// stationService.js
// Simple client to fetch station data from local backend.

const BASE_LOCAL = 'http://localhost:5001';

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return res.json();
}

export async function fetchStationNow() {
  const candidates = [
    `${BASE_LOCAL}/api/station/now`,
  ];

  for (const url of candidates) {
    try {
      const data = await fetchJson(url);
      return data;
    } catch (err) {
      console.warn('stationService: failed', url, err.message);
    }
  }

  throw new Error('No station endpoint available');
}

// Buscar histórico de dados (últimos n registros)
export async function fetchStationHistory(n = 24) {
  const url = `${BASE_LOCAL}/api/station/history?n=${n}`;

  try {
    const response = await fetchJson(url);
    
    if (response.status !== 'success' || !response.observations) {
      throw new Error('Failed to fetch history data');
    }

    return response.observations;
  } catch (err) {
    console.error('fetchStationHistory error:', err);
    throw err;
  }
}

// Requisição direta à API de estação meteorológica (weather.com PWS)
export async function fetchStationNowDirect() {
  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
  const STATION_ID = import.meta.env.VITE_WEATHER_STATION_ID || 'IRIODE90';

  if (!API_KEY) {
    throw new Error('VITE_WEATHER_API_KEY not configured in .env.local');
  }

  const url = `https://api.weather.com/v2/pws/observations/current?stationId=${encodeURIComponent(STATION_ID)}&format=json&units=s&numericPrecision=decimal&apiKey=${encodeURIComponent(API_KEY)}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }

    const jsonData = await res.json();
    const obs = jsonData.observations?.[0];
    if (!obs) {
      throw new Error('No observation data in response');
    }

    // Função auxiliar para garantir que velocidades nunca sejam negativas
    const ensureNonNegative = (val) => {
      if (val === null || val === undefined) return 0;
      const num = Number(val);
      return Math.max(0, num);
    };

    // Normalizar resposta para o formato que o frontend espera
    const metric = obs.metric_si || {};
    return {
      when: obs.obsTimeLocal,
      data: {
        obsTimeLocal: obs.obsTimeLocal,
        winddir: obs.winddir,
        wdir10m: obs.winddir,
        wspd10m: ensureNonNegative(metric.windSpeed),
        windSpeed: ensureNonNegative(metric.windSpeed),
        gust: ensureNonNegative(metric.windGust),
        wgust: ensureNonNegative(metric.windGust),
        humidity: obs.humidity, // pode ser null
        temp: metric.temp, // pode ser null
        pressure_hpa: metric.pressure, // em hPa
        pressure: metric.pressure,
        precip_mm: Math.max(0, Number(metric.precipRate || 0)), // precipitação não pode ser negativa
        precip: Math.max(0, Number(metric.precipRate || 0)),
        tide: null, // API não fornece dados de maré
        waveHeight: ensureNonNegative(metric.windSpeed) || 0,
        solarRadiation: Math.max(0, Number(obs.solarRadiation || 0)),
        uv: Math.max(0, Number(obs.uv || 0))
      }
    };
  } catch (err) {
    console.error('fetchStationNowDirect error:', err);
    throw err;
  }
}

export default { fetchStationNow, fetchStationNowDirect, fetchStationHistory };