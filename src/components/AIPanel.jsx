import { motion, AnimatePresence } from 'framer-motion'
import { useDraipStore } from '../store/draipStore'
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts'
import { useState } from 'react'

const LOG_CONFIG = {
  system:  { color: 'text-[#00A896]',    bg: 'border-l-[#00A896]/40',    label: 'SYSTEM' },
  ai:      { color: 'text-[#FF6B35]',    bg: 'border-l-[#FF6B35]/40',    label: 'TRAVEL AI' },
  warning: { color: 'text-[#F4A261]',    bg: 'border-l-[#F4A261]/40',    label: 'ALERT' },
  replan:  { color: 'text-[#FF8C42]',    bg: 'border-l-[#FF8C42]/40',    label: 'REPLAN' },
  user:    { color: 'text-[#2A9D8F]',    bg: 'border-l-[#2A9D8F]/40',    label: 'YOU' },
  error:   { color: 'text-[#E76F51]',    bg: 'border-l-[#E76F51]/40',    label: 'ISSUE' },
}

// Activity types (moved from UserStatePanel)
const ACTIVITY_TYPES = [
  { id: 'indoor', icon: '🏠', label: 'Indoor Activities' },
  { id: 'outdoor', icon: '🌳', label: 'Outdoor Activities' },
  { id: 'free', icon: '💰', label: 'Free Activities' },
  { id: 'paid', icon: '💵', label: 'Paid Activities' },
  { id: 'short', icon: '⏱️', label: 'Short (<1hr)' },
  { id: 'long', icon: '⏳', label: 'Long (>2hrs)' },
]

export default function AIPanel({ onManualEvaluate }) {
  const { decisionLog, rlMetrics, isReplanning, isEvaluating } = useDraipStore()
  const [selectedTypes, setSelectedTypes] = useState(['indoor', 'outdoor'])

  const chartData = rlMetrics.satisfactionHistory.map((v, i) => ({ i, v }))

  // Toggle activity type filter
  const toggleActivityType = (typeId) => {
    setSelectedTypes(prev =>
      prev.includes(typeId) ? prev.filter(t => t !== typeId) : [...prev, typeId]
    )
  }

  return (
    <div className="flex flex-col h-full bg-white/70 backdrop-blur-sm">
      {/* Header with metrics */}
      <div className="p-4 border-b border-[#E0D5C3] bg-gradient-to-r from-[#FFF5F0]/50 to-[#F0FAFA]/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00A896] animate-pulse" />
            <span className="font-mono text-sm font-medium text-[#2D3142]">AI CONTROL CENTER</span>
          </div>
          <button
            onClick={onManualEvaluate}
            disabled={isEvaluating || isReplanning}
            className="px-3 py-1.5 text-xs font-mono bg-white border border-[#E0D5C3] rounded-full text-[#6B7280] hover:border-[#00A896] hover:text-[#00A896] transition-all disabled:opacity-40"
          >
            {isEvaluating ? '⟳ ANALYZING...' : '⟳ RUN ANALYSIS'}
          </button>
        </div>

        

        {/* Satisfaction trend chart */}
        {chartData.length > 1 && (
          <div>
            <div className="font-mono text-xs text-[#6B7280] mb-2">SATISFACTION TREND</div>
            <div className="h-20 bg-[#F8F1E9]/50 rounded-xl p-2 border border-[#E0D5C3]/70">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="satGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00A896" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#00A896" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="v" 
                    stroke="#00A896" 
                    strokeWidth={2} 
                    fill="url(#satGradient)" 
                    dot={false} 
                  />
                  <Tooltip
                    contentStyle={{ 
                      background: 'rgba(248, 241, 233, 0.95)', 
                      border: '1px solid #E0D5C3', 
                      borderRadius: 8, 
                      fontFamily: 'Space Mono, monospace',
                      fontSize: 11,
                      padding: '8px 12px'
                    }}
                    labelStyle={{ display: 'none' }}
                    itemStyle={{ color: '#2D3142' }}
                    formatter={(v) => [`${v}%`, 'Satisfaction']}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Activity type toggles */}
      <div className="p-4 border-b border-[#E0D5C3] bg-white/50">
        <div className="font-mono text-xs text-[#FF6B35] uppercase tracking-wide mb-3 flex items-center gap-2">
          <span className="text-lg">🎯</span> QUICK FILTERS
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {ACTIVITY_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => toggleActivityType(type.id)}
              className={`p-3 rounded-xl border text-left transition-all text-sm
                ${selectedTypes.includes(type.id)
                  ? 'border-[#00A896] bg-[#F0FAFA] text-[#00A896]'
                  : 'border-[#E0D5C3] bg-white text-[#6B7280] hover:border-[#FF6B35]/50'
                }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{type.icon}</span>
                <span>{type.label}</span>
              </div>
            </button>
          ))}
        </div>
        
        {/* Active filters summary */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="text-xs text-[#6B7280]">Active filters:</span>
          {selectedTypes.map(type => {
            const t = ACTIVITY_TYPES.find(t => t.id === type)
            return (
              <span key={type} className="text-xs px-2 py-0.5 bg-[#F0FAFA] text-[#00A896] rounded-full">
                {t?.label}
              </span>
            )
          })}
        </div>
      </div>

      {/* Decision Log Header */}
      <div className="px-4 pt-3 pb-1 flex items-center justify-between">
        <div className="font-mono text-xs text-[#6B7280] uppercase tracking-wide flex items-center gap-2">
          <span className="text-lg">📋</span> DECISION LOG
        </div>
        <span className="text-xs font-mono text-[#6B7280]">
          {decisionLog.length} events
        </span>
      </div>

      {/* Decision Log */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 bg-[#F8F1E9]">
        <AnimatePresence initial={false}>
          {decisionLog.slice(-12).reverse().map((entry, index) => {
            const config = LOG_CONFIG[entry.type] || LOG_CONFIG.system
            return (
              <motion.div
                key={entry.id || index}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className={`
                  p-3.5 rounded-xl border border-[#E0D5C3] shadow-sm
                  ${config.bg || 'border-l-[#6B7280]/30 bg-white/60'}
                `}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <span className={`text-xl ${config.color}`}>
                      {entry.type === 'ai' ? '🧭' :
                       entry.type === 'user' ? '👤' :
                       entry.type === 'replan' ? '🔄' :
                       entry.type === 'warning' ? '⚠️' :
                       entry.type === 'error' ? '❌' : 'ℹ️'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-mono text-xs font-medium uppercase ${config.color}`}>
                        {config.label}
                      </span>
                      <span className="font-mono text-[10px] text-[#6B7280]">
                        {entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                      </span>
                    </div>
                    <p className="text-sm text-[#2D3142] leading-relaxed whitespace-pre-wrap">
                      {entry.message}
                    </p>
                    {entry.detail && (
                      <div className="mt-2 text-xs text-[#6B7280] bg-white/80 p-2 rounded-lg border border-[#E0D5C3]/50">
                        {entry.detail}
                      </div>
                    )}
                    {entry.rules && entry.rules.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {entry.rules.map((rule, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 bg-[#FF6B35]/10 text-[#FF6B35] rounded-full">
                            {rule}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {decisionLog.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-center text-[#6B7280]">
            <div className="text-5xl opacity-50 mb-3">🧭</div>
            <p className="font-mono text-sm">AI decisions will appear here...</p>
            <p className="font-mono text-xs text-[#6B7280]/70 mt-1">Start planning to see insights</p>
          </div>
        )}
      </div>

      {/* Footer with stats */}
      {decisionLog.length > 0 && (
        <div className="p-3 border-t border-[#E0D5C3] bg-white/50 text-[10px] font-mono text-[#6B7280] flex justify-between">
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
          <span>AI v1.0 • Active</span>
        </div>
      )}
    </div>
  )
}