import { create } from 'zustand'
import { computeRLReward, updateFatigueModel } from '../services/aiService'

const DEFAULT_USER = {
  name: 'Traveller',
  travelStyle: 'explorer', // relaxed | explorer | cultural | luxury
  energyLevel: 'high',
  budgetPerDay: 200,
  budgetSensitive: 0.4,
  preferences: {
    nature: 0.3,
    food: 0.3,
    museums: 0.7,
    nightlife: 0.2,
    shopping: 0.2,
  },
  maxWalkingKm: 8,
}

export const useDraipStore = create((set, get) => ({
  // ── API Keys ──
  anthropicKey: '',
  groqKey: '', // Add Groq API key
  setApiKeys: (anthropic, groq) => // Update to include groq
    set({ anthropicKey: anthropic, groqKey: groq }),

  // ── Location ──
  location: null,         // { lat, lon, city }
  setLocation: (loc) => set({ location: loc }),

  // ── User Profile ──
  userProfile: DEFAULT_USER,
  setUserProfile: (profile) => set({ userProfile: { ...DEFAULT_USER, ...profile } }),

  // ── Dynamic User State ──
  userState: {
    fatigue: 10,
    stress: 5,
    motivation: 90,
    budgetSpent: 0,
  },
  updateUserState: (delta) =>
    set((s) => ({
      userState: {
        fatigue: Math.max(0, Math.min(100, s.userState.fatigue + (delta.fatigueDelta || 0))),
        stress: Math.max(0, Math.min(100, s.userState.stress + (delta.stressDelta || 0))),
        motivation: Math.max(0, Math.min(100, s.userState.motivation + (delta.motivationDelta || 0))),
        budgetSpent: Math.max(0, s.userState.budgetSpent + (delta.budgetDelta || 0)),
      },
    })),
  resetUserState: () => set({ userState: { fatigue: 10, stress: 5, motivation: 90, budgetSpent: 0 } }),

  // ── Weather ──
  weather: null,
  weatherError: null,
  setWeather: (w) => set({ weather: w, weatherError: null }),
  setWeatherError: (e) => set({ weatherError: e }),

  // ── Places ──
  availablePlaces: [],
  setPlaces: (places) => set({ availablePlaces: places }),

  // ── Itinerary ──
  itinerary: [],
  itineraryVersion: 0,
  dayTheme: '',
  plannerNote: '',
  setItinerary: (items, theme = '', note = '') =>
    set((s) => ({
      itinerary: items,
      itineraryVersion: s.itineraryVersion + 1,
      dayTheme: theme,
      plannerNote: note,
    })),

  // ── AI Decision Log ──
  decisionLog: [],
  addLogEntry: (entry) =>
    set((s) => ({
      decisionLog: [
        { ...entry, id: Date.now(), timestamp: new Date().toISOString() },
        ...s.decisionLog.slice(0, 49), // keep last 50
      ],
    })),

  // ── RL Metrics ──
  rlMetrics: {
    cumulativeReward: 0,
    replanCount: 0,
    satisfactionHistory: [],
    lastReplanLatency: 0,
  },
  updateRLMetrics: (update) =>
    set((s) => ({
      rlMetrics: {
        ...s.rlMetrics,
        ...update,
        satisfactionHistory: [
          ...s.rlMetrics.satisfactionHistory.slice(-11),
          update.satisfactionPoint ?? null,
        ].filter((v) => v !== null),
      },
    })),

  // ── Loading / Status ──
  isGenerating: false,
  isReplanning: false,
  isEvaluating: false,
  setGenerating: (v) => set({ isGenerating: v }),
  setReplanning: (v) => set({ isReplanning: v }),
  setEvaluating: (v) => set({ isEvaluating: v }),

  // ── Disruption Banner ──
  activeDisruption: null,
  setDisruption: (d) => set({ activeDisruption: d }),
  clearDisruption: () => set({ activeDisruption: null }),

  // ── App Phase ──
  phase: 'landing',
   // setup | planning | active | done
  setPhase: (p) => set({ phase: p }),

  // ── Reset ──
  resetTrip: () =>
    set({
      itinerary: [],
      itineraryVersion: 0,
      dayTheme: '',
      plannerNote: '',
      decisionLog: [],
      activeDisruption: null,
      rlMetrics: { cumulativeReward: 0, replanCount: 0, satisfactionHistory: [], lastReplanLatency: 0 },
      userState: { fatigue: 10, stress: 5, motivation: 90, budgetSpent: 0 },
      phase: 'planning',
    }),
}))