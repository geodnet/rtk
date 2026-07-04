# GEODNET RTK Portal

A premium, high-fidelity Single Page Application (SPA) designed for **GEODNET RTK Service** end-use customers and enterprise resellers. This portal provides an interactive dashboard, regional coverage checks, coordinate system references, reseller API tools (including a live signature generator), a deep technical knowledge base, and a GNSS RTK hardware catalog.

## Features

1. **Branded Dashboard**: Centimeter-accurate RTK overview, Triple-Band & Full-Constellation highlights, active CORS station live statistics, and standard NTRIP settings.
2. **Interactive Coverage Tool**: A custom visual radar panel, link to the live Mapbox portal, and a client-side **Estimated Regional Coverage Checker** linking country selections to local datums and recommended caster IPs.
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

## Server Casters & IPs

| Region | NTRIP Caster Domain | Resolved IPv4 | Port |
| :--- | :--- | :--- | :--- |
| **USA / Global** | `rtk.geodnet.com` | `13.56.117.10` | 2101 |
| **Europe** | `eu.geodnet.com` | `3.73.41.96` | 2101 |
| **South America** | `sa.geodnet.com` | `18.230.73.64` | 2101 |
| **Australia** | `aus.geodnet.com` | `54.206.56.130` | 2101 |
