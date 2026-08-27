/**
 * GEODNET RTK Station State Sync & History Tracker
 * Fetches live stations, diffs against baseline, and records transition events.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const DATA_DIR = path.join(__dirname, '..', 'data');
const BASELINE_FILE = path.join(DATA_DIR, 'station_baseline.json');
const EVENTS_FILE = path.join(DATA_DIR, 'station_events.json');
const SUMMARY_FILE = path.join(DATA_DIR, 'daily_summary.json');

const API_URL = 'https://rtk.geodnet.com/api/v2/coverage_stations';

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'GEODNET-RTK-History-Tracker/1.0' } }, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

function loadJsonSafe(filePath, defaultValue) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (err) {
    console.warn(`Warning reading ${filePath}:`, err.message);
  }
  return defaultValue;
}

function saveJsonPretty(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function getDayKey(timestamp) {
  const d = new Date(timestamp);
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

async function syncStations() {
  console.log(`[${new Date().toISOString()}] Fetching live stations from ${API_URL}...`);
  const response = await fetchJson(API_URL);

  if (!response || !Array.isArray(response.data)) {
    throw new Error('Invalid API response format: response.data is not an array');
  }

  const liveStations = response.data;
  console.log(`Fetched ${liveStations.length} live stations from API.`);

  // Build current map
  const currentMap = {};
  liveStations.forEach((s) => {
    if (s && s.name) {
      currentMap[s.name] = {
        status: (s.status || 'OFFLINE').toUpperCase(),
        stationId: s.stationId,
        lat: s.lat != null ? Number(s.lat.toFixed(4)) : null,
        lng: s.lng != null ? Number(s.lng.toFixed(4)) : null
      };
    }
  });

  const baseline = loadJsonSafe(BASELINE_FILE, null);
  const events = loadJsonSafe(EVENTS_FILE, []);
  const summary = loadJsonSafe(SUMMARY_FILE, {});
  const now = Date.now();
  const dayKey = getDayKey(now);

  if (!summary[dayKey]) {
    summary[dayKey] = {
      date: dayKey,
      newActive: 0,
      newOnline: 0,
      activeToDegraded: 0,
      promotedToActive: 0,
      totalActive: 0,
      totalOnline: 0,
      totalOffline: 0,
      totalStations: liveStations.length
    };
  }

  // Calculate live counts
  let liveActive = 0;
  let liveOnline = 0;
  let liveOffline = 0;
  liveStations.forEach((s) => {
    const st = (s.status || '').toUpperCase();
    if (st === 'ACTIVE') liveActive++;
    else if (st === 'ONLINE') liveOnline++;
    else liveOffline++;
  });

  summary[dayKey].totalActive = liveActive;
  summary[dayKey].totalOnline = liveOnline;
  summary[dayKey].totalOffline = liveOffline;
  summary[dayKey].totalStations = liveStations.length;

  if (!baseline) {
    console.log(`Initializing baseline snapshot with ${Object.keys(currentMap).length} stations...`);
    saveJsonPretty(BASELINE_FILE, currentMap);
    saveJsonPretty(EVENTS_FILE, events);
    saveJsonPretty(SUMMARY_FILE, summary);
    console.log('Baseline initialization complete.');
    return;
  }

  // Detect state transitions
  const newEvents = [];

  for (const [name, cur] of Object.entries(currentMap)) {
    const prev = baseline[name];
    if (!prev) {
      // Newly joined station
      if (cur.status === 'ACTIVE') {
        newEvents.push({
          timestamp: now,
          type: 'NEW_ACTIVE',
          name,
          stationId: cur.stationId,
          lat: cur.lat,
          lng: cur.lng,
          fromStatus: 'NONE',
          toStatus: 'ACTIVE'
        });
        summary[dayKey].newActive++;
      } else if (cur.status === 'ONLINE') {
        newEvents.push({
          timestamp: now,
          type: 'NEW_ONLINE',
          name,
          stationId: cur.stationId,
          lat: cur.lat,
          lng: cur.lng,
          fromStatus: 'NONE',
          toStatus: 'ONLINE'
        });
        summary[dayKey].newOnline++;
      }
    } else if (prev.status !== cur.status) {
      let eventType = 'STATUS_CHANGED';
      if (prev.status === 'ACTIVE' && cur.status === 'ONLINE') {
        eventType = 'ACTIVE_TO_ONLINE';
        summary[dayKey].activeToDegraded++;
      } else if (prev.status === 'ACTIVE' && cur.status === 'OFFLINE') {
        eventType = 'ACTIVE_TO_OFFLINE';
        summary[dayKey].activeToDegraded++;
      } else if ((prev.status === 'ONLINE' || prev.status === 'OFFLINE') && cur.status === 'ACTIVE') {
        eventType = 'TO_ACTIVE';
        summary[dayKey].promotedToActive++;
      } else if (prev.status === 'OFFLINE' && cur.status === 'ONLINE') {
        eventType = 'OFFLINE_TO_ONLINE';
      } else if (prev.status === 'ONLINE' && cur.status === 'OFFLINE') {
        eventType = 'ONLINE_TO_OFFLINE';
      }

      newEvents.push({
        timestamp: now,
        type: eventType,
        name,
        stationId: cur.stationId != null ? cur.stationId : prev.stationId,
        lat: cur.lat,
        lng: cur.lng,
        fromStatus: prev.status,
        toStatus: cur.status
      });
    }
  }

  console.log(`Detected ${newEvents.length} state transitions.`);

  if (newEvents.length > 0) {
    events.unshift(...newEvents);
    if (events.length > 10000) {
      events.length = 10000;
    }
    saveJsonPretty(EVENTS_FILE, events);
  }

  // Update baseline & summary
  saveJsonPretty(BASELINE_FILE, currentMap);
  saveJsonPretty(SUMMARY_FILE, summary);

  console.log('Sync and diffing completed successfully.');
}

syncStations().catch((err) => {
  console.error('Fatal sync error:', err);
  process.exit(1);
});
