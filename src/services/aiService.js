/**
 * DRAIP — REAL AI Decision Engine (Groq LLM)
 * Uses LLaMA 3 70B via Groq (FREE tier)
 */

const GROQ_MODEL = "llama3-70b-8192"
const MAX_TOKENS = 2048
const API_URL = "https://api.groq.com/openai/v1/chat/completions"

/* ───────────────────────────────────────── */
/* CORE LLM CALL                             */
/* ───────────────────────────────────────── */

async function callGroq({ system, user }) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.4,
      max_tokens: MAX_TOKENS,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  })

  if (!res.ok) {
    const t = await res.text()
    throw new Error("Groq API error: " + t)
  }

  const data = await res.json()
  return data.choices[0].message.content
}

function parseJSON(text) {
  const clean = text.replace(/```json|```/g, "").trim()
  return JSON.parse(clean)
}

/* ───────────────────────────────────────── */
/* RL REWARD FUNCTION (✅ MISSING EXPORT)    */
/* ───────────────────────────────────────── */

/**
 * Computes a reinforcement-style reward score (0 → 1)
 * based on itinerary quality & user satisfaction signals
 */
export function computeRLReward({
  satisfaction = 0.7,
  fatigue = 0.3,
  stress = 0.2,
  costOverrun = 0,
  walkingOverrunKm = 0,
}) {
  const reward =
    satisfaction * 0.5 +
    (1 - fatigue) * 0.2 +
    (1 - stress) * 0.2 -
    costOverrun * 0.05 -
    walkingOverrunKm * 0.05

  return Math.max(0, Math.min(1, Number(reward.toFixed(3))))
}

/* ───────────────────────────────────────── */
/* SYSTEM PROMPTS                            */
/* ───────────────────────────────────────── */

const ITINERARY_SYSTEM =
  "You are DRAIP, an expert AI travel planner. Respond ONLY with valid JSON."

const CONTEXT_SYSTEM =
  "You are a real-time context analysis engine. Respond ONLY with JSON."

const REPLAN_SYSTEM =
  "You are an itinerary replanning engine. Respond ONLY with JSON."

const FEEDBACK_SYSTEM =
  "You interpret user feedback and emotional signals. Respond ONLY with JSON."
/**
 * Deterministic fatigue update model
 * Used after each activity execution
 */
export function updateFatigueModel({
  currentFatigue,
  durationMin,
  walkingKm = 0,
  crowdLevel = 0.3,
  isIndoor = true,
}) {
  let fatigueDelta = 0

  // Time-based fatigue
  fatigueDelta += durationMin * 0.08

  // Walking impact
  fatigueDelta += walkingKm * 4

  // Crowd stress
  fatigueDelta += crowdLevel * 6

  // Outdoor penalty
  if (!isIndoor) fatigueDelta += 3

  return Math.max(
    0,
    Math.min(100, Math.round(currentFatigue + fatigueDelta))
  )
}
/* ───────────────────────────────────────── */
/* 1. INITIAL ITINERARY                      */
/* ───────────────────────────────────────── */

export async function generateInitialItinerary({
  userProfile,
  weatherContext,
  places,
  city,
  date,
}) {
  const prompt = `
Generate a one-day itinerary.

USER:
${JSON.stringify(userProfile, null, 2)}

CITY: ${city}
DATE: ${date}

WEATHER:
${JSON.stringify(weatherContext, null, 2)}

PLACES (pick 6–8):
${JSON.stringify(places.slice(0, 15), null, 2)}

Return JSON:
{
 "itinerary":[{ "id":"act-1","time":"09:00","endTime":"10:30","name":"Place","category":"museum","icon":"🏛️","durationMin":90,"costUsd":15,"distanceFromPrevM":400,"isIndoor":true,"crowdLevel":0.4,"description":"...","reasonChosen":"...","lat":0,"lon":0 }],
 "dayTheme":"string",
 "totalCostUsd":80,
 "totalWalkingKm":4.2,
 "plannerNote":"string"
}`

  const text = await callGroq({ system: ITINERARY_SYSTEM, user: prompt })
  return parseJSON(text)
}

/* ───────────────────────────────────────── */
/* 2. CONTEXT EVALUATION                     */
/* ───────────────────────────────────────── */

export async function evaluateContext({
  currentActivity,
  upcomingActivities,
  weatherContext,
  userState,
  timeInfo,
}) {
  const prompt = `
CURRENT ACTIVITY:
${JSON.stringify(currentActivity, null, 2)}

UPCOMING:
${JSON.stringify(upcomingActivities.slice(0, 3), null, 2)}

WEATHER:
${JSON.stringify(weatherContext, null, 2)}

USER STATE:
${JSON.stringify(userState, null, 2)}

TIME:
${JSON.stringify(timeInfo, null, 2)}

Return:
{
 "hasDisruption":true,
 "disruptions":[{"type":"WEATHER","severity":4,"affectsActivityIds":["act-2"],"description":"...","urgency":"immediate"}],
 "overallRisk":"medium",
 "recommendReplan":true,
 "analysisNote":"string"
}`

  const text = await callGroq({ system: CONTEXT_SYSTEM, user: prompt })
  return parseJSON(text)
}

/* ───────────────────────────────────────── */
/* 3. REPLANNING                             */
/* ───────────────────────────────────────── */

export async function replanItinerary({
  lockedActivities,
  disruptedActivities,
  disruptions,
  userProfile,
  userState,
  weatherContext,
  availablePlaces,
  constraints,
  city,
}) {
  const prompt = `
LOCKED:
${JSON.stringify(lockedActivities, null, 2)}

DISRUPTED:
${JSON.stringify(disruptedActivities, null, 2)}

DISRUPTIONS:
${JSON.stringify(disruptions, null, 2)}

USER:
${JSON.stringify(userProfile, null, 2)}

STATE:
${JSON.stringify(userState, null, 2)}

CONSTRAINTS:
${JSON.stringify(constraints, null, 2)}

AVAILABLE PLACES:
${JSON.stringify(availablePlaces.slice(0, 12), null, 2)}

Return:
{
 "newActivities":[{ "id":"act-x","time":"14:00","endTime":"15:00","name":"Place","category":"cafe","icon":"☕","durationMin":60,"costUsd":10,"distanceFromPrevM":200,"isIndoor":true,"crowdLevel":0.3,"description":"...","lat":0,"lon":0,"isNew":true }],
 "xaiExplanation":{
   "summary":"string",
   "rulesApplied":["WEATHER"],
   "removed":["Old activity"],
   "added":["New activity"],
   "satisfactionDelta":"+0.1",
   "rewardScore":0.78,
   "detail":"string"
 },
 "updatedConstraints":{"newTotalCost":95,"newTotalWalkingKm":4.8}
}`

  const text = await callGroq({ system: REPLAN_SYSTEM, user: prompt })
  return parseJSON(text)
}

/* ───────────────────────────────────────── */
/* 4. FEEDBACK INTERPRETATION                */
/* ───────────────────────────────────────── */

export async function interpretUserFeedback({
  signal,
  intensity,
  currentActivity,
  userState,
  currentContext,
}) {
  const prompt = `
SIGNAL: "${signal}" intensity ${intensity}

ACTIVITY:
${JSON.stringify(currentActivity, null, 2)}

STATE:
${JSON.stringify(userState, null, 2)}

CONTEXT:
${JSON.stringify(currentContext, null, 2)}

Return:
{
 "updatedState":{"fatigueDelta":10,"stressDelta":-5,"motivationDelta":-5},
 "shouldReplan":true,
 "replanUrgency":"soon",
 "empathyMessage":"string",
 "suggestion":"string"
}`

  const text = await callGroq({ system: FEEDBACK_SYSTEM, user: prompt })
  return parseJSON(text)
}