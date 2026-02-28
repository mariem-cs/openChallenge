import { motion, AnimatePresence } from 'framer-motion'
import { useDraipStore } from '../store/draipStore'
import { useState, forwardRef } from 'react'
import ChatBot from './ChatBot'

const STATUS_CONFIG = {
  done: {
    dot: 'bg-[#2A9D8F]',           // seafoam/teal success
    card: 'opacity-60 bg-[#F8F1E9]/70',
    badge: { text: 'DONE', style: 'bg-[#2A9D8F]/10 text-[#2A9D8F] border-[#2A9D8F]/30' }
  },
  active: {
    dot: 'bg-[#FF6B35] ring-4 ring-[#FF6B35]/30',
    card: 'border-[#FF8C42]/40 bg-[#FFF5F0]',
    badge: { text: 'NOW', style: 'bg-[#FF6B35]/10 text-[#FF6B35] border-[#FF6B35]/30' }
  },
  new: {
    dot: 'bg-[#00A896] ring-4 ring-[#00A896]/30',
    card: 'border-[#00BFA5]/40 bg-[#F0FAFA]',
    badge: { text: 'NEW', style: 'bg-[#00A896]/10 text-[#00A896] border-[#00A896]/30' }
  },
  disrupted: {
    dot: 'bg-[#E76F51]',
    card: 'border-[#F4A261]/40 bg-[#FFF8F2]',
    badge: { text: 'CHANGED', style: 'bg-[#E76F51]/10 text-[#E76F51] border-[#E76F51]/30' }
  },
  upcoming: {
    dot: 'bg-[#FFD166]',
    card: '',
    badge: { text: 'UPCOMING', style: 'bg-[#FFD166]/20 text-[#F4A261] border-[#FFD166]/40' }
  },
  pending: {
    dot: 'bg-[#83C5BE]',
    card: 'border-[#83C5BE]/40 bg-[#F0FAF9]',
    badge: { text: 'PENDING', style: 'bg-[#83C5BE]/15 text-[#2A9D8F] border-[#83C5BE]/30' }
  },
}

// Wrap ActivityCard with forwardRef
const ActivityCard = forwardRef(({ activity, isLast, onConfirm, onDelete }, ref) => {
  const [expanded, setExpanded] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const cfg = STATUS_CONFIG[activity.status] || STATUS_CONFIG.upcoming

  const getLocationDisplay = () => {
    if (activity.address && activity.address !== 'Address not available' && activity.address !== 'Location in area') {
      return activity.address
    }
    
    const locations = {
      restaurant: 'Dining spot',
      cafe: 'Café area',
      museum: 'Cultural quarter',
      park: 'Green escape',
      monument: 'Historic landmark',
      art: 'Creative district',
      shopping: 'Market zone',
      nightlife: 'Evening hub',
      theater: 'Arts venue',
      spa: 'Relaxation retreat',
      hotel: 'Stay area',
    }
    
    return locations[activity.category] || 'Local gem'
  }

  const handleConfirm = (e) => {
    e.stopPropagation()
    onConfirm(activity.id)
    setShowActions(false)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    onDelete(activity.id)
    setShowActions(false)
  }

  return (
    <div ref={ref} className="flex gap-0 group relative">
      {/* Spine / Timeline line */}
      <div className="flex flex-col items-center w-10 flex-shrink-0">
        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-5 relative z-10 ${cfg.dot}`} />
        {!isLast && <div className="w-px flex-1 bg-gradient-to-b from-[#FF8C42]/40 to-[#00BFA5]/40 min-h-[28px]" />}
      </div>

      {/* Hover actions */}
      <div className="absolute -left-2 top-5 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex gap-1">
        {activity.status === 'pending' && (
          <>
            <button
              onClick={handleConfirm}
              className="w-6 h-6 rounded-full bg-[#2A9D8F]/20 border border-[#2A9D8F]/40 flex items-center justify-center text-[#2A9D8F] hover:bg-[#2A9D8F]/30 transition-all shadow-sm"
              title="Confirm activity"
            >
              ✓
            </button>
            <button
              onClick={handleDelete}
              className="w-6 h-6 rounded-full bg-[#FF6B35]/20 border border-[#FF6B35]/40 flex items-center justify-center text-[#FF6B35] hover:bg-[#FF6B35]/30 transition-all shadow-sm"
              title="Remove activity"
            >
              ✕
            </button>
          </>
        )}
        {activity.status !== 'pending' && activity.status !== 'done' && (
          <button
            onClick={handleDelete}
            className="w-6 h-6 rounded-full bg-[#FF6B35]/20 border border-[#FF6B35]/40 flex items-center justify-center text-[#FF6B35] hover:bg-[#FF6B35]/30 transition-all shadow-sm"
            title="Remove activity"
          >
            ✕
          </button>
        )}
      </div>

      {/* Card */}
      <motion.div
        layout
        initial={activity.isNew ? { opacity: 0, x: -12, scale: 0.97 } : false}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        className={`flex-1 my-2 ml-3 rounded-xl border bg-white shadow-md cursor-pointer transition-all duration-200
          hover:shadow-lg hover:translate-x-0.5 ${cfg.card} ${
          activity.status === 'pending' ? 'border-[#83C5BE]/50' : 'border-[#E0D5C3]'
        }`}
        onClick={() => setExpanded(e => !e)}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className="flex overflow-hidden rounded-xl">
          <div className={`w-[3px] flex-shrink-0 rounded-l-xl ${
            activity.status === 'active' ? 'bg-[#FF6B35]' :
            activity.status === 'new' ? 'bg-[#00A896]' :
            activity.status === 'pending' ? 'bg-[#83C5BE]' :
            activity.status === 'done' ? 'bg-transparent' : 'bg-[#FFD166]'
          }`} />

          <div className="flex-1 p-3.5">
            <div className="flex items-start justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2.5">
                <span className="text-xl leading-none">{activity.icon}</span>
                <div>
                  <div className="font-display font-bold text-sm leading-tight text-[#2D3142]">{activity.name}</div>
                  <div className="font-mono text-[10px] text-[#6B7280] mt-0.5">
                    {activity.time} → {activity.endTime || activity.time}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded-sm border ${cfg.badge.style}`}>
                  {cfg.badge.text}
                </span>
              </div>
            </div>

            {/* Meta chips */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { icon: '⏱', val: activity.durationMin ? `${activity.durationMin} min` : null },
                { icon: '💰', val: activity.costUsd ? `$${activity.costUsd}` : null },
                { icon: activity.isIndoor ? '🏠' : '🌿', val: activity.isIndoor ? 'Indoor' : 'Outdoor' },
                { icon: '👥', val: activity.crowdLevel ? `${Math.round(activity.crowdLevel * 100)}%` : null },
                { icon: '⭐', val: activity.rating ? `${activity.rating.toFixed(1)}` : null },
              ].filter(m => m.val).map((m) => (
                <span key={m.icon} className="font-mono text-[10px] text-[#6B7280] flex items-center gap-1 bg-[#F8F1E9] px-2 py-0.5 rounded-full border border-[#E0D5C3]">
                  {m.icon} {m.val}
                </span>
              ))}
            </div>

            {activity.status === 'pending' && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-1.5 text-[9px] font-mono bg-[#2A9D8F]/10 border border-[#2A9D8F]/30 rounded text-[#2A9D8F] hover:bg-[#2A9D8F]/20 transition-all"
                >
                  ✓ Confirm
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-1.5 text-[9px] font-mono bg-[#FF6B35]/10 border border-[#FF6B35]/30 rounded text-[#FF6B35] hover:bg-[#FF6B35]/20 transition-all"
                >
                  ✕ Remove
                </button>
              </div>
            )}

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 border-t border-[#E0D5C3]/70 mt-3 space-y-2.5">
                    {/* IMAGE */}
                    {activity.photo ? (
                      <div className="rounded-lg overflow-hidden mb-2 shadow-sm">
                        {activity.photo.url ? (
                          <img 
                            src={activity.photo.url} 
                            alt={activity.name}
                            className="w-full h-32 object-cover"
                            onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                          />
                        ) : activity.photo.fromWikipedia ? (
                          <div className="w-full h-32 bg-gradient-to-br from-[#F0FAFA] to-[#FFF5F0] rounded-lg flex items-center justify-center">
                            <span className="text-2xl mr-2">📖</span>
                            <span className="font-mono text-xs text-[#6B7280]">From Wikipedia: {activity.photo.page}</span>
                          </div>
                        ) : null}
                        {activity.photo.attribution && (
                          <div className="text-[8px] text-[#9CA3AF] mt-1">
                            📸 {activity.photo.attribution}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className={`w-full h-24 bg-gradient-to-br from-[#FFF5F0] to-[#F0FAFA] rounded-lg flex items-center justify-center mb-2 shadow-sm`}>
                        <span className="text-4xl opacity-60">{activity.placeholderIcon || activity.icon}</span>
                      </div>
                    )}

                    {activity.description && (
                      <p className="text-xs text-[#4B5563] leading-relaxed">{activity.description}</p>
                    )}
                    
                    <div className="flex gap-2">
                      <span className="font-mono text-[10px] text-[#6B7280] flex-shrink-0">📍</span>
                      <span className="font-mono text-[10px] text-[#4B5563]">{getLocationDisplay()}</span>
                    </div>
                    
                    {activity.reasonChosen && (
                      <div className="flex gap-2">
                        <span className="font-mono text-[10px] text-[#FF6B35] flex-shrink-0">WHY:</span>
                        <span className="font-mono text-[10px] text-[#4B5563]">{activity.reasonChosen}</span>
                      </div>
                    )}
                    
                    {activity.phone && (
                      <div className="flex gap-2">
                        <span className="font-mono text-[10px] text-[#6B7280] flex-shrink-0">📞</span>
                        <span className="font-mono text-[10px] text-[#4B5563]">{activity.phone}</span>
                      </div>
                    )}
                    
                    {activity.website && (
                      <div className="flex gap-2">
                        <span className="font-mono text-[10px] text-[#6B7280] flex-shrink-0">🌐</span>
                        <a 
                          href={activity.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-mono text-[10px] text-[#00A896] hover:underline truncate"
                        >
                          {activity.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                    
                    {activity.estimatedWaitMin > 0 && (
                      <div className="flex gap-2">
                        <span className="font-mono text-[10px] text-[#F4A261] flex-shrink-0">⏳</span>
                        <span className="font-mono text-[10px] text-[#4B5563]">Est. wait: {activity.estimatedWaitMin} min</span>
                      </div>
                    )}
                    
                    {typeof activity.crowdLevel === 'number' && (
                      <div>
                        <div className="font-mono text-[10px] text-[#6B7280] mb-1">Crowd level</div>
                        <div className="h-1.5 bg-[#E0D5C3]/70 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${activity.crowdLevel * 100}%`,
                              background: activity.crowdLevel > 0.7 ? '#FF9F9F' : activity.crowdLevel > 0.4 ? '#FFD166' : '#83C5BE',
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  )
})

ActivityCard.displayName = 'ActivityCard'

export default function ItineraryTimeline() {
  const { itinerary, itineraryVersion, dayTheme, plannerNote, isReplanning, setItinerary, addLogEntry } = useDraipStore()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [isChatOpen, setIsChatOpen] = useState(false)

  const handleConfirm = (activityId) => {
    const updatedItinerary = itinerary.map(activity => 
      activity.id === activityId 
        ? { ...activity, status: 'upcoming' }
        : activity
    )
    setItinerary(updatedItinerary)
    
    const activity = itinerary.find(a => a.id === activityId)
    addLogEntry({
      type: 'user',
      title: 'ACTIVITY CONFIRMED',
      message: `Confirmed ${activity?.name}`,
    })
  }

  const handleDelete = (activityId) => {
    setShowDeleteConfirm(activityId)
  }

  const confirmDelete = (activityId) => {
    const activity = itinerary.find(a => a.id === activityId)
    const updatedItinerary = itinerary.filter(a => a.id !== activityId)
    
    setItinerary(updatedItinerary)
    setShowDeleteConfirm(null)
    
    addLogEntry({
      type: 'user',
      title: 'ACTIVITY REMOVED',
      message: `Removed ${activity?.name} from itinerary`,
    })

    const toast = document.createElement('div')
    toast.className = 'fixed bottom-24 right-6 bg-[#FF6B35] text-white px-4 py-2 rounded-lg text-xs font-mono z-50 animate-slide-up shadow-lg'
    toast.textContent = `🗑️ Removed ${activity?.name}`
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 3000)
  }

  const cancelDelete = () => {
    setShowDeleteConfirm(null)
  }

  if (!itinerary.length) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center text-[#6B7280] font-mono text-sm">No itinerary planned yet — let's start exploring! 🌍</div>
    </div>
  )

  const doneCount = itinerary.filter(a => a.status === 'done').length
  const totalCount = itinerary.length
  const totalCost = itinerary.reduce((s, a) => s + (a.costUsd || 0), 0)
  const totalWalking = itinerary.reduce((s, a) => s + (a.distanceFromPrevM || 0), 0)
  const pendingCount = itinerary.filter(a => a.status === 'pending').length

  return (
    <div className="p-4 relative min-h-screen bg-[#F8F1E9]">
      {/* Floating travel icons – subtle & dreamy */}
      <motion.div className="absolute top-[8%] left-[6%] text-6xl opacity-15 pointer-events-none z-0" animate={{ y: [0, -25, 0], rotate: [0, 6, -6, 0] }} transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}>🎈</motion.div>
      <motion.div className="absolute top-[22%] right-[8%] text-7xl opacity-15 pointer-events-none z-0" animate={{ x: [0, -40, 40, 0], y: [0, 15, -15, 0] }} transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}>✈️</motion.div>
      <motion.div className="absolute bottom-[18%] left-[12%] text-6xl opacity-15 pointer-events-none z-0" animate={{ rotate: [0, 360] }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}>🧭</motion.div>
      <motion.div className="absolute bottom-[35%] right-[18%] text-7xl opacity-15 pointer-events-none z-0" animate={{ y: [0, -18, 0], rotate: [0, 8, -8, 0] }} transition={{ duration: 19, repeat: Infinity }}>🌍</motion.div>
      <motion.div className="absolute top-[45%] left-[15%] text-6xl opacity-15 pointer-events-none z-0" animate={{ rotate: [0, 7, -7, 0], scale: [1, 1.12, 1] }} transition={{ duration: 17, repeat: Infinity }}>🌴</motion.div>
      <motion.div className="absolute top-[65%] right-[7%] text-6xl opacity-15 pointer-events-none z-0" animate={{ y: [0, -12, 0], x: [0, 15, -15, 0] }} transition={{ duration: 24, repeat: Infinity }}>⛱️</motion.div>

      {/* Subtle gradient orbs */}
      <div className="absolute top-[-80px] right-[-80px] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#FF8C42]/8 to-[#00BFA5]/8 pointer-events-none z-0" />
      <div className="absolute bottom-[-80px] left-[-80px] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#FFD166]/8 to-[#83C5BE]/8 pointer-events-none z-0" />

      {/* Main content */}
      <div className="relative z-10">
        {/* Header card */}
        <div className="bg-white rounded-2xl p-4 mb-5 shadow-md border border-[#E0D5C3]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-base text-[#2D3142]">Your Adventure</h2>
              <div className="font-mono text-[11px] text-[#6B7280] mt-0.5">
                v{itineraryVersion} · {totalCount} stops · <span className="text-[#FF6B35] font-bold">${totalCost}</span>
              </div>
              {dayTheme && <div className="font-mono text-[10px] text-[#00A896] mt-1">✨ {dayTheme}</div>}
              {pendingCount > 0 && (
                <div className="font-mono text-[9px] text-[#83C5BE] mt-1">
                  ⏳ {pendingCount} suggestion{pendingCount > 1 ? 's' : ''} waiting
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="font-mono text-[11px] text-[#6B7280]">{doneCount}/{totalCount} completed</div>
              <div className="font-mono text-[11px] text-[#6B7280]">{(totalWalking / 1000).toFixed(1)} km explored</div>
            </div>
          </div>

          <div className="h-1.5 bg-[#E0D5C3]/70 rounded-full overflow-hidden mt-3">
            <motion.div
              className="h-full bg-gradient-to-r from-[#FF6B35] to-[#00A896] rounded-full"
              animate={{ width: totalCount > 0 ? `${(doneCount / totalCount) * 100}%` : '0%' }}
              transition={{ duration: 1.2 }}
            />
          </div>
        </div>

        {/* Bulk pending actions */}
        {pendingCount > 0 && (
          <div className="mb-5 p-3 bg-[#F0FAF9] border border-[#83C5BE]/40 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[#2A9D8F]">⏳</span>
              <span className="font-mono text-[10px] text-[#4B5563]">
                {pendingCount} suggestion{pendingCount > 1 ? 's' : ''} to review
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => itinerary.forEach(a => a.status === 'pending' && handleConfirm(a.id))}
                className="px-3 py-1 text-[9px] font-mono bg-[#2A9D8F]/15 border border-[#2A9D8F]/30 rounded text-[#2A9D8F] hover:bg-[#2A9D8F]/25 transition-all"
              >
                Confirm All
              </button>
              <button
                onClick={() => {
                  const pendingIds = itinerary.filter(a => a.status === 'pending').map(a => a.id)
                  pendingIds.forEach(id => handleDelete(id))
                }}
                className="px-3 py-1 text-[9px] font-mono bg-[#FF6B35]/15 border border-[#FF6B35]/30 rounded text-[#FF6B35] hover:bg-[#FF6B35]/25 transition-all"
              >
                Remove All
              </button>
            </div>
          </div>
        )}

        {/* Replanning notice */}
        <AnimatePresence>
          {isReplanning && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-5 p-3 bg-[#F0FAFA] border border-[#00A896]/30 rounded-xl flex items-center gap-3"
            >
              <span className="text-[#00A896] animate-spin-slow text-xl">⟳</span>
              <div className="font-mono text-[10px] text-[#4B5563]">Tailoring your journey in real time...</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/25 flex items-center justify-center z-50"
              onClick={cancelDelete}
            >
              <motion.div
                initial={{ scale: 0.88, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.88, y: 20 }}
                className="bg-white border border-[#E0D5C3] rounded-2xl p-5 max-w-xs mx-4 shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="text-center mb-5">
                  <div className="text-5xl mb-3">🗑️</div>
                  <h3 className="font-display font-bold text-sm text-[#2D3142] mb-1.5">Remove this stop?</h3>
                  <p className="font-mono text-[10px] text-[#6B7280]">
                    This will be removed from your travel plan.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => confirmDelete(showDeleteConfirm)}
                    className="flex-1 py-2.5 bg-[#FF6B35]/10 border border-[#FF6B35]/30 rounded-xl text-[#FF6B35] font-mono text-xs hover:bg-[#FF6B35]/20 transition-all"
                  >
                    Yes, Remove
                  </button>
                  <button
                    onClick={cancelDelete}
                    className="flex-1 py-2.5 bg-[#F8F1E9] border border-[#E0D5C3] rounded-xl text-[#4B5563] font-mono text-xs hover:bg-[#EDE4D9] transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timeline items */}
        <AnimatePresence mode="popLayout">
          {itinerary.map((activity, i) => (
            <ActivityCard 
              key={activity.id || i} 
              activity={activity} 
              isLast={i === itinerary.length - 1}
              onConfirm={handleConfirm}
              onDelete={handleDelete}
            />
          ))}
        </AnimatePresence>

        {plannerNote && (
          <div className="mt-5 p-3.5 bg-[#F0FAFA] border border-[#00A896]/20 rounded-2xl shadow-sm">
            <div className="font-mono text-[10px] text-[#00A896] uppercase tracking-wide mb-1.5">Travel Note</div>
            <p className="text-xs text-[#4B5563] leading-relaxed">{plannerNote}</p>
          </div>
        )}
      </div>

      {/* Chat toggle */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-[#FF6B35] via-[#FF8C42] to-[#00A896] shadow-xl flex items-center justify-center text-2xl z-40 hover:shadow-2xl transition-all"
      >
        🤖
      </motion.button>

      <AnimatePresence>
        {isChatOpen && <ChatBot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />}
      </AnimatePresence>
    </div>
  )
}