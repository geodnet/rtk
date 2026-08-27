# GEODNET RTK Portal

A premium, high-fidelity Single Page Application (SPA) designed for **GEODNET RTK Service** end-use customers and enterprise resellers. This portal provides an interactive dashboard, regional coverage checks, coordinate system references, reseller API tools (including a live signature generator), a deep technical knowledge base, and a GNSS RTK hardware catalog.

## Features

1. **Branded Dashboard**: Centimeter-accurate RTK overview, Triple-Band & Full-Constellation highlights, active CORS station live statistics, and standard NTRIP settings.
2. **Interactive RTK Coverage Map**:
   - Direct integration with GEODNET's live coverage endpoint (`https://rtk.geodnet.com/api/v2/coverage_stations`) displaying ~20,000 global CORS base stations in real time.
   - High-performance Canvas rendering (60 FPS) with status filtering (`ACTIVE`, `ONLINE`, `OFFLINE`).
   - 20km / 40km RTK Range Radius buffer visualization.
   - Real-time station search (by RTCM Station ID, masked name, city, or coordinates) and quick region navigation presets.
   - **Station Telemetry Inspector**: Interactive popups and sidebar inspector with geodetic coordinates, NTRIP routing, and copy tools.
   - **RTK Baseline & Rover Distance Analyzer**: Calculates baseline distance in kilometers between rover coordinates and nearest base station with positioning precision ratings.
   - **Estimated Regional Coverage Checker**: Country-to-datum and regional caster mapping.
3. **Mountpoints & Coordinate Systems Explorer**:
   - NTRIP mountpoints lookup table (Table 1: `AUTO`, `AUTO_ITRF2020`, `AUTO_WGS84`, etc.).
   - Searchable database of Regional Geodetic Coordinate Systems (Table 2: `NAD83`, `ETRS89`, `GDA2020`, etc.) with real-time text and category filters.
4. **Enterprise Reseller API Center**:
   - Technical documentation of all REST API endpoints.
   - **Interactive API Signature Calculator**: Dynamically generates alphabetically sorted parameter keys, concatenated parameter sequences, and final MD5 request signatures alongside copyable JSON payloads.
   - Dynamic code snippet builder for `cURL`, `JavaScript`, and `Python` configurations.
5. **Knowledge Base**: Deep documentation on GNSS error vectors, RTK carrier-phase ambiguity resolution, NTRIP caster components, RTCM 3.2 MSM message specs, and Geodetic vs. Projected coordinate grids.
6. **RTK Hardware Database**: Categorized listings of compatible chips, modules, and receivers (including Airoha AG3335A, ST Teseo V, Unicore UM980, Quectel, and HYFIX units) with full specs, precision figures, and official website links.

---

## File Structure

```
.
├── index.html       # SPA Markup and SVG Icons
├── styles.css       # Custom dark-theme styling, transitions, animations
├── app.js           # Client-side router, databases, MD5 compiler, interactive calculators
└── README.md        # Project documentation (this file)
```

---

## Getting Started

### Local Development Server

Since this is a client-side static web application, it can be launched using any standard static file server.

#### Python
Run the following command in the project root directory:
```bash
python -m http.server 8000
```
Then navigate to **http://localhost:8000** in your browser.

#### Node (http-server)
Run the following command:
```bash
npx http-server -p 8000
```
Then open **http://localhost:8000**.

---

## Reseller API Authentication

Reseller APIs require an `appId` and `appKey` provided by GEODNET. Request signatures (`sign`) are compiled by:
1. Sorting all request keys in character ascending order (excluding `appKey` and `sign`).
2. Concatenating their values.
3. Appending your `appKey` to the concatenated string.
4. Hashing the final string using MD5.

The interactive **Signature Calculator** on the Reseller API page automates this process directly in the browser.

---

## RTK Coverage Stations API Integration

The portal integrates directly with GEODNET's public RTK Coverage API endpoint:

- **Endpoint**: `https://rtk.geodnet.com/api/v2/coverage_stations`
- **Method**: `GET`
- **Response Format**:
  ```json
  {
    "code": 0,
    "msg": "",
    "data": [
      {
        "name": "****E3E19",
        "status": "OFFLINE",
        "stationId": 3320,
        "lat": 43.419,
        "lng": 6.394
      },
      ...
    ]
  }
  ```
- **Field Definitions**:
  - `name` *(string)*: Masked globally unique hardware identifier (UID) / miner hash.
  - `stationId` *(integer)*: Standard 12-bit RTCM Station ID (`0–4095`) broadcast in RTCM 3.x MSM/1005/1006 messages. *(Note: RTCM Station IDs are non-unique globally and reused across regional networks).*
  - `status` *(string)*: Real-time station operational state (`ACTIVE`, `ONLINE`, or `OFFLINE`).
  - `lat`, `lng` *(float)*: Geodetic decimal coordinates on WGS84 / ITRF2020 reference frame.

### Key Map Features
- **High-Performance Canvas Rendering**: Uses Leaflet.js with HTML5 Canvas (`L.canvas({ padding: 0.5 })`) to smoothly render ~20,000 global reference stations at 60 FPS without DOM overhead.
- **Delaunay Triangulation Network Mesh**: Computes 2D Delaunay network across active CORS stations to visualize Network RTK / VRS baseline interconnections.
- **Dynamic Edge Lengths in KM (Detailed Zoom View)**:
  - When zoomed into a detailed view (**Zoom ≥ 9**), automatically displays distance badges in kilometers along visible Delaunay baseline edges.
  - Hides distance text when zoomed out to maintain a clean, uncluttered global map.
- **10-Minute Background Auto-Sync & Dynamics Engine**:
  - Automatically synchronizes live station data every 10 minutes with a real-time countdown status pill (`Auto-Sync: 10m • Next in mm:ss`).
  - Employs an IndexedDB-backed state-diffing machine that tracks all network delta transitions over time.
- **Station Network Dynamics & Transition Analytics**:
  - Summarizes network evolution across selectable timeframes: **Today (24h)**, **This Week (7d)**, **This Month (30d)**, and **All Time**.
  - 4 Key Transition Metrics:
    - 🟢 **New Active Stations** (Newly deployed & RTK ready)
    - 🟡 **New Online Stations** (Newly connected base stations)
    - 🟠 **Active &rarr; Online / Offline** (Degraded or RTK disabled)
    - 🔵 **Offline / Online &rarr; Active** (Recovered / promoted to RTK ready)
  - Interactive, searchable transition events feed with 1-click **"View"** navigation to jump directly to and highlight transitioning stations on the map.
- **Population Coverage & RTK Gap Analytics Dashboard**:
  - Quantifies real-time centimeter RTK coverage accessibility relative to global and regional urban populations across major global metropolitan centers.
  - **Global & Regional Coverage Rates**: Live percentage progress bars for North America, Europe, Asia & Pacific, South America, Oceania, Middle East, and Sub-Saharan Africa.
  - **Top Underserved Metros Bounty Leaderboard**: Ranked table of high-population metropolitan areas with baseline distances $> 40\text{ km}$, identifying high-ROI deployment bounties.
  - **Interactive Map Gap Overlay**: Toggle on the coverage map showing colored population bubbles (Green = Covered $< 20\text{ km}$, Amber = Extended $20–40\text{ km}$, Red = High-Priority Gap Void $> 40\text{ km}$).
- **Status & PPP Layer Filter**: Toggle between `All Stations`, `Active Only (RTK Ready)`, `Online Only`, `Offline Only`, and **`Global PPP Station`** to isolate GEODNET's intercontinental PPP tracker backbone.
- **Dynamic Station Selection Highlighting**: Whenever a station is searched, clicked, or inspected, a glowing pulsating target ring highlights the exact station position on the map canvas.
- **RTK Baseline Range Buffers**: Visualizes standard 20 km (Core RTK Fix) and 40 km (Extended RTK Fix) coverage radius circles around active reference stations.
- **Co-located Multi-Station Clustering**:
  - Automatically aggregates stations sharing the exact same physical coordinates (e.g. multi-antenna or redundant receiver sites) into a single visual site with a distinct cluster badge.
  - Interactive multi-station popup lets users inspect and analyze every receiver at the site without overlapping marker occlusion.
  - Station Inspector sidebar provides 1-click navigation chips to switch between co-located receivers at the site.
  - Deduplicates physical sites during Delaunay triangulation to eliminate 0-distance degenerate edges.
- **Interactive Inspector**: Click or hover any base station to view exact geodetic coordinates, station status, Global PPP classification, NTRIP mountpoints, and recommended regional caster routing.
- **Rover Baseline Proximity Analyzer**: Enter jobsite coordinates or click on the map to calculate the exact Haversine distance to the nearest base station with positioning precision ratings:
  - `< 15 km`: Optimal Centimeter RTK Fix (< 1.0 cm)
  - `15 – 30 km`: Standard Survey-Grade Fix (1.0 – 2.0 cm)
  - `30 – 50 km`: Extended Single-Base / VRS Fix (2.0 – 4.0 cm)
  - `> 50 km`: Long Baseline (> 50 km, PPP mode recommended)
- **Multi-Basemap Switching**: Switch between Esri Dark Gray Canvas (Dark), Esri World Imagery (Satellite), and OpenStreetMap (Streets) — all 100% keyless and watermark-free.
- **Fast Search & Region Navigation**: Search by full unmasked station name (e.g. `24D04CA59`, automatically truncated to match masked dataset), numeric RTCM Station ID (e.g. `3320`), masked station name (`****CA599`), geodetic coordinates, or city/country address via OpenStreetMap Nominatim geocoding.

---

## Server Casters & IPs

| Region | NTRIP Caster Domain | Resolved IPv4 | Port | Supported Mountpoints |
| :--- | :--- | :--- | :--- | :--- |
| **USA / Global** | `rtk.geodnet.com` | `13.56.117.10` | 2101 | `AUTO`, `AUTO_ITRF2020`, `AUTO_WGS84`, `AUTO_NAD83` |
| **Europe** | `eu.geodnet.com` | `3.73.41.96` | 2101 | `AUTO`, `AUTO_ETRS89`, `AUTO_ITRF2020` |
| **South America** | `sa.geodnet.com` | `18.230.73.64` | 2101 | `AUTO`, `AUTO_SIRGAS2000`, `AUTO_ITRF2020` |
| **Australia** | `aus.geodnet.com` | `54.206.56.130` | 2101 | `AUTO`, `AUTO_GDA2020`, `AUTO_NZGD2000` |
