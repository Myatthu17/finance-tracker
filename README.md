# 💰 Finance Tracker

A full-stack personal finance tracking app with multi-user support. Track income, expenses, and balances with customizable categories, time-based filters, and a dashboard with charts.
🚀 Live Demo: https://finance-tracker-017.up.railway.app/

## Features

- **Dashboard** — Monthly overview with income vs expenses chart, category breakdowns, and balance health check
- **Expenses & Income Logs** — Add, edit, delete entries with time filters (Month/Year/All) and category filter pills
- **Balance Tracking** — Record monthly balances by type (Cash, Card, etc.) with running totals
- **Installment Tracking** — Label expenses as installments (e.g. `"PC (1/6)"`) with highlighted rows and one-click `Next→` to auto-create next month's payment
- **Custom Categories** — Create your own expense, income, and balance categories
- **Multi-User Auth** — Register/login with JWT-based authentication
- **Persistent Storage** — SQLite database with per-user data isolation

## Demo Account

A pre-loaded demo account is available in production. You can also seed it locally:

| Credential | Value |
|------------|-------|
| Email | `demo@example.com` |
| Password | `demo123` |

The demo account includes 6 months of sample data (Jan–Jun 2026) — income entries, categorized expenses with installment tracking, and monthly balance records.

## Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | React 19, TypeScript 6, Vite 8, Tailwind CSS v4, Recharts |
| Backend | Express 5, better-sqlite3, JWT (jsonwebtoken + bcryptjs) |
| Deployment | Railway — auto-deploys from GitHub, persistent volume |

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

### Seed Sample Data (Optional)

The demo account is automatically seeded on first start. To manually seed or reset:

```bash
# Delete old demo data, then re-seed
npx tsx src/seed.ts
```

Run this from the `server/` directory. The demo account is `demo@example.com` / `demo123` with 6 months of realistic sample data.

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
│   │   ├── index.ts        # Entry point, static serving in production
│   │   ├── db.ts           # SQLite schema + migration
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

Deployed on Railway. Push to GitHub triggers auto-deploy.  
Requires these environment variables:

| Variable | Description |
|----------|-------------|
| `NODE_ENV=production` | Enables static file serving |
| `DB_PATH=/data/finance.db` | SQLite path on persistent volume |
| `JWT_SECRET` | Secret for signing tokens |
