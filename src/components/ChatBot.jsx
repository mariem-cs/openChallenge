import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDraipStore } from '../store/draipStore'
import { sendChatMessage, getSuggestions, isApiKeyAvailable } from '../services/groqService' 

export default function ChatBot({ isOpen, onClose }) {
  const { itinerary, weather, userProfile, location, groqKey: storeGroqKey } = useDraipStore()
  
  const [effectiveGroqKey, setEffectiveGroqKey] = useState(null);

  useEffect(() => {
    console.log('🔑 Checking for API keys...');
    
    if (storeGroqKey) {
      console.log('🔑 Using API key from store');
      setEffectiveGroqKey(storeGroqKey);
      return;
    }
    
    if (import.meta.env.VITE_GROQ_API_KEY) {
      console.log('🔑 Using VITE_GROQ_API_KEY from import.meta.env');
      setEffectiveGroqKey(import.meta.env.VITE_GROQ_API_KEY);
      return;
    }
    
    if (typeof process !== 'undefined' && process.env && process.env.GROQ_API_KEY) {
      console.log('🔑 Using GROQ_API_KEY from process.env (CMD)');
      setEffectiveGroqKey(process.env.GROQ_API_KEY);
      return;
    }
    
    console.log('❌ No API key found in any source');
    setEffectiveGroqKey(null);
  }, [storeGroqKey]);

  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: `👋 Bon voyage! I'm your AI travel companion. Ask me anything about your adventure in ${location?.city || 'your dream destination'}! ✈️🌊` 
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    console.log('🔑 ChatBot - Final Effective Key:', !!effectiveGroqKey);
    if (effectiveGroqKey) {
      console.log('🔑 Key starts with:', effectiveGroqKey.substring(0, 8));
    }
    console.log('🔑 Service check - API Key available:', isApiKeyAvailable());
  }, [effectiveGroqKey])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (location) {
      setSuggestions(getSuggestions({ weather, userProfile, location }))
    }
  }, [weather, userProfile, location])

  async function handleSendMessage(e) {
    e?.preventDefault()
    
    if (!input.trim() || isLoading) return
    
    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      if (!effectiveGroqKey) {
        console.log('ℹ️ No Groq API key found, using mock responses')
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: getMockResponse(input, { weather, userProfile, location, itinerary })
          }])
          setIsLoading(false)
        }, 1000)
        return
      }

      const context = { itinerary, weather, userProfile, location }
      const recentMessages = messages.slice(-10)
      console.log('🤖 Sending message to Groq API with key starting with:', effectiveGroqKey.substring(0, 8))
      
      const response = await sendChatMessage(
        [...recentMessages, userMessage],
        effectiveGroqKey,
        context
      )

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.message 
      }])
      
      console.log('✅ Response received from Groq')
    } catch (error) {
      console.error('❌ Chat error:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Sorry, I encountered an error: ${error.message}. Please try again.` 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  function handleSuggestionClick(suggestion) {
    setInput(suggestion)
    setTimeout(() => handleSendMessage(), 50)
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-6 right-6 w-96 h-[600px] bg-[#F8F1E9] rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col border border-[#E0D5C3]"
    >
      {/* Header – blue gradient */}
      <div className="p-4 border-b border-[#E0D5C3] bg-gradient-to-r from-[#0088FF] to-[#0066CC] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/25 flex items-center justify-center shadow-sm">
            <span className="text-lg">✈️</span>
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-white drop-shadow-sm">Travel Companion</h3>
            <p className="font-mono text-[10px] text-white/90">
              {effectiveGroqKey ? 'Powered by Groq – Real AI' : 'Explore Mode'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full hover:bg-white/30 transition-colors flex items-center justify-center text-white"
          aria-label="Close chat"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8F1E9]">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[82%] p-3.5 rounded-2xl shadow-sm ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-[#0088FF] to-[#0066CC] text-white rounded-br-none'
                  : 'bg-white border border-[#E0D5C3] text-[#2D3142] rounded-bl-none'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </motion.div>
        ))}
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white border border-[#E0D5C3] rounded-2xl rounded-bl-none p-3.5 shadow-sm">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-[#0066CC] rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <span className="w-2 h-2 bg-[#00A3FF] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <span className="w-2 h-2 bg-[#40C4FF] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="px-4 pb-2 bg-[#F8F1E9] border-t border-[#E0D5C3]">
          <div className="flex flex-wrap gap-2 pt-2">
            {suggestions.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-1.5 text-xs font-medium bg-[#E3F2FD] border border-[#90CAF9] rounded-full text-[#0D47A1] hover:bg-[#BBDEFB] hover:border-[#64B5F6] transition-all shadow-sm"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-[#E0D5C3] bg-white">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Where to next? Ask anything..."
            className="flex-1 bg-[#F8F1E9] border border-[#E0D5C3] rounded-xl px-4 py-2.5 text-sm text-[#2D3142] placeholder-[#8D8D8D] focus:border-[#0066CC] focus:ring-2 focus:ring-[#0066CC]/30 transition-all outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-5 py-2.5 bg-gradient-to-r from-[#0088FF] to-[#0066CC] text-white rounded-xl font-medium text-sm hover:brightness-105 transition-all disabled:opacity-50 shadow-md"
          >
            Send
          </button>
        </div>
        {!effectiveGroqKey && (
          <p className="text-[10px] text-[#8D8D8D] mt-2 text-center italic">
            Demo mode – real AI responses need a Groq API key
          </p>
        )}
      </form>
    </motion.div>
  )
}

// Mock responses (unchanged)
function getMockResponse(input, context) {
  const lower = input.toLowerCase()
  
  if (lower.includes('weather')) {
    return `The weather in ${context.location?.city} is ${context.weather?.temperature}°C with ${context.weather?.condition}. ${context.weather?.isRaining ? 'Bring an umbrella! ☔' : 'Perfect for exploring! ☀️'}`
  }
  
  if (lower.includes('restaurant') || lower.includes('eat') || lower.includes('food')) {
    return `I recommend trying local restaurants in ${context.location?.city}. Based on your ${context.userProfile?.travelStyles?.join(', ') || 'explorer'} style, you might enjoy authentic local cuisine! 🍽️`
  }
  
  if (lower.includes('next activity') || lower.includes('what next')) {
    const next = context.itinerary?.find(a => a.status === 'upcoming')
    return next ? `Your next activity is ${next.name} at ${next.time}. It's a ${next.category} that should take about ${next.durationMin} minutes.` : 'No upcoming activities scheduled.'
  }
  
  if (lower.includes('hello') || lower.includes('hi')) {
    return `Hello! How can I help with your trip to ${context.location?.city} today?`
  }
  
  if (lower.includes('thank')) {
    return "You're welcome! 😊 Let me know if you need anything else."
  }
  
  if (lower.includes('car') || lower.includes('drive')) {
    return context.userProfile?.hasCar 
      ? `Since you have a car, I can recommend places with parking and wider area attractions! 🚗` 
      : `You're traveling without a car. I'll focus on walkable and public transport accessible locations. 🚶`
  }
  
  if (lower.includes('budget')) {
    return `Your daily budget is $${context.userProfile?.budgetPerDay}. I'll make sure recommendations fit within your budget! 💰`
  }
  
  return `I'd be happy to help with that! You can ask me about weather, activities, restaurants, or get tips about ${context.location?.city}. Feel free to be more specific! 😊`
}