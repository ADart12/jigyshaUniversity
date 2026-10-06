# Raah Website Spec (NH-7 Landslide Alert)

One self-contained file for whoever builds the website. It covers what the product is, what the mobile app is building, everything the backend really offers, the design system, every page, and a build plan with agent prompts. You do not need any other design document.

**Goal: the website looks and feels like the app.** Same colours, fonts, shapes, wording, Road Strip. On phones the website *is* the app's layout. On laptops it widens into a side-panel layout, and it adds the tools officials need.

---

## 1. Read this first

| Item | Decision |
|---|---|
| Product name | **Raah** (राह, "path"). Placeholder. Keep it in one constant, `brand.ts`. |
| Hackathon | 8 October. Be demo-ready on the 7th. |
| What it is | Live landslide risk for NH-7 from **Rishikesh to Joshimath** (247.37 km, 18 stretches), with a trip planner, closures, driver reports, voice alerts, an offline emergency pack, and official tools. |
| Not Badrinath | The backend data stops at **Joshimath**. Never write Badrinath anywhere. Say "Badrinath is the next phase" in the pitch only. |
| Default stack | Next.js (App Router) + TypeScript + Tailwind CSS + react-leaflet + TanStack Query + react-i18next + Recharts. Any stack is fine if the look and behaviour match. |
| Backend | Already built (FastAPI, 119 passing tests). **Use the real API. Do not mock it.** Section 4. |
| Two shells | Below 1024 px: **Compact shell** (identical to the app: bottom nav, bottom sheet). From 1024 px: **Wide shell** (top nav, 360 px side panel, map, bottom strip). Section 7. |
| Signature element | The **Road Strip**: NH-7 as one straight line split into 18 stretches, each coloured by risk. Spend your design effort here. |
| Priorities | **P0** demo cannot work without it. **P1** makes it impressive. **P2** only if time is left. Section 14. |

**Who the pages are for**

| Person | Needs | Where |
|---|---|---|
| Traveller / pilgrim | "Should I go, and when?" Share it on WhatsApp. Hindi. | Live map, Plan trip, Alerts, Emergency |
| Driver | A glance at what is ahead, voice, works on poor signal | Live map, Listen buttons, Emergency |
| Official (BRO, SDRF, district office) | Verify reports, close and reopen roads, know where to pre-position machines | `/admin/*` |
| Judge | The idea in five seconds, then proof it is real | Live map + demo panel, Plan trip, About |

---

## 2. What the mobile app is building (so the website matches)

The app is Expo React Native. Same backend, same design system. The website must offer the same features with the same wording.

| App feature | Website equivalent | Priority |
|---|---|---|
| Map tab: coloured NH-7 line, towns, closed style, status banner, bottom sheet with "stretches to watch" | Live map `/` | P0 |
| Segment detail sheet: verdict, closure card, "Why this stretch is risky" (3 bars), rain numbers, driver-report count, Listen, Alert me, Report here | Same content in the side panel (wide) or bottom sheet (compact) | P0 |
| Trip planner: From/To, day + leave-time chips, departure strip, verdict, safest window, "when to leave", per-stretch ETA list | `/plan` (adds a **departure matrix** on desktop) | P0 |
| Demo panel (tap the NH shield 5 times): storm slider 35/85/140 mm, time machine (12 to 14 Aug 2023), simulation chip | Same panel, also opens with `?demo=1` | P0 |
| Alerts tab: road closures, alerts, follow stretches | `/alerts` | P1 |
| Report tab: photo, location, type chips, note, offline queue | `/report` (no offline queue on web) | P1 |
| Listen button (Hindi/English voice from backend) | Same | P1 |
| Emergency screen from the offline pack: tap-to-call contacts, nearest hospitals | `/emergency` | P1 |
| About: how it works, honest accuracy | `/about` plus a model card | P1 |
| Saved-data mode (recorded fixtures for demo insurance) | Optional | P2 |
| (Not in app) | **Official tools:** verify reports, manage closures, BRO priority list | P0 (reports + priority), P1 (closures) |

---

## 3. Product principles

1. **The road first.** The map and the strip are always visible or one tap away.
2. **Verdict before detail.** Every screen ends in a decision ("Go with care") and a next action, never a bare number.
3. **Colour, shape and word together.** A risk is never shown by colour alone.
4. **Honest.** Risk is an estimate. Never say "safe". Show how fresh the data is. Never invent data the backend does not provide (no hourly rain, no 7-day forecast).
5. **Hindi is first class.** Every screen is checked in Hindi.
6. **Calm and professional.** Highway-sign look. No template feel.

**Deliberately avoid:** cream backgrounds with a serif headline and clay accent, near-black pages with neon, rows of identical rounded cards with soft shadows, gradients and glass blur, emoji as icons, small tracked uppercase labels above every heading, a giant number with a gradient as the first thing on the page, fade-up animation on every section, hover-lift on every card, arrows on every button, "Welcome back" greetings.

---

## 4. Backend reference (real, verified from the backend docs)

### 4.1 Basics

| Item | Value |
|---|---|
| Local base URL | `http://localhost:8000` (Swagger: `/docs`, schema: `/openapi.json`) |
| If docs and `/openapi.json` disagree | **`/openapi.json` wins.** |
| Language | Send `lang=en` or `lang=hi`. The backend returns localized segment names, advisories and headlines. **Do not translate those yourself.** Put `lang` in every query key. |
| Times | UTC ISO strings. **Display everything in IST** (`Asia/Kolkata`). |
| Auth | Public endpoints need none. Admin endpoints need header `X-Admin-Key` (or `X-API-Key`). **Never ship the admin key to the browser** (section 13). |
| Rate limits | Reports 5/min per IP. Risk queries 60/min per IP. Everyone on the demo Wi-Fi shares one IP, so cache with TanStack Query (`staleTime` 2 min) and do not poll faster than every 5 min. |
| Errors | `422` outside the 3 km corridor, `409` duplicate report within 10 min from the same IP and place, `429` rate limit. |
| Simulation | `simulate_rain_mm` (0 to 180) on `/risk-map`, `/trip-planner`, `/priority-list`. `as_of=YYYY-MM-DD` on `/risk-map` (time machine, ERA5 replay, e.g. `2023-08-14`). |

### 4.2 Segment registry (18 stretches)

Use these IDs and names. Hindi names come from the backend when `lang=hi`, but keep this table as the static registry for the Road Strip, dropdowns and offline fallback.

| ID | # | English | Hindi | Start km | End km | Length km |
|---|:--:|---|---|---:|---:|---:|
| seg_01 | 1 | Rishikesh to Shivpuri | ऋषिकेश से शिवपुरी | 0.00 | 17.43 | 17.43 |
| seg_02 | 2 | Shivpuri to Byasi | शिवपुरी से ब्यासी | 17.43 | 24.26 | 6.83 |
| seg_03 | 3 | Byasi to Kaudiyala | ब्यासी से कौडियाला | 24.26 | 38.12 | 13.86 |
| seg_04 | 4 | Kaudiyala to Devprayag | कौडियाला से देवप्रयाग | 38.12 | 70.63 | 32.51 |
| seg_05 | 5 | Devprayag to Teen Dhara | देवप्रयाग से तीन धारा | 70.63 | 85.56 | 14.94 |
| seg_06 | 6 | Teen Dhara to Kirtinagar | तीन धारा से कीर्तिनगर | 85.56 | 98.04 | 12.47 |
| seg_07 | 7 | Kirtinagar to Srinagar | कीर्तिनगर से श्रीनगर | 98.04 | 102.99 | 4.95 |
| seg_08 | 8 | Srinagar to Sirobagarh | श्रीनगर से सिरोबगड़ | 102.99 | 112.42 | 9.42 |
| seg_09 | 9 | Sirobagarh to Rudraprayag | सिरोबगड़ से रुद्रप्रयाग | 112.42 | 136.06 | 23.64 |
| seg_10 | 10 | Rudraprayag to Gauchar | रुद्रप्रयाग से गौचर | 136.06 | 158.55 | 22.49 |
| seg_11 | 11 | Gauchar to Karnaprayag | गौचर से कर्णप्रयाग | 158.55 | 168.12 | 9.56 |
| seg_12 | 12 | Karnaprayag to Langasu | कर्णप्रयाग से लंगासू | 168.12 | 174.18 | 6.07 |
| seg_13 | 13 | Langasu to Nandprayag | लंगासू से नंदप्रयाग | 174.18 | 187.33 | 13.15 |
| seg_14 | 14 | Nandprayag to Chamoli | नंदप्रयाग से चमोली | 187.33 | 200.39 | 13.05 |
| seg_15 | 15 | Chamoli to Birahi | चमोली से बिरही | 200.39 | 205.62 | 5.24 |
| seg_16 | 16 | Birahi to Pipalkoti | बिरही से पीपलकोटी | 205.62 | 212.36 | 6.74 |
| seg_17 | 17 | Pipalkoti to Helang (Tangani) | पीपलकोटी से हेलंग (तांगणी) | 212.36 | 241.04 | 28.68 |
| seg_18 | 18 | Helang to Joshimath | हेलंग से जोशीमठ | 241.04 | 247.37 | 6.33 |

**Towns (19 route points)** for From/To pickers and strip ticks. `From` town X means the segment that **starts** at X. `To` town Y means the segment that **ends** at Y. (The trip planner takes segment IDs, not town names.)

| Town | km | Hindi |
|---|---:|---|
| Rishikesh | 0 | ऋषिकेश |
| Shivpuri | 17.43 | शिवपुरी |
| Byasi | 24.26 | ब्यासी |
| Kaudiyala | 38.12 | कौडियाला |
| Devprayag | 70.63 | देवप्रयाग |
| Teen Dhara | 85.56 | तीन धारा |
| Kirtinagar | 98.04 | कीर्तिनगर |
| Srinagar | 102.99 | श्रीनगर |
| Sirobagarh | 112.42 | सिरोबगड़ |
| Rudraprayag | 136.06 | रुद्रप्रयाग |
| Gauchar | 158.55 | गौचर |
| Karnaprayag | 168.12 | कर्णप्रयाग |
| Langasu | 174.18 | लंगासू |
| Nandprayag | 187.33 | नंदप्रयाग |
| Chamoli | 200.39 | चमोली |
| Birahi | 205.62 | बिरही |
| Pipalkoti | 212.36 | पीपलकोटी |
| Helang | 241.04 | हेलंग |
| Joshimath | 247.37 | जोशीमठ |

### 4.3 Endpoints and how the website uses them

| Endpoint | Purpose | Key fields | Website use |
|---|---|---|---|
| `GET /health` | Status | `status`, `circuit_breaker`, `timestamp` | Footer status dot (P2) |
| `GET /risk-map?lang&simulate_rain_mm&as_of&refresh_weather` | Live risk for all 18 stretches | Top: `rain_status` ("live" or "cached"), `as_of`, `is_simulated`, `high_or_very_high_risk_count`. Per segment: `id`, `name`, `name_en`, `sequence_order`, `subpoints` (**array of `[lat, lng]`**, ready for Leaflet), `risk_level`, `risk_level_en`, `risk_score` (0 to 1), `terrain_score`, `r3d_mm`, `rain_24h_mm`, `forecast_24h_mm`, `forecast_72h_mm`, `main_driver`, `main_driver_en`, `closure` (null or object), `adjusted_risk_level` (null or raised), `ground_report_count_24h`, `updated_at` | Live map, strip, segment detail, everything |
| `POST /trip-planner` | Time-aware trip advice | **Body:** `origin` (segment id), `destination` (segment id), `depart_time` (UTC ISO), `speed_kmph` (30), `simulate_rain_mm`, `lang`. **Response:** `recommendation{action (RECOMMENDED / CAUTION / AVOID), headline, safe_departure_window, total_distance_km, estimated_duration_hours, max_risk_level, max_risk_segment, active_closures_encountered}`, `departure_timeline[{depart_time, overall_risk, advisory}]`, `route_segments[{segment_id, segment_name, sequence_order, eta_ist, rain_at_eta_mm, risk_level_at_eta, risk_score_at_eta}]` | Plan trip |
| `GET /route-risk` | Route risk (listed in the feature doc; read its params in `/openapi.json`) | | Optional |
| `GET /priority-list?sort_by=priority\|risk&simulate_rain_mm` (alias `GET /consequence`) | BRO pre-positioning ranking | `top_priority_segment`, `priority_list[{rank, segment_id, segment_name, priority_score, hazard_risk_score, hazard_level, consequence_score, nearest_hospital_km, nearest_town, has_critical_bridge, detour_available, recommended_action}]` | `/admin/priority` |
| `GET /closures?active_only&segment_id` | Road closures | `closures[{id, segment_id, segment_name, status, reason, source, starts_at, ends_at}]`, `active_closures_count` | Banner, Alerts, segment detail |
| `POST /admin/closure` (admin) | Create closure | `segment_id`, `status` (closed / one_way / restricted), `reason`, `source`, `starts_at`, `ends_at` | `/admin/closures` |
| `DELETE /admin/closure/{id}` (admin) | Reopen highway | | `/admin/closures` |
| `POST /field-report` | Driver report | **Body:** `lat`, `lng`, `reporter_name`, `description`, `photo_url`. **Returns** `id`, `segment_id`, `status` "pending", `reported_at` | `/report` |
| `GET /field-reports` | List reports | Same fields plus `status` (pending / verified / rejected), `verified_at`, `verified_by` (confirm filters in `/openapi.json`) | `/admin/reports`, `/report/mine` |
| `POST /admin/validate-report` (admin) | Verify or reject | **Body:** `report_id`, `status` ("verified" or "rejected"), `verified_by`. **Returns** `success`, `flywheel_triggered`, `message` | `/admin/reports` |
| `GET /voice-alert?segment_id&lang` and `GET /alerts/voice/{id}` | MP3 voice alert (English or Hindi) | `audio/mpeg` | Listen button |
| `GET /offline-pack` (supports `If-None-Match`) | Emergency pack, under 17 KB | `emergency_contacts[{name, phone}]`, `segments[{id, name, name_hi, risk_level, risk_score, nearest_hospital, advisory_en, advisory_hi}]`, `version`, `generated_at`. Header `ETag`; reply `304` when unchanged | `/emergency` |
| `GET /alerts`, `POST /subscribe` | Alerts and subscriptions | Shapes **not in the doc: read `/openapi.json`**. DB columns: `phone_number`, `segment_id` (null = whole corridor), `alert_channel` (sms / telegram / push) | `/alerts` |
| `GET /model-info`, `GET /backtest/events` | Model facts and historical events | Read `/openapi.json` | About (P2) |
| `POST /webhook/sms`, `POST /webhook/telegram` | Two-way SMS and Telegram bot | SMS commands: `NH7 HELP`, `NH7 SEG08`, `NH7 ROUTE RISHIKESH JOSHIMATH` | Not called from the website. Mention in About and Emergency. Telegram: `@NH7_Landslide_Bot` |

**Backend mechanics worth knowing (use in copy and tooltips)**

- Hazard = terrain susceptibility × rain trigger: `P = P_terrain × (1 − e^(−0.4 × R3d))`, with `R3d` the 3-day rain (yesterday + today + tomorrow) averaged across 5 stations (Rishikesh, Devprayag, Srinagar, Rudraprayag, Chamoli).
- **Dry guard:** if `R3d` is under 25 mm, risk cannot exceed Moderate.
- If the live weather API fails the backend serves cached rain and sets `rain_status: "cached"`.
- **Flywheel:** 5 or more verified landslide reports on one segment within 24 h raises its tier by one step (`adjusted_risk_level`) and logs ground truth for retraining.
- The trip planner uses the forecast at the hour you **reach** each stretch (speed default 30 km/h).

### 4.4 Risk levels, and the Closed state

| Level | Score range | UI name | Hindi |
|---|---|---|---|
| 0 | 0.00 to 0.34 | Low | कम |
| 1 | 0.35 to 0.59 | Moderate | मध्यम |
| 2 | 0.60 to 0.79 | High | ज़्यादा |
| 3 | 0.80 to 1.00 | Severe (backend says "Very High") | गंभीर |
| Closed | active closure with `status: "closed"` | Closed | सड़क बंद है |

```ts
export type Level = 0 | 1 | 2 | 3;
export type Effective = Level | 'closed';

const byScore = (s: number): Level => (s >= 0.8 ? 3 : s >= 0.6 ? 2 : s >= 0.35 ? 1 : 0);

// Segment from /risk-map. Use risk_score (language independent), never the localized label.
export function toEffective(seg: RawSegment): Effective {
  if (seg.closure?.status === 'closed') return 'closed';
  const base = byScore(seg.risk_score);
  // adjusted_risk_level is non-null when verified driver reports raised the tier by exactly one step
  return seg.adjusted_risk_level ? (Math.min(3, base + 1) as Level) : base;
}

// Trip planner rows: use risk_score_at_eta. For recommendation.max_risk_level and
// departure_timeline[].overall_risk (text, may be Hindi when lang=hi) use levelFromText()
// with a dictionary of English names plus the Hindi names you actually see in a lang=hi response.
```

- A closure with `one_way` or `restricted` does **not** change the level. Show it as a note chip on the stretch.
- **Closed always beats every risk level.**
- Verdict wording (one per level): Low "Good to go" / चल सकते हैं. Moderate "Go with care" / सावधानी से चलें. High "Delay if you can" / हो सके तो टालें. Severe "Not advised" / यात्रा की सलाह नहीं. Closed "Road closed" / सड़क बंद है.
- For a trip, the verdict is set by the worst level on the route. If `active_closures_encountered` is above 0, the verdict is "Not advised". Show `recommendation.headline` under it (it is already localized).

### 4.5 Gaps to confirm with the backend teammate

| Gap | Workaround until fixed |
|---|---|
| `/field-report` accepts only `photo_url`, no image upload | Ask for a multipart upload that returns a URL. Until then send the report without a photo and tell the user "Photo upload is coming". Do not invent an endpoint. |
| No report `type` field | Put the English type in the description: `[Road blocked] note`. Parse it in the admin queue to show a type chip. |
| `subpoints` may have only 3 points per segment (draws straight lines across mountains) | Ask for 20 to 60 points, or a GeoJSON endpoint. |
| Past landslide events (309) as map markers | Ask for a JSON endpoint. Meanwhile `/history` uses the static per-stretch counts in section 8.7. |
| `/alerts` and `/subscribe` shapes not documented | Read `/openapi.json`. |
| Reverse trips (Joshimath to Rishikesh) and how far ahead `depart_time` can be | Test in `/docs`. Default to forward trips and today/tomorrow. |
| Closure status names differ between the backend docs (`closed / one_way / restricted` vs `reported / verified / clearing / reopened`) | Read `/openapi.json`. |
| Rate limits shared by all demo devices | Ask for a relaxed demo setting. |
| Stable demo URL | A tunnel or deployed HTTPS URL with CORS enabled, plus seeded demo data (a closure on `seg_08`, a few pending reports, one verified). |

---

## 5. Design system

Identical to the app. Implement as CSS variables in `tokens.css` and read them from Tailwind. **Never hardcode a colour or font in a component.** The backend docs suggest their own colour palette: ignore it, this one wins.

### 5.1 Colour

| Token | Hex | Use |
|---|---|---|
| `ink` | `#1B2A33` | Text, headings, Closed fill |
| `granite` | `#4F5E66` | Secondary text, icons |
| `mist` | `#CBD5DA` | Borders, dividers |
| `glacier` | `#EDF1F3` | Page background, side panels |
| `snow` | `#FAFBFC` | Sheets, panels, inputs |
| `river` | `#1D5E6B` | Primary buttons, links, selected state (white text 7.3:1) |
| `river-tint` | `#DCEBEE` | Selected row, active chip |
| `milestone` | `#F7C600` | **Only** the NH shield and logo. Never a UI fill. |

| Level | Fill | Tint | Shape | Text on fill |
|---|---|---|---|---|
| Low | `#2E7D57` | `#E3F1EA` | Circle | White |
| Moderate | `#D49A00` | `#FAF0D2` | Triangle | Ink |
| High | `#C4470F` | `#F8E3D8` | Diamond | White |
| Severe | `#9B1C31` | `#F3DADF` | Octagon | White |
| Closed | `#1B2A33` | `#DDE3E6` | Square with bar (no entry) | White |

```ts
// tailwind.config.ts (theme.extend)
colors: {
  ink: '#1B2A33', granite: '#4F5E66', mist: '#CBD5DA', glacier: '#EDF1F3', snow: '#FAFBFC',
  river: { DEFAULT: '#1D5E6B', tint: '#DCEBEE' }, milestone: '#F7C600',
  risk: { low: '#2E7D57', moderate: '#D49A00', high: '#C4470F', severe: '#9B1C31', closed: '#1B2A33' },
  tint: { low: '#E3F1EA', moderate: '#FAF0D2', high: '#F8E3D8', severe: '#F3DADF', closed: '#DDE3E6' },
},
borderRadius: { xs: '2px', sm: '6px', md: '10px', lg: '16px' },
boxShadow: { sheet: '0 -2px 12px rgba(27,42,51,.12)', pop: '0 4px 16px rgba(27,42,51,.16)' },
```

Rules:
- Shape and word travel with every colour.
- **Severe** blocks get a diagonal hatch: `repeating-linear-gradient(45deg, rgba(255,255,255,.45) 0 2px, transparent 2px 6px)`. **Closed** blocks get a cross-hatch (the same pattern at 45° and −45°). These are the only allowed gradients.
- Report status (Pending, Verified, Rejected) uses neutral and river colours only, never the risk colours.
- Night palette (optional P2): bg `#0E181D`, surface `#16242B`, text `#E6EDF0`, muted `#9DB0B8`, line `#2B3D46`, risk fills Low `#4DB383`, Moderate `#F0B429`, High `#F2793F`, Severe `#F0647A`.

### 5.2 Risk shapes (inline SVG, viewBox 0 0 20 20, fill = the level's fill)

```tsx
const shapes = {
  0: <circle cx="10" cy="10" r="8" />,                                             // Low
  1: <path d="M10 2 L18.5 17 H1.5 Z" strokeLinejoin="round" />,                    // Moderate (triangle)
  2: <path d="M10 1.5 L18.5 10 L10 18.5 L1.5 10 Z" />,                             // High (diamond)
  3: <path d="M6.5 2 H13.5 L18 6.5 V13.5 L13.5 18 H6.5 L2 13.5 V6.5 Z" />,         // Severe (octagon)
  closed: (<><rect x="2" y="2" width="16" height="16" rx="2" /><rect x="5" y="8.6" width="10" height="2.8" fill="#fff" /></>),
};
```

### 5.3 Type

Fonts via `next/font/google`, self-hosted at build: **IBM Plex Sans** (400, 500, 600), **IBM Plex Sans Condensed** (500, 600, 700), **IBM Plex Sans Devanagari** (400, 500, 600). Condensed is the "road sign" voice for headings, verdicts, town names, km markers. When `html[lang="hi"]`, headings and body both use the Devanagari family (Condensed has no Devanagari), with line-height +0.1.

| Style | Size / line | Font | Use |
|---|---|---|---|
| Verdict | 40 / 44 | Condensed 700 | Segment and trip verdicts only |
| H1 | 28 / 34 | Condensed 600 | Page title |
| H2 | 22 / 28 | Condensed 600 | Section title |
| H3 | 18 / 24 | Condensed 600 | Item title |
| Body | 16 / 24 | Sans 400 | Minimum on mobile |
| Small | 14 / 20 | Sans 400 | Metadata |
| Caption | 12 / 16 | Sans 500 | Strip tick labels |

Sentence case. No letter-spacing. No all-caps. `font-variant-numeric: tabular-nums` on every number. Body line length under 70 characters.

### 5.4 Space, shape, motion

- Spacing on a 4 px grid: 4, 8, 12, 16, 24, 32, 48.
- Radius: 2 (strip blocks, tags), 6 (inputs, buttons), 10 (panels, popovers), 16 (sheet top), 999 (chips).
- Depth: borders first; only the two shadows above.
- Touch targets 48 px minimum. Icons: Lucide, stroke 1.75, 20 px.
- Focus ring: 2 px `river`, 2 px offset, on everything interactive.
- **Motion (one orchestrated moment):** the Road Strip draws left to right on first load per session (700 ms, ease-out). Everything else is 150 to 200 ms response to user actions (sheet drag, selection highlight, report-sent check mark). Honour `prefers-reduced-motion`.

---

## 6. Components

Build these first. Both shells use them. Names match the app.

| Component | Spec |
|---|---|
| **NHShield** | Milestone-yellow rounded badge, 1.5 px ink border, "NH 7" Condensed 700. Sizes 24 and 40. |
| **RiskIcon / RiskBadge** | Shape (16 px) + level word on the level tint, ink text. Prop `showVerdict` swaps the word for the verdict. Includes `closed`. Has an accessible label: "High risk, Srinagar to Sirobagarh, km 103 to 112". |
| **StatusLine** | "Updated 10 min ago." After 30 min: Moderate tint "Data is 45 min old." After 3 h, offline, or `rain_status: "cached"`: High tint ("Weather data is cached" / "Showing old data from 2:10 pm"). Uses `as_of` and `updated_at`. |
| **RoadStrip** | Horizontal in the Wide shell (16 px blocks), vertical in the Compact shell (12 px rail). Blocks proportional to km (from section 4.2), 2 px radius, 1 px gap. Town ticks with Condensed 12 px labels (thin out labels when blocks are narrow). Severe hatch, Closed cross-hatch. Props: `segments`, `towns`, `orientation`, `selectedId`, `hoveredId`, `onSelect`, `onHover`, `range` (dims everything outside a trip), `rankBadges` (numbers on the top N stretches, used by the BRO page). Hover shows a tooltip with name + RiskBadge. Keyboard: Tab into it, arrows move, Enter selects, Escape clears. |
| **MapLayer** | react-leaflet, client only (`dynamic(..., { ssr: false })`). Base: CARTO Positron `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png` with attribution "© OpenStreetMap contributors © CARTO". Optional Terrain toggle: OpenTopoMap. Each stretch = two polylines from `subpoints`: a white casing (weight + 3) under the coloured line. Weights: Low 4, Moderate 5, High 7, Severe 8, Closed 8. **Closed** = ink line with a white dashed overlay (`dashArray: '2 10'`). Selected: weight +2 and a white outer ring. Town dots with Condensed labels (major towns only when zoomed out). Fit bounds to the whole route on load; fly to a stretch on selection. |
| **ReasonBars** | "Why this stretch is risky": the localized `main_driver` sentence, then 3 thin Granite-on-Mist bars (see 8.1). |
| **RainBars** | Three labelled bars: last 24 h, next 24 h, next 72 h (mm). No hourly chart. |
| **ClosureCard** | Closed shape, stretch, reason, source, "Closed since 7:00 am", expected reopening if `ends_at`. One-way or restricted shows as a note chip. |
| **ListenButton** | Plays `GET /voice-alert?segment_id=&lang=` (MP3). States: idle, loading, playing (tap to stop), error ("Voice alert is not available right now."). Starts on a user click only (browser autoplay rules). Stops any other playing audio first. |
| **DepartureStrip** | Row of leave-time chips; under each chip the risk shape for that departure (from parallel `/trip-planner` calls). Selected chip has a river outline. |
| **DepartureMatrix** (wide only) | Table: rows = stretches grouped by leg between major towns, columns = departure slots; each cell is a RiskIcon on the level tint, the word available on hover and to screen readers. Built from the same parallel `/trip-planner` calls using `risk_score_at_eta`. |
| **DemoPanel** | See section 10. |
| **BottomSheet** (compact) | Snap points: peek about 168 px, half, full. Drag handle, 16 px top radius, `sheet` shadow. Use a small custom implementation with pointer events, or `vaul`. |
| **SidePanel** (wide) | 360 px (320 px between 1024 and 1279), Snow, 1 px mist right border. |
| **Button** | Primary: river fill, white text, 6 px radius, 48 px tall. Secondary: snow fill, mist border, ink text. Verb labels ("Check my trip", "Send report"). |
| **Chip** | 999 radius, 40 px tall, mist border; selected: river-tint fill, river border and text. |
| **Dialog, Popover, Select** | Radix primitives (unstyled), styled with the tokens. No shadcn, no component kit. |
| **Toast** | Bottom, 4 s, ink background, white text, optional Undo. |
| **Skeleton** | Mist blocks. The strip shows grey blocks while loading. |

Every data component needs loading, empty, error, stale and offline states.

---

## 7. Responsive layout system

Two shells, one breakpoint that matters: **1024 px**.

| Width | Shell | Behaviour |
|---|---|---|
| 360 to 767 | **Compact** | Exactly the app: 56 px top bar (NHShield, title, language toggle `हिं | EN`, "more" menu), content, 64 px bottom nav (Map, Plan trip, Alerts, Report). Segment detail opens in a bottom sheet. Forms and results are single column. |
| 768 to 1023 | **Compact, wider** | Same as above. Content is centred with a max width of 720 px. Sheets and results get 720 px max width, centred. Map takes the full width. |
| 1024 to 1279 | **Wide** | Top nav, 320 px side panel, map, 120 px bottom strip. |
| 1280 and up | **Wide** | Side panel 360 px. Text pages max width 1200 px. Map pages are full bleed. |

Rules:
- Design for 390 × 844 first, then 1440 × 900, then check 768 and 1024.
- Use relative units, flex and grid; never let the page body scroll sideways. Tables and the strip scroll inside their own `overflow-x: auto` container.
- Phone safe areas: `viewport-fit=cover` and `env(safe-area-inset-*)` on the top bar and bottom nav.
- Map pages use `height: 100dvh`.
- Bottom nav appears only in the Compact shell. The Wide shell puts the same four items (plus Emergency, Past events, About) in the top nav.

**Compact shell, Live map**

```
┌──────────────────────────────┐
│ [NH 7] Rishikesh–Joshimath   │  हिं|EN  ⋯
│ 1 road closure on NH-7       │  banner (ink) or "2 stretches need care"
├──────────────────────────────┤
│                              │
│        MAP (Leaflet)         │
│    coloured NH-7 line        │
│                        [⌖]   │
├──────────────────────────────┤  BottomSheet, peek
│ ────                         │
│ Updated 10 min ago           │
│ Watch: Srinagar–Sirobagarh   │
│ ■ Road closed                │
│ [ Plan a trip ] [ Emergency ]│
├──────────────────────────────┤
│  Map   Plan trip  Alerts  Report │
└──────────────────────────────┘
```

**Wide shell, Live map**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [NH 7] Raah  Live map  Plan trip  Alerts  Report  Emergency  Past events  About     हिं|EN  Officials │
├──────────────────────────────────────────────────────────────────────────────┤
│ banner (only when a closure, High or Severe exists)                          │
├───────────────────────┬──────────────────────────────────────────────────────┤
│ Find a stretch [____] │                                                      │
│                       │                    MAP                               │
│ Stretches to watch    │             coloured NH-7 line                       │
│ ■ Srinagar–Sirobagarh │                                          [+][-][⌖][▤] │
│   Road closed         │                                                      │
│ ────────────────────  │                                                      │
│ ◆ Kaudiyala–Devprayag │                                                      │
│   Heavy rain, 3 days  │                                                      │
│ ────────────────────  │                                                      │
│ Legend · Updated 10 m │                                                      │
├───────────────────────┴──────────────────────────────────────────────────────┤
│ Rishikesh ─▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌── Joshimath          │  Road Strip
│ Devprayag   Srinagar    Rudraprayag    Karnaprayag   Chamoli    Helang       │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Public pages

### 8.1 Live map `/` (P0): the landing page; no marketing hero

- **Data:** `GET /risk-map` (lang, demo state) and `GET /closures`. Refetch every 5 min. Keep persisted data so the page still draws if the network drops.
- **Layout:** per section 7.
- **Banner:** if any stretch is Closed: "N road closure(s) on NH-7" (ink background, white text, click opens the first closure). Else if any High or Severe: "N stretches need care today" (Moderate/High tint by worst level). Else no banner.
- **Side panel / sheet default view:** search "Find a stretch" (town names), then **Stretches to watch**: plain rows with dividers (not cards), worst first, closed first. Row: RiskIcon, stretch name, km range, one-line reason (`main_driver`). Under it the legend (five shapes with words) and StatusLine. If nothing is above Low: "No stretch is High or Severe right now."
- **Selection** (click a map line, a strip block or a row) highlights the stretch everywhere, flies the map to it, and opens **Segment detail**:

```
‹ All stretches
Kaudiyala to Devprayag
NH-7, km 38 to 71
◆ High
Delay if you can                    (verdict, Condensed 40/44)
[ Listen ]

[Closure card, only if a closure exists]

Why this stretch is risky
  <main_driver sentence from backend>
  Rain in the last 3 days     ▓▓▓▓▓▓▓▓░░    min(r3d_mm / 100, 1)
  Steep, unstable terrain     ▓▓▓▓▓▓░░░░    terrain_score
  Reports from drivers (3)    ▓▓▓▓▓░░░░░    min(ground_report_count_24h / 5, 1)
  Risk raised by verified driver reports.   (only if adjusted_risk_level is set)

Rain      Last 24 h 18 mm · Next 24 h 38 mm · Next 72 h 64 mm   (RainBars)
Score 73 of 100                      (small, granite)

[ Alert me about this stretch ]   [ Report a problem here ]
Updated 10 min ago · This is an estimate from rainfall and terrain. On the road, follow BRO and police instructions.
```

- Hover on a strip block highlights the stretch on the map within 100 ms, and the reverse.
- Keyboard: Tab to strip blocks, arrows move, Enter selects, Escape clears.
- States: loading (grey strip, "Loading latest risk"), stale, offline/cached, error with "Try again", all clear.
- **Alert me:** opens a Dialog: mobile number (+91), channels SMS (and a Telegram link), threshold chips Moderate / High / Severe (default High), "Start alerts". Calls `POST /subscribe` with the fields in `/openapi.json`.

### 8.2 Plan trip `/plan` (P0): the hero feature; lead the demo with it

The backend checks forecast rain at the hour you **reach** each stretch. So the question is "when should I leave", not "which day".

**Form**
- From and To: Select with type-ahead over the 19 towns (Hindi or English name). Defaults Rishikesh and Joshimath. A swap button. Map towns to segment IDs (section 4.2).
- Day chips: Today / Tomorrow. Time chips: Now, 5:00 am, 6:00 am, 8:00 am, 10:00 am, 12:00 pm, 2:00 pm (past times for today are disabled with "Already passed"). Default Now.
- "Advanced": speed km/h (default 30).
- Primary button "Check my trip".
- **DepartureStrip** under the chips: as soon as From/To are set, fire up to 6 parallel `POST /trip-planner` calls (one per time chip) and show the worst risk shape under each chip (skeletons while loading). Cap parallel calls at 6.
- One-line live preview of the selected slot: shape + verdict + "Safest window 6:00 to 8:30 am".
- Last checked trip stored locally and shown as one row.

**Result** (single page on wide: form left, result right; compact: separate `/plan/result` page)

```
Rishikesh to Joshimath · Today, leaving 6:00 am
◭ Go with care                                   (shape + verdict, 40/44)
<recommendation.headline, localized>
Safest window to leave: 6:00 – 8:30 am IST · 247 km, about 8 h 15 min       [ Listen ]

When to leave
  6:00 am   ◭ Moderate   Best window: clears high-gradient sectors before noon rain
  8:00 am   ◆ High       Expect delay near Sirobagarh
  12:00 pm  ▣ Severe     Avoid: afternoon storm in the Chamoli gorge

Leave-time matrix (wide only)                    5:00  6:00  8:00  10:00  12:00  2:00
  Rishikesh – Devprayag                           ●     ●     ●     ◭      ◭     ◭
  Devprayag – Srinagar                            ...

Along your route (each row: name · "You reach it at 2:10 pm" · "Rain expected then: 8 mm" · shape + word)
  6 stretches, all Low (expand)
  ◆ Pipalkoti to Helang · You reach it at 2:10 pm · Rain then: 8 mm · High
  ■ Srinagar to Sirobagarh · Road closed
Based on forecast rain at the time you reach each stretch.

[ Alert me on this trip ]  [ Share on WhatsApp ]  [ Copy link ]  [ Print ]
```

- Verdict from the worst level (4.4). Closed stretches are always expanded with the Closed style.
- The strip below the list shows the route range at ETA risk; everything outside the trip is dimmed.
- Tapping a row opens Segment detail.
- **Share on WhatsApp:** `https://wa.me/?text=` + encoded text, in the current language: "Rishikesh to Joshimath, Fri 10 Oct, leaving 6:00 am: Go with care. Safest window 6:00 to 8:30 am. {headline}".
- Keep URL state: `/plan?from=rishikesh&to=joshimath&day=today&time=0600`.
- Print stylesheet: verdict, when to leave, matrix, route list, disclaimer, URL. Shapes make it readable in black and white.
- States: loading skeleton, error with retry, 4xx shown as a plain sentence.
- When the demo panel has a storm active, pass `simulate_rain_mm`.

### 8.3 Alerts and closures `/alerts` (P1)

- **Road closures** (top): `GET /closures` active. Each row is a ClosureCard. Empty: "No road closures right now."
- **Active alerts:** from `GET /alerts` (shape from `/openapi.json`) as rows: risk shape, stretch, advice, relative time, Listen.
- **Following:** the user's subscriptions (stored locally, created via `POST /subscribe`) with a remove action.
- Link to Emergency at the top.

### 8.4 Report a problem `/report` (P1)

- Photo: `<input type="file" accept="image/*" capture="environment">`; compress client-side to about 1280 px and 300 KB.
- Location: "Use my location" (browser geolocation) or click on the map to place the pin (this is the website's advantage over the app). Show the nearest stretch.
- Type chips: Landslide or debris, Falling rocks, Cracks or sinking road, Water on the road, Road blocked. Optional note. Optional name (default "Traveller").
- Submit `POST /field-report` with `description = "[Road blocked] note"`. Photo only if an upload endpoint exists (4.5).
- Errors: 422 "You seem to be too far from NH-7 to report here." 409 "Already reported. Thank you." 429 "Too many reports. Try again in a minute."
- Safety line: "Do not stop on a slope to take a photo. Report from a safe place."
- Success: check-draw animation, "Report sent. An official will check it."
- `/report/mine`: ids of reports sent from this browser (localStorage) with live status from `GET /field-reports`: Pending review, Verified by officials, Rejected.

### 8.5 Emergency `/emergency` (P1)

- From `GET /offline-pack` with ETag. Store `etag` and body in localStorage, send `If-None-Match`, use the stored body on `304`.
- Big contact rows with a Call button (`tel:`): 112 State Emergency, BRO Control Room (Gauchar), SDRF 1070, Chamoli Police Control Room.
- "Nearest hospital by stretch" list with the bilingual advisory text (`advisory_en` or `advisory_hi` by language).
- "Other ways to check": SMS "Text NH7 HELP to {number}" (show only if `NEXT_PUBLIC_SMS_NUMBER` is set), example `NH7 SEG08`, `NH7 ROUTE RISHIKESH JOSHIMATH`; Telegram link `https://t.me/NH7_Landslide_Bot`.
- Bundle a fallback copy of the pack so the page works on first load without network.
- P2: PWA manifest + service worker so this page works offline.

### 8.6 About `/about` (P1): honest, plain words

1. **What this shows** (3 sentences).
2. **How the risk is worked out:** a simple horizontal diagram in plain boxes (ink on glacier): "Terrain, 30 m elevation model" + "Rain now and forecast, 5 stations" + "Landslides mapped after the 2022 monsoon (309)" + "Driver reports checked by officials" → "Risk for each stretch" → "Alerts, trip checks, voice, SMS".
3. **The five levels:** table with shape, word, verdict, what to do.
4. **Reports make it better:** a driver sends a report, an official checks it, five verified landslides on a stretch raise its risk and are logged for retraining.
5. **How we checked it (model card):**

| Measure | Result |
|---|---|
| Test method | 6 road blocks, each tested without training on it, with a 2 km buffer between train and test |
| Ranking quality (ROC-AUC, out of sample) | **0.767** (95% interval 0.68 to 0.80) |
| Precision-recall AUC | 0.533 |
| Landslides inside the riskiest 20% of the road | 43% |
| Rank agreement with ground truth (Spearman) | 0.65 |
| Historical replay, Aug 2023 monsoon, daily reanalysis rain | AUC 0.62 (a modest result; shown for honesty) |

   In words: "It ranks a landslide-prone stretch above a calmer one in about 3 of 4 comparisons. It was trained on one monsoon season and replays of past rain are coarse. It is an estimate; it can miss events and it can raise false alarms." (Hindi too.)
   Optional P2 chart: what the model looks at, 8 horizontal bars: elevation 19.6%, slope 19.5%, north-south aspect 15.4%, local relief 14.3%, maximum cut slope 9.9%, east-west aspect 7.7%, ridge/valley index 7.0%, curvature 6.6%.
6. **Limits** with the full disclaimer.
7. **Data sources:** Copernicus DEM (30 m), Open-Meteo, ERA5-Land, Mey et al. (2024) landslide inventory, OpenStreetMap contributors, CARTO.
8. Team and contact.

### 8.7 Past events `/history` (P1)

- Heading "Past landslide events on NH-7" and a caption "Mapped after the 2022 monsoon (309 road-blocking landslides). One season only."
- **Chart that works with no extra endpoint:** "Landslides per stretch" horizontal bars (granite, not risk colours), from this static table (sums to 309):

| Stretch | Events | Per km |
|---|---:|---:|
| seg_04 Kaudiyala to Devprayag | 96 | 2.95 |
| seg_05 Devprayag to Teen Dhara | 44 | 2.95 |
| seg_03 Byasi to Kaudiyala | 36 | 2.60 |
| seg_17 Pipalkoti to Helang | 32 | 1.12 |
| seg_01 Rishikesh to Shivpuri | 23 | 1.32 |
| seg_02 Shivpuri to Byasi | 20 | 2.93 |
| seg_09 Sirobagarh to Rudraprayag | 17 | 0.72 |
| seg_14 Nandprayag to Chamoli | 9 | 0.69 |
| seg_06 Teen Dhara to Kirtinagar | 7 | 0.56 |
| seg_07 Kirtinagar to Srinagar | 4 | 0.81 |
| seg_10 Rudraprayag to Gauchar | 4 | 0.18 |
| seg_12 Karnaprayag to Langasu | 4 | 0.66 |
| seg_16 Birahi to Pipalkoti | 4 | 0.59 |
| seg_11 Gauchar to Karnaprayag | 3 | 0.31 |
| seg_18 Helang to Joshimath | 3 | 0.47 |
| seg_13 Langasu to Nandprayag | 2 | 0.15 |
| seg_08 Srinagar to Sirobagarh | 1 | 0.11 |
| seg_15 Chamoli to Birahi | 0 | 0.00 |

- If the backend exposes the 309 events, add a map with clustered ink dots and a popover (stretch, source). No month chart (the data has no dates).
- Do not draw conclusions from this table about Sirobagarh: the survey saw only 1 slide there in 2022, yet the highway is known for debris. Closures and driver reports cover that gap.

---

## 9. Officials pages `/admin/*`

Separate shell: 56 px ink top bar with white text, NHShield + "Officials", tabs **Reports** (with a pending count), **Closures**, **Priority**, **Overview**, signed-in name, Sign out. Page background glacier, panels snow with mist borders, 10 px radius. Desktop first. Below 1024 px the lists become single-column master-detail (list screen, then detail screen) and the Priority table scrolls horizontally.

**Auth.** Sign in at `/admin/login` (email, password). Demo account from env (`ADMIN_EMAIL`, `ADMIN_PASSWORD`), shown in the panel footer only when `?demo=1`. On success set an httpOnly cookie. All admin API calls go through Next.js route handlers (`app/api/admin/[...path]/route.ts`) that check the cookie and add the `X-Admin-Key` header from a **server-only** env var. The key never reaches the browser. Error: "Email or password is not right."

### 9.1 Reports `/admin/reports` (P0): verify driver reports

- **Data:** `GET /field-reports`. Filters: status (default Pending), stretch, last 24 h / 7 days. Counts "Pending 7 · Verified 42 · Rejected 5".
- **List row (72 px):** photo thumbnail if present (else a neutral placeholder), type chip parsed from `[type]` in the description, stretch name, time, status chip outside the Pending filter. Selected row: river-tint background with a 3 px river left bar.
- **Detail panel:**

```
┌ photo (large) ──────────────┐  ┌ mini map: pin + stretch highlighted ┐
Road blocked
Near Srinagar to Sirobagarh · 14:02 · Harish Rawat (Taxi Driver)
"Debris across both lanes, trucks stuck"

What the model says now          What the driver says
◭ Moderate                       Road blocked
This differs from the model. Look closely.

Verified landslides on this stretch (24 h):  ■■■□□  3 of 5
Reaching 5 raises this stretch's risk by one level.

[ Reject ]                                     [ Approve ]
A approve · R reject · J/K next
```

- **"What the model says now"** comes from `GET /risk-map` for that `segment_id`. Show the differs-note when the type is "Road blocked" or "Landslide" and the current level is below High.
- **Flywheel meter** (a visible USP): count verified reports on the same segment in the last 24 h (from the list), show progress toward 5, and the backend rule in plain words.
- **Approve:** `POST /admin/validate-report { report_id, status: "verified", verified_by }`. **Reject:** `status: "rejected"`. Use `verified_by` from the signed-in official. Toast uses the backend `message` (for example "Report verified. Logged for model refinement."). Optimistic update with Undo for 5 s (Undo re-sets to pending only if the backend supports it; otherwise hide the Undo).
- Auto-select the next report after each action.
- Keyboard: `A` approve, `R` reject, `J`/`K` next/previous, `Enter` opens the photo, `Escape` closes.
- No reject reasons (the backend cannot store them).
- States: empty ("No reports are waiting."), loading skeleton rows, error ("Could not load reports. Try again."), photo missing ("No photo with this report.").

### 9.2 Closures `/admin/closures` (P1)

- Table of closures (`GET /closures?active_only=false`): stretch, status chip (Closed / One-way / Restricted), reason, source, since, until, actions.
- "Close a stretch" Dialog: stretch (Select of the 18), status, reason (required), source (default "Control room"), starts (default now), ends (optional). Posts `POST /admin/closure`.
- "Reopen" on active rows with a confirm Dialog ("Reopen Srinagar to Sirobagarh?"). Calls `DELETE /admin/closure/{id}`. Success toast "Closure removed. Highway reopened."
- Result shows instantly on the public map (refetch).

### 9.3 BRO priority `/admin/priority` (P0): the BRO and SDRF feature

Where should machines wait before the storm? Priority = hazard × consequence (bridges, hospital access, settlements, detour availability).

```
Pre-positioning order                       Sort: Priority | Hazard      Rain: Live ▾ / Storm 85 mm
Rishikesh ─[1][2]▌▌[3]▌▌▌▌▌▌[4]▌▌▌▌▌▌[5]▌▌▌▌▌▌▌▌── Joshimath          RoadStrip with rank badges on the top 5

Rank  Stretch               Hazard      Consequence  Priority      Nearest town · hospital   Bridge  Detour  Recommended action
1     Kaudiyala–Devprayag   ◆ High 0.73   0.80       ▓▓▓▓▓▓▓ 0.58   Devprayag · 14.2 km      Yes     No      Pre-stage heavy excavator at Devprayag bypass depot.
```

- **Data:** `GET /priority-list?sort_by=priority|risk&simulate_rain_mm=` (storm picker uses the demo state).
- Columns as above. Hazard uses RiskBadge plus the score. Priority has an inline bar (granite). Bridge and Detour as "Yes/No" words with a small icon.
- Clicking a row selects the stretch on the strip and opens a side panel with the Segment detail (same component as the public map).
- **Print list** button with a print stylesheet (rank, stretch, action, nearest town). P1.
- Hindi is optional on this page; English first.

### 9.4 Overview `/admin` (P1)

One plain sentence: "2 stretches are High or Severe · 1 road closure · 7 reports waiting." Then the Road Strip, then two columns: **Stretches that need attention** (table: stretch, level, reason; closed first) and **Reports waiting** (list, "Open reports"). No stat tiles.

### 9.5 Analytics `/admin/analytics` (P2)

No backend analytics endpoint exists. Compute client-side from `GET /field-reports` and closures: reports per day stacked by status (river, granite, mist), reports per stretch (top 8). Only river and granite colours. Label what the numbers come from. Never present seeded numbers as real.

---

## 10. Demo panel (P0)

Open by clicking the NH shield 5 times, or with `?demo=1`. A popover (wide) or bottom sheet (compact):

- **Mode:** Live / Storm simulation / Time machine.
- **Storm:** slider 0 to 180 mm with preset chips **Moderate 35**, **Severe 85**, **Cloudburst 140**.
- **Time machine:** preset chips **12 Aug 2023**, **13 Aug 2023**, **14 Aug 2023** plus a date input (calls `/risk-map?as_of=`).
- **Back to live.**
- Changing anything refetches the map, strip, trip results and BRO list at once (state lives in one store; every query key includes it).
- While active, show a persistent chip in the header: "Simulation: 85 mm" (Moderate tint) or "Replay: 14 Aug 2023". Use `is_simulated` from the response as the source of truth.
- P2: **Saved data** mode serving recorded responses, as insurance if the venue Wi-Fi fails. Record real responses to JSON files once (risk-map live/85/140/2023-08-14 in both languages, closures, offline pack, one trip-planner response) and fall back to them on network failure with a High-tint "Showing saved data" chip.

---

## 11. Copy and i18n

- Plain verbs, sentence case, no exclamation marks, no emoji. Errors say what happened and what to do. Say "stretch", "road blocked", "falling rocks" (not "segment", "anomaly"). Never say "safe".
- One action keeps one name: the button says "Send report", the confirmation says "Report sent".
- Keys live in `locales/en.json` and `locales/hi.json`. **Backend text is not translated by you.** **Have a Hindi speaker proofread before the demo.**
- Disclaimer EN: "This is an estimate from rainfall and terrain. On the road, follow BRO and police instructions." HI: "यह बारिश और भू-भाग के आधार पर लगाया गया अनुमान है। सड़क पर BRO और पुलिस के निर्देशों का पालन करें।"

| Key | English | Hindi |
|---|---|---|
| `nav.map` | Map | नक्शा |
| `nav.plan` | Plan trip | यात्रा योजना |
| `nav.alerts` | Alerts | अलर्ट |
| `nav.report` | Report | रिपोर्ट |
| `nav.emergency` | Emergency | आपातकालीन सहायता |
| `nav.history` | Past events | पिछली घटनाएँ |
| `nav.about` | How it works | यह कैसे काम करता है |
| `nav.officials` | Officials sign in | अधिकारी लॉगिन |
| `risk.low` | Low | कम |
| `risk.moderate` | Moderate | मध्यम |
| `risk.high` | High | ज़्यादा |
| `risk.severe` | Severe | गंभीर |
| `risk.closed` | Closed | बंद |
| `verdict.low` | Good to go | चल सकते हैं |
| `verdict.moderate` | Go with care | सावधानी से चलें |
| `verdict.high` | Delay if you can | हो सके तो टालें |
| `verdict.severe` | Not advised | यात्रा की सलाह नहीं |
| `verdict.closed` | Road closed | सड़क बंद है |
| `home.updated` | Updated {n} min ago | {n} मिनट पहले अपडेट हुआ |
| `home.watch` | {n} stretches need care today | आज {n} हिस्सों पर सावधानी ज़रूरी है |
| `home.closure` | {n} road closure on NH-7 | NH-7 पर {n} जगह सड़क बंद है |
| `home.clear` | No stretch is High or Severe right now | अभी कोई हिस्सा ज़्यादा या गंभीर जोखिम में नहीं है |
| `home.cached` | Weather data is cached | मौसम का डेटा सहेजा हुआ है |
| `home.saved` | Showing saved data | सहेजा हुआ डेटा दिखा रहे हैं |
| `sim.chip` | Simulation: {mm} mm | सिमुलेशन: {mm} मिमी |
| `replay.chip` | Replay: {date} | रीप्ले: {date} |
| `detail.why` | Why this stretch is risky | यह हिस्सा जोखिम भरा क्यों है |
| `detail.rain3d` | Rain in the last 3 days | पिछले 3 दिनों की बारिश |
| `detail.terrain` | Steep, unstable terrain | तीखा और अस्थिर भू-भाग |
| `detail.reports` | Reports from drivers ({n} in 24 h) | चालकों की रिपोर्ट (24 घंटे में {n}) |
| `detail.raised` | Risk raised by verified driver reports. | सत्यापित चालकों की रिपोर्ट के कारण जोखिम बढ़ाया गया है। |
| `detail.rain24` | Last 24 h | पिछले 24 घंटे |
| `detail.next24` | Next 24 h | अगले 24 घंटे |
| `detail.next72` | Next 72 h | अगले 72 घंटे |
| `closure.since` | Closed since {time} | {time} से बंद |
| `closures.title` | Road closures | सड़क बंद होने की जानकारी |
| `closures.none` | No road closures right now. | अभी कोई सड़क बंद नहीं है। |
| `listen` | Listen | सुनें |
| `listen.error` | Voice alert is not available right now. | वॉइस अलर्ट अभी उपलब्ध नहीं है। |
| `plan.title` | Plan your trip | अपनी यात्रा की योजना बनाएँ |
| `plan.from` | From | कहाँ से |
| `plan.to` | To | कहाँ तक |
| `plan.today` | Today | आज |
| `plan.tomorrow` | Tomorrow | कल |
| `plan.now` | Now | अभी |
| `plan.passed` | Already passed | समय निकल चुका है |
| `plan.cta` | Check my trip | मेरी यात्रा जाँचें |
| `plan.window` | Safest window to leave | निकलने का सबसे अच्छा समय |
| `plan.when` | When to leave | कब निकलें |
| `plan.along` | Along your route | आपके रास्ते में |
| `plan.reach` | You reach it at {time} | आप {time} पहुँचेंगे |
| `plan.rainThen` | Rain expected then: {mm} mm | तब बारिश का अनुमान: {mm} मिमी |
| `plan.basis` | Based on forecast rain at the time you reach each stretch. | आप जिस समय हर हिस्से में पहुँचेंगे, उस समय की बारिश के पूर्वानुमान पर आधारित। |
| `plan.share` | Share on WhatsApp | WhatsApp पर भेजें |
| `alerts.subscribe` | Alert me about this stretch | इस हिस्से के लिए अलर्ट पाएँ |
| `alerts.empty` | No active alerts on NH-7. | NH-7 पर अभी कोई अलर्ट नहीं है। |
| `report.title` | Report a problem on the road | सड़क की समस्या बताएँ |
| `report.photo` | Take a photo | फ़ोटो लें |
| `report.what` | What do you see? | आप क्या देख रहे हैं? |
| `report.type.slide` | Landslide or debris | भूस्खलन या मलबा |
| `report.type.rockfall` | Falling rocks | पत्थर गिर रहे हैं |
| `report.type.crack` | Cracks or sinking road | सड़क में दरार या धँसाव |
| `report.type.water` | Water on the road | सड़क पर पानी |
| `report.type.blocked` | Road blocked | रास्ता बंद |
| `report.submit` | Send report | रिपोर्ट भेजें |
| `report.sent` | Report sent. An official will check it. | रिपोर्ट भेज दी गई है। अधिकारी इसकी जाँच करेंगे। |
| `report.safety` | Do not stop on a slope to take a photo. Report from a safe place. | ढलान पर रुककर फ़ोटो न लें। सुरक्षित जगह से रिपोर्ट करें। |
| `report.far` | You seem to be too far from NH-7 to report here. | आप NH-7 से बहुत दूर लग रहे हैं, यहाँ से रिपोर्ट नहीं हो सकती। |
| `report.dup` | Already reported. Thank you. | यह पहले ही रिपोर्ट हो चुका है। धन्यवाद। |
| `report.limit` | Too many reports. Try again in a minute. | बहुत ज़्यादा रिपोर्ट। एक मिनट बाद फिर कोशिश करें। |
| `emergency.call` | Call | कॉल करें |
| `offline.banner` | You are offline. Showing data from {time}. | आप ऑफ़लाइन हैं। {time} तक का डेटा दिखा रहे हैं। |
| `error.load` | Could not load risk data. Showing the last update from {time}. | जोखिम का डेटा नहीं मिला। {time} का आख़िरी अपडेट दिखा रहे हैं। |

Admin copy can stay English-only but keep it in keys.

---

## 12. Accessibility, performance, states

- Contrast: body text 4.5:1 minimum; check every risk fill against its text colour.
- Shape + word + colour always. Grayscale test: the map and the strip must still be readable.
- 48 px touch targets; respect system font size (layouts must not break at 130%); Hindi never clipped or truncated.
- Screen-reader labels on every risk shape. Skip link. Keyboard access everywhere; the strip and the admin queue are fully keyboard driven.
- Language toggle reachable in one click on every page.
- Performance: dynamic-import Leaflet and Recharts; `staleTime` 2 min; do not refetch on window focus faster than 5 min; compress report photos; use `next/font` so fonts are not blocking.
- Every data component has loading, empty, error, stale and offline states. Show data freshness on every screen.

---

## 13. Tech setup

**Stack:** Next.js (latest stable, App Router), TypeScript strict, Tailwind, `react-leaflet` + `leaflet`, `@tanstack/react-query`, `react-i18next` + `i18next`, `zustand` (demo state, language), `recharts`, `lucide-react`, Radix primitives (`@radix-ui/react-dialog`, `react-popover`, `react-select`), optional `vaul`. No shadcn, no UI kit.

```
src/
  app/
    (public)/ page.tsx(map) plan/ alerts/ report/ emergency/ history/ about/
    admin/ login/ reports/ closures/ priority/ page.tsx(overview)
    api/admin/[...path]/route.ts      // proxy: cookie check + X-Admin-Key
  api/        client.ts, backend-types.ts, adapters.ts (toEffective, toSegment, levelFromText)
  data/       segments.ts (registry 4.2), towns.ts, history-counts.ts (8.7)
  design/     tokens.css, brand.ts, risk-shapes.tsx
  components/ NHShield, RiskIcon, RiskBadge, StatusLine, RoadStrip, MapLayer, ReasonBars, RainBars,
              ClosureCard, ListenButton, DepartureStrip, DepartureMatrix, DemoPanel, BottomSheet, SidePanel, ...
  locales/    en.json, hi.json
```

**Env**

```
NEXT_PUBLIC_API_URL=http://localhost:8000     # or the tunnel / deployed HTTPS URL
API_URL=http://localhost:8000                 # server-side (rewrites, admin proxy)
ADMIN_KEY=...                                 # server only, never NEXT_PUBLIC
ADMIN_EMAIL=official@raah.demo
ADMIN_PASSWORD=...
NEXT_PUBLIC_SMS_NUMBER=                       # optional, shows the SMS card
```

**Avoid CORS and mixed content:** proxy public calls with a rewrite in `next.config`: `/backend/:path*` → `${API_URL}/:path*`, and call `/backend/...` from the browser (this also lets `<audio src="/backend/voice-alert?...">` work). Admin calls go through `/api/admin/*` only.

**The adapter layer is the only code that knows backend field names.** Components receive a UI model: `{ id, name, nameEn, seq, kmStart, kmEnd, coords: [lat,lng][], level: Effective, score, driver, rain: {h24, next24, next72, r3d}, terrain, reports24h, adjusted, closure, updatedAt }`.

---

## 14. Build plan and agent prompts

| Order | Work | Priority |
|---|---|---|
| 1 | Scaffold, tokens, fonts, i18n, proxy, backend types, adapters, static registry | P0 |
| 2 | Components: NHShield, RiskIcon, RiskBadge, StatusLine, RoadStrip, MapLayer, shells | P0 |
| 3 | Live map + Segment detail + banner + demo panel | P0 |
| 4 | Plan trip (departure strip, result, matrix, share) | P0 |
| 5 | Admin: login, Reports verify, BRO Priority | P0 |
| 6 | Closures (public + admin), Alerts, Report form | P1 |
| 7 | Emergency, About + model card, Past events chart, Listen buttons | P1 |
| 8 | Admin Overview, Hindi audit, print styles, polish | P1 |
| 9 | Saved-data mode, PWA, analytics, night theme | P2 |

If you are short on time, cut from the bottom, never from the P0 rows.

Paste each prompt into your coding agent with this file attached. Use your strongest model for Prompt 1, a good UI model for Prompts 2 and 3, and a fast model for small fixes and the Hindi audit.

### Prompt 1: Foundation, Live map

```text
Read WEBSITE_SPEC.md fully. We are building the Raah website with Next.js (App Router), TypeScript strict, Tailwind, react-leaflet, TanStack Query, react-i18next, zustand. Use the real backend (section 4); do not mock it. If /openapi.json at the API URL disagrees with the spec, trust openapi.json and tell me.

Build, in order, testing each step:
1. Scaffold, tailwind.config and tokens.css from section 5 (colours incl. Closed, radii, two shadows), fonts via next/font (Plex Sans, Plex Sans Condensed, Plex Sans Devanagari; in Hindi use Devanagari for headings too), i18n with en.json and hi.json containing every key in section 11, language toggle with a cookie, a /backend/* rewrite to API_URL, and the env vars from section 13.
2. src/data/segments.ts and towns.ts from section 4.2. src/api/backend-types.ts, adapters.ts (toEffective, toSegment, levelFromText) and client.ts (10 s timeout, lang param, typed errors). TanStack Query hooks useRiskMap and useClosures with lang and the demo state in every query key; refetch every 5 min; staleTime 2 min. A zustand store for demo state { simulateRainMm, asOf }.
3. Components from section 6: NHShield, RiskIcon (5 shapes from 5.2), RiskBadge, StatusLine, Button, Chip, Skeleton, RoadStrip (horizontal and vertical, hatch for Severe, cross-hatch for Closed, strip-draw animation once per session, keyboard support), MapLayer (casing + line, Closed dashed overlay, selection, fit and fly), BottomSheet, SidePanel, Dialog and Popover and Select (Radix, styled). Add /dev/kitchen-sink showing every component in every state in English and Hindi.
4. The two shells from section 7 (Compact up to 1023 px, Wide from 1024 px) and the Live map page "/" from section 8.1: banner, "Stretches to watch" list, legend, StatusLine, Segment detail with ReasonBars, RainBars, closure card, score line and the two buttons (Listen is a placeholder for now), selection sync between map, strip and list, hover sync, all states.
5. DemoPanel from section 10 (storm slider and presets, time machine presets, back to live, header chip, 5 clicks on the NH shield or ?demo=1).

Rules: tokens only, no hardcoded colours or fonts; shape + word + colour for every risk; no gradients except the Severe hatch and Closed cross-hatch; no emoji; sentence case; all text through i18n with Hindi; backend text is never translated by us; 48 px targets; no new libraries beyond the spec without telling me.
Do not build Plan trip, Alerts, Report, Emergency, About, History or Admin yet. Stop after the demo panel.
Acceptance: dragging the storm slider to 140 mm recolours map and strip within 2 s; time machine on 2023-08-14 shows the replay chip; a closed stretch shows the Closed style and banner; Hindi refetches and shows backend-localized names; works at 390, 768, 1024 and 1440 px; no TypeScript errors.
```

### Prompt 2: Plan trip, public pages

```text
Read WEBSITE_SPEC.md (especially sections 4, 6, 8, 11). Foundation, shells, Live map and demo panel already exist; reuse them and do not restyle them.

Build, in order, testing each:
1. Plan trip (section 8.2): From/To Selects over the 19 towns (From = segment that starts at the town, To = segment that ends there), day chips (Today/Tomorrow), time chips (Now, 5, 6, 8, 10 am, 12, 2 pm; past times disabled), Advanced speed. DepartureStrip: up to 6 parallel POST /trip-planner calls (cap 6) and the worst-risk shape under each chip. Result: verdict from the worst level (4.4; closures encountered means Not advised), recommendation.headline, safest window, distance and duration, "When to leave" rows from departure_timeline, DepartureMatrix (wide only) built from risk_score_at_eta, "Along your route" list from route_segments with ETA and rain at ETA (group consecutive Low rows; expand Moderate and above; closed stretches always expanded), the honesty line, buttons Alert me / Share on WhatsApp / Copy link / Print, URL state, print stylesheet, ListenButton placeholder, loading/error states, demo storm passed as simulate_rain_mm. Send depart_time as UTC ISO converted from the user's IST choice. Use risk_score_at_eta for levels and levelFromText for the text fields (inspect a lang=hi response and fill the Hindi names).
2. ListenButton (section 6) and put it on Segment detail, the trip verdict (for max_risk_segment) and alert rows.
3. Alerts and closures page (8.3) using /closures and /alerts (read the /alerts and /subscribe shapes from openapi.json), and the subscribe Dialog.
4. Report page (8.4) and /report/mine (localStorage ids + GET /field-reports status). No photo upload unless openapi.json shows an upload endpoint; otherwise send without a photo and say so on the page.
5. Emergency page (8.5) with the ETag flow, tap-to-call, bundled fallback pack, SMS and Telegram card.
6. About page with the model card (8.6) and Past events with the static per-stretch bar chart (8.7).

Rules, acceptance and stopping point: same rules as Prompt 1. Do not build /admin. Acceptance: Rishikesh to Joshimath gives a verdict, window, duration and per-stretch ETAs; picking 12:00 pm versus 6:00 am changes later stretches' rain and risk; the 140 mm storm changes verdicts and strip shapes; Listen plays audio; every page works in Hindi at 390 and 1440 px; no TypeScript errors.
```

### Prompt 3: Officials

```text
Read WEBSITE_SPEC.md sections 4, 9 and 10. Public pages exist. Build the officials area on the real backend. The admin key must never reach the browser: build the server-side proxy app/api/admin/[...path]/route.ts that checks an httpOnly login cookie and adds X-Admin-Key from the ADMIN_KEY env var.

Build, in order:
1. Admin shell, /admin/login (demo account from env, demo credentials shown only with ?demo=1), middleware protecting /admin/*, Sign out.
2. /admin/reports (9.1): list, filters, detail with large photo or placeholder, parsed [type] chip, mini map, "What the model says now" from /risk-map, the differs-note, the flywheel meter (verified reports on the same stretch in the last 24 h, out of 5), Approve (verified) and Reject (rejected) through POST /admin/validate-report with verified_by, toast with the backend message, auto-select next, keyboard A/R/J/K/Enter/Escape, all states. Optimistic updates. No reject reasons.
3. /admin/priority (9.3): GET /priority-list with sort toggle and storm picker from the demo state, RoadStrip with rank badges on the top 5, the table with inline priority bars, row click opens Segment detail, print list with a print stylesheet.
4. /admin/closures (9.2): table, "Close a stretch" Dialog (POST /admin/closure), Reopen with confirm (DELETE /admin/closure/{id}), instant refetch of the public map.
5. /admin overview (9.4).

Rules: same as before; risk colours only for risk; report status uses neutral and river only; desktop first with single-column master-detail below 1024 px. After finishing, list anything that needs a backend change under "Backend needs".
Acceptance: an official can verify 10 reports using only the keyboard; verifying and rejecting call the backend and the list updates; closing a stretch makes it appear Closed on the public map within a minute; the Priority list re-ranks under a 140 mm storm; the admin key appears nowhere in the browser's network tab or bundle; no TypeScript errors.
```

---

## 15. Review checklist and demo script

**Checklist (run before the demo)**
- [ ] Grayscale test: map and strip still readable (shape, hatch, word).
- [ ] No hardcoded colours, radii or fonts outside tokens.
- [ ] No gradients except the two hatches; no emoji; no uppercase labels; no identical card grids.
- [ ] Every number has a unit and a time ("64 mm in 24 h").
- [ ] Every screen shows how fresh its data is.
- [ ] Hindi: nothing overflows or stays in English (backend text arrives localized).
- [ ] Disconnect the network: map and Emergency still show the last data.
- [ ] 390, 768, 1024 and 1440 px all checked.
- [ ] The disclaimer is visible on segment detail and trip results.
- [ ] Admin key not in the browser.
- [ ] The word "Badrinath" appears nowhere in the product.

**Demo script (lead with the trip planner)**
1. Plan trip, Rishikesh to Joshimath: "It checks the rain at the hour you reach each stretch." Change the leave time and watch the shapes change.
2. Live map: open the demo panel, drag to 140 mm, the road turns red. Switch to Hindi, press Listen.
3. Time machine to 14 Aug 2023: "Would we have warned people before the 2023 disaster?"
4. A closed stretch: Closed style, "Not advised" on the trip.
5. Report a hazard from the phone. On the laptop at `/admin/reports`, verify it and show the flywheel meter.
6. `/admin/priority`: "Where BRO should pre-position machines before the storm."
7. Emergency page with the network off.
