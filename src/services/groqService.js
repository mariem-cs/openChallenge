/**
 * Groq API Service for AI Chatbot
 * Documentation: https://console.groq.com/docs
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Default system prompt for travel assistant
const SYSTEM_PROMPT = `You are a friendly and knowledgeable travel assistant for the DRAIP app. 
Your role is to help users with their travel plans, answer questions about their itinerary, 
suggest activities, and provide local tips. Keep responses concise, helpful, and engaging.

You have access to the user's:
- Current itinerary
- Weather information
- User preferences (travel style, budget, transport mode)
- Available places

Provide practical advice, recommendations, and answers based on this context.`;

// Available models (as of 2026)
const MODELS = {
  LLAMA_70B: 'llama-3.3-70b-versatile',  // Current recommended model
  MIXTRAL: 'mixtral-8x7b-32768',          // Alternative for complex tasks
  GEMMA: 'gemma2-9b-it',                   // Fast and efficient
  LLAMA_8B: 'llama3-8b-8192'               // DEPRECATED - DO NOT USE
};

/**
 * Get API key from environment variables (like os.getenv in Python)
 * Checks both system environment and Vite environment
 */
function getApiKeyFromEnv() {
  // Check if we're in a Node.js environment (process.env available)
  if (typeof process !== 'undefined' && process.env) {
    // Like os.getenv("GROQ_API_KEY") in Python
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
      console.log('🔑 Found GROQ_API_KEY in system environment');
      return groqKey;
    }
    
    // Also check for Vite prefixed version
    const viteGroqKey = process.env.VITE_GROQ_API_KEY;
    if (viteGroqKey) {
      console.log('🔑 Found VITE_GROQ_API_KEY in system environment');
      return viteGroqKey;
    }
  }
  
  // Check Vite's import.meta.env (for browser environment)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const viteKey = import.meta.env.VITE_GROQ_API_KEY;
    if (viteKey) {
      console.log('🔑 Found VITE_GROQ_API_KEY in Vite environment');
      return viteKey;
    }
  }
  
  return null;
}

export async function sendChatMessage(messages, apiKey, context = {}) {
  // Get API key: either from parameter or from environment (like os.getenv)
  let finalApiKey = apiKey;
  
  // If no API key provided, try to get from environment
  if (!finalApiKey) {
    finalApiKey = getApiKeyFromEnv();
    console.log('🔑 Attempting to get API key from environment:', finalApiKey ? '✅ Found' : '❌ Not found');
  }
  
  if (!finalApiKey) {
    console.error('❌ No Groq API key found. Please set GROQ_API_KEY in your environment variables.');
    throw new Error('Groq API key is required. Please set GROQ_API_KEY in your environment variables (like os.getenv("GROQ_API_KEY") in Python).');
  }

  // Log key presence (safely)
  console.log('🔑 API Key present:', !!finalApiKey);
  console.log('🔑 Key prefix:', finalApiKey.substring(0, 8) + '...');

  // Add context to the system message if provided
  let systemMessage = SYSTEM_PROMPT;
  
  if (context.itinerary && context.itinerary.length > 0) {
    systemMessage += `\n\nCurrent itinerary: ${JSON.stringify(context.itinerary.map(a => ({
      name: a.name,
      time: a.time,
      category: a.category,
      duration: a.durationMin,
      status: a.status
    })))}`;
  }
  
  if (context.weather) {
    systemMessage += `\n\nWeather: ${context.weather.temperature}°C, ${context.weather.condition}`;
    if (context.weather.isRaining) {
      systemMessage += ` (rain expected)`;
    }
  }
  
  if (context.userProfile) {
    const travelStyles = context.userProfile.travelStyles?.join(', ') || context.userProfile.travelStyle || 'explorer';
    systemMessage += `\n\nUser profile: ${travelStyles} traveler`;
    systemMessage += ` with budget $${context.userProfile.budgetPerDay}/day`;
    
    if (context.userProfile.hasCar) {
      systemMessage += `\nTraveling by car (max ${context.userProfile.maxDrivingKm}km/day)`;
    }
    if (context.userProfile.transportMode) {
      systemMessage += `\nPreferred transport: ${context.userProfile.transportMode.join(', ')}`;
    }
  }

  if (context.location) {
    systemMessage += `\n\nCurrent location: ${context.location.city}`;
  }

  try {
    console.log('📤 Sending to Groq with model: llama-3.3-70b-versatile');
    console.log('📤 Messages:', messages.length, 'context messages');
    
    const requestBody = {
      model: MODELS.LLAMA_70B,
      messages: [
        { role: 'system', content: systemMessage },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 500,
      top_p: 1,
      stream: false
    };

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${finalApiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'DRAIP-App/1.0'
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📥 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Groq API error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      
      // Provide specific error messages based on status code
      switch (response.status) {
        case 401:
          throw new Error('Invalid Groq API key. Please check your GROQ_API_KEY environment variable.');
        case 403:
          throw new Error('Access forbidden. Your API key may not have permission for this model.');
        case 429:
          throw new Error('Rate limit exceeded. Please try again later.');
        case 500:
        case 502:
        case 503:
          throw new Error('Groq service is currently unavailable. Please try again later.');
        default:
          try {
            const error = JSON.parse(errorText);
            throw new Error(error.error?.message || `Groq API error (${response.status})`);
          } catch {
            throw new Error(`Groq API error (${response.status}): ${errorText}`);
          }
      }
    }

    const data = await response.json();
    console.log('✅ Groq API response received:', {
      id: data.id,
      model: data.model,
      usage: data.usage
    });
    
    return {
      message: data.choices[0].message.content,
      usage: data.usage,
      model: data.model
    };
  } catch (error) {
    console.error('❌ Groq API error:', error);
    throw error;
  }
}

// Predefined suggestions based on context
export function getSuggestions(context) {
  const suggestions = [];
  
  if (context.weather?.condition === 'Rain') {
    suggestions.push('Indoor activities for rainy weather? ☔');
  } else if (context.weather?.condition === 'Sunny') {
    suggestions.push('Outdoor activities for sunny weather? ☀️');
  }
  
  // Handle both string and array travel styles
  const travelStyle = context.userProfile?.travelStyle;
  const travelStyles = context.userProfile?.travelStyles || [];
  
  if (travelStyles.includes('cultural') || travelStyle === 'cultural') {
    suggestions.push('Recommend museums nearby 🏛️');
  }
  if (travelStyles.includes('relaxed') || travelStyle === 'relaxed') {
    suggestions.push('Quiet cafes or parks 🌿');
  }
  if (travelStyles.includes('explorer') || travelStyle === 'explorer') {
    suggestions.push('Hidden gems in the area 🧭');
  }
  if (travelStyles.includes('foodie')) {
    suggestions.push('Best local food spots 🍽️');
  }
  if (travelStyles.includes('nature')) {
    suggestions.push('Scenic nature spots 🌄');
  }
  
  // Transport-based suggestions
  if (context.userProfile?.hasCar) {
    suggestions.push('Places with parking nearby 🚗');
  }
  
  // Time-based suggestions
  const hour = new Date().getHours();
  if (hour < 11) {
    suggestions.push('Breakfast spots nearby? 🥐');
  } else if (hour < 14) {
    suggestions.push('Lunch recommendations? 🥗');
  } else if (hour < 17) {
    suggestions.push('Afternoon activities? 🏛️');
  } else if (hour < 20) {
    suggestions.push('Dinner suggestions? 🍽️');
  } else {
    suggestions.push('Evening activities? 🌙');
  }
  
  suggestions.push('What should I do next? ⏭️');
  
  // Return unique suggestions (limit to 5)
  return [...new Set(suggestions)].slice(0, 5);
}

// Optional: Function to check if API key is available (like os.getenv check)
export function isApiKeyAvailable() {
  return !!getApiKeyFromEnv();
}