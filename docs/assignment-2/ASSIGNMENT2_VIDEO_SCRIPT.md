# Assignment 2 — Video Script
**Target:** Under 2 minutes | Record with Cmd+Shift+5 (Mac screen record)  
**App running:** `pnpm dev` → http://localhost:3000 open in browser  
**VS Code open:** project root  

---

## PRE-RECORDING CHECKLIST

- [ ] `pnpm dev` running, app loads at localhost:3000
- [ ] VS Code open, file explorer visible
- [ ] Browser tabs ready: localhost:3000
- [ ] Mic on, background noise off
- [ ] Screen resolution clean (hide dock if messy)

---

## FULL SCRIPT (with timestamps)

---

### [0:00 – 0:10] INTRO

**SHOW:** Browser at localhost:3000 (homepage)

> "This is Archcool — a commercial kitchen equipment e-commerce platform built with Next.js, TypeScript, and Prisma. I'll walk through the framework setup, the RESTful web services, and a live demo."

---

### [0:10 – 0:30] PART A — FRAMEWORK SETUP

**SHOW:** VS Code → open `package.json`  
Highlight `"next": "16.2.4"` and `"react": "^19.1.0"`

> "The framework is Next.js 16 with the App Router. Dependencies include Prisma for the database, Better Auth for authentication, Stripe for payments, and TanStack Query for state management."

**SHOW:** Expand `src/app/` folder in VS Code file explorer

> "Next.js uses file-system routing. The `(auth)` folder handles login and signup, `(public)` is the storefront, `(protected)/dashboard` is the admin panel, and `api/` contains all the REST endpoints."

**SHOW:** Open `next.config.mjs` briefly, point at `output: "standalone"`

> "The config is set to standalone output for Docker deployment."

---

### [0:30 – 1:00] PART B — RESTFUL WEB SERVICES SETUP

**SHOW:** VS Code → open `src/app/api/products/route.ts`

> "The first RESTful service is the Products API at `/api/products`. It's a public GET endpoint that supports filtering by category, full-text search, featured flag, and cursor-based pagination. It returns a JSON array of products with a next cursor for infinite scroll."

**SHOW:** Scroll slowly — let viewer see the `whereClause` logic and `NextResponse.json()` return

> "Each query parameter builds a dynamic Prisma where-clause. Response follows REST conventions — 200 on success, 404 if not found, 500 on error."

**SHOW:** VS Code → open `src/app/api/orders/route.ts`

> "The second RESTful service is the Orders API at `/api/orders`. This one is protected — it validates the session using Better Auth, returns 401 if unauthenticated, and only returns orders belonging to the current user."

---

### [1:00 – 1:50] PART C — LIVE DEMO

**SHOW:** Browser → localhost:3000 homepage

> "Quick demo of the five functionalities."

**ACTION 1 — Product Catalogue:**  
Click `/products` or the shop nav link

> "Functionality one — product catalogue. Products load from the database with infinite scroll."

**ACTION 2 — Search:**  
Type "grill" in the search bar

> "Functionality two — search. Full-text search filters results client-side using MiniSearch."

**ACTION 3 — Cart:**  
Click on any product → click Add to Bag

> "Functionality three — shopping cart. Items persist in localStorage for both guests and logged-in users."

**ACTION 4 — Checkout:**  
Go to `/bag` → click Proceed to Checkout

> "Functionality four — checkout powered by Stripe. This creates a Stripe session and a pending order in the database."  
*(Don't complete payment — just show the checkout page loaded)*

**ACTION 5 — Orders:**  
Navigate to `/sign-in` → sign in as admin or test user → go to `/my-orders`  
*(OR just show the dashboard orders page if already logged in)*

> "Functionality five — order management. Users see their order history with status tracking."

---

### [1:50 – 2:00] OUTRO

**SHOW:** Browser → localhost:3000 (back to homepage)

> "Framework: Next.js. Two REST services: Products API and Orders API. Source code is on GitHub at github.com/Seganation/scsj4383-project1."

**STOP RECORDING**

---

## CHEAT SHEET — Key Lines to Hit

| Requirement | What to say / show |
|---|---|
| Framework setup | `package.json` → Next.js version, `src/app/` folder structure |
| REST service 1 | `src/app/api/products/route.ts` — public GET, filtering, pagination |
| REST service 2 | `src/app/api/orders/route.ts` — protected GET, 401 if no session |
| Demo | Products page → search → add to cart → checkout → my-orders |
| GitHub | Say the URL out loud at the end |

---

## TIMING BREAKDOWN

| Segment | Time | Duration |
|---|---|---|
| Intro | 0:00 | 10s |
| Framework setup | 0:10 | 20s |
| REST service 1 (Products) | 0:30 | 15s |
| REST service 2 (Orders) | 0:45 | 15s |
| Demo | 1:00 | 50s |
| Outro | 1:50 | 10s |
| **Total** | | **~1:55** |

---

## TIPS

- Talk while navigating — don't pause silently
- Zoom in VS Code font: `Cmd+=` before recording
- If you mess up past 1:30 — just finish, trim in iMovie or cut with `ffmpeg`
- Trim silence from start/end: `ffmpeg -i input.mov -ss 1 -c copy output.mp4`
- Convert .mov → .mp4: `ffmpeg -i recording.mov -c:v libx264 -c:a aac output.mp4`
