// lib/weather.js

// Coordinates for all 64 Bangladesh districts
const DISTRICT_COORDS = {
  Bagerhat:         { lat: 22.6602, lon: 89.7895 },
  Bandarban:        { lat: 22.1953, lon: 92.2184 },
  Barguna:          { lat: 22.0961, lon: 90.1120 },
  Barishal:         { lat: 22.7010, lon: 90.3535 },
  Bhola:            { lat: 22.6860, lon: 90.6482 },
  Bogura:           { lat: 24.8465, lon: 89.3776 },
  Brahmanbaria:     { lat: 23.9570, lon: 91.1115 },
  Chandpur:         { lat: 23.2513, lon: 90.8518 },
  'Chapai Nawabganj': { lat: 24.5965, lon: 88.2776 },
  Chattogram:       { lat: 22.3569, lon: 91.7832 },
  Chuadanga:        { lat: 23.6401, lon: 88.8415 },
  "Cox's Bazar":    { lat: 21.4272, lon: 92.0058 },
  Cumilla:          { lat: 23.4607, lon: 91.1809 },
  Dhaka:            { lat: 23.8103, lon: 90.4125 },
  Dinajpur:         { lat: 25.6279, lon: 88.6338 },
  Faridpur:         { lat: 23.6070, lon: 89.8429 },
  Feni:             { lat: 23.0230, lon: 91.3960 },
  Gaibandha:        { lat: 25.3288, lon: 89.5285 },
  Gazipur:          { lat: 23.9999, lon: 90.4203 },
  Gopalganj:        { lat: 23.0050, lon: 89.8266 },
  Habiganj:         { lat: 24.3745, lon: 91.4156 },
  Jamalpur:         { lat: 24.8949, lon: 89.9488 },
  Jessore:          { lat: 23.1667, lon: 89.2167 },
  Jhalokati:        { lat: 22.6406, lon: 90.1987 },
  Jhenaidah:        { lat: 23.5449, lon: 89.1530 },
  Joypurhat:        { lat: 25.0966, lon: 89.0224 },
  Khagrachhari:     { lat: 23.1193, lon: 91.9847 },
  Khulna:           { lat: 22.8456, lon: 89.5403 },
  Kishoreganj:      { lat: 24.4449, lon: 90.7766 },
  Kurigram:         { lat: 25.8054, lon: 89.6360 },
  Kushtia:          { lat: 23.9014, lon: 89.1226 },
  Lakshmipur:       { lat: 22.9446, lon: 90.8282 },
  Lalmonirhat:      { lat: 25.9923, lon: 89.2847 },
  Madaripur:        { lat: 23.1641, lon: 90.2000 },
  Magura:           { lat: 23.4871, lon: 89.4196 },
  Manikganj:        { lat: 23.8634, lon: 89.9940 },
  Meherpur:         { lat: 23.7621, lon: 88.6317 },
  Moulvibazar:      { lat: 24.4829, lon: 91.7774 },
  Munshiganj:       { lat: 23.5422, lon: 90.5305 },
  Mymensingh:       { lat: 24.7471, lon: 90.4203 },
  Naogaon:          { lat: 24.7933, lon: 88.9312 },
  Narail:           { lat: 23.1724, lon: 89.5120 },
  Narayanganj:      { lat: 23.6238, lon: 90.5000 },
  Narsingdi:        { lat: 23.9324, lon: 90.7150 },
  Natore:           { lat: 24.4204, lon: 88.9882 },
  Netrokona:        { lat: 24.8703, lon: 90.7279 },
  Nilphamari:       { lat: 25.9308, lon: 88.8560 },
  Noakhali:         { lat: 22.8696, lon: 91.0994 },
  Pabna:            { lat: 24.0064, lon: 89.2372 },
  Panchagarh:       { lat: 26.3411, lon: 88.5542 },
  Patuakhali:       { lat: 22.3596, lon: 90.3290 },
  Pirojpur:         { lat: 22.5791, lon: 89.9759 },
  Rajbari:          { lat: 23.7574, lon: 89.6444 },
  Rajshahi:         { lat: 24.3745, lon: 88.6042 },
  Rangamati:        { lat: 22.6321, lon: 92.2080 },
  Rangpur:          { lat: 25.7439, lon: 89.2752 },
  Satkhira:         { lat: 22.7185, lon: 89.0705 },
  Shariatpur:       { lat: 23.2423, lon: 90.4348 },
  Sherpur:          { lat: 25.0204, lon: 90.0152 },
  Sirajganj:        { lat: 24.4534, lon: 89.7006 },
  Sunamganj:        { lat: 25.0658, lon: 91.3950 },
  Sylhet:           { lat: 24.8949, lon: 91.8687 },
  Tangail:          { lat: 24.2513, lon: 89.9167 },
  Thakurgaon:       { lat: 26.0336, lon: 88.4616 },
}

/**
 * Fetch current weather for a Bangladesh district using Open-Meteo (free, no API key).
 * Returns a plain object with weather fields, or null if district not found / fetch fails.
 */
export async function getDistrictWeather(district) {
  if (!district) return null

  // Normalize: trim + title-case to match keys
  const key = Object.keys(DISTRICT_COORDS).find(
    k => k.toLowerCase() === district.trim().toLowerCase()
  )
  if (!key) return null

  const { lat, lon } = DISTRICT_COORDS[key]

  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m` +
      `&timezone=Asia%2FDhaka`

    const res = await fetch(url)
    if (!res.ok) return null
    const json = await res.json()
    const c = json.current

    return {
      district: key,
      temperature: c.temperature_2m,          // °C
      humidity: c.relative_humidity_2m,        // %
      precipitation: c.precipitation,          // mm (last hour)
      windSpeed: c.wind_speed_10m,             // km/h
      weatherCode: c.weather_code,
      description: describeWeatherCode(c.weather_code),
    }
  } catch {
    return null
  }
}

// WMO weather codes → human-readable string
function describeWeatherCode(code) {
  if (code === 0)              return 'Clear sky'
  if (code <= 3)               return 'Partly cloudy'
  if (code <= 9)               return 'Foggy / hazy'
  if (code <= 19)              return 'Drizzle'
  if (code <= 29)              return 'Rain'
  if (code <= 39)              return 'Snow / sleet'
  if (code <= 49)              return 'Foggy'
  if (code <= 59)              return 'Drizzle'
  if (code <= 69)              return 'Rain'
  if (code <= 79)              return 'Snow'
  if (code <= 82)              return 'Rain showers'
  if (code <= 84)              return 'Heavy rain showers'
  if (code <= 94)              return 'Thunderstorm'
  return 'Severe thunderstorm'
}