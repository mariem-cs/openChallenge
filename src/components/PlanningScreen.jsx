import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDraipStore } from '../store/draipStore'
import { useWeather, usePlaces, useItineraryGenerator } from '../hooks/useDraip'
import ChatBot from './ChatBot'

const LOADING_STEPS = [
  { icon: '🌤', text: 'Fetching live weather data...' },
  { icon: '📍', text: 'Loading nearby venues...' },
  { icon: '🧠', text: 'Analysing your preferences...' },
  { icon: '✨', text: 'Optimising activity sequence...' },
]

export default function PlanningScreen() {
  const { weather, availablePlaces, location, isGenerating } = useDraipStore()
  const { data: weatherData, refetch: refetchWeather, isLoading: weatherLoading } = useWeather()
  const { data: placesData, reload: reloadPlaces, isLoading: placesLoading } = usePlaces()
  const { generate, isLoading: generating } = useItineraryGenerator()
  const [loadStep, setLoadStep] = useState(0)
  const [error, setError] = useState('')
  const [started, setStarted] = useState(false)
  const [initialLoadDone, setInitialLoadDone] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)

  // Auto-fetch data on mount
  useEffect(() => {
    async function loadInitialData() {
      try {
        setError('')
        await Promise.all([refetchWeather?.(), reloadPlaces?.()])
      } catch (err) {
        setError(err.message || 'Failed to load initial data')
      } finally {
        setInitialLoadDone(true)
      }
    }

    loadInitialData()
  }, [])

  // Loading steps animation
  useEffect(() => {
    if (!started && !generating) return
    const timer = setInterval(() => setLoadStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1)), 1800)
    return () => clearInterval(timer)
  }, [started, generating])

  async function handleGenerate() {
    setError('')
    setStarted(true)
    try {
      await generate()
    } catch (e) {
      setError(e.message)
      setStarted(false)
    }
  }

  async function handleRetry() {
    setError('')
    try {
      await Promise.all([refetchWeather?.(), reloadPlaces?.()])
    } catch (err) {
      setError(err.message || 'Failed to reload data')
    }
  }

  const dataReady = weather && availablePlaces?.length > 0
  const isLoading = weatherLoading || placesLoading || !initialLoadDone

  return (
    <div className="min-h-screen bg-[#F8F1E9] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Floating aurora-like travel elements (same as SetupScreen) */}
      
      {/* Hot air balloon */}
      <motion.div 
        className="absolute top-[8%] left-[6%] text-7xl opacity-15 pointer-events-none z-0"
        animate={{ y: [0, -30, 0], x: [0, 20, 0], rotate: [0, 6, -6, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      >
        🎈
      </motion.div>

      {/* Airplane */}
      <motion.div 
        className="absolute top-[22%] right-[8%] text-8xl opacity-15 pointer-events-none z-0"
        animate={{ x: [0, -50, 50, 0], y: [0, 15, -15, 0], rotate: [0, -10, 10, -10, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      >
        ✈️
      </motion.div>

      {/* Compass */}
      <motion.div 
        className="absolute bottom-[18%] left-[12%] text-7xl opacity-15 pointer-events-none z-0"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      >
        🧭
      </motion.div>

      {/* Globe */}
      <motion.div 
        className="absolute bottom-[35%] right-[18%] text-8xl opacity-15 pointer-events-none z-0"
        animate={{ y: [0, -20, 0], rotate: [0, 8, -8, 0] }}
        transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }}
      >
        🌍
      </motion.div>

      {/* Palm tree */}
      <motion.div 
        className="absolute top-[45%] left-[15%] text-7xl opacity-15 pointer-events-none z-0"
        animate={{ rotate: [0, 7, -7, 0], scale: [1, 1.12, 1] }}
        transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
      >
        🌴
      </motion.div>

      {/* Beach umbrella */}
      <motion.div 
        className="absolute top-[65%] right-[7%] text-7xl opacity-15 pointer-events-none z-0"
        animate={{ y: [0, -15, 0], x: [0, 12, -12, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      >
        ⛱️
      </motion.div>

      {/* Camera */}
      <motion.div 
        className="absolute bottom-[10%] right-[25%] text-7xl opacity-15 pointer-events-none z-0"
        animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
      >
        📷
      </motion.div>

      {/* Passport */}
      <motion.div 
        className="absolute top-[15%] left-[20%] text-7xl opacity-15 pointer-events-none z-0"
        animate={{ y: [0, -25, 0], rotate: [0, 15, -15, 0] }}
        transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }}
      >
        🛂
      </motion.div>

      {/* Colorful gradient orbs */}
      <motion.div 
        className="absolute top-[-80px] right-[-80px] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#FF8C42]/12 to-[#0088FF]/12 blur-[80px] pointer-events-none z-0"
        animate={{ x: [0, 60, -60, 0], y: [0, -60, 60, 0], scale: [1, 1.15, 0.9, 1] }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <motion.div 
        className="absolute bottom-[-80px] left-[-80px] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#FFD166]/12 to-[#40C4FF]/12 blur-[80px] pointer-events-none z-0"
        animate={{ x: [0, -60, 60, 0], y: [0, 60, -60, 0], scale: [1, 0.9, 1.15, 1] }}
        transition={{ duration: 36, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating sparkles/particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-xl opacity-20 pointer-events-none z-0"
          style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
          animate={{
            y: [0, -40, 0],
            x: [0, Math.random() * 40 - 20, 0],
            rotate: [0, 360],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut"
          }}
        >
          {['✨', '⭐', '🌟', '💫', '⚡'][i % 5]}
        </motion.div>
      ))}

      {/* Subtle wave at bottom */}
      <svg className="absolute bottom-0 left-0 w-full opacity-10 pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
        <motion.path 
          fill="#0088FF" 
          fillOpacity="0.25"
          animate={{ 
            d: [
              "M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,170.7C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              "M0,160L48,165.3C96,171,192,181,288,176C384,171,480,149,576,138.7C672,128,768,128,864,138.7C960,149,1056,171,1152,176C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ]
          }}
          transition={{ duration: 15, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />
      </svg>

      {/* Main content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-extrabold tracking-tight mb-2">
            Planning your day in <span className="text-[#0066CC]">{location?.city || 'your destination'}</span>
          </h1>
          <p className="text-[#6B7280] text-sm">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-[#E0D5C3] rounded-2xl p-6 shadow-xl space-y-4">
          {/* Status cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-3 rounded-xl border transition-all ${
              weather 
                ? 'border-[#0066CC] bg-[#E3F2FD]/60' 
                : 'border-[#E0D5C3] bg-white'
            }`}>
              <div className="text-lg mb-1">
                {weather ? weather.icon : (weatherLoading ? '⏳' : '❌')}
              </div>
              <div className="font-mono text-[11px] text-[#0066CC] uppercase tracking-widest">Weather</div>
              <div className="font-display font-bold text-sm mt-0.5 text-[#2D3142]">
                {weather ? `${weather.temperature}°C · ${weather.condition}` : 
                 weatherLoading ? 'Loading...' : 'Failed to load'}
              </div>
            </div>
            
            <div className={`p-3 rounded-xl border transition-all ${
              availablePlaces?.length 
                ? 'border-[#0088FF] bg-[#E3F2FD]/60' 
                : 'border-[#E0D5C3] bg-white'
            }`}>
              <div className="text-lg mb-1">
                {availablePlaces?.length ? '📍' : (placesLoading ? '⏳' : '❌')}
              </div>
              <div className="font-mono text-[11px] text-[#0088FF] uppercase tracking-widest">Venues</div>
              <div className="font-display font-bold text-sm mt-0.5 text-[#2D3142]">
                {availablePlaces?.length ? `${availablePlaces.length} places loaded` : 
                 placesLoading ? 'Loading...' : 'Failed to load'}
              </div>
            </div>
          </div>

          {/* Loading progress */}
          {(started || generating) && (
            <div className="space-y-2 bg-[#E3F2FD]/30 p-3 rounded-xl border border-[#90CAF9]/40">
              {LOADING_STEPS.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: i <= loadStep ? 1 : 0.3, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 py-1.5"
                >
                  <span className="text-base w-6">{step.icon}</span>
                  <span className={`font-mono text-[11px] ${
                    i <= loadStep ? 'text-[#0066CC] font-bold' : 'text-[#6B7280]'
                  }`}>
                    {step.text}
                  </span>
                  {i === loadStep && i < LOADING_STEPS.length - 1 && (
                    <span className="ml-auto font-mono text-[10px] text-[#0088FF] animate-pulse">processing...</span>
                  )}
                  {i < loadStep && (
                    <span className="ml-auto font-mono text-[10px] text-[#0066CC]">✓</span>
                  )}
                  {i === LOADING_STEPS.length - 1 && i <= loadStep && (
                    <span className="ml-auto font-mono text-[10px] text-[#0066CC]">✓ ready</span>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {error && (
            <div className="px-3 py-2 bg-[#FFEBEE] border border-[#EF9A9A] rounded-lg text-[#C62828] text-xs font-mono leading-relaxed">
              ⚠ {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={!dataReady || generating || isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0088FF] to-[#0066CC] text-white font-display font-bold text-sm hover:brightness-105 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#0066CC]/25"
          >
            {generating ? '🤖 DRAIP is planning...' : 
             isLoading ? '⏳ Loading data...' :
             dataReady ? '✨ Generate AI Itinerary' : '⏳ Waiting for data...'}
          </button>

          {(!dataReady || error) && !isLoading && (
            <button
              onClick={handleRetry}
              className="w-full py-2 rounded-xl border border-[#E0D5C3] text-[#6B7280] font-display text-sm hover:border-[#0066CC] hover:text-[#0066CC] transition-all bg-white"
            >
              ↺ Retry loading data
            </button>
          )}
        </div>
      </motion.div>

      {/* Chat toggle button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-[#0088FF] via-[#0066CC] to-[#40C4FF] shadow-lg flex items-center justify-center text-2xl z-40 hover:shadow-xl transition-all hover:scale-110"
      >
        🤖
      </motion.button>

      {/* ChatBot */}
      <AnimatePresence>
        {isChatOpen && (
          <ChatBot 
            isOpen={isChatOpen} 
            onClose={() => setIsChatOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  )
}