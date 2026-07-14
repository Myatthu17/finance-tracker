# 💰 Finance Tracker

A full-stack personal finance tracking app with multi-user support. Track income, expenses, and balances with customizable categories, time-based filters, and a dashboard with charts.
🚀 Live Demo: https://finance-tracker-0017.vercel.app/

## Features

- **Dashboard** — Monthly overview with income vs expenses chart, category breakdowns, and balance health check
- **Expenses & Income Logs** — Add, edit, delete entries with time filters (Month/Year/All) and category filter dropdown
- **Balance Tracking** — Record monthly balances by type (Cash, Card, etc.) with running totals
- **Installment Tracking** — Label expenses as installments (e.g. `"PC (1/6)"`) with highlighted rows and one-click `Next→` to auto-create next month's payment
- **Custom Categories** — Create your own expense, income, and balance categories
- **Mobile Responsive** — Bottom navigation with icons, floating action button, compact month picker, responsive tables, and stacked layouts optimized for phone screens
- **PWA Support** — Installable on mobile home screen with offline API caching via Workbox service worker
- **Multi-User Auth** — Register/login with JWT-based authentication
- **Persistent Storage** — Turso (libSQL) database with per-user data isolation

## Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | React 19, TypeScript 6, Vite 8, Tailwind CSS v4, Recharts |
| Backend | Express 5, Turso (libSQL via `@libsql/client`), JWT (jsonwebtoken + bcryptjs) |
| Deployment | Vercel (frontend) + Render (API) + Turso (persistent DB) |

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Install & Run (Development)

```bash
# Install dependencies
npm install
cd server && npm install && cd ..

# Start both frontend and backend
npm run dev
```

Frontend: http://localhost:5173  
Backend API: http://localhost:3001

### Production Build

```bash
npm run build:prod
```

Compiles the frontend (Vite) and server (tsc) into `dist/` and `server/dist/` respectively.

## Project Structure

```
├── server/                 # Express API server
│   ├── src/
│   │   ├── index.ts        # Entry point, route wiring
│   │   ├── db.ts           # Turso/libSQL client, schema + migration
│   │   ├── middleware/      # JWT auth middleware
│   │   └── routes/          # Auth, incomes, expenses, balances, categories
│   ├── package.json
│   └── tsconfig.json
├── src/                    # React frontend
│   ├── components/         # Reusable UI components
│   ├── context/            # AuthContext + FinanceContext
│   ├── pages/              # Route pages
│   ├── lib/api.ts          # API client with JWT header
│   └── utils/              # Formatting, filtering, defaults
├── package.json             # Root scripts
└── .gitignore
```

## API Endpoints

### Auth (no token required)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account (`email`, `username`, `password`) |
| POST | `/api/auth/login` | Sign in → returns JWT token |

### Data (requires `Authorization: Bearer <token>`)

| Method | Path | Description |
|--------|------|-------------|
| GET/POST | `/api/incomes` | List / Create income entries |
| PUT/DELETE | `/api/incomes/:id` | Update / Delete income entry |
| GET/POST | `/api/expenses` | List / Create expense entries |
| PUT/DELETE | `/api/expenses/:id` | Update / Delete expense entry |
| GET/POST | `/api/balances` | List / Create balance entries |
| PUT/DELETE | `/api/balances/:id` | Update / Delete balance entry |
| GET/POST | `/api/categories` | List / Create custom categories |
| DELETE | `/api/categories/:name` | Remove custom category |

## Deployment

The frontend and backend deploy separately:

- **Frontend (Vercel)** — framework preset Vite, build command `npm run
  build`, output directory `dist`. Push to GitHub triggers auto-deploy.
- **Backend (Render)** — Web Service with root directory `server/`, build
  command `npm install --include=dev && npm run build`, start command
  `npm start`. The `--include=dev` is required because `NODE_ENV=production`
  is set on the service, which otherwise makes `npm install` skip the
  `devDependencies` (`typescript`, `@types/*`) that the build step needs.
- **Database (Turso)** — free hosted libSQL database; the server talks to it
  via `@libsql/client`. Locally, no Turso account is needed — it falls back
  to a local SQLite file (`file:./data.db`).

Environment variables:

| Variable | Where | Description |
|----------|-------|-------------|
| `NODE_ENV=production` | Render | Marks the API as running in production |
| `JWT_SECRET` | Render | Secret for signing auth tokens |
| `TURSO_DATABASE_URL` | Render | `libsql://...` URL of the Turso database |
| `TURSO_AUTH_TOKEN` | Render | Auth token for the Turso database |
| `GOOGLE_CLIENT_ID` | Render | Google OAuth Client ID, used to verify Google sign-in tokens |
| `VITE_API_URL` | Vercel | Full URL of the Render API, e.g. `https://<service>.onrender.com/api` |
| `VITE_GOOGLE_CLIENT_ID` | Vercel | Google OAuth Client ID, used by the Google sign-in button |
