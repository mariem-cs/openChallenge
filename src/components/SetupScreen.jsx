import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDraipStore } from '../store/draipStore'
import { searchCity, getCityFromCoords } from '../services/weatherService'

const TRAVEL_STYLES = [
  { id: 'relaxed',  icon: '🧘', label: 'Relaxed',  desc: 'Slow pace, comfort first' },
  { id: 'explorer', icon: '🧭', label: 'Explorer', desc: 'High activity, maximum variety' },
  { id: 'cultural', icon: '🏛',  label: 'Cultural', desc: 'Museums, history, arts' },
  { id: 'luxury',   icon: '✨',  label: 'Luxury',   desc: 'Premium venues, VIP treatment' },
  { id: 'foodie',   icon: '🍽',  label: 'Foodie',   desc: 'Culinary experiences' },
  { id: 'nature',   icon: '🌿',  label: 'Nature',   desc: 'Outdoor & landscapes' },
]

const BUDGET_PRESETS = [
  { value: 50, label: '💸 Budget', desc: 'Backpacker friendly' },
  { value: 150, label: '⚖️ Moderate', desc: 'Balanced comfort' },
  { value: 300, label: '🌟 Comfortable', desc: 'Nice hotels & dining' },
  { value: 500, label: '✨ Luxury', desc: 'Premium experiences' },
  { value: 1000, label: '👑 Ultra', desc: 'No limits' },
]

const TRANSPORT_OPTIONS = [
  { id: 'walking', icon: '🚶', label: 'Walking', desc: 'Explore on foot' },
  { id: 'public', icon: '🚌', label: 'Public Transport', desc: 'Buses & trains' },
  { id: 'car', icon: '🚗', label: 'Car', desc: 'Self-drive or rental' },
  { id: 'bike', icon: '🚲', label: 'Bike', desc: 'Cycling around' },
]

export default function SetupScreen() {
  const { setLocation, setUserProfile, setPhase, setApiKeys } = useDraipStore()
  const [step, setStep] = useState(0)
  const [citySearch, setCitySearch] = useState('')
  const [citySuggestions, setCitySuggestions] = useState([])
  const [selectedCity, setSelectedCity] = useState(null)
  const [groqApiKey, setGroqApiKey] = useState('')
  const [profile, setProfile] = useState({
    name: '',
    travelStyles: ['explorer'],
    hasCar: false,
    transportMode: ['walking'],
    budgetPerDay: 150,
    preferences: { 
      nature: 0.3, 
      food: 0.5, 
      museums: 0.7, 
      nightlife: 0.2, 
      shopping: 0.2,
      adventure: 0.5,
      relaxation: 0.4,
    },
    maxWalkingKm: 8,
    maxDrivingKm: 50,
  })
  const [locating, setLocating] = useState(false)
  const [error, setError] = useState('')
  const [customBudget, setCustomBudget] = useState('')

useEffect(() => {
  console.log('📂 Reading from .env...')
  const envGroqKey = import.meta.env.VITE_GROQ_API_KEY
  
  console.log('🔑 Raw env value:', envGroqKey ? 'Found (length: ' + envGroqKey.length + ')' : 'Not found')
  
  if (envGroqKey) {
    console.log('🔑 Key first 8 chars:', envGroqKey.substring(0, 8))
    setGroqApiKey(envGroqKey)
    
    // Log before calling setApiKeys
    console.log('📤 Calling setApiKeys with:', { anthropic: '', foursquare: '', groq: envGroqKey.substring(0, 8) + '...' })
    
    setApiKeys('', '', envGroqKey)
    
    // Check if it was stored (you'll need to check the store directly)
    setTimeout(() => {
      const store = useDraipStore.getState()
      console.log('📦 Store after setting:', { 
        groqKey: store.groqKey ? store.groqKey.substring(0, 8) + '...' : 'NOT SET',
        anthropicKey: store.anthropicKey,
        foursquareKey: store.foursquareKey
      })
    }, 100)
    
    console.log('✅ Groq API key loaded from env')
  } else {
    console.warn('⚠️ No Groq API key found in .env file')
    console.log('📂 All env vars:', import.meta.env)
  }
}, [])
  const steps = ['Location', 'Profile', 'Transport', 'Ready']

  const getBudgetCategory = (amount) => {
    if (amount <= 100) return { icon: '🎒', label: 'Economic', color: 'text-forest-500' }
    if (amount <= 250) return { icon: '⚖️', label: 'Moderate', color: 'text-ocean-500' }
    if (amount <= 400) return { icon: '🌟', label: 'Comfortable', color: 'text-purple-500' }
    if (amount <= 700) return { icon: '✨', label: 'Luxury', color: 'text-sunset-500' }
    return { icon: '👑', label: 'Ultra Luxury', color: 'text-berry-500' }
  }

  async function handleCitySearch(q) {
    setCitySearch(q)
    if (q.length < 2) return setCitySuggestions([])
    const results = await searchCity(q)
    setCitySuggestions(results)
  }

  async function useMyLocation() {
    setLocating(true)
    try {
      const pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 8000 })
      )
      const { latitude: lat, longitude: lon } = pos.coords
      const city = await getCityFromCoords(lat, lon)
      setSelectedCity({ name: city, lat, lon })
      setCitySearch(city)
    } catch {
      setError('Could not get location. Please search manually.')
    } finally {
      setLocating(false)
    }
  }

  const toggleTravelStyle = (styleId) => {
    setProfile((p) => {
      const currentStyles = p.travelStyles || []
      const newStyles = currentStyles.includes(styleId)
        ? currentStyles.filter(id => id !== styleId)
        : [...currentStyles, styleId]
      
      if (newStyles.length === 0) return p
      return { ...p, travelStyles: newStyles }
    })
  }

  const toggleTransportMode = (modeId) => {
    setProfile((p) => {
      const currentModes = p.transportMode || ['walking']
      const newModes = currentModes.includes(modeId)
        ? currentModes.filter(id => id !== modeId)
        : [...currentModes, modeId]
      
      if (newModes.length === 0) return p
      return { ...p, transportMode: newModes }
    })
  }

  function handleBudgetChange(value) {
    setProfile((p) => ({ ...p, budgetPerDay: value }))
    setCustomBudget('')
  }

  function handleCustomBudgetInput(e) {
    const value = e.target.value
    setCustomBudget(value)
    const numValue = parseInt(value.replace(/[^0-9]/g, ''))
    if (!isNaN(numValue) && numValue > 0) {
      setProfile((p) => ({ ...p, budgetPerDay: numValue }))
    }
  }

  function handleFinish() {
    if (!selectedCity) return setError('Please select a city')
    
    setLocation({ lat: selectedCity.lat, lon: selectedCity.lon, city: selectedCity.name })
    setUserProfile(profile)
    setPhase('planning')
  }

  function handleContinue() {
    setError('')
    
    if (step === 0 && !selectedCity) {
      return setError('Please select a city first')
    }
    
    if (step < steps.length - 1) {
      setStep(s => s + 1)
    } else {
      handleFinish()
    }
  }

  const formatBudget = (value) => {
    return new Intl.NumberFormat().format(value)
  }

  const currentCategory = getBudgetCategory(profile.budgetPerDay)

  return (
    <div className="min-h-screen bg-background text-text flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Floating aurora-like elements - tourism themed */}
      
      {/* Hot air balloon aurora */}
      <motion.div 
        className="absolute top-[10%] left-[5%] text-7xl opacity-20 pointer-events-none"
        animate={{ 
          y: [0, -30, 0],
          x: [0, 20, 0],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 20, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      >
        🎈
      </motion.div>

      {/* Airplane aurora */}
      <motion.div 
        className="absolute top-[20%] right-[10%] text-8xl opacity-20 pointer-events-none"
        animate={{ 
          x: [0, -50, 0, 50, 0],
          y: [0, 20, -20, 20, 0],
          rotate: [0, -10, 10, -10, 0]
        }}
        transition={{ 
          duration: 25, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      >
        ✈️
      </motion.div>

      {/* Compass aurora */}
      <motion.div 
        className="absolute bottom-[15%] left-[10%] text-7xl opacity-20 pointer-events-none"
        animate={{ 
          rotate: [0, 360],
          scale: [1, 1.2, 1]
        }}
        transition={{ 
          duration: 30, 
          repeat: Infinity,
          ease: "linear" 
        }}
      >
        🧭
      </motion.div>

      {/* Globe aurora */}
      <motion.div 
        className="absolute bottom-[30%] right-[15%] text-8xl opacity-20 pointer-events-none"
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 10, -10, 0]
        }}
        transition={{ 
          duration: 18, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      >
        🌍
      </motion.div>

      {/* Palm tree aurora */}
      <motion.div 
        className="absolute top-[40%] left-[20%] text-7xl opacity-20 pointer-events-none"
        animate={{ 
          rotate: [0, 5, -5, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 15, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      >
        🌴
      </motion.div>

      {/* Beach umbrella aurora */}
      <motion.div 
        className="absolute top-[60%] right-[5%] text-7xl opacity-20 pointer-events-none"
        animate={{ 
          y: [0, -15, 0],
          x: [0, 10, -10, 0]
        }}
        transition={{ 
          duration: 22, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      >
        ⛱️
      </motion.div>

      {/* Camera aurora */}
      <motion.div 
        className="absolute bottom-[10%] right-[25%] text-7xl opacity-20 pointer-events-none"
        animate={{ 
          rotate: [0, 10, -10, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ 
          duration: 17, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      >
        📷
      </motion.div>

      {/* Passport aurora */}
      <motion.div 
        className="absolute top-[15%] left-[20%] text-7xl opacity-20 pointer-events-none"
        animate={{ 
          y: [0, -25, 0],
          rotate: [0, 15, -15, 0]
        }}
        transition={{ 
          duration: 19, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      >
        🛂
      </motion.div>

      {/* Colorful gradient auroras */}
      <motion.div 
        className="absolute top-[-100px] right-[-100px] w-[600px] h-[600px] rounded-full bg-gradient-to-r from-soft-coral/20 to-soft-sky/20 blur-[100px] pointer-events-none"
        animate={{ 
          x: [0, 50, -50, 0],
          y: [0, -50, 50, 0],
          scale: [1, 1.2, 0.8, 1]
        }}
        transition={{ 
          duration: 30, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      />
      
      <motion.div 
        className="absolute bottom-[-100px] left-[-100px] w-[600px] h-[600px] rounded-full bg-gradient-to-r from-soft-mint/20 to-soft-lavender/20 blur-[100px] pointer-events-none"
        animate={{ 
          x: [0, -50, 50, 0],
          y: [0, 50, -50, 0],
          scale: [1, 0.8, 1.2, 1]
        }}
        transition={{ 
          duration: 35, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      />

      {/* Floating particles - like stars/sparkles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-xl opacity-20 pointer-events-none"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
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

      {/* Subtle wave patterns */}
      <svg className="absolute bottom-0 left-0 w-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
        <motion.path 
          fill="#4ECDC4" 
          fillOpacity="0.3"
          animate={{ 
            d: [
              "M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,170.7C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
              "M0,160L48,165.3C96,171,192,181,288,176C384,171,480,149,576,138.7C672,128,768,128,864,138.7C960,149,1056,171,1152,176C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ]
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        />
      </svg>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-extrabold tracking-tight mb-2">
            Welcome to <span className="gradient-text">DRAIP</span>
          </h1>
          <p className="text-text-light text-sm">Set up your intelligent travel companion</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-mono font-bold transition-all
                ${i < step ? 'bg-ocean-500 text-white' : 
                  i === step ? 'bg-ocean-100 border-2 border-ocean-500 text-ocean-700' : 
                  'bg-white border border-gray-200 text-text-light'}`}>
                {i < step ? '✓' : i + 1}
              </div>
              {i < steps.length - 1 && <div className={`w-8 h-px ${i < step ? 'bg-ocean-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl overflow-hidden shadow-xl">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 space-y-5">
                <h2 className="font-display text-lg font-bold text-text">Where are you travelling?</h2>

                <button
                  onClick={useMyLocation}
                  disabled={locating}
                  className="w-full flex items-center justify-center gap-2 bg-ocean-50 border border-ocean-200 rounded-lg py-2.5 text-ocean-700 font-display font-semibold text-sm hover:bg-ocean-100 transition-colors disabled:opacity-50"
                >
                  {locating ? '📡 Detecting...' : '📍 Use My Location'}
                </button>

                <div className="flex items-center gap-3 text-text-light text-xs font-mono">
                  <div className="flex-1 h-px bg-gray-200" />or search manually<div className="flex-1 h-px bg-gray-200" />
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search city "
                    value={citySearch}
                    onChange={(e) => handleCitySearch(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 font-body text-sm text-text placeholder-text-light focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 focus:outline-none transition-colors"
                  />
                  {citySuggestions.length > 0 && (
                    <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-lg overflow-hidden z-10 shadow-lg">
                      {citySuggestions.map((c) => (
                        <button
                          key={`${c.lat}-${c.lon}`}
                          onClick={() => { setSelectedCity(c); setCitySearch(`${c.name}, ${c.country}`); setCitySuggestions([]) }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-ocean-50 transition-colors"
                        >
                          <span className="font-medium text-text">{c.name}</span>
                          <span className="text-text-light ml-2 text-xs">{c.admin1 && `${c.admin1}, `}{c.country}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 space-y-5">
                <h2 className="font-display text-lg font-bold text-text">Your Travel Profile</h2>

                <div>
                  <label className="block font-mono text-[11px] text-ocean-600 tracking-widest uppercase mb-2">Your Name</label>
                  <input
                    type="text"
                    placeholder="Type your name"
                    value={profile.name}
                    onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-text placeholder-text-light focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[11px] text-ocean-600 tracking-widest uppercase mb-2">
                    Travel Style (select multiple)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {TRAVEL_STYLES.map((s) => {
                      const isSelected = profile.travelStyles?.includes(s.id)
                      return (
                        <button
                          key={s.id}
                          onClick={() => toggleTravelStyle(s.id)}
                          className={`p-3 rounded-lg border text-left transition-all relative ${
                            isSelected 
                              ? 'border-ocean-500 bg-ocean-50 text-ocean-700' 
                              : 'border-gray-200 bg-white text-text-light hover:border-ocean-300 hover:bg-ocean-50/30'
                          }`}
                        >
                          <div className="text-lg mb-1">{s.icon}</div>
                          <div className="font-display font-bold text-sm">{s.label}</div>
                          <div className="text-[10px] opacity-70">{s.desc}</div>
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-2 h-2 bg-ocean-500 rounded-full" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block font-mono text-[11px] text-ocean-600 tracking-widest uppercase">
                      Daily Budget
                    </label>
                    <div className={`flex items-center gap-1 text-sm font-medium ${currentCategory.color}`}>
                      <span>{currentCategory.icon}</span>
                      <span>{currentCategory.label}</span>
                    </div>
                  </div>
                  
                  <div className="bg-ocean-50/50 border border-ocean-100 rounded-lg p-4 mb-3">
                    <div className="text-2xl font-bold text-text mb-1">
                       {formatBudget(profile.budgetPerDay)} DNT
                      <span className="text-sm font-normal text-text-light ml-1">/day</span>
                    </div>
                    
                    {/* Budget range indicators */}
                    <div className="grid grid-cols-5 gap-1 mt-3">
                      <div className={`h-1 rounded-l-full ${profile.budgetPerDay <= 100 ? 'bg-forest-500' : 'bg-gray-200'}`} />
                      <div className={`h-1 ${profile.budgetPerDay > 100 && profile.budgetPerDay <= 250 ? 'bg-ocean-500' : 'bg-gray-200'}`} />
                      <div className={`h-1 ${profile.budgetPerDay > 250 && profile.budgetPerDay <= 400 ? 'bg-purple-500' : 'bg-gray-200'}`} />
                      <div className={`h-1 ${profile.budgetPerDay > 400 && profile.budgetPerDay <= 700 ? 'bg-sunset-500' : 'bg-gray-200'}`} />
                      <div className={`h-1 rounded-r-full ${profile.budgetPerDay > 700 ? 'bg-berry-500' : 'bg-gray-200'}`} />
                    </div>
                    
                    <div className="flex justify-between text-[10px] text-text-light mt-1">
                      <span>🎒 0-100 DNT</span>
                      <span>⚖️ 100-250 DNT</span>
                      <span>🌟 250-400 DNT</span>
                      <span>✨ 400-700 DNT </span>
                      <span>👑 700+ DNT</span>
                    </div>
                  </div>

                  {/* Budget Presets */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {BUDGET_PRESETS.map((budget) => (
                      <button
                        key={budget.value}
                        onClick={() => handleBudgetChange(budget.value)}
                        className={`p-2 rounded-lg border text-left transition-all ${
                          profile.budgetPerDay === budget.value && !customBudget
                            ? 'border-ocean-500 bg-ocean-50 text-ocean-700' 
                            : 'border-gray-200 bg-white text-text-light hover:border-ocean-300 hover:bg-ocean-50/30'
                        }`}
                      >
                        <div className="font-display font-bold text-xs">{budget.label}</div>
                        <div className="text-[10px] opacity-70">{formatBudget(budget.value)} DNT/day</div>
                      </button>
                    ))}
                  </div>

                  {/* Custom Budget Input */}
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light font-mono"></span>
                    <input
                      type="text"
                      placeholder="Custom amount "
                      value={customBudget}
                      onChange={handleCustomBudgetInput}
                      className="w-full bg-white border border-gray-200 rounded-lg pl-7 pr-3 py-2.5 text-sm text-text placeholder-text-light focus:border-ocean-500 focus:ring-2 focus:ring-ocean-200 focus:outline-none transition-colors"
                    />
                  </div>
                  <p className="text-[10px] text-text-light mt-1">Enter any amount - no upper limit</p>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 space-y-5">
                <h2 className="font-display text-lg font-bold text-text">Transportation</h2>

                {/* Car option toggle */}
                <div className="bg-gradient-to-r from-sunset-50 to-ocean-50 border border-sunset-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🚗</span>
                      <div>
                        <div className="font-display font-bold text-sm">Traveling by Car</div>
                        <div className="font-mono text-[10px] text-text-light">Access to wider area, parking to consider</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setProfile(p => ({ ...p, hasCar: !p.hasCar }))}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        profile.hasCar ? 'bg-ocean-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-md ${
                          profile.hasCar ? 'left-7' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                  {profile.hasCar && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="mt-3 pt-3 border-t border-sunset-200"
                    >
                      <label className="block font-mono text-[10px] text-text-light mb-1">
                        Max driving distance per day (km)
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="200"
                        step="10"
                        value={profile.maxDrivingKm || 50}
                        onChange={(e) => setProfile(p => ({ ...p, maxDrivingKm: parseInt(e.target.value) }))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-ocean-500"
                      />
                      <div className="flex justify-between text-[9px] font-mono text-text-light mt-1">
                        <span>10km</span>
                        <span className="text-ocean-600 font-bold">{profile.maxDrivingKm || 50}km</span>
                        <span>200km</span>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Transport modes */}
                <div>
                  <label className="block font-mono text-[11px] text-ocean-600 tracking-widest uppercase mb-2">
                    Preferred Transport (select multiple)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {TRANSPORT_OPTIONS.map((mode) => {
                      const isSelected = profile.transportMode?.includes(mode.id)
                      return (
                        <button
                          key={mode.id}
                          onClick={() => toggleTransportMode(mode.id)}
                          className={`p-3 rounded-lg border text-left transition-all ${
                            isSelected 
                              ? 'border-ocean-500 bg-ocean-50 text-ocean-700' 
                              : 'border-gray-200 bg-white text-text-light hover:border-ocean-300 hover:bg-ocean-50/30'
                          }`}
                        >
                          <div className="text-lg mb-1">{mode.icon}</div>
                          <div className="font-display font-bold text-sm">{mode.label}</div>
                          <div className="text-[10px] opacity-70">{mode.desc}</div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Walking distance (if walking is selected) */}
                {profile.transportMode?.includes('walking') && (
                  <div>
                    <label className="block font-mono text-[10px] text-text-light mb-1">
                      Max walking distance per day (km)
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      step="1"
                      value={profile.maxWalkingKm}
                      onChange={(e) => setProfile(p => ({ ...p, maxWalkingKm: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-ocean-500"
                    />
                    <div className="flex justify-between text-[9px] font-mono text-text-light mt-1">
                      <span>1km</span>
                      <span className="text-ocean-600 font-bold">{profile.maxWalkingKm}km</span>
                      <span>20km</span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="p-6 text-center space-y-4">
                <div className="text-5xl mb-2">🗺</div>
                <h2 className="font-display text-xl font-bold text-text">Ready to explore!</h2>
                <div className="bg-ocean-50/50 border border-ocean-100 rounded-xl p-4 text-left space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-text-light">Traveller</span><span className="font-medium text-text">{profile.name || 'Traveler'}</span></div>
                  <div className="flex justify-between"><span className="text-text-light">Styles</span>
                    <span className="font-medium">
                      {profile.travelStyles?.map(s => 
                        TRAVEL_STYLES.find(ts => ts.id === s)?.icon
                      ).join(' ')}
                    </span>
                  </div>
                  <div className="flex justify-between"><span className="text-text-light">City</span><span className="font-medium">{selectedCity?.name || 'Not selected'}</span></div>
                  <div className="flex justify-between">
                    <span className="text-text-light">Budget</span>
                    <span className="font-medium">
                      <span className={currentCategory.color}>{currentCategory.icon}</span> ${formatBudget(profile.budgetPerDay)}/day
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-light">Transport</span>
                    <span className="font-medium">
                      {profile.hasCar && '🚗 '}
                      {profile.transportMode?.map(m => 
                        TRANSPORT_OPTIONS.find(to => to.id === m)?.icon
                      ).join(' ')}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="mx-6 mb-4 px-3 py-2 bg-sunset-50 border border-sunset-200 rounded-lg text-sunset-700 text-xs font-mono">
              ⚠ {error}
            </div>
          )}

          <div className="px-6 pb-6 flex gap-3">
            {step > 0 && (
              <button 
                onClick={() => { setStep(s => s - 1); setError('') }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-text-light font-display font-semibold text-sm hover:border-ocean-300 hover:text-ocean-600 transition-all bg-white"
              >
                ← Back
              </button>
            )}
            <button
              onClick={handleContinue}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-ocean-500 to-ocean-600 text-white font-display font-bold text-sm hover:from-ocean-600 hover:to-ocean-700 transition-all shadow-lg shadow-ocean-500/25"
            >
              {step === steps.length - 1 ? '🚀 Start Planning' : 'Continue →'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}