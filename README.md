# Budget Bite — Grocery Price Comparison App

Built by Mohammed Tahir | SAG IT Consulting

## What it does
User enters a grocery item + zip code → sees prices from up to 5 nearby stores, sorted cheapest to most expensive — all on the Budget Bite website (no redirects).

---

## Phase 1 Setup (Kroger API — Free)

### Step 1 — Get your API keys (30 min total)

**Kroger API (free)**
1. Go to https://developer.kroger.com
2. Sign up and create an app
3. Copy your Client ID and Client Secret

**Google Maps API (free up to 40K calls/month)**
1. Go to https://console.cloud.google.com
2. Create a project → Enable "Geocoding API"
3. Create credentials → API Key → copy it

---

### Step 2 — Set up the backend

```bash
cd sag-budget-bite/backend
cp .env.example .env
# Fill in your keys in .env
npm install
npm run dev
# Server runs on http://localhost:3001
```

Test it's working:
```bash
curl http://localhost:3001/api/health
```

---

### Step 3 — Set up the frontend

```bash
cd sag-budget-bite/frontend
npm install
npm start
# App opens at http://localhost:3000
```

---

### Step 4 — Test with a working zip code

Phase 1 uses Kroger-family stores (35 US states, not PA yet).

Best test zip codes:
- **77001** — Houston TX (high Kroger density)
- **44101** — Cleveland OH (Kroger home state)
- **30301** — Atlanta GA

Try: `whole milk` + `77001`

---

## Moving to Phase 2 (Allentown PA Coverage)

When you're ready to cover Allentown PA (Wegmans, Giant, Walmart):

1. Sign up for BlueCart API (~$50–100/month): https://rapidapi.com/bluecart
2. Add your key to `.env`: `BLUECART_API_KEY=your_key`
3. Change one line in `.env`: `DATA_PROVIDER=bluecart`
4. Restart the backend

Frontend stays identical. Zero other changes.

---

## Project Structure

```
sag-budget-bite/
├── CLAUDE.md               ← Claude Code context file
├── backend/
│   ├── server.js           ← API endpoints (never changes)
│   ├── groceryService.js   ← Provider-agnostic service (never changes)
│   ├── providers/
│   │   ├── kroger.js       ← Phase 1 ✅
│   │   ├── bluecart.js     ← Phase 2 (stub ready)
│   │   └── actowiz.js      ← Phase 3 (stub ready)
│   └── .env.example        ← Copy to .env and fill in keys
└── frontend/
    └── src/
        ├── App.jsx
        └── components/
            ├── SearchForm.jsx
            └── ResultsTable.jsx
```

---

## Deployment (after local testing)

**Backend → Railway**
1. Push repo to GitHub
2. Connect Railway to your GitHub repo
3. Set environment variables in Railway dashboard (same as .env)
4. Deploy

**Frontend → Vercel**
1. Connect Vercel to your GitHub repo
2. Set `REACT_APP_API_URL=https://your-railway-url.railway.app`
3. Deploy

---

*Phase 1 target launch: June 15, 2026 | SAG IT Consulting*
