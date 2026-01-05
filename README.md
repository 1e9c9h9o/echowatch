# ECHO.WATCH

Real-time satellite nighttime lights visualization for civic transparency.

## What is this?

ECHO.WATCH displays NASA VIIRS Day/Night Band satellite imagery — the same data used by researchers to track power outages, conflict damage, economic activity, and infrastructure changes around the world.

## Data Source

- **Satellite**: Suomi NPP / NOAA-20 VIIRS
- **Band**: Day/Night Band (DNB)
- **Resolution**: ~750m
- **Update frequency**: Daily (with ~24hr delay)
- **Provider**: NASA GIBS (Global Imagery Browse Services)

## Tech Stack

- MapLibre GL JS
- NASA GIBS WMTS tiles
- Vanilla JavaScript
- CSS (Ulm School design aesthetic)

## NASA GIBS Layers Used

```
VIIRS_SNPP_DayNightBand_ENCC     - Enhanced Near Constant Contrast
VIIRS_Black_Marble               - Blue/Yellow composite
```

### GIBS Tile URL Pattern

```
https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/{LAYER}/default/{YYYY-MM-DD}/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png
```

## Local Development

Just open `index.html` in a browser. No build step required.

For a local server (enables better caching):

```bash
# Python
python -m http.server 8000

# Node
npx serve
```

## Project Structure

```
echo-watch/
├── index.html          # Main application
├── css/
│   └── style.css       # Ulm-style design system
├── js/
│   └── app.js          # Map logic + NASA GIBS integration
└── README.md
```

## Planned Features

- [ ] Date comparison slider (before/after)
- [ ] Location search
- [ ] Anomaly detection (current vs historical baseline)
- [ ] Export reports
- [ ] Radiance value extraction

## Limitations

1. **Max zoom level 8** — GIBS tiles cap at ~750m resolution
2. **24-48hr data delay** — Not real-time
3. **Moonlight affects data** — Full moon = brighter background
4. **Cloud cover** — Obscures data

## Related Resources

- [NASA Black Marble](https://blackmarble.gsfc.nasa.gov/)
- [NASA GIBS API](https://nasa-gibs.github.io/gibs-api-docs/)
- [VIIRS Land Products](https://viirsland.gsfc.nasa.gov/)
- [Worldview](https://worldview.earthdata.nasa.gov/) — NASA's official viewer

## Part of ECHOCORP

Infrastructure for information sovereignty.

- [CIV.IQ](https://civiq.io) — Civic intelligence platform
- [ECHOLOCK](https://github.com/echocorp/echolock) — Cryptographic dead man's switch
- [ECHO.WATCH](https://echo.watch) — Satellite monitoring

---

Data: NASA VIIRS DNB via GIBS  
License: MIT
