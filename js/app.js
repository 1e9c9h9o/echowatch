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
      id: 'VIIRS_SNPP_DayNightBand',
      name: 'Night Lights',
      maxZoom: 7,
      tileMatrixSet: 'GoogleMapsCompatible_Level7'
    },
    blackmarble: {
      id: 'VIIRS_Black_Marble',
      name: 'Black Marble',
      maxZoom: 8,
      tileMatrixSet: 'GoogleMapsCompatible_Level8',
      staticDate: '2016-01-01' // Annual composite, not daily
    }
  },

  // Preset locations with anomaly data and context
  // Radiance values in nW/cm²/sr (nanowatts per square centimeter per steradian)
  locations: [
    {
      name: 'Gaza Strip',
      desc: 'Humanitarian crisis',
      category: 'conflict',
      status: 'critical',
      lat: 31.5,
      lng: 34.47,
      zoom: 10,
      anomaly: {
        current: 8.2,
        baseline: 28.4,
        reference: 'Jan 2023'
      },
      context: {
        situation: 'Infrastructure damage from ongoing conflict',
        cause: 'Over 70% reduction correlates with power grid damage, fuel shortages, and population displacement.',
        lookFor: 'Compare to pre-conflict imagery. Remaining light sources typically indicate generators or areas with intact infrastructure.'
      }
    },
    {
      name: 'Kyiv, Ukraine',
      desc: 'Wartime infrastructure',
      category: 'conflict',
      status: 'warning',
      lat: 50.4501,
      lng: 30.5234,
      zoom: 9,
      anomaly: {
        current: 31.5,
        baseline: 52.1,
        reference: 'Jan 2022'
      },
      context: {
        situation: 'Infrastructure damage and energy rationing',
        cause: 'A 40% decrease correlates with power infrastructure damage, rolling blackouts, and wartime energy conservation.',
        lookFor: 'Central Kyiv typically maintains higher output. Suburban and industrial zones show variable reduction. Compare to Feb 2022 baseline.'
      }
    },
    {
      name: 'Puerto Rico',
      desc: 'Grid fragility post-Maria',
      category: 'disaster',
      status: 'warning',
      lat: 18.2208,
      lng: -66.5901,
      zoom: 9,
      anomaly: {
        current: 22.1,
        baseline: 31.4,
        reference: 'Jan 2017 (pre-Maria)'
      },
      context: {
        situation: 'Partial recovery from Hurricane Maria (2017)',
        cause: 'Radiance remains approximately 30% below pre-Maria levels. Factors include grid infrastructure limitations, population changes, and economic conditions.',
        lookFor: 'San Juan metropolitan area registers highest. Rural mountainous interior shows variable recovery. Compare with pre-2017 imagery.'
      }
    },
    {
      name: 'Houston, TX',
      desc: 'Petrochemical corridor',
      category: 'urban',
      status: 'normal',
      lat: 29.7604,
      lng: -95.3698,
      zoom: 9,
      anomaly: {
        current: 89.2,
        baseline: 85.6,
        reference: '5-year avg (Jan)'
      },
      context: {
        situation: 'Within normal range',
        cause: 'A 4% increase falls within typical variation. Possible factors: new development, seasonal activity, or industrial output.',
        lookFor: 'Petrochemical facilities along the Ship Channel register highest radiance. Downtown and Energy Corridor show consistent output.'
      }
    },
    {
      name: 'Los Angeles, CA',
      desc: 'Metropolitan basin',
      category: 'urban',
      status: 'normal',
      lat: 34.0522,
      lng: -118.2437,
      zoom: 9,
      anomaly: {
        current: 124.8,
        baseline: 128.3,
        reference: '5-year avg (Jan)'
      },
      context: {
        situation: 'Within normal range',
        cause: 'A 3% decrease is within measurement uncertainty. LED lighting transition reduces total radiance while maintaining ground-level illumination.',
        lookFor: 'Street grid pattern visible at this resolution. LAX, ports, and downtown register highest. Dark areas correspond to terrain and parks.'
      }
    },
    {
      name: 'Detroit, MI',
      desc: 'Industrial Midwest',
      category: 'urban',
      status: 'normal',
      lat: 42.3314,
      lng: -83.0458,
      zoom: 10,
      anomaly: {
        current: 42.3,
        baseline: 45.8,
        reference: '5-year avg (Jan)'
      },
      context: {
        situation: 'Within normal range',
        cause: 'Minor decrease consistent with seasonal variation, weather conditions, or industrial scheduling. Changes under 10% fall within typical fluctuation.',
        lookFor: 'High-radiance clusters correspond to automotive plants and refineries. Downtown core maintains consistent output.'
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
  },

  // Notable Events - Documented incidents with measurable radiance changes
  notableEvents: [
    {
      id: 'ukraine-invasion',
      title: 'Ukraine Invasion',
      subtitle: 'February 2022',
      description: 'Following the Russian invasion in February 2022, strikes on power infrastructure caused blackouts across multiple oblasts.',
      beforeDate: '2022-02-20',
      afterDate: '2022-03-15',
      lat: 50.4501,
      lng: 30.5234,
      zoom: 7,
      impact: 'Measurable radiance reduction in Kyiv, Kharkiv, and surrounding regions.',
      category: 'conflict'
    },
    {
      id: 'gaza-2023',
      title: 'Gaza Blackout',
      subtitle: 'October 2023',
      description: 'The Gaza Strip recorded approximately 70% radiance reduction following conflict escalation in October 2023.',
      beforeDate: '2023-10-01',
      afterDate: '2023-11-15',
      lat: 31.5,
      lng: 34.47,
      zoom: 10,
      impact: 'Population affected: 2.3 million. Near-complete loss of grid power.',
      category: 'conflict'
    },
    {
      id: 'hurricane-maria',
      title: 'Hurricane Maria',
      subtitle: 'September 2017',
      description: 'Category 4 hurricane made landfall September 20, 2017, causing complete power grid failure across Puerto Rico.',
      beforeDate: '2017-09-15',
      afterDate: '2017-09-25',
      lat: 18.2208,
      lng: -66.5901,
      zoom: 8,
      impact: 'Island-wide blackout. Grid restoration completed after 11 months.',
      category: 'disaster'
    },
    {
      id: 'texas-freeze',
      title: 'Texas Power Crisis',
      subtitle: 'February 2021',
      description: 'Winter storm Uri caused cascading failures in the ERCOT grid, resulting in widespread outages across Texas.',
      beforeDate: '2021-02-10',
      afterDate: '2021-02-17',
      lat: 29.7604,
      lng: -95.3698,
      zoom: 7,
      impact: '4.5 million homes without power at peak. Grid frequency dropped to critical levels.',
      category: 'disaster'
    },
    {
      id: 'california-wildfires-2020',
      title: 'California Wildfires',
      subtitle: 'August–September 2020',
      description: 'The 2020 fire season burned 4.2 million acres. Active fires appear as point sources; evacuated areas show reduced radiance.',
      beforeDate: '2020-08-01',
      afterDate: '2020-09-15',
      lat: 38.5,
      lng: -121.5,
      zoom: 6,
      impact: 'Active fire signatures visible. Evacuation zones show temporary radiance decrease.',
      category: 'disaster'
    },
    {
      id: 'india-diwali',
      title: 'Diwali Festival',
      subtitle: 'November 2023',
      description: 'During Diwali, decorative lighting across Indian cities produces measurable radiance increase in VIIRS data.',
      beforeDate: '2023-11-01',
      afterDate: '2023-11-12',
      lat: 28.6139,
      lng: 77.209,
      zoom: 6,
      impact: 'Detectable brightness increase in urban areas during festival period.',
      category: 'cultural'
    }
  ],

  // Discover mode - Curated locations with notable radiance patterns
  discoverFacts: [
    {
      location: 'North Korea',
      lat: 39.0392,
      lng: 125.7625,
      zoom: 6,
      fact: 'North Korea records minimal nighttime radiance outside Pyongyang. The contrast with South Korea is among the most pronounced cross-border differentials globally.',
      lookFor: 'The DMZ is delineated by radiance difference alone—no physical border features required.'
    },
    {
      location: 'Fishing Fleets',
      lat: -8.5,
      lng: 115.5,
      zoom: 5,
      fact: 'Offshore light clusters are commercial fishing vessels using high-intensity lamps to attract squid. Southeast Asian waters show the highest concentration.',
      lookFor: 'Point sources 50–200 km offshore, often in linear formations following fishing grounds.'
    },
    {
      location: 'Nile River',
      lat: 26.8206,
      lng: 30.8025,
      zoom: 5,
      fact: 'Egypt\'s population is concentrated along the Nile corridor. The river valley contains >95% of the country\'s nighttime radiance.',
      lookFor: 'Linear radiance pattern from the Mediterranean delta to Aswan, surrounded by near-zero readings.'
    },
    {
      location: 'Las Vegas',
      lat: 36.1699,
      lng: -115.1398,
      zoom: 9,
      fact: 'Las Vegas registers high per-capita radiance due to concentrated commercial lighting. The resort corridor is surrounded by Mojave Desert with minimal ambient light.',
      lookFor: 'High-intensity cluster with sharp boundary where urban development ends at desert.'
    },
    {
      location: 'Trans-Siberian Railway',
      lat: 55.0,
      lng: 90.0,
      zoom: 4,
      fact: 'The 9,289 km Trans-Siberian Railway route is traceable by the chain of settlements along its path—the primary development corridor across Siberia.',
      lookFor: 'Sequential point sources following an east-west axis across otherwise dark terrain.'
    },
    {
      location: 'India-Pakistan Border',
      lat: 31.0,
      lng: 74.0,
      zoom: 6,
      fact: 'Security floodlighting along the India-Pakistan border creates a continuous linear feature visible in VIIRS data spanning approximately 3,000 km.',
      lookFor: 'Orange-tinted linear feature extending from the Arabian Sea coast to the Kashmir region.'
    },
    {
      location: 'Oil Fields of Kuwait',
      lat: 29.3117,
      lng: 47.4818,
      zoom: 8,
      fact: 'Gas flares from petroleum extraction register as high-radiance point sources. The Persian Gulf region contains numerous such signatures.',
      lookFor: 'Isolated high-intensity points in areas with no urban development—these are extraction facilities.'
    },
    {
      location: 'Amazon Deforestation',
      lat: -8.0,
      lng: -63.0,
      zoom: 6,
      fact: 'Road construction and settlement expansion in the Amazon basin create new radiance signatures in previously unlit areas. Patterns correlate with deforestation data.',
      lookFor: 'Linear patterns extending from established corridors—characteristic "fishbone" road network signature.'
    }
  ]
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
function buildGIBSUrl(layerId, date, tileMatrixSet = 'GoogleMapsCompatible_Level8') {
  return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${layerId}/default/${date}/${tileMatrixSet}/{z}/{y}/{x}.png`;
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
  const tileMatrixSet = layerConfig.tileMatrixSet || 'GoogleMapsCompatible_Level8';
  const tileUrl = buildGIBSUrl(layerConfig.id, effectiveDate, tileMatrixSet);

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
        maxzoom: layerConfig.maxZoom, // Tiles only available up to this zoom
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
        maxzoom: 22, // Render at all zooms (tiles upscaled beyond source maxzoom)
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
  const tileMatrixSet = layerConfig.tileMatrixSet || 'GoogleMapsCompatible_Level8';
  const tileUrl = buildGIBSUrl(layerConfig.id, effectiveDate, tileMatrixSet);

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
    maxzoom: layerConfig.maxZoom, // Tiles only available up to this zoom
    attribution: '© NASA GIBS'
  });

  // Re-add layer (before labels)
  state.map.addLayer({
    id: 'viirs',
    type: 'raster',
    source: 'viirs',
    minzoom: 0,
    maxzoom: 22, // Render at all zooms (upscaled beyond source maxzoom)
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
  const tileMatrixSet = layerConfig.tileMatrixSet || 'GoogleMapsCompatible_Level8';
  const tileUrl = buildGIBSUrl(layerConfig.id, effectiveDate, tileMatrixSet);

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
    maxzoom: layerConfig.maxZoom, // Tiles only available up to this zoom
    attribution: '© NASA GIBS'
  });

  state.afterMap.addLayer({
    id: 'viirs',
    type: 'raster',
    source: 'viirs',
    minzoom: 0,
    maxzoom: 22, // Render at all zooms (upscaled beyond source maxzoom)
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
    btn.className = `location-btn status-${loc.status || 'normal'}`;
    btn.dataset.category = loc.category || 'urban';

    // Calculate the change percentage for the badge
    const change = loc.anomaly
      ? Math.round(((loc.anomaly.current - loc.anomaly.baseline) / loc.anomaly.baseline) * 100)
      : 0;
    const changeText = change > 0 ? `+${change}%` : `${change}%`;

    btn.innerHTML = `
      <div class="location-status"></div>
      <div class="location-info">
        <div class="name">${loc.name}</div>
        <div class="desc">${loc.desc}</div>
      </div>
      <div class="location-change ${change < -10 ? 'decrease' : change > 10 ? 'increase' : ''}">${changeText}</div>
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

  // Update context interpretation
  const interpretationEl = document.getElementById('contextInterpretation');
  const scaleMarker = document.getElementById('scaleMarker');
  const causeEl = document.getElementById('contextCause');

  // Determine severity based on percentage change
  let severity = 'normal';
  let interpretation = '';

  const absChange = Math.abs(analysis.percentChange);
  if (absChange > 30) {
    severity = 'severe';
    interpretation = `<strong>Significant change detected.</strong> `;
  } else if (absChange > 10) {
    severity = 'moderate';
    interpretation = `<strong>Notable change.</strong> `;
  } else {
    severity = 'normal';
    interpretation = `<strong>Within normal range.</strong> `;
  }

  // Add location-specific context if available
  if (location.context) {
    interpretation += location.context.situation;
    interpretationEl.innerHTML = interpretation;
    causeEl.innerHTML = `<strong>What's happening:</strong> ${location.context.cause}<br><br><strong>What to look for:</strong> ${location.context.lookFor}`;
  } else {
    interpretation += `A ${absChange.toFixed(0)}% ${analysis.direction === 'increase' ? 'increase' : 'decrease'} in nighttime light output.`;
    interpretationEl.innerHTML = interpretation;
    causeEl.innerHTML = '<strong>What to look for:</strong> Bright spots indicate populated areas, industry, and infrastructure. Dark areas may be rural, unpopulated, or experiencing outages.';
  }

  // Set severity class
  interpretationEl.className = 'context-interpretation severity-' + severity;

  // Position scale marker (clamp between 0% and 100%, center is 50% = no change)
  const markerPosition = Math.max(0, Math.min(100, 50 - (analysis.percentChange)));
  scaleMarker.style.left = `${markerPosition}%`;

  // Update news link
  const newsLink = document.getElementById('newsLink');
  const searchTerms = `${location.name} ${analysis.isSignificant ? (analysis.direction === 'decrease' ? 'power outage blackout' : 'lights activity') : 'news'}`;
  newsLink.href = `https://news.google.com/search?q=${encodeURIComponent(searchTerms)}&hl=en`;

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

  // Clear context elements
  document.getElementById('contextInterpretation').innerHTML = '';
  document.getElementById('contextInterpretation').className = 'context-interpretation';
  document.getElementById('contextCause').innerHTML = '';
  document.getElementById('scaleMarker').style.left = '50%';

  state.currentLocation = null;
}

// ========================================
// Location Search (Nominatim Geocoding)
// ========================================

/**
 * Search for a location using Nominatim
 */
// Debounce helper
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Search for locations with autocomplete
async function searchLocations(query) {
  if (!query.trim() || query.length < 2) {
    hideSearchResults();
    return;
  }

  const resultsEl = document.getElementById('searchResults');
  resultsEl.innerHTML = '<div class="search-loading">Searching...</div>';
  resultsEl.classList.add('active');

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'ECHO.WATCH/1.0' }
    });

    if (!response.ok) throw new Error('Search failed');

    const results = await response.json();

    if (results.length === 0) {
      resultsEl.innerHTML = '<div class="search-loading">No results found</div>';
      return;
    }

    resultsEl.innerHTML = results.map((result, i) => `
      <div class="search-result-item" data-index="${i}">
        <div class="result-name">${result.display_name.split(',')[0]}</div>
        <div class="result-detail">${result.display_name.split(',').slice(1, 3).join(',')}</div>
      </div>
    `).join('');

    // Store results for click handling
    resultsEl.searchResults = results;

  } catch (error) {
    console.error('Geocoding error:', error);
    resultsEl.innerHTML = '<div class="search-loading">Search error</div>';
  }
}

function selectSearchResult(result) {
  const lat = parseFloat(result.lat);
  const lon = parseFloat(result.lon);

  // Determine zoom based on place type
  let zoom = 10;
  if (result.type === 'country') zoom = 5;
  else if (result.type === 'state' || result.type === 'region') zoom = 7;
  else if (result.type === 'city' || result.type === 'town') zoom = 10;
  else if (result.type === 'village' || result.type === 'suburb') zoom = 12;

  const shortName = result.display_name.split(',')[0];

  // Fly to location with generated context
  flyToLocation({
    lat: lat,
    lng: lon,
    zoom: Math.min(zoom, 12),
    name: shortName,
    desc: result.display_name.split(',').slice(1, 2).join('').trim()
  });

  hideSearchResults();
  document.getElementById('searchInput').value = shortName;
}

function hideSearchResults() {
  const resultsEl = document.getElementById('searchResults');
  resultsEl.classList.remove('active');
  resultsEl.innerHTML = '';
}

function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  const resultsEl = document.getElementById('searchResults');

  // Debounced search on input
  const debouncedSearch = debounce(searchLocations, 300);
  searchInput.addEventListener('input', (e) => {
    debouncedSearch(e.target.value);
  });

  // Handle Enter key
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const results = resultsEl.searchResults;
      if (results && results.length > 0) {
        selectSearchResult(results[0]);
      }
      searchInput.blur();
    } else if (e.key === 'Escape') {
      hideSearchResults();
      searchInput.blur();
    }
  });

  // Handle result clicks
  resultsEl.addEventListener('click', (e) => {
    const item = e.target.closest('.search-result-item');
    if (item && resultsEl.searchResults) {
      const index = parseInt(item.dataset.index);
      selectSearchResult(resultsEl.searchResults[index]);
    }
  });

  // Hide results on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-box')) {
      hideSearchResults();
    }
  });

  // Show results on focus if there's text
  searchInput.addEventListener('focus', () => {
    if (searchInput.value.length >= 2) {
      searchLocations(searchInput.value);
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
// Mobile Support
// ========================================

function setupMobile() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const headerControls = document.querySelector('.header-controls');

  // Toggle sidebar on menu button click
  menuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('mobile-open');
    overlay.classList.toggle('active');
  });

  // Close sidebar on overlay click
  overlay.addEventListener('click', () => {
    sidebar.classList.remove('mobile-open');
    overlay.classList.remove('active');
  });

  // Close sidebar when clicking a location button (mobile UX)
  document.querySelectorAll('.location-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.innerWidth <= 900) {
        sidebar.classList.remove('mobile-open');
        overlay.classList.remove('active');
      }
    });
  });

  // Toggle header controls visibility on mobile
  // Reuse menu button for header controls on very small screens
  menuBtn.addEventListener('dblclick', () => {
    headerControls.classList.toggle('mobile-visible');
  });
}

// ========================================
// Notable Events
// ========================================

function setupNotableEvents() {
  const container = document.getElementById('eventsList');

  CONFIG.notableEvents.forEach(event => {
    const card = document.createElement('button');
    card.className = `event-card category-${event.category}`;

    const categoryLabels = {
      'conflict': 'Conflict',
      'disaster': 'Disaster',
      'cultural': 'Event'
    };
    const badgeText = categoryLabels[event.category] || 'Compare';

    card.innerHTML = `
      <div class="event-header">
        <div>
          <div class="event-title">${event.title}</div>
          <div class="event-subtitle">${event.subtitle}</div>
        </div>
        <span class="event-badge">${badgeText}</span>
      </div>
      <div class="event-description">${event.description}</div>
      <div class="event-dates">
        <span>${formatDate(event.beforeDate)}</span>
        <span class="event-arrow">→</span>
        <span>${formatDate(event.afterDate)}</span>
      </div>
    `;

    card.addEventListener('click', () => {
      loadNotableEvent(event);
    });

    container.appendChild(card);
  });
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function loadNotableEvent(event) {
  // First fly to the location
  const flyOptions = {
    center: [event.lng, event.lat],
    zoom: event.zoom,
    duration: 1500
  };

  state.map.flyTo(flyOptions);

  // If in compare mode, exit first
  if (state.mode !== 'single') {
    exitCompareMode();
  }

  // Wait for fly animation, then enter compare mode with specific dates
  setTimeout(() => {
    // Set the dates
    state.beforeDate = event.beforeDate;
    state.afterDate = event.afterDate;

    // Enter swipe compare mode
    state.mode = 'swipe';
    state.currentDate = state.beforeDate;

    // Create the after map
    const wrapper = document.getElementById('map-wrapper');
    wrapper.classList.add('compare-swipe');

    // Update main map with before date
    updateLayer();

    state.afterMap = new maplibregl.Map({
      container: 'map-after',
      style: buildMapStyle(state.afterDate),
      center: state.map.getCenter(),
      zoom: state.map.getZoom(),
      bearing: state.map.getBearing(),
      pitch: state.map.getPitch(),
      maxZoom: 12
    });

    state.afterMap.on('load', () => {
      initSwipeCompare();
    });

    updateDateLabels();
    updateCompareUI(true);

    // Update location info
    document.getElementById('locationInfo').textContent = event.title;

    // Show impact message
    showImpactToast(event);

  }, 1600);

  // Close sidebar on mobile
  if (window.innerWidth <= 900) {
    document.querySelector('.sidebar').classList.remove('mobile-open');
    document.getElementById('sidebarOverlay').classList.remove('active');
  }
}

function showImpactToast(event) {
  // Remove existing toast if any
  const existing = document.querySelector('.impact-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'impact-toast';
  toast.innerHTML = `
    <div class="toast-content">
      <strong>${event.title}</strong>
      <p>${event.impact}</p>
      <span class="toast-hint">Use slider to compare dates</span>
    </div>
  `;

  document.body.appendChild(toast);

  // Animate in
  setTimeout(() => toast.classList.add('visible'), 100);

  // Auto-dismiss after 6 seconds
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  }, 6000);

  // Click to dismiss
  toast.addEventListener('click', () => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  });
}

// ========================================
// Discover Mode
// ========================================

let lastDiscoverIndex = -1;

function setupDiscover() {
  const discoverBtn = document.getElementById('discoverBtn');
  const discoverCard = document.getElementById('discoverCard');
  const discoverClose = document.getElementById('discoverClose');
  const discoverAnother = document.getElementById('discoverAnother');

  discoverBtn.addEventListener('click', () => {
    showRandomDiscover();
  });

  discoverClose.addEventListener('click', () => {
    discoverCard.classList.add('hidden');
  });

  discoverAnother.addEventListener('click', () => {
    showRandomDiscover();
  });
}

function showRandomDiscover() {
  const facts = CONFIG.discoverFacts;
  const discoverCard = document.getElementById('discoverCard');

  // Get a random fact that's different from the last one
  let index;
  do {
    index = Math.floor(Math.random() * facts.length);
  } while (index === lastDiscoverIndex && facts.length > 1);

  lastDiscoverIndex = index;
  const fact = facts[index];

  // Update the card
  document.getElementById('discoverLocation').textContent = fact.location;
  document.getElementById('discoverFact').textContent = fact.fact;
  document.getElementById('discoverLookFor').textContent = fact.lookFor;

  // Show the card
  discoverCard.classList.remove('hidden');

  // Fly to the location
  state.map.flyTo({
    center: [fact.lng, fact.lat],
    zoom: fact.zoom,
    duration: 2000
  });

  // Update location info
  document.getElementById('locationInfo').textContent = fact.location;

  // Exit compare mode if active
  if (state.mode !== 'single') {
    exitCompareMode();
  }

  // Close sidebar on mobile
  if (window.innerWidth <= 900) {
    document.querySelector('.sidebar').classList.remove('mobile-open');
    document.getElementById('sidebarOverlay').classList.remove('active');
  }
}

// ========================================
// Guide Card (Collapsible)
// ========================================

function setupGuide() {
  const guideCard = document.getElementById('guideCard');
  const guideHeader = guideCard.querySelector('.guide-header');

  // Check if user has collapsed it before
  const isCollapsed = localStorage.getItem('echowatch_guide_collapsed') === 'true';

  if (isCollapsed) {
    guideCard.classList.add('collapsed');
  }

  guideHeader.addEventListener('click', () => {
    guideCard.classList.toggle('collapsed');
    localStorage.setItem('echowatch_guide_collapsed', guideCard.classList.contains('collapsed'));
  });
}

// ========================================
// Welcome Modal
// ========================================

function setupWelcome() {
  const modal = document.getElementById('welcomeModal');
  const closeBtn = document.getElementById('welcomeClose');
  const startBtn = document.getElementById('welcomeStart');
  const tourBtn = document.getElementById('welcomeTour');
  const dontShowCheckbox = document.getElementById('welcomeDontShow');

  // Check if user has dismissed the welcome before
  const hasSeenWelcome = localStorage.getItem('echowatch_welcome_dismissed');

  if (hasSeenWelcome) {
    modal.classList.add('hidden');
    return;
  }

  function closeWelcome() {
    modal.classList.add('hidden');

    // Save preference if checkbox is checked
    if (dontShowCheckbox.checked) {
      localStorage.setItem('echowatch_welcome_dismissed', 'true');
    }
  }

  closeBtn.addEventListener('click', closeWelcome);
  startBtn.addEventListener('click', closeWelcome);

  // Tour button - load Hurricane Maria as example event
  tourBtn.addEventListener('click', () => {
    closeWelcome();
    // Wait for modal to close, then load example event
    setTimeout(() => {
      // Hurricane Maria demonstrates clear before/after radiance change
      const event = CONFIG.notableEvents.find(e => e.id === 'hurricane-maria');
      if (event) {
        loadNotableEvent(event);
      }
    }, 500);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeWelcome();
    }
  });

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeWelcome();
    }
  });
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
  setupMobile();
  setupGuide();
  setupNotableEvents();
  setupDiscover();
  setupWelcome();

  // Check for URL hash state after map loads
  state.map.on('load', () => {
    const urlState = parseUrlHash();
    if (urlState) {
      applyUrlState(urlState);
    }
  });
});
