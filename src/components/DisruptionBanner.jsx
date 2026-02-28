import { motion, AnimatePresence } from 'framer-motion'
import { useDraipStore } from '../store/draipStore'

export function DisruptionBanner() {
  const { activeDisruption, clearDisruption } = useDraipStore()

  const SEVERITY_COLORS = {
    low:      { bg: 'bg-jade/10',    border: 'border-jade/25',    text: 'text-jade',     icon: 'ℹ' },
    medium:   { bg: 'bg-amber-ai/10',border: 'border-amber-ai/25',text: 'text-amber-ai', icon: '⚠' },
    high:     { bg: 'bg-crimson/10', border: 'border-crimson/25', text: 'text-crimson',  icon: '⚡' },
    critical: { bg: 'bg-crimson/15', border: 'border-crimson/40', text: 'text-crimson',  icon: '🚨' },
  }

  return (
    <AnimatePresence>
      {activeDisruption && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className={`px-4 py-2.5 border-b flex items-center gap-3 ${SEVERITY_COLORS[activeDisruption.severity <= 2 ? 'low' : activeDisruption.severity <= 3 ? 'medium' : activeDisruption.severity <= 4 ? 'high' : 'critical']?.bg || 'bg-amber-ai/10'} ${SEVERITY_COLORS[activeDisruption.severity <= 2 ? 'low' : 'high']?.border || 'border-amber-ai/25'}`}>
            <span className="text-base">
              {activeDisruption.type === 'WEATHER' ? '🌧' :
               activeDisruption.type === 'FATIGUE' ? '😴' :
               activeDisruption.type === 'CROWD' ? '👥' : '⚡'}
            </span>
            <div className="flex-1">
              <div className="font-mono text-[10px] text-crimson font-bold uppercase tracking-widest">
                {activeDisruption.type} DISRUPTION DETECTED
              </div>
              <div className="font-mono text-[11px] text-[#7a8ba6]">{activeDisruption.description}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-amber-ai animate-pulse">
                AI replanning...
              </span>
              <button
                onClick={clearDisruption}
                className="font-mono text-[10px] text-[#3d4f67] hover:text-white px-2 py-1 rounded border border-white/10 hover:border-white/20 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default DisruptionBanner

export function RLMetricsBar() {
  const { rlMetrics, itinerary } = useDraipStore()
  const satScore = rlMetrics.satisfactionHistory.length
    ? rlMetrics.satisfactionHistory[rlMetrics.satisfactionHistory.length - 1]
    : null

  return (
    <div className="px-4 py-1.5 border-b border-white/[0.04] bg-surface/50 flex items-center gap-5 overflow-x-auto">
      {[
        { label: 'Replans', val: rlMetrics.replanCount, color: 'text-amber-ai' },
        { label: 'Satisfaction', val: satScore ? `${satScore}%` : '—', color: 'text-jade' },
        { label: 'Latency', val: rlMetrics.lastReplanLatency ? `${rlMetrics.lastReplanLatency}ms` : '—', color: 'text-iris' },
        { label: 'Activities', val: itinerary.length, color: 'text-[#7a8ba6]' },
        { label: 'Weather API', val: 'Open-Meteo', color: 'text-teal' },
      ].map((m) => (
        <div key={m.label} className="flex items-center gap-1.5 flex-shrink-0">
          <span className="font-mono text-[9px] text-[#3d4f67] uppercase tracking-widest">{m.label}</span>
          <span className={`font-mono text-[9px] font-bold ${m.color}`}>{m.val}</span>
        </div>
      ))}
    </div>
  )
}
