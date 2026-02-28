# 🗺 DRAIP — Dynamic Real-Time AI Itinerary Planner

A production-grade React application that uses **Claude AI** to generate and dynamically replan tourist itineraries in real time, adapting to weather changes, crowd density, and user fatigue.

---

## 🏗 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| State | Zustand |
| Animation | Framer Motion |
| Charts | Recharts |
| Styling | Tailwind CSS |
| **AI Engine** | **Anthropic Claude claude-sonnet-4-20250514** (via API) |
| **Weather** | **Open-Meteo** (free, no key needed) |
| **Venues** | **Foursquare Places API v3** (optional, free tier) |
| Geocoding | OpenStreetMap Nominatim |

---

## ⚡ Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment
```bash
cp .env.example .env
# Add your Anthropic API key to .env
```

### 3. Start development server
```bash
npm run dev
# Opens http://localhost:3000
```

### 4. Build for production
```bash
npm run build
npm run preview
```

---

## 🔑 API Keys

### Required
**Anthropic API Key** — Powers all AI intelligence:
- Get key: https://console.anthropic.com/
- Format: `sk-ant-api03-...`
- Used for: itinerary generation, context evaluation, replanning, XAI explanations, user feedback interpretation

### Free (No Key Needed)
**Open-Meteo** — Real-time weather and forecasts:
- API docs: https://open-meteo.com/en/docs
- Fetches: temperature, precipitation, wind, UV, hourly forecast
- Polls every 5 minutes

### Optional
**Foursquare Places API** — Real venue data and crowd estimates:
- Get free key: https://developer.foursquare.com/
- Free tier: 1,000 calls/day
- Without key: curated demo venues are used

---

## 🧠 AI Architecture

### Claude API Usage (5 endpoints)

#### 1. `generateInitialItinerary()`
Sends user profile + weather + available venues → Claude returns ordered activity list with reasons.

#### 2. `evaluateContext()`
Every 3 minutes: sends current activity + upcoming + weather + user state → Claude determines if disruptions exist and their severity.

#### 3. `replanItinerary()`
When disruption detected: sends locked activities + disrupted segment + constraints + replacement venues → Claude returns new activity sequence + XAI explanation.

#### 4. `interpretUserFeedback()`
When user taps tired/happy/rushed/bored: sends signal + context → Claude returns state deltas + empathy message + replan recommendation.

### Local Computation (No API)

#### `computeRLReward()`
```
R = 0.40×satisfaction - 0.20×fatigue - 0.15×crowd - 0.12×timeWaste - 0.08×budgetOverrun - 0.05×weather
```

#### `updateFatigueModel()`
```
Δfatigue = walkingM×0.003 + durationMin×0.005 + delayMin×0.08
         × (1 - positiveFeedback×0.4) - restRecovery×8
```

#### `computePreferenceMatch()`
Cosine similarity between 5-dim user preference vector and activity tag vector.

---

## 📁 Project Structure

```
draip/
├── src/
│   ├── services/
│   │   ├── aiService.js        # Claude API + RL reward + fatigue model
│   │   ├── weatherService.js   # Open-Meteo API
│   │   └── placesService.js    # Foursquare Places API
│   ├── hooks/
│   │   └── useDraip.js         # useWeather, usePlaces, useItineraryGenerator,
│   │                           # useContextMonitor, useFeedback
│   ├── store/
│   │   └── draipStore.js       # Zustand global state
│   ├── components/
│   │   ├── SetupScreen.jsx     # Onboarding (API keys, location, profile)
│   │   ├── PlanningScreen.jsx  # Loading + generation screen
│   │   ├── ActivePlanner.jsx   # Main dashboard layout
│   │   ├── WeatherPanel.jsx    # Live weather sidebar panel
│   │   ├── UserStatePanel.jsx  # Fatigue/stress bars + feedback buttons
│   │   ├── ItineraryTimeline.jsx # Animated activity timeline
│   │   ├── AIPanel.jsx         # Decision log + RL metrics chart
│   │   └── DisruptionBanner.jsx # Alert banner + RL metrics bar
│   ├── App.jsx                 # Phase-based router
│   ├── main.jsx                # React entry
│   └── index.css               # Tailwind + custom CSS
├── index.html
├── vite.config.js              # Dev proxy for Anthropic API
├── tailwind.config.js
├── .env.example
└── package.json
```

---

## 🔄 System Flow

```
User opens app
    ↓
SetupScreen: API keys + location + profile
    ↓
PlanningScreen: Fetch weather (Open-Meteo) + venues (Foursquare)
    ↓
Claude: Generate personalised itinerary
    ↓
ActivePlanner (sense-reason-act loop):
    ├── Every 5 min: Poll Open-Meteo weather
    ├── Every 3 min: Claude evaluates context for disruptions
    ├── On disruption detected: Claude replans affected segment
    ├── On user feedback: Claude interprets + updates state
    └── All decisions logged with XAI explanation
```

---

## 🧪 Disruption Detection Rules

| Rule | Trigger | Action |
|------|---------|--------|
| SWAP_OUTDOOR_FOR_INDOOR | precipitation > 0.5mm | Replace outdoor activities |
| INSERT_REST_BREAK | fatigue > 70% | Add café/rest activity |
| DEFER_OR_REPLACE_VENUE | crowd > 80% | Defer or find alternative |
| SHORTEN_ITINERARY | < 90 min remaining | Drop lowest-priority activities |
| ADD_COOLING_BREAK | temperature > 35°C | Insert air-conditioned stop |
| SUGGEST_TRANSIT | distance > 2km + budget sensitive | Recommend taxi/transit |

---

## 🎓 Academic Notes

This system implements:
- **Context-Aware Recommendation** (Adomavicius & Tuzhilin, 2011)
- **Hybrid rule-based + ML planning** architecture
- **MDP formulation** for itinerary as sequential decision problem
- **XAI transparency** (Tintarev & Masthoff, 2012 principles)
- **Dynamic fatigue modelling** inspired by PANAS framework

For the full academic documentation, see `DRAIP_System_Design.docx`.

---

## 🔮 Deployment

```bash
# Build
npm run build

# The dist/ folder is a static SPA
# Deploy to: Vercel, Netlify, Cloudflare Pages

# For production, move Anthropic API calls to a backend
# to keep your API key secure
```

> ⚠️ **Security Note**: In production, never expose your Anthropic API key in the frontend. Create a simple backend proxy (Node.js/FastAPI) that receives requests from your React app and forwards them to Anthropic with the server-side key.

---

## 📄 License

MIT — Built for academic and research purposes.
