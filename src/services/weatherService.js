/**
 * Weather Service — Open-Meteo API (free, no API key required)
 * Docs: https://open-meteo.com/en/docs
 */

const BASE_URL = 'https://api.open-meteo.com/v1/forecast'

// WMO Weather code descriptions
const WMO_CODES = {
  0: { label: 'Clear Sky', icon: '☀️', severity: 0 },
  1: { label: 'Mainly Clear', icon: '🌤', severity: 0 },
  2: { label: 'Partly Cloudy', icon: '⛅', severity: 0 },
  3: { label: 'Overcast', icon: '☁️', severity: 1 },
  45: { label: 'Foggy', icon: '🌫', severity: 1 },
  48: { label: 'Icy Fog', icon: '🌫', severity: 2 },
  51: { label: 'Light Drizzle', icon: '🌦', severity: 1 },
  53: { label: 'Drizzle', icon: '🌦', severity: 2 },
  55: { label: 'Heavy Drizzle', icon: '🌧', severity: 3 },
  61: { label: 'Slight Rain', icon: '🌧', severity: 2 },
  63: { label: 'Moderate Rain', icon: '🌧', severity: 3 },
  65: { label: 'Heavy Rain', icon: '⛈', severity: 4 },
  71: { label: 'Light Snow', icon: '🌨', severity: 3 },
  73: { label: 'Moderate Snow', icon: '❄️', severity: 4 },
  75: { label: 'Heavy Snow', icon: '❄️', severity: 5 },
  80: { label: 'Showers', icon: '🌦', severity: 2 },
  81: { label: 'Rain Showers', icon: '🌧', severity: 3 },
  82: { label: 'Violent Showers', icon: '⛈', severity: 5 },
  95: { label: 'Thunderstorm', icon: '⛈', severity: 5 },
  96: { label: 'Thunderstorm+Hail', icon: '⛈', severity: 5 },
  99: { label: 'Heavy Thunderstorm', icon: '🌩', severity: 5 },
}

export async function fetchWeather(lat, lon) {
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current: [
      'temperature_2m',
      'apparent_temperature',
      'relative_humidity_2m',
      'precipitation',
      'rain',
      'weather_code',
      'wind_speed_10m',
      'wind_direction_10m',
      'uv_index',
      'cloud_cover',
      'visibility',
    ].join(','),
    hourly: [
      'temperature_2m',
      'precipitation_probability',
      'precipitation',
      'weather_code',
      'uv_index',
    ].join(','),
    forecast_days: 1,
    timezone: 'auto',
  })

  const response = await fetch(`${BASE_URL}?${params}`)
  if (!response.ok) throw new Error(`Weather API error: ${response.status}`)
  const data = await response.json()

  const current = data.current
  const wmo = WMO_CODES[current.weather_code] || { label: 'Unknown', icon: '🌡', severity: 0 }

  // Build hourly forecast for next 8 hours
  const now = new Date()
  const currentHour = now.getHours()
  const hourlyForecast = []
  for (let i = 0; i < 8; i++) {
    const idx = currentHour + i
    if (idx < data.hourly.time.length) {
      hourlyForecast.push({
        time: data.hourly.time[idx],
        hour: (currentHour + i) % 24,
        temp: Math.round(data.hourly.temperature_2m[idx]),
        precipProb: data.hourly.precipitation_probability[idx],
        precip: data.hourly.precipitation[idx],
        code: data.hourly.weather_code[idx],
        icon: (WMO_CODES[data.hourly.weather_code[idx]] || wmo).icon,
      })
    }
  }

  return {
    temperature: Math.round(current.temperature_2m),
    apparentTemp: Math.round(current.apparent_temperature),
    humidity: current.relative_humidity_2m,
    precipitation: current.precipitation,
    rain: current.rain,
    weatherCode: current.weather_code,
    windSpeed: Math.round(current.wind_speed_10m),
    windDirection: current.wind_direction_10m,
    uvIndex: current.uv_index,
    cloudCover: current.cloud_cover,
    visibility: current.visibility,
    condition: wmo.label,
    icon: wmo.icon,
    severity: wmo.severity, // 0=fine → 5=severe
    isRaining: current.precipitation > 0.1,
    isStormy: current.weather_code >= 95,
    hourlyForecast,
    fetchedAt: new Date().toISOString(),
  }
}

/**
 * Reverse geocode coordinates to a city name
 * Uses Open-Meteo's geocoding API (free)
 */
export async function getCityFromCoords(lat, lon) {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    )
    const data = await r.json()
    return (
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.county ||
      'Your Location'
    )
  } catch {
    return 'Your Location'
  }
}

/**
 * Search for a city's coordinates
 */
export async function searchCity(query) {
  const r = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
  )
  const data = await r.json()
  return (data.results || []).map((r) => ({
    name: r.name,
    country: r.country,
    admin1: r.admin1,
    lat: r.latitude,
    lon: r.longitude,
  }))
}
