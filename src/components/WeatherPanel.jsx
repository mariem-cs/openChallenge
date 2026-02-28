import { useDraipStore } from '../store/draipStore'
import { motion } from 'framer-motion'

export default function WeatherPanel() {
  const { weather } = useDraipStore()

  if (!weather) return (
    <div className="p-4 border-b border-white/[0.06]">
      <div className="font-mono text-[10px] text-[#3d4f67] uppercase tracking-widest mb-3">Weather</div>
      <div className="text-[#3d4f67] text-xs font-mono animate-pulse">Loading...</div>
    </div>
  )

  const severityColor = weather.severity >= 4 ? 'text-crimson' : weather.severity >= 2 ? 'text-amber-ai' : 'text-jade'

  return (
    <div className="p-4 border-b border-white/[0.06]">
      <div className="font-mono text-[10px] text-[#3d4f67] uppercase tracking-widest mb-3">Live Weather</div>

      {/* Main condition */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{weather.icon}</span>
        <div>
          <div className={`font-display font-bold text-lg ${severityColor}`}>{weather.temperature}°C</div>
          <div className="font-mono text-[11px] text-[#7a8ba6]">{weather.condition}</div>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { icon: '💧', label: 'Rain', val: `${weather.precipitation}mm`, bad: weather.precipitation > 1 },
          { icon: '💨', label: 'Wind', val: `${weather.windSpeed} km/h`, bad: weather.windSpeed > 40 },
          { icon: '☀️', label: 'UV', val: weather.uvIndex?.toFixed(1), bad: weather.uvIndex > 7 },
          { icon: '👁', label: 'Visibility', val: weather.visibility ? `${(weather.visibility/1000).toFixed(1)}km` : 'Good', bad: false },
        ].map((m) => (
          <div key={m.label} className="bg-raised border border-white/[0.05] rounded-lg p-2">
            <div className="text-base mb-0.5">{m.icon}</div>
            <div className={`font-mono text-xs font-bold ${m.bad ? 'text-amber-ai' : 'text-white'}`}>{m.val}</div>
            <div className="font-mono text-[10px] text-[#3d4f67] uppercase">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Hourly forecast mini */}
      {weather.hourlyForecast?.length > 0 && (
        <div>
          <div className="font-mono text-[10px] text-[#3d4f67] uppercase tracking-widest mb-2">Next Hours</div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {weather.hourlyForecast.slice(0, 6).map((h, i) => (
              <div key={i} className={`flex-shrink-0 text-center p-1.5 rounded-lg border ${h.precipProb > 60 ? 'border-amber-ai/30 bg-amber-ai/5' : 'border-white/[0.05] bg-raised'}`}>
                <div className="font-mono text-[9px] text-[#3d4f67]">{String(h.hour).padStart(2,'0')}h</div>
                <div className="text-base my-0.5">{h.icon}</div>
                <div className="font-mono text-[9px] text-white">{h.temp}°</div>
                {h.precipProb > 20 && <div className="font-mono text-[8px] text-amber-ai">{h.precipProb}%</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {weather.isRaining && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="mt-3 px-2.5 py-2 bg-crimson/10 border border-crimson/20 rounded-lg"
        >
          <div className="font-mono text-[10px] text-crimson font-bold">⚠ ACTIVE RAIN</div>
          <div className="font-mono text-[9px] text-[#7a8ba6] mt-0.5">Outdoor activities affected</div>
        </motion.div>
      )}

      <div className="mt-2 font-mono text-[9px] text-[#3d4f67]">
        Source: Open-Meteo API · Updated {new Date(weather.fetchedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  )
}
