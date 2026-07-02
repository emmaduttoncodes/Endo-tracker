# Endo Tracker

A private, local-first Progressive Web App for tracking endometriosis symptoms, menstrual cycles, and medical
records — daily check-ins, cycle history, blood test results, appointments, and medications, all in one place.

All data is stored on-device in IndexedDB. Nothing is sent to a server. Use **Settings → Export** to back up your
data as JSON.

The data model is intentionally structured (rather than free text) so that a future AI layer can use it as context
to help spot patterns and trends, and act as a health coach / advocate.

## Features

- **Today** — daily log of pain level & location, a symptom checklist (pain, digestive, urinary,
  energy/cognitive, mood), mood, energy, sleep, medications taken, and notes.
- **Cycle** — log period days and flow intensity; see current cycle day, average cycle/period length, and a
  predicted next period.
- **Medical** — appointments (with reason/outcome notes and follow-ups), blood test results (with reference
  ranges and out-of-range flagging), and medications.
- **Trends** — pain/energy trend chart, period-day overlay, and most frequent symptoms over a selectable range.
- **Settings** — export/import all data as JSON, clear data.
- Installable PWA with offline support.

## Development

```bash
npm install
npm run dev       # start dev server
npm run build     # typecheck + production build
npm run lint      # oxlint
npm run preview   # preview the production build
```

## Tech stack

- React + TypeScript + Vite
- Dexie.js (IndexedDB) for local-first storage
- react-router-dom, recharts, date-fns
- vite-plugin-pwa for the installable, offline-capable app shell
