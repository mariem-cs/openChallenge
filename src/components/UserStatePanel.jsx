import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDraipStore } from '../store/draipStore'

// Mood configuration - updated colors to match soft palette
const MOOD_OPTIONS = [
  { id: 'energy', icon: '⚡', label: 'Energy Level', min: 0, max: 100, default: 70, color: '#FF9F9F' },
  { id: 'relaxation', icon: '🧘', label: 'Need Relaxation', min: 0, max: 100, default: 40, color: '#B8E0D2' },
  { id: 'adventure', icon: '🗺️', label: 'Adventure Seeker', min: 0, max: 100, default: 60, color: '#FFD6A5' },
  { id: 'social', icon: '👥', label: 'Social Mood', min: 0, max: 100, default: 50, color: '#D6CCFE' },
  { id: 'culture', icon: '🏛️', label: 'Cultural Interest', min: 0, max: 100, default: 65, color: '#A9D6E5' },
]

// Preference categories
const PREFERENCE_CATEGORIES = [
  { id: 'nature', icon: '🌿', label: 'Nature & Outdoors', default: 0.5 },
  { id: 'food', icon: '🍽️', label: 'Food & Dining', default: 0.6 },
  { id: 'museums', icon: '🏛️', label: 'Museums & Culture', default: 0.7 },
  { id: 'nightlife', icon: '🌙', label: 'Nightlife', default: 0.3 },
  { id: 'shopping', icon: '🛍️', label: 'Shopping', default: 0.4 },
  { id: 'relaxation', icon: '🧘', label: 'Relaxation', default: 0.5 },
  { id: 'adventure', icon: '⛰️', label: 'Adventure', default: 0.6 },
  { id: 'photography', icon: '📸', label: 'Photography', default: 0.5 },
]

// Activity type filters
const ACTIVITY_TYPES = [
  { id: 'indoor', icon: '🏠', label: 'Indoor Activities' },
  { id: 'outdoor', icon: '🌳', label: 'Outdoor Activities' },
  { id: 'free', icon: '💰', label: 'Free Activities' },
  { id: 'paid', icon: '💵', label: 'Paid Activities' },
  { id: 'short', icon: '⏱️', label: 'Short (<1hr)' },
  { id: 'long', icon: '⏳', label: 'Long (>2hrs)' },
]

// Groq API call helper
async function generateTravelRecommendations(prompt, groqKey) {
  if (!groqKey) throw new Error("No Groq API key available");

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are an expert travel companion and creative local guide.
Generate 5–8 fresh, realistic, highly personalized activity/place recommendations tailored to the user's current mood, preferences, location, weather, and constraints.

For each recommendation return a JSON object with exactly these fields:
- name: short catchy name (string)
- category: one of: park, museum, restaurant, cafe, nightlife, shopping, spa, monument, art, theater, adventure, viewpoint, market, beach, historical, wellness, photography-spot, other (string)
- description: 1–2 engaging sentences (string)
- durationMin: estimated time in minutes (integer)
- costUsd: estimated cost in USD (integer, use 0 for free)
- isIndoor: true/false (boolean)
- whyItMatches: brief reason why this fits the mood/preferences (string, 1 sentence)
- crowdLevel: 0.0 to 1.0 (float)
- rating: realistic rating 1.0–5.0 (float)

Output ONLY a valid JSON array of objects. No markdown, no explanations, no extra text.`
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.75,
        max_tokens: 1400,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content?.trim() || '';

    try {
      const parsed = JSON.parse(content);
      if (!Array.isArray(parsed)) return [];
      return parsed.map(item => ({
        ...item,
        id: `groq-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        icon: getIconForCategory(item.category),
      }));
    } catch (parseErr) {
      console.error("Failed to parse Groq response as JSON:", content);
      return [];
    }
  } catch (err) {
    console.error("Groq recommendation error:", err);
    throw err;
  }
}

// Helper to get icon based on category
function getIconForCategory(category) {
  const icons = {
    park: '🌳',
    museum: '🏛️',
    restaurant: '🍽️',
    cafe: '☕',
    nightlife: '🌙',
    shopping: '🛍️',
    spa: '💆',
    monument: '🗼',
    art: '🎨',
    theater: '🎭',
    adventure: '⛰️',
    viewpoint: '🏔️',
    market: '🏪',
    beach: '🏖️',
    historical: '🏯',
    wellness: '🧘',
    'photography-spot': '📸',
    other: '📍',
  };
  return icons[category] || '📍';
}

export default function UserStatePanel({ onFeedback, onPreferenceUpdate }) {
  const {
    userState,
    userProfile,
    setUserProfile,
    location,
    weather,
    itinerary,
    setItinerary,
    addLogEntry,
    groqKey: storeGroqKey,
  } = useDraipStore();

  const [mood, setMood] = useState({
    energy: 70,
    relaxation: 40,
    adventure: 60,
    social: 50,
    culture: 65,
  });

  const [preferences, setPreferences] = useState(
    userProfile.preferences ||
    PREFERENCE_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat.id]: cat.default }), {})
  );

  const [selectedTypes, setSelectedTypes] = useState(['indoor', 'outdoor']);

  const [recommendedPlaces, setRecommendedPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addedPlaceIds, setAddedPlaceIds] = useState(new Set());

  // Determine effective Groq key
  const effectiveGroqKey = storeGroqKey || import.meta.env.VITE_GROQ_API_KEY;

  // Generate recommendations when relevant state changes
  useEffect(() => {
    if (!location?.city || !effectiveGroqKey) {
      setRecommendedPlaces([]);
      return;
    }

    const generate = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const prompt = `
Location: ${location.city || 'unknown'}, ${location.country || location.region || ''}

Current weather: ${weather?.condition || 'unknown'}, ~${weather?.temperature || '?'}°C ${weather?.isRaining ? '(rainy)' : weather?.isSunny ? '(sunny)' : ''}

User mood (0–100 scale):
- Energy level: ${mood.energy}
- Need for relaxation: ${mood.relaxation}
- Adventure seeking: ${mood.adventure}
- Social mood: ${mood.social}
- Cultural interest: ${mood.culture}

User preferences (0.0–1.0 scale):
${Object.entries(preferences)
  .map(([key, val]) => `- ${key}: ${val.toFixed(2)}`)
  .join('\n')}

Allowed activity types: ${selectedTypes.length ? selectedTypes.join(', ') : 'any'}

Daily budget remaining: ~$${Math.max(0, (userProfile.budgetPerDay || 150) - (userState.budgetSpent || 0))}

Current itinerary has ${itinerary.length} activities already planned.

Generate 5–8 fresh, creative, realistic recommendations that best match right now.
Focus on variety, feasibility, and strong alignment with the user's current state.
`;

        const suggestions = await generateTravelRecommendations(prompt, effectiveGroqKey);
        setRecommendedPlaces(suggestions);
      } catch (err) {
        setError("Failed to generate suggestions. Please try again.");
        setRecommendedPlaces([]);
      } finally {
        setIsLoading(false);
      }
    };

    generate();
  }, [mood, preferences, selectedTypes, location, weather, effectiveGroqKey, userProfile.budgetPerDay, userState.budgetSpent, itinerary.length]);

  const handleMoodChange = (id, value) => {
    setMood(prev => ({ ...prev, [id]: value }));
  };

  const handlePreferenceChange = (id, value) => {
    const newPrefs = { ...preferences, [id]: value };
    setPreferences(newPrefs);
    setUserProfile({ ...userProfile, preferences: newPrefs });
    if (onPreferenceUpdate) onPreferenceUpdate(newPrefs);
  };

  const toggleActivityType = (typeId) => {
    setSelectedTypes(prev =>
      prev.includes(typeId) ? prev.filter(t => t !== typeId) : [...prev, typeId]
    );
  };

  const addToItinerary = (place) => {
    const newActivity = {
      ...place,
      id: place.id || `groq-${Date.now()}`,
      status: 'pending',
      time: calculateNextAvailableTime(),
      endTime: calculateEndTime(place.durationMin),
      isNew: true,
      reasonChosen: place.whyItMatches || 'Matches your current mood & preferences',
    };

    const updated = [...itinerary, newActivity];
    setItinerary(updated);

    setAddedPlaceIds(prev => new Set([...prev, place.id]));
    setRecommendedPlaces(prev => prev.filter(p => p.id !== place.id));

    addLogEntry({
      type: 'user',
      title: 'ACTIVITY ADDED',
      message: `Added ${place.name} from suggestions`,
    });

    // Toast
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-24 right-6 bg-soft-coral-500 text-white px-4 py-3 rounded-xl text-sm font-medium shadow-xl z-50 animate-slide-up';
    toast.textContent = `+ ${place.name} added to plan`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3200);
  };

  const calculateNextAvailableTime = () => {
    if (!itinerary.length) return '09:00';
    const last = itinerary[itinerary.length - 1];
    if (last.endTime) return last.endTime;
    const [h, m] = (last.time || '09:00').split(':').map(Number);
    const nextH = (h + 1) % 24;
    return `${nextH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const calculateEndTime = (durationMin) => {
    const base = new Date();
    base.setMinutes(base.getMinutes() + (durationMin || 60));
    return `${base.getHours().toString().padStart(2, '0')}:${base.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleRefresh = () => {
    // Force regeneration by toggling a state or just call the effect again
    setIsLoading(true);
    setTimeout(() => {
      // The useEffect will run again when dependencies change
      // We can trigger it by modifying a dummy state or just rely on the effect
      setIsLoading(false);
    }, 100);
  };

  const budgetPct = Math.min(100, Math.round((userState.budgetSpent / userProfile.budgetPerDay) * 100));

  return (
    <div className="flex flex-col flex-1 overflow-y-auto bg-gradient-to-b from-soft-lavender-50 to-soft-peach-50">
      {/* Header / Profile summary */}
      <div className="p-4 border-b border-soft-lavender-200 bg-white/50 backdrop-blur-sm">
        <div className="font-mono text-xs text-soft-coral-600 uppercase tracking-wide mb-3">Your Travel Profile</div>
        
        {/* Profile card */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-soft-coral-400 to-soft-sky-400 flex items-center justify-center text-2xl shadow-md">
            🧭
          </div>
          <div>
            <div className="font-display font-bold text-lg text-[#2D3142]">{userProfile.name || 'Traveler'}</div>
            <div className="flex gap-2 mt-1">
              {userProfile.travelStyles?.map(style => (
                <span key={style} className="text-xs px-2 py-0.5 bg-soft-lavender-200 text-soft-lavender-700 rounded-full">
                  {style}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* State bars */}
        <div className="space-y-3">
          {[
            { label: 'Fatigue', val: userState.fatigue, color: '#FF9F9F' },
            { label: 'Stress', val: userState.stress, color: '#FFD6A5' },
            { label: 'Motivation', val: userState.motivation, color: '#B8E0D2' },
          ].map(({ label, val, color }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="font-mono text-xs text-gray-600 w-16">{label}</span>
              <div className="flex-1 h-2 bg-soft-lavender-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                  animate={{ width: `${val}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              <span className="font-mono text-xs text-gray-500 w-8 text-right">{val}%</span>
            </div>
          ))}
        </div>

        {/* Budget */}
        <div className="mt-3">
          <div className="flex justify-between mb-1">
            <span className="font-mono text-xs text-gray-600">Budget</span>
            <span className="font-mono text-xs text-soft-coral-600">
              ${userState.budgetSpent} / ${userProfile.budgetPerDay}
            </span>
          </div>
          <div className="h-2 bg-soft-lavender-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: budgetPct > 90 ? '#FF9F9F' : '#B8E0D2' }}
              animate={{ width: `${budgetPct}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>
      </div>

      {/* Mood sliders */}
      <div className="p-4 border-b border-soft-lavender-200">
        <div className="font-mono text-xs text-soft-coral-600 uppercase tracking-wide mb-4 flex items-center gap-2">
          <span className="text-lg">🎭</span> Your current vibe
        </div>
        <div className="space-y-5">
          {MOOD_OPTIONS.map(m => (
            <div key={m.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{m.icon}</span>
                  <span className="font-medium text-sm text-gray-700">{m.label}</span>
                </div>
                <span className="font-mono text-sm font-bold" style={{ color: m.color }}>{mood[m.id]}%</span>
              </div>
              <input
                type="range"
                min={m.min}
                max={m.max}
                value={mood[m.id]}
                onChange={e => handleMoodChange(m.id, Number(e.target.value))}
                className="w-full h-2 bg-soft-lavender-200 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: m.color }}
              />
            </div>
          ))}
        </div>
      </div>

 

      {/* Activity type toggles */}
      <div className="p-4 border-b border-soft-lavender-200">
        <div className="font-mono text-xs text-soft-coral-600 uppercase tracking-wide mb-3 flex items-center gap-2">
          <span className="text-lg">🎯</span> Activity filters
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {ACTIVITY_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => toggleActivityType(type.id)}
              className={`p-3 rounded-xl border text-left transition-all text-sm
                ${selectedTypes.includes(type.id)
                  ? 'border-soft-sky-400 bg-soft-sky-50 text-soft-sky-700'
                  : 'border-soft-lavender-200 bg-white text-gray-600 hover:border-soft-sky-300'
                }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{type.icon}</span>
                <span>{type.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* AI-Powered Recommendations */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="font-mono text-sm font-medium text-gray-800 flex items-center gap-2">
            <span className="text-xl">🧠</span> Recommended for you
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className={`px-4 py-2 text-sm rounded-full flex items-center gap-2 transition-all
              ${isLoading
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-soft-coral-100 text-soft-coral-600 hover:bg-soft-coral-200 border border-soft-coral-200'
              }`}
          >
            <span className={isLoading ? 'animate-spin' : ''}>↻</span>
            Refresh
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="flex gap-3">
              <div className="w-4 h-4 bg-soft-coral-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-4 h-4 bg-soft-sky-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-4 h-4 bg-soft-lavender-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center text-red-700">
            {error}
          </div>
        ) : recommendedPlaces.length > 0 ? (
          <div className="space-y-4">
            {recommendedPlaces.map((place, index) => (
              <motion.div
                key={place.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.07 }}
                className="p-4 bg-white border border-soft-lavender-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl flex-shrink-0 mt-1">{place.icon || '📍'}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-base text-gray-800">{place.name}</h4>
                      <span className="text-xs font-mono text-soft-coral-600 whitespace-nowrap">
                        {Math.round((place.rating || 4.5) * 20)}% match
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                      {place.description || `${place.category} in ${location?.city}`}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="text-xs px-2.5 py-1 bg-soft-lavender-100 text-soft-lavender-700 rounded-full">
                        {place.category}
                      </span>
                      <span className="text-xs px-2.5 py-1 bg-soft-peach-100 text-soft-peach-700 rounded-full">
                        {place.durationMin || 60} min
                      </span>
                      <span className="text-xs px-2.5 py-1 bg-soft-mint-100 text-soft-mint-700 rounded-full">
                        ${place.costUsd || 0}
                      </span>
                      <span className="text-xs px-2.5 py-1 bg-soft-sky-100 text-soft-sky-700 rounded-full">
                        {place.isIndoor ? 'Indoor' : 'Outdoor'}
                      </span>
                      {place.crowdLevel && (
                        <span className="text-xs px-2.5 py-1 bg-soft-coral-100 text-soft-coral-700 rounded-full">
                          {Math.round(place.crowdLevel * 100)}% crowd
                        </span>
                      )}
                    </div>

                    {place.whyItMatches && (
                      <div className="mt-3 text-xs italic text-soft-sky-600">
                        ✨ {place.whyItMatches}
                      </div>
                    )}

                    <button
                      onClick={() => addToItinerary(place)}
                      className="mt-4 w-full py-2.5 bg-gradient-to-r from-soft-coral-500 to-soft-sky-500 text-black rounded-xl font-medium text-sm hover:from-soft-coral-600 hover:to-soft-sky-600 transition-all shadow-sm"
                    >
                      + Add to Itinerary
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-gray-500">
            <div className="text-5xl mb-4 opacity-70">🧭</div>
            <p className="text-sm">Adjust your mood or preferences to get personalized suggestions</p>
            <button
              onClick={handleRefresh}
              className="mt-4 px-4 py-2 text-sm bg-soft-lavender-100 text-soft-lavender-700 rounded-full hover:bg-soft-lavender-200 transition-all"
            >
              Try different filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}