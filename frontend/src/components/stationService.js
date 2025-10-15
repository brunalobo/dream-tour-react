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

export default { fetchStationNow };