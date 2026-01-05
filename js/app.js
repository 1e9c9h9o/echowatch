/**
 * ECHO.WATCH - Nighttime Lights Visualization
 * NASA VIIRS Day/Night Band via GIBS
 */

// ========================================
// Configuration
// ========================================

const CONFIG = {
  // NASA GIBS layer definitions
  layers: {
    nightlights: {
      id: 'VIIRS_SNPP_DayNightBand_At_Sensor_Radiance',
      name: 'Night Lights',
      maxZoom: 8
    },
    blackmarble: {
      id: 'VIIRS_Black_Marble',
      name: 'Black Marble',
      maxZoom: 8,
      staticDate: '2016-01-01' // Annual composite, not daily
    }
  },

  // Preset locations with mock anomaly data
  // Radiance values in nW/cm²/sr (nanowatts per square centimeter per steradian)
  locations: [
    {
      name: 'Detroit, MI',
      desc: 'Industrial activity monitoring',
      lat: 42.3314,
      lng: -83.0458,
      zoom: 10,
      anomaly: {
        current: 42.3,
        baseline: 45.8,
        reference: '5-year avg (Jan)'
      }
    },
    {
      name: 'Gaza Strip',
      desc: 'Conflict zone monitoring',
      lat: 31.5,
      lng: 34.47,
      zoom: 10,
      anomaly: {
        current: 8.2,
        baseline: 28.4,
        reference: 'Jan 2023'
      }
    },
    {
      name: 'Kyiv, Ukraine',
      desc: 'Infrastructure damage tracking',
      lat: 50.4501,
      lng: 30.5234,
      zoom: 9,
      anomaly: {
        current: 31.5,
        baseline: 52.1,
        reference: 'Jan 2022'
      }
    },
    {
      name: 'Houston, TX',
      desc: 'Hurricane recovery',
      lat: 29.7604,
      lng: -95.3698,
      zoom: 9,
      anomaly: {
        current: 89.2,
        baseline: 85.6,
        reference: '5-year avg (Jan)'
      }
    },
    {
      name: 'Los Angeles, CA',
      desc: 'Urban light patterns',
      lat: 34.0522,
      lng: -118.2437,
      zoom: 9,
      anomaly: {
        current: 124.8,
        baseline: 128.3,
        reference: '5-year avg (Jan)'
      }
    },
    {
      name: 'Puerto Rico',
      desc: 'Grid resilience',
      lat: 18.2208,
      lng: -66.5901,
      zoom: 9,
      anomaly: {
        current: 22.1,
        baseline: 31.4,
        reference: 'Jan 2017 (pre-Maria)'
      }
    }
  ],

  // Default map view
  defaultCenter: [-83.0458, 42.3314],
  defaultZoom: 8,

  // Basemap tiles
  basemap: {
    dark: 'https://basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png',
    labels: 'https://basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png'
  }
};

// ========================================
// State
// ========================================

let state = {
  currentLayer: 'nightlights',
  currentDate: null,
  map: null,
  // Compare mode
  mode: 'single', // 'single' | 'swipe' | 'side-by-side'
  beforeDate: null,
  afterDate: null,
  afterMap: null,
  compare: null,
  // Anomaly detection
  currentLocation: null
};

// ========================================
// NASA GIBS Integration
// ========================================

/**
 * Build GIBS tile URL for a given layer and date
 */
function buildGIBSUrl(layerId, date) {
  return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${layerId}/default/${date}/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png`;
}

/**
 * Get a default date (use recent date with known data availability)
 * GIBS data has ~1-2 day latency, and may not have future dates
 */
function getDefaultDate() {
  // Use a date we know has data - fall back to late 2024 if current date might not have data
  const now = new Date();
  const twoWeeksAgo = new Date(now);
  twoWeeksAgo.setDate(now.getDate() - 14);

  // If we're somehow in the "future" relative to GIBS data, use a safe fallback
  const safeDate = new Date('2024-12-15');
  const useDate = twoWeeksAgo < safeDate ? safeDate : twoWeeksAgo;

  return useDate.toISOString().split('T')[0];
}

/**
 * Get a date offset by N days from today
 */
function getDateOffset(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

/**
 * Build a complete map style object for a given date
 */
function buildMapStyle(date, layerKey = state.currentLayer) {
  const layerConfig = CONFIG.layers[layerKey];
  // Use static date for layers like Black Marble that are composites
  const effectiveDate = layerConfig.staticDate || date;
  const tileUrl = buildGIBSUrl(layerConfig.id, effectiveDate);

  return {
    version: 8,
    sources: {
      'dark-base': {
        type: 'raster',
        tiles: [CONFIG.basemap.dark],
        tileSize: 256,
        attribution: '© CartoDB © OpenStreetMap'
      },
      'viirs': {
        type: 'raster',
        tiles: [tileUrl],
        tileSize: 256,
        attribution: '© NASA GIBS'
      },
      'labels': {
        type: 'raster',
        tiles: [CONFIG.basemap.labels],
        tileSize: 256
      }
    },
    layers: [
      {
        id: 'dark-base',
        type: 'raster',
        source: 'dark-base',
        minzoom: 0,
        maxzoom: 22
      },
      {
        id: 'viirs',
        type: 'raster',
        source: 'viirs',
        minzoom: 0,
        maxzoom: layerConfig.maxZoom,
        paint: {
          'raster-opacity': 0.9
        }
      },
      {
        id: 'labels',
        type: 'raster',
        source: 'labels',
        minzoom: 0,
        maxzoom: 22
      }
    ]
  };
}

// ========================================
// Map Initialization
// ========================================

function initMap() {
  state.currentDate = getDefaultDate();

  state.map = new maplibregl.Map({
    container: 'map',
    style: buildMapStyle(state.currentDate),
    center: CONFIG.defaultCenter,
    zoom: CONFIG.defaultZoom,
    maxZoom: 12
  });

  // Add navigation controls
  state.map.addControl(new maplibregl.NavigationControl(), 'top-right');

  // Setup event listeners
  setupMapEvents();
}

// ========================================
// Layer Management
// ========================================

function updateLayer() {
  const layerConfig = CONFIG.layers[state.currentLayer];
  const effectiveDate = layerConfig.staticDate || state.currentDate;
  const tileUrl = buildGIBSUrl(layerConfig.id, effectiveDate);

  // Remove existing layer and source
  if (state.map.getLayer('viirs')) {
    state.map.removeLayer('viirs');
  }
  if (state.map.getSource('viirs')) {
    state.map.removeSource('viirs');
  }

  // Add updated source
  state.map.addSource('viirs', {
    type: 'raster',
    tiles: [tileUrl],
    tileSize: 256,
    attribution: '© NASA GIBS'
  });

  // Re-add layer (before labels)
  state.map.addLayer({
    id: 'viirs',
    type: 'raster',
    source: 'viirs',
    minzoom: 0,
    maxzoom: layerConfig.maxZoom,
    paint: {
      'raster-opacity': 0.9
    }
  }, 'labels');

  // If in compare mode, also update the after map
  if (state.mode !== 'single' && state.afterMap) {
    updateAfterMapLayer();
  }
}

/**
 * Update the after map's VIIRS layer
 */
function updateAfterMapLayer() {
  if (!state.afterMap) return;

  const layerConfig = CONFIG.layers[state.currentLayer];
  const effectiveDate = layerConfig.staticDate || state.afterDate;
  const tileUrl = buildGIBSUrl(layerConfig.id, effectiveDate);

  if (state.afterMap.getLayer('viirs')) {
    state.afterMap.removeLayer('viirs');
  }
  if (state.afterMap.getSource('viirs')) {
    state.afterMap.removeSource('viirs');
  }

  state.afterMap.addSource('viirs', {
    type: 'raster',
    tiles: [tileUrl],
    tileSize: 256,
    attribution: '© NASA GIBS'
  });

  state.afterMap.addLayer({
    id: 'viirs',
    type: 'raster',
    source: 'viirs',
    minzoom: 0,
    maxzoom: layerConfig.maxZoom,
    paint: {
      'raster-opacity': 0.9
    }
  }, 'labels');
}

// ========================================
// Compare Mode
// ========================================

/**
 * Enter compare mode
 */
function enterCompareMode(type = 'swipe') {
  state.mode = type;

  // Set default dates: before = 9 days ago, after = 2 days ago
  state.beforeDate = getDateOffset(-9);
  state.afterDate = getDateOffset(-2);

  // Update the main map to use before date
  state.currentDate = state.beforeDate;
  updateLayer();

  // Create the after map
  const wrapper = document.getElementById('map-wrapper');
  wrapper.classList.add(type === 'swipe' ? 'compare-swipe' : 'compare-side-by-side');

  state.afterMap = new maplibregl.Map({
    container: 'map-after',
    style: buildMapStyle(state.afterDate),
    center: state.map.getCenter(),
    zoom: state.map.getZoom(),
    bearing: state.map.getBearing(),
    pitch: state.map.getPitch(),
    maxZoom: 12
  });

  // Wait for after map to load before setting up compare
  state.afterMap.on('load', () => {
    if (type === 'swipe') {
      initSwipeCompare();
    } else {
      syncMaps();
    }
  });

  // Update date labels
  updateDateLabels();

  // Update UI
  updateCompareUI(true);
}

/**
 * Exit compare mode
 */
function exitCompareMode() {
  // Remove compare instance
  if (state.compare) {
    state.compare.remove();
    state.compare = null;
  }

  // Remove after map
  if (state.afterMap) {
    state.afterMap.remove();
    state.afterMap = null;
  }

  // Reset wrapper classes
  const wrapper = document.getElementById('map-wrapper');
  wrapper.classList.remove('compare-swipe', 'compare-side-by-side');

  // Reset state
  state.mode = 'single';
  state.beforeDate = null;
  state.afterDate = null;
  state.currentDate = getDefaultDate();

  // Update main map
  updateLayer();

  // Update UI
  updateCompareUI(false);
}

/**
 * Toggle between swipe and side-by-side modes
 */
function toggleCompareType(type) {
  if (state.mode === type) return;

  const wrapper = document.getElementById('map-wrapper');

  // Remove existing compare instance
  if (state.compare) {
    state.compare.remove();
    state.compare = null;
  }

  // Update classes
  wrapper.classList.remove('compare-swipe', 'compare-side-by-side');
  wrapper.classList.add(type === 'swipe' ? 'compare-swipe' : 'compare-side-by-side');

  state.mode = type;

  // Resize maps
  state.map.resize();
  state.afterMap.resize();

  if (type === 'swipe') {
    initSwipeCompare();
  } else {
    syncMaps();
  }

  // Update toggle buttons
  document.querySelectorAll('.compare-type-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.type === type);
  });
}

/**
 * Initialize the swipe compare control
 */
function initSwipeCompare() {
  state.compare = new maplibregl.Compare(
    state.map,
    state.afterMap,
    '#map-wrapper',
    { orientation: 'vertical' }
  );
}

/**
 * Sync maps for side-by-side mode
 */
function syncMaps() {
  let syncing = false;

  const sync = (source, target) => {
    if (syncing) return;
    syncing = true;
    target.jumpTo({
      center: source.getCenter(),
      zoom: source.getZoom(),
      bearing: source.getBearing(),
      pitch: source.getPitch()
    });
    syncing = false;
  };

  state.map.on('move', () => sync(state.map, state.afterMap));
  state.afterMap.on('move', () => sync(state.afterMap, state.map));
}

/**
 * Update date label overlays
 */
function updateDateLabels() {
  const beforeLabel = document.getElementById('labelBefore');
  const afterLabel = document.getElementById('labelAfter');

  beforeLabel.textContent = `BEFORE · ${state.beforeDate}`;
  afterLabel.textContent = `AFTER · ${state.afterDate}`;
}

/**
 * Update compare UI elements
 */
function updateCompareUI(isCompareMode) {
  const singleDateControl = document.getElementById('dateControl');
  const compareDates = document.getElementById('compareDates');
  const beforeInput = document.getElementById('beforeDate');
  const afterInput = document.getElementById('afterDate');

  if (isCompareMode) {
    singleDateControl.classList.add('hidden');
    compareDates.classList.add('active');
    beforeInput.value = state.beforeDate;
    afterInput.value = state.afterDate;
  } else {
    singleDateControl.classList.remove('hidden');
    compareDates.classList.remove('active');
    document.getElementById('dateSelect').value = state.currentDate;
  }
}

// ========================================
// UI Components
// ========================================

function setupDateControl() {
  const dateInput = document.getElementById('dateSelect');
  dateInput.value = state.currentDate;

  // Single mode date change
  dateInput.addEventListener('change', (e) => {
    state.currentDate = e.target.value;
    updateLayer();
  });

  // Compare mode date changes
  const beforeInput = document.getElementById('beforeDate');
  const afterInput = document.getElementById('afterDate');

  beforeInput.addEventListener('change', (e) => {
    state.beforeDate = e.target.value;
    state.currentDate = e.target.value;
    updateLayer();
    updateDateLabels();
  });

  afterInput.addEventListener('change', (e) => {
    state.afterDate = e.target.value;
    updateAfterMapLayer();
    updateDateLabels();
  });
}

function setupCompareControls() {
  // Compare toggle button
  document.getElementById('compareToggle').addEventListener('click', () => {
    enterCompareMode('swipe');
  });

  // Close compare button
  document.getElementById('compareClose').addEventListener('click', () => {
    exitCompareMode();
  });

  // Swipe/Split toggle buttons
  document.querySelectorAll('.compare-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      toggleCompareType(btn.dataset.type);
    });
  });
}

function setupLayerToggle() {
  document.querySelectorAll('.layer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      document.querySelectorAll('.layer-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update layer
      state.currentLayer = btn.dataset.layer;
      updateLayer();
    });
  });
}

function setupLocationButtons() {
  const container = document.getElementById('locationList');
  
  CONFIG.locations.forEach(loc => {
    const btn = document.createElement('button');
    btn.className = 'location-btn';
    btn.innerHTML = `
      <div class="name">${loc.name}</div>
      <div class="desc">${loc.desc}</div>
    `;
    
    btn.addEventListener('click', () => {
      flyToLocation(loc);
    });
    
    container.appendChild(btn);
  });
}

function flyToLocation(location) {
  const flyOptions = {
    center: [location.lng, location.lat],
    zoom: location.zoom,
    duration: 2000
  };

  state.map.flyTo(flyOptions);

  // Sync after map if in compare mode
  if (state.mode !== 'single' && state.afterMap) {
    state.afterMap.flyTo(flyOptions);
  }

  document.getElementById('locationInfo').textContent = location.name;

  // Update anomaly panel
  updateAnomalyPanel(location);
}

// ========================================
// Anomaly Detection
// ========================================

/**
 * Calculate anomaly data from current and baseline values
 */
function calculateAnomaly(current, baseline) {
  const difference = current - baseline;
  const percentChange = ((difference / baseline) * 100);

  return {
    current,
    baseline,
    difference,
    percentChange,
    direction: percentChange > 0 ? 'increase' : percentChange < 0 ? 'decrease' : 'normal',
    isSignificant: Math.abs(percentChange) > 5 // 5% threshold for "significant"
  };
}

/**
 * Generate mock anomaly data for arbitrary locations
 * In production, this would fetch real radiance data from an API
 */
function generateMockAnomaly(lat, lng) {
  // Use coordinates to generate deterministic but varied mock data
  const seed = Math.abs(Math.sin(lat * 12.9898 + lng * 78.233) * 43758.5453) % 1;

  // Base radiance varies by latitude (more urban areas at mid-latitudes)
  const latFactor = 1 - Math.abs(lat - 40) / 90;
  const baseRadiance = 20 + (latFactor * 80) + (seed * 40);

  // Current value with some variation
  const variation = (seed - 0.5) * 0.4; // -20% to +20%
  const currentRadiance = baseRadiance * (1 + variation);

  return {
    current: Math.round(currentRadiance * 10) / 10,
    baseline: Math.round(baseRadiance * 10) / 10,
    reference: '5-year avg'
  };
}

/**
 * Update the anomaly panel UI
 */
function updateAnomalyPanel(location) {
  const panel = document.getElementById('anomalyPanel');
  const badge = document.getElementById('anomalyBadge');
  const percentEl = panel.querySelector('.anomaly-percent');
  const directionEl = panel.querySelector('.anomaly-direction');
  const currentEl = document.getElementById('anomalyCurrent');
  const baselineEl = document.getElementById('anomalyBaseline');
  const referenceEl = document.getElementById('anomalyReference');

  // Get anomaly data - use preset data if available, otherwise generate
  let anomalyData;
  if (location.anomaly) {
    anomalyData = location.anomaly;
  } else {
    anomalyData = generateMockAnomaly(location.lat, location.lng);
  }

  const analysis = calculateAnomaly(anomalyData.current, anomalyData.baseline);

  // Update panel classes
  panel.classList.add('active');
  panel.classList.remove('anomaly-increase', 'anomaly-decrease');
  if (analysis.isSignificant) {
    panel.classList.add(analysis.direction === 'increase' ? 'anomaly-increase' : 'anomaly-decrease');
  }

  // Update badge
  badge.className = 'anomaly-badge';
  if (analysis.isSignificant) {
    badge.textContent = analysis.direction === 'increase' ? 'Brighter' : 'Dimmer';
    badge.classList.add(analysis.direction);
  } else {
    badge.textContent = 'Normal';
    badge.classList.add('normal');
  }

  // Update percentage display
  const sign = analysis.percentChange > 0 ? '+' : '';
  percentEl.textContent = `${sign}${analysis.percentChange.toFixed(1)}%`;

  // Update direction text
  if (analysis.isSignificant) {
    directionEl.textContent = analysis.direction === 'increase'
      ? 'brighter than baseline'
      : 'dimmer than baseline';
  } else {
    directionEl.textContent = 'within normal range';
  }

  // Update details
  currentEl.textContent = `${anomalyData.current} nW/cm²/sr`;
  baselineEl.textContent = `${anomalyData.baseline} nW/cm²/sr`;
  referenceEl.textContent = anomalyData.reference;

  // Store current location
  state.currentLocation = location;
}

/**
 * Clear the anomaly panel
 */
function clearAnomalyPanel() {
  const panel = document.getElementById('anomalyPanel');
  const badge = document.getElementById('anomalyBadge');
  const percentEl = panel.querySelector('.anomaly-percent');
  const directionEl = panel.querySelector('.anomaly-direction');

  panel.classList.remove('active', 'anomaly-increase', 'anomaly-decrease');
  badge.className = 'anomaly-badge';
  badge.textContent = '--';
  percentEl.textContent = '--';
  directionEl.textContent = 'vs. baseline';

  document.getElementById('anomalyCurrent').textContent = '--';
  document.getElementById('anomalyBaseline').textContent = '--';
  document.getElementById('anomalyReference').textContent = '--';

  state.currentLocation = null;
}

// ========================================
// Location Search (Nominatim Geocoding)
// ========================================

/**
 * Search for a location using Nominatim
 */
async function searchLocation(query) {
  if (!query.trim()) return;

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ECHO.WATCH/1.0'
      }
    });

    if (!response.ok) throw new Error('Search failed');

    const results = await response.json();

    if (results.length === 0) {
      document.getElementById('locationInfo').textContent = 'Location not found';
      return;
    }

    const result = results[0];
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);

    // Determine zoom based on place type
    let zoom = 10;
    if (result.type === 'country') zoom = 5;
    else if (result.type === 'state' || result.type === 'region') zoom = 7;
    else if (result.type === 'city' || result.type === 'town') zoom = 10;
    else if (result.type === 'village' || result.type === 'suburb') zoom = 12;

    // Fly to location
    flyToLocation({
      lat: lat,
      lng: lon,
      zoom: Math.min(zoom, 12), // Respect maxZoom
      name: result.display_name.split(',')[0] // Short name
    });

  } catch (error) {
    console.error('Geocoding error:', error);
    document.getElementById('locationInfo').textContent = 'Search error';
  }
}

function setupSearch() {
  const searchInput = document.getElementById('searchInput');

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchLocation(searchInput.value);
      searchInput.blur();
    }
  });
}

// ========================================
// Map Events
// ========================================

function setupMapEvents() {
  const loadingEl = document.getElementById('loading');
  const coordsEl = document.getElementById('coords');

  // Loading indicator
  state.map.on('dataloading', () => {
    loadingEl.classList.add('show');
  });

  state.map.on('idle', () => {
    loadingEl.classList.remove('show');
  });

  // Coordinate display
  state.map.on('mousemove', (e) => {
    const lat = e.lngLat.lat.toFixed(4);
    const lng = e.lngLat.lng.toFixed(4);
    coordsEl.textContent = `${lat}, ${lng}`;
  });
}

// ========================================
// Export & URL State
// ========================================

/**
 * Build shareable URL with current map state
 */
function buildShareableUrl() {
  const center = state.map.getCenter();
  const zoom = state.map.getZoom();
  const date = state.mode === 'single' ? state.currentDate : `${state.beforeDate},${state.afterDate}`;

  const params = new URLSearchParams({
    lat: center.lat.toFixed(4),
    lng: center.lng.toFixed(4),
    z: zoom.toFixed(1),
    d: date,
    l: state.currentLayer
  });

  // Add compare mode if active
  if (state.mode !== 'single') {
    params.set('m', state.mode);
  }

  return `${window.location.origin}${window.location.pathname}#${params.toString()}`;
}

/**
 * Parse URL hash and restore map state
 */
function parseUrlHash() {
  const hash = window.location.hash.slice(1);
  if (!hash) return null;

  try {
    const params = new URLSearchParams(hash);
    return {
      lat: parseFloat(params.get('lat')),
      lng: parseFloat(params.get('lng')),
      zoom: parseFloat(params.get('z')),
      date: params.get('d'),
      layer: params.get('l'),
      mode: params.get('m')
    };
  } catch (e) {
    return null;
  }
}

/**
 * Apply URL hash state to map
 */
function applyUrlState(urlState) {
  if (!urlState || isNaN(urlState.lat) || isNaN(urlState.lng)) return false;

  // Set layer
  if (urlState.layer && CONFIG.layers[urlState.layer]) {
    state.currentLayer = urlState.layer;
    document.querySelectorAll('.layer-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.layer === urlState.layer);
    });
  }

  // Handle date(s)
  if (urlState.date) {
    if (urlState.date.includes(',')) {
      // Compare mode
      const [before, after] = urlState.date.split(',');
      state.beforeDate = before;
      state.afterDate = after;
      state.currentDate = before;
    } else {
      state.currentDate = urlState.date;
    }
  }

  // Jump to location
  state.map.jumpTo({
    center: [urlState.lng, urlState.lat],
    zoom: urlState.zoom || CONFIG.defaultZoom
  });

  // Update date input
  document.getElementById('dateSelect').value = state.currentDate;

  // Enter compare mode if specified
  if (urlState.mode && urlState.mode !== 'single') {
    // Delay to let map initialize
    setTimeout(() => {
      enterCompareMode(urlState.mode);
    }, 500);
  }

  // Update location info
  document.getElementById('locationInfo').textContent = `${urlState.lat.toFixed(4)}, ${urlState.lng.toFixed(4)}`;

  return true;
}

/**
 * Update URL hash as map moves (debounced)
 */
let hashUpdateTimeout;
function updateUrlHash() {
  clearTimeout(hashUpdateTimeout);
  hashUpdateTimeout = setTimeout(() => {
    const url = buildShareableUrl();
    const hash = url.split('#')[1];
    history.replaceState(null, '', `#${hash}`);
  }, 500);
}

/**
 * Open export modal
 */
function openExportModal() {
  const modal = document.getElementById('exportModal');
  const urlInput = document.getElementById('exportUrl');
  const center = state.map.getCenter();

  // Generate shareable URL
  urlInput.value = buildShareableUrl();

  // Update metadata
  document.getElementById('metaLocation').textContent =
    state.currentLocation?.name || 'Custom location';
  document.getElementById('metaCoords').textContent =
    `${center.lat.toFixed(4)}, ${center.lng.toFixed(4)}`;
  document.getElementById('metaDate').textContent =
    state.mode === 'single'
      ? state.currentDate
      : `${state.beforeDate} vs ${state.afterDate}`;
  document.getElementById('metaZoom').textContent =
    state.map.getZoom().toFixed(1);

  modal.classList.add('active');
}

/**
 * Close export modal
 */
function closeExportModal() {
  document.getElementById('exportModal').classList.remove('active');
}

/**
 * Copy URL to clipboard
 */
async function copyUrlToClipboard() {
  const urlInput = document.getElementById('exportUrl');
  const copyBtn = document.getElementById('copyUrl');

  try {
    await navigator.clipboard.writeText(urlInput.value);
    copyBtn.textContent = 'Copied!';
    copyBtn.classList.add('copied');

    setTimeout(() => {
      copyBtn.textContent = 'Copy';
      copyBtn.classList.remove('copied');
    }, 2000);
  } catch (err) {
    // Fallback
    urlInput.select();
    document.execCommand('copy');
  }
}

/**
 * Download map screenshot
 */
function downloadScreenshot() {
  const canvas = state.map.getCanvas();
  const link = document.createElement('a');

  // Generate filename
  const date = state.currentDate.replace(/-/g, '');
  const center = state.map.getCenter();
  const filename = `echowatch_${date}_${center.lat.toFixed(2)}_${center.lng.toFixed(2)}.png`;

  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/**
 * Setup export controls
 */
function setupExport() {
  // Export button
  document.getElementById('exportBtn').addEventListener('click', openExportModal);

  // Close button
  document.getElementById('exportClose').addEventListener('click', closeExportModal);

  // Click outside to close
  document.getElementById('exportModal').addEventListener('click', (e) => {
    if (e.target.id === 'exportModal') {
      closeExportModal();
    }
  });

  // Copy URL button
  document.getElementById('copyUrl').addEventListener('click', copyUrlToClipboard);

  // Download screenshot
  document.getElementById('downloadScreenshot').addEventListener('click', downloadScreenshot);

  // Escape key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeExportModal();
    }
  });

  // Update URL hash as map moves
  state.map.on('moveend', updateUrlHash);
}

// ========================================
// Initialize
// ========================================

document.addEventListener('DOMContentLoaded', () => {
  initMap();
  setupDateControl();
  setupLayerToggle();
  setupLocationButtons();
  setupCompareControls();
  setupSearch();
  setupExport();

  // Check for URL hash state after map loads
  state.map.on('load', () => {
    const urlState = parseUrlHash();
    if (urlState) {
      applyUrlState(urlState);
    }
  });
});
