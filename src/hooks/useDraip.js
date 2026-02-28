import { useEffect, useCallback, useRef } from 'react'
import { useState } from 'react'
import { useDraipStore } from '../store/draipStore'
import { fetchWeather } from '../services/weatherService'
import { searchNearbyPlaces } from '../services/placesService'
import {
  generateInitialItinerary,
  evaluateContext,
  replanItinerary,
  interpretUserFeedback,
  computeRLReward,
  updateFatigueModel,
} from '../services/aiService'

// ── useWeather: poll every 5 minutes ─────────────────────────────────────
export function useWeather() {
  const { location, setWeather, setWeatherError } = useDraipStore()

  const fetch = useCallback(async () => {
    if (!location?.lat) return
    try {
      const w = await fetchWeather(location.lat, location.lon)
      setWeather(w)
    } catch (e) {
      setWeatherError(e.message)
    }
  }, [location, setWeather, setWeatherError])

  useEffect(() => {
    fetch()
    const timer = setInterval(fetch, 5 * 60 * 1000)
    return () => clearInterval(timer)
  }, [fetch])

  return { refetch: fetch }
}

// ── usePlaces: load nearby places ────────────────────────────────────────
export function usePlaces() {
  const { location, setPlaces } = useDraipStore()
  
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  const reload = async () => {
    if (!location?.lat || !location?.lon) {
      console.log('📍 No location available yet')
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      console.log('🌍 Fetching places from OpenStreetMap for:', location)
      
      const places = await searchNearbyPlaces(
        location.lat,
        location.lon,
        [], // all categories
        3000 // radius in meters
      )
      
      console.log('✅ Places fetched:', places.length)
      setData(places)
      setPlaces(places)
    } catch (error) {
      console.error('❌ Failed to load places:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (location?.lat && location?.lon) {
      reload()
    }
  }, [location?.lat, location?.lon])

  return {
    data,
    isLoading,
    reload,
    error
  }
}

// ── useItineraryGenerator ─────────────────────────────────────────────────
export function useItineraryGenerator() {
  const store = useDraipStore()

  const generate = useCallback(async () => {
    const { userProfile, weather, availablePlaces, location } = store
    
    if (!weather || !availablePlaces.length) {
      throw new Error('Missing required data: weather or places')
    }

    store.setGenerating(true)
    store.addLogEntry({
      type: 'system',
      title: 'ITINERARY GENERATOR',
      message: `Generating demo itinerary for ${location?.city}. Analysing ${availablePlaces.length} places against your preferences...`,
    })

    try {
      await new Promise(resolve => setTimeout(resolve, 2500))

      const placesByCategory = availablePlaces.reduce((acc, place) => {
        if (!acc[place.category]) acc[place.category] = []
        acc[place.category].push(place)
        return acc
      }, {})

      console.log('Places by category:', Object.keys(placesByCategory).map(k => `${k}: ${placesByCategory[k].length}`))

      const scoredPlaces = availablePlaces.map(place => {
        let score = 0
        score += (place.rating || 3.5) * 0.5
        
        if (place.category === 'museum' || place.category === 'art' || place.category === 'monument') {
          score += userProfile.preferences.museums * 3
        }
        if (place.category === 'restaurant' || place.category === 'cafe') {
          score += userProfile.preferences.food * 3
        }
        if (place.category === 'park') {
          score += userProfile.preferences.nature * 3
        }
        if (place.category === 'shopping') {
          score += userProfile.preferences.shopping * 3
        }
        if (place.category === 'nightlife') {
          score += userProfile.preferences.nightlife * 3
        }
        
        if (userProfile.travelStyle === 'relaxed' && place.durationMin < 60) score += 0.5
        if (userProfile.travelStyle === 'explorer' && place.category !== 'cafe') score += 0.3
        if (userProfile.travelStyle === 'cultural' && ['museum', 'art', 'monument'].includes(place.category)) score += 0.8
        if (userProfile.travelStyle === 'luxury' && place.price > 2) score += 0.6
        
        return { ...place, score }
      })

      const topPlaces = scoredPlaces.sort((a, b) => b.score - a.score).slice(0, 15)
      
      const itinerary = []
      const usedIds = new Set()

      const getBestPlace = (category) => {
        const place = topPlaces.find(p => p.category === category && !usedIds.has(p.id))
        if (place) {
          usedIds.add(place.id)
          return place
        }
        return null
      }

      const morningCafe = getBestPlace('cafe') || getBestPlace('restaurant')
      if (morningCafe) {
        itinerary.push({ ...morningCafe, time: '09:00', status: 'active' })
      }

      const mainAttraction = getBestPlace('museum') || getBestPlace('monument') || getBestPlace('art')
      if (mainAttraction) {
        itinerary.push({ ...mainAttraction, time: '10:30', status: 'upcoming' })
      }

      const lunch = getBestPlace('restaurant')
      if (lunch) {
        itinerary.push({ ...lunch, time: '12:30', status: 'upcoming' })
      }

      const afternoon1 = getBestPlace('park') || getBestPlace('museum') || getBestPlace('shopping')
      if (afternoon1) {
        itinerary.push({ ...afternoon1, time: '14:00', status: 'upcoming' })
      }

      const afternoon2 = getBestPlace('shopping') || getBestPlace('art') || getBestPlace('cafe')
      if (afternoon2) {
        itinerary.push({ ...afternoon2, time: '15:30', status: 'upcoming' })
      }

      const lateAfternoon = getBestPlace('monument') || getBestPlace('park') || getBestPlace('cafe')
      if (lateAfternoon) {
        itinerary.push({ ...lateAfternoon, time: '17:00', status: 'upcoming' })
      }

      const dinner = getBestPlace('restaurant')
      if (dinner) {
        itinerary.push({ ...dinner, time: '19:00', status: 'upcoming' })
      }

      const evening = getBestPlace('nightlife') || getBestPlace('theater') || getBestPlace('restaurant')
      if (evening && evening.id !== dinner?.id) {
        itinerary.push({ ...evening, time: '20:30', status: 'upcoming' })
      }

      if (itinerary.length < 5) {
        const remainingPlaces = topPlaces.filter(p => !usedIds.has(p.id))
        for (let i = 0; i < remainingPlaces.length && itinerary.length < 8; i++) {
          const place = remainingPlaces[i]
          usedIds.add(place.id)
          itinerary.push({ 
            ...place, 
            time: `${9 + itinerary.length}:00`, 
            status: 'upcoming' 
          })
        }
      }

      const enhancedItinerary = itinerary.map((activity, index) => {
        const duration = activity.durationMin || 60
        const [hours, minutes] = activity.time.split(':').map(Number)
        const endTotalMinutes = hours * 60 + minutes + duration
        const endHours = Math.floor(endTotalMinutes / 60)
        const endMinutes = endTotalMinutes % 60
        const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`
        
        return {
          ...activity,
          id: activity.id || `activity-${index}`,
          endTime,
          durationMin: duration,
          status: index === 0 ? 'active' : 'upcoming',
          originalTime: activity.time,
          isNew: true,
        }
      })

      const totalCost = enhancedItinerary.reduce((sum, a) => sum + (a.costUsd || 0), 0)
      const totalWalking = enhancedItinerary.length * 1.5

      const categoryCounts = enhancedItinerary.reduce((acc, a) => {
        acc[a.category] = (acc[a.category] || 0) + 1
        return acc
      }, {})

      let theme = 'City Discovery'
      if (categoryCounts.museum > 2 || categoryCounts.art > 1) theme = 'Cultural Exploration'
      else if (categoryCounts.restaurant > 2 || categoryCounts.cafe > 1) theme = 'Culinary Journey'
      else if (categoryCounts.park > 1) theme = 'Nature & Relaxation'
      else if (categoryCounts.shopping > 1) theme = 'Shopping Adventure'

      store.setItinerary(
        enhancedItinerary,
        `${theme} in ${location?.city}`,
        `Generated ${enhancedItinerary.length} activities based on your ${userProfile.travelStyle} travel style and preferences.`
      )

      store.addLogEntry({
        type: 'ai',
        title: 'DEMO ITINERARY',
        message: `✓ Generated ${enhancedItinerary.length} activities. Theme: "${theme}". Estimated cost: $${totalCost}. Walking: ~${totalWalking.toFixed(1)}km.`,
        detail: `Selected ${enhancedItinerary.length} places from ${availablePlaces.length} available`,
      })

      store.updateRLMetrics({ satisfactionPoint: 75 })
      store.setPhase('active')
      
      console.log('Generated itinerary with', enhancedItinerary.length, 'activities')
    } catch (error) {
      console.error('Failed to generate itinerary:', error)
      store.addLogEntry({
        type: 'error',
        title: 'ITINERARY ERROR',
        message: error.message,
      })
      throw error
    } finally {
      store.setGenerating(false)
    }
  }, [store])

  return { generate, isLoading: store.isGenerating }
}

// ── useContextMonitor: MOCK VERSION (no API key needed) ─────────────────
export function useContextMonitor() {
  const store = useDraipStore()
  const intervalRef = useRef(null)

  const evaluate = useCallback(async () => {
    const { itinerary, weather, userState, phase } = store
    if (!itinerary.length || phase !== 'active') return

    const activeActivity = itinerary.find((a) => a.status === 'active')
    if (!activeActivity) return

    const hour = new Date().getHours()
    const disruptions = []

    if (weather?.condition === 'Rain' && !activeActivity.isIndoor) {
      disruptions.push({
        type: 'WEATHER',
        severity: 3,
        description: 'Rain expected at your outdoor activity'
      })
    }

    if (activeActivity.time) {
      const activityHour = parseInt(activeActivity.time.split(':')[0])
      if (hour > activityHour + 2) {
        disruptions.push({
          type: 'TIME',
          severity: 4,
          description: 'You might be running late for this activity'
        })
      }
    }

    if (userState.fatigue > 70) {
      disruptions.push({
        type: 'FATIGUE',
        severity: 3,
        description: 'You seem tired. Consider a break.'
      })
    }

    if (disruptions.length > 0) {
      store.setDisruption(disruptions[0])
      store.addLogEntry({
        type: 'warning',
        title: 'DISRUPTION DETECTED',
        message: disruptions.map(d => d.description).join(' | '),
        severity: Math.max(...disruptions.map(d => d.severity))
      })
    }
  }, [store])

  const triggerReplan = useCallback(async (disruptions) => {
    console.log('🔄 Mock replan triggered with disruptions:', disruptions)
    store.addLogEntry({
      type: 'replan',
      title: 'REPLAN (MOCK)',
      message: 'Replanning triggered but using mock mode',
      detail: disruptions.map(d => d.description).join(', ')
    })
  }, [store])

  useEffect(() => {
    if (store.phase !== 'active') return
    intervalRef.current = setInterval(evaluate, 3 * 60 * 1000)
    return () => clearInterval(intervalRef.current)
  }, [store.phase, evaluate])

  return { evaluate, triggerReplan }
}

// ── useFeedback: MOCK VERSION ───────────────────────────────────────────
export function useFeedback() {
  const store = useDraipStore()
  const { triggerReplan } = useContextMonitor()

  const sendFeedback = useCallback(async (signal, intensity = 0.8) => {
    const { itinerary, userState } = store
    const currentActivity = itinerary.find((a) => a.status === 'active')

    store.addLogEntry({
      type: 'user',
      title: 'USER FEEDBACK',
      message: `Signal: "${signal.toUpperCase()}" (intensity: ${intensity})`,
    })

    const DELTAS = {
      happy:  { fatigueDelta: -5, stressDelta: -8, motivationDelta: 10 },
      tired:  { fatigueDelta: 20, stressDelta: 8,  motivationDelta: -15 },
      rushed: { fatigueDelta: 5,  stressDelta: 22, motivationDelta: -8 },
      bored:  { fatigueDelta: 8,  stressDelta: 5,  motivationDelta: -12 },
    }
    
    store.updateUserState(DELTAS[signal] || {})
    
    const responses = {
      happy: `😊 I'm glad you're enjoying ${currentActivity?.name || 'your current activity'}! I'll keep recommending similar experiences.`,
      tired: `😴 Take a break if you need to! I can suggest some relaxing spots nearby.`,
      rushed: `⚡ Let's adjust the pace. I'll recommend fewer activities or extend your current ones.`,
      bored: `😑 Let's find something more exciting! I'll look for unique experiences in the area.`
    }
    
    store.addLogEntry({
      type: 'ai',
      title: 'AI RESPONSE (MOCK)',
      message: responses[signal] || `Thanks for your feedback! I'll adjust your recommendations.`,
    })

    if (signal === 'tired' && userState.fatigue > 60) {
      await triggerReplan([{ 
        type: 'FATIGUE', 
        severity: 3, 
        description: 'User feeling tired - consider lighter activities' 
      }])
    }
    
    if (signal === 'bored') {
      await triggerReplan([{ 
        type: 'BOREDOM', 
        severity: 3, 
        description: 'User bored - suggest more exciting activities' 
      }])
    }
  }, [store, triggerReplan])

  return { sendFeedback }
}