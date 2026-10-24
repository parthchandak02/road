# Road — Creative Brief (original)

> Historical. This is the brief for the first version, a 3D React Three Fiber road. The project
> was later rebuilt as a single-file 2D line chart (`index.html`); the 3D version is in git history
> before that change. Data source and fallback notes still apply; the scene, chrome and deploy sections do not.

## Concept
A winding mountain road through a moody night landscape. Road elevation traces EUR/USD exchange rates over the last 30 trading days. A glowing car drives along the road from past to present. Sharp dips show rate drops; climbs show rate rallies. Hero number shows current rate. Tap any point on the road to see the exact rate and date.

**Metaphor family:** journey (road/car journey — driving EUR/USD price path)
**Narrative pattern:** Flow (temporal progression along road)
**Tier 2 patterns (pick 2):** Hero Number (C) + Quiet Zone (A)

## Data Source
- API endpoint: `https://api.frankfurter.app/2026-06-10..2026-07-10?from=EUR&to=USD` (expand range dynamically)
- Poll interval: fetch once on load (historical data); refresh current rate: `https://api.frankfurter.app/latest?from=EUR&to=USD`
- Fields used: `rates[date].USD` — EUR/USD exchange rate by date
- Fallback data: embed realistic rate data (1.10-1.18 range, 23 points) if API fails

## Visual Style
**Preset:** Dark — Abyss (adapted for night mountain road)

Palette:
```ts
const PALETTE = {
  bg: '#0a0e17',          // deep navy night sky
  road: '#00bcd4',        // cyan-teal road surface
  roadGlow: '#4dd0e1',    // bright cyan for road edge glow
  terrain: '#0f1b2d',     // dark terrain, subtle blue
  car: '#ff6b35',         // warm amber headlights (single accent)
  carGlow: '#ffab00',     // headlight glow
  text: 'rgba(255,255,255,0.6)',
  accent: '#4dd0e1',      // hero number cyan
};
```

Three Dials:
- DESIGN_VARIANCE: 4 (semi-organic road path, data-driven)
- MOTION_INTENSITY: 3 (gentle — car slowly follows road, camera follows smoothly)
- VISUAL_DENSITY: 3 (sparse — road, car, terrain markers, sky, chrome)

## Encoding Contract
| Data Field | Visual Channel | Range (scene) | Inverse | "Bigger means..." | Legend? |
|------------|----------------|---------------|---------|-------------------|---------|
| exchange_rate | road vertex Y | 0-5 units (mapped from 1.10-1.18) | invertY(pixel, 0,5, 1.10,1.18) | stronger EUR (higher rate) | yes |
| date | car position along road | t=0 to t=1 | invertT(clickPos, 0,1, 0,23) | later date | yes |
| rate_change | road vertex color tint | road goes from neutral to green/red | — | rising/falling at that point | no (color is secondary) |

## Creative Scene (R3F)
- **Primary metaphor:** A 3D mountain road through nighttime terrain. Road centerline Y follows smoothed EUR/USD exchange rate series. Sharp dips and climbs visible as the road undulates.
- **drei components:** CatmullRomLine for road tube, Plane/Box for terrain edges, Html for labels and chrome
- **Car:** simple Box or custom geometry, moves along spline via useFrame
- **Headlights:** two small SpotLight or PointLight cones, warm amber (single accent color)
- **Night sky:** very dark gradient bg, subtle stars (Points), distant mountain silhouettes
- **Default camera:** behind and slightly above car, following with damped lag
- **Interaction:** tap on road reveals quiet zone panel with date and rate at that position
- **Reduced motion:** static camera, car at latest position, hero and stamp visible

## UX Chrome
- Hero metric: EUR/USD 1.1430 (48px, top-left, cyan)
- #desc: "Drive along 30 days of EUR/USD rates — road climbs and falls with the exchange rate"
- #stamp: "Frankfurter · EUR/USD · 23 days · live" (bottom-left, 10px)
- #legend: "higher = stronger EUR · tap to see rate" (bottom-center, 9px)
- Quiet Zone: DOM overlay, appears on tap, shows date + rate at that road point, fades after 3s

## Render tier
r3f — Vite + React Three Fiber + drei, Cloudflare Pages

## Canvas Code Requirements (MANDATORY)
1. Single-page React app with Vite + React Three Fiber + drei
2. No controls panel, no sliders, no export buttons, no undo/redo, no timeline
3. Only chrome: HeroStats (#hero), DataStamp (#stamp), Description (#desc), Legend (#legend), QuietZone
4. Chrome positions: #stamp bottom:20px left:16px; #legend bottom:44px center; #desc bottom:68px center; #hero top-left
5. DPR: `gl.setPixelRatio(Math.min(window.devicePixelRatio, 2))`
6. Mobile-first: OrbitControls handles touch natively. `<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">`
7. All interactions work via tap (no hover)
8. Fallback data embedded; first frame never blank
9. `@media (prefers-reduced-motion: reduce)` — static frame with data still visible
10. Font: system-ui, sans-serif only on chrome. No em-dashes in any user-visible text
11. QuietZone: `position: absolute; pointer-events: none` container, fades after 3s idle. Shows date + rate.
12. Hero number: 48px, top-left, cyan color
13. .nojekyll file at project root
14. Always-visible labels: date labels along road (every ~5 dates), hero number, stamp, desc, legend

## Deploy
- Slug: road
- URL: https://road.parthchandak.info
- Build: npm run build
- Ship: ship-creative-daily.sh dist
