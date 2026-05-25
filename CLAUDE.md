# CLAUDE.md — Budget Bite

## Project
App Name: Budget Bite
Owner: Mohammed Tahir | SAG IT Consulting
Type: Grocery price comparison web app
Goal: User enters a grocery item + zip code, sees prices from nearby stores sorted cheapest to most expensive — all displayed on the Budget Bite website.
Target Launch: June 15, 2026

## The #1 Rule
Prices MUST display on the Budget Bite website.
Never redirect users to another site to see prices.

## Tech Stack
- Frontend: React + CSS (Vercel)
- Backend: Node.js Express (Railway)
- Geocoding: Google Maps Geocoding API
- Prices Phase 1: Kroger API (free, 35 states)
- Prices Phase 2: BlueCart API (~$50-100/month, covers Allentown PA)
- Prices Phase 3: Actowiz (~$100-200/month, full national coverage)

## Current Features (Phase 1)
- Search by grocery item + zip code
- Radius slider: 5 to 10 miles (default 10)
- Store count selector: 3 to 10 stores with +/- buttons (default 5)
- Results sorted cheapest first with Best badge on top result
- Shows price difference vs cheapest store

## File Structure
- backend/server.js — API endpoints, never changes between phases
- backend/groceryService.js — provider router, NEVER MODIFY
- backend/providers/kroger.js — Phase 1 active provider
- backend/providers/bluecart.js — Phase 2 stub
- backend/providers/actowiz.js — Phase 3 stub
- frontend/src/App.jsx — main app component
- frontend/src/App.css — all styles
- frontend/src/components/SearchForm.jsx — search inputs + slider + counter
- frontend/src/components/ResultsTable.jsx — price comparison table

## Provider Layer Rules
- Never hardcode a specific grocery API into groceryService.js
- DATA_PROVIDER env variable controls which provider is active
- Every provider must return: { store, address, distance, price, unit, productName, inStock }
- Array sorted by price ascending, maximum results = user selected storeCount

## Coding Rules
- Never hardcode API keys — always use environment variables
- Never modify groceryService.js
- Never add redirect logic — prices must render inside Budget Bite
- Always handle errors gracefully
- Keep provider files independent

## Switching Phases
Change one line in backend/.env:
DATA_PROVIDER=kroger    (Phase 1 - current)
DATA_PROVIDER=bluecart  (Phase 2 - covers Allentown PA)
DATA_PROVIDER=actowiz   (Phase 3 - full national)

## Test Zip Codes (Phase 1)
- 77001 — Houston TX (best for testing)
- 44101 — Cleveland OH
- 30301 — Atlanta GA

## Deployment
- Backend: Railway
- Frontend: Vercel
- Environment variables must be set in both platforms

## SAG Working Principles
1. Clarity creates results
2. Responsibility sits with the leader — Mohammed Tahir reviews all deployments
3. Improvement is continuous
