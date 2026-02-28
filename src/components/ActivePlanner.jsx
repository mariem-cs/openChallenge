import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDraipStore } from '../store/draipStore'
import { useWeather, useContextMonitor, useFeedback } from '../hooks/useDraip'
import WeatherPanel from './WeatherPanel'
import ItineraryTimeline from './ItineraryTimeline'
import AIPanel from './AIPanel'
import UserStatePanel from './UserStatePanel'
import DisruptionBanner, { RLMetricsBar } from './DisruptionBanner'

export default function ActivePlanner() {
  const {
    location, itinerary, itineraryVersion, dayTheme, plannerNote,
    isReplanning, isEvaluating, resetTrip, setPhase,
  } = useDraipStore()

  useWeather()
  const { evaluate } = useContextMonitor()
  const { sendFeedback } = useFeedback()

  // Evaluate context when itinerary changes and every 3 min
  useEffect(() => {
    const timer = setTimeout(() => evaluate(), 60_000) // first eval after 1 min
    return () => clearTimeout(timer)
  }, [itineraryVersion, evaluate])

  return (
    <div className="min-h-screen bg-[#F8F1E9] flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E0D5C3] h-14 flex items-center px-5 gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#FF6B35]" />
            <div className="w-3 h-3 rounded-full bg-[#FFD166]" />
            <div className="w-3 h-3 rounded-full bg-[#00A896]" />
          </div>
          <span className="font-mono text-xs text-[#6B7280]">
            DRAIP — {location?.city || 'Your Journey'} — {new Date().toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
          </span>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {isEvaluating && (
            <span className="flex items-center gap-2 text-xs font-mono text-[#FF6B35] bg-[#FFF5F0] border border-[#FF6B35]/30 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#FF6B35] animate-pulse" />
              Evaluating plan...
            </span>
          )}
          {isReplanning && (
            <span className="flex items-center gap-2 text-xs font-mono text-[#00A896] bg-[#F0FAFA] border border-[#00A896]/30 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-[#00A896] animate-pulse" />
              Replanning...
            </span>
          )}
          <span className="flex items-center gap-2 text-xs font-mono text-[#2D3142] bg-[#F8F1E9] border border-[#E0D5C3] px-3 py-1 rounded-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#FFD166] animate-pulse-dot" />
            AI Travel Engine
          </span>
          <button
            onClick={() => { resetTrip(); setPhase('setup') }}
            className="text-xs font-mono text-[#4B5563] hover:text-[#FF6B35] px-3 py-1.5 rounded-lg border border-[#E0D5C3] hover:border-[#FF6B35]/50 hover:bg-[#FFF5F0]/50 transition-all"
          >
            ↺ New Adventure
          </button>
        </div>
      </header>

      {/* RL Metrics & Disruption Banner */}
      <RLMetricsBar />
      <DisruptionBanner />

      {/* Day Theme Banner */}
      {dayTheme && (
        <div className="px-5 py-3 bg-gradient-to-r from-[#FFF5F0] to-[#F0FAFA] border-b border-[#E0D5C3]">
          <p className="text-center font-display text-sm text-[#2D3142] tracking-wide">
            <span className="text-xs font-mono text-[#00A896] mr-2 uppercase">Today's Vibe</span>
            {dayTheme}
          </p>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden" style={{ height: 'calc(100vh - 128px)' }}>
        {/* Left Sidebar – Weather + User State */}
        <aside className="w-72 flex-shrink-0 border-r border-[#E0D5C3] overflow-y-auto hidden lg:flex flex-col bg-white/70 backdrop-blur-sm">
          <WeatherPanel />
          <UserStatePanel onFeedback={sendFeedback} />
        </aside>

        {/* Center – Itinerary Timeline */}
        <main className="flex-1 overflow-y-auto bg-[#F8F1E9]">
          <ItineraryTimeline />
        </main>

        {/* Right Sidebar – AI Assistant Panel */}
        <aside className="w-80 flex-shrink-0 border-l border-[#E0D5C3] overflow-y-auto hidden xl:flex flex-col bg-white/70 backdrop-blur-sm">
          <AIPanel onManualEvaluate={evaluate} />
        </aside>
      </div>

      {/* Floating subtle travel elements (optional – can be removed if too much) */}
      <motion.div
        className="absolute bottom-12 right-12 text-6xl opacity-10 pointer-events-none z-0"
        animate={{ rotate: [0, 10, -10, 0], y: [0, -15, 15, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      >
        ✈️
      </motion.div>
    </div>
  )
}