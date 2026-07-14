# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install (root and server have separate dependency trees)
npm install
cd server && npm install && cd ..

# Development (runs Vite dev server on :5173 + Express on :3001 concurrently)
npm run dev

# Frontend only / server only
npm run dev:client
npm run dev:server

# Production build (frontend: tsc && vite build -> dist/; server: tsc -> server/dist/)
npm run build:prod

# Frontend build/typecheck only
npm run build

# Server build/typecheck only
cd server && npm run build
```

There is no test suite and no lint script configured in either `package.json`. Treat `tsc`/`npm run build` as the correctness check for a change (both root and `server/` have `strict: true`).

## Architecture

Two independent TypeScript projects in one repo, each with its own `package.json`, `node_modules`, and `tsconfig.json`:

- **`src/`** — React 19 + Vite frontend (Tailwind v4, Recharts, react-router-dom, PWA via `vite-plugin-pwa`).
- **`server/`** — Express 5 API (`server/src/`), talking to a libSQL/Turso database via `@libsql/client`.

They deploy separately (frontend on Vercel, API on Render) and communicate purely over HTTP `/api/*` — there is no shared code or types package between them; request/response shapes are duplicated by convention (e.g. `IncomeEntry`/`ExpenseEntry`/`BalanceEntry` types in `src/types.ts` mirror the SQL row shapes in `server/src/routes/`).

### Frontend data flow

- `src/lib/api.ts` — single `api()` fetch wrapper. Reads the JWT from `localStorage` (`ft_token`) and attaches `Authorization: Bearer`. Base URL is `import.meta.env.VITE_API_URL` in production, `/api` in dev (proxied to `localhost:3001` by `vite.config.ts`).
- `src/context/AuthContext.tsx` — owns the JWT and derives the logged-in user by decoding the JWT payload client-side (no `/me` endpoint). `ProtectedRoute` gates all routes except `/login` and `/register` on this.
- `src/context/FinanceContext.tsx` — the single source of truth for incomes/expenses/balances/categories. On mount (and whenever `token` changes) it bulk-fetches all four resources in parallel and holds them in state; every mutation (`addExpense`, `updateIncome`, etc.) calls the API then patches local state directly rather than refetching. When adding a new page/feature that touches finance data, extend this context rather than fetching independently in a component.
- Categories are split by `kind` (`expense` | `income` | `balance`) and merged with hardcoded defaults from `src/utils/defaults.ts` — `allCategories`/`allIncomeCategories`/`allBalanceTypes` in `FinanceContext` are always `[...defaults, ...customFromServer]`.

### Backend structure

- `server/src/index.ts` — Express app wiring. `initDb()` (from `db.ts`) is awaited before `app.listen`. All routes except `/api/auth/*` go through `authenticateToken` middleware (`server/src/middleware/auth.ts`), which verifies the JWT and sets `req.userId`.
- `server/src/db.ts` — creates the libSQL client (`TURSO_DATABASE_URL`/`TURSO_AUTH_TOKEN` env vars, falling back to a local `file:./data.db` when unset, so local dev needs no Turso account) and owns schema creation + in-place migrations (e.g. adding a column to an existing table), run once via `initDb()`.
- `server/src/routes/{auth,incomes,expenses,balances,categories}.ts` — one router per resource. All five follow the same shape: every handler is `async`, queries go through `db.execute({ sql, args })` (positional `?` placeholders), and every non-auth route reads `req.userId` to scope the query to the logged-in user — **every new query must filter by `user_id`**, since there is no other tenant isolation.
- Every table has a `user_id` FK with `ON DELETE CASCADE` back to `users`.
- Installment tracking is a plain convention, not a separate table: expenses carry a free-text `installment_label` (e.g. `"PC (1/6)"`) and the UI (`TransactionTable`/`TransactionForm`) parses/increments that label to create the next month's row via `Next→`.

## Deployment

Frontend (Vercel) and backend (Render) deploy independently; the database (Turso) is a separate free-tier service the API connects to over the network. See the README's Deployment section for the required env vars per service (`JWT_SECRET`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` on the API; `VITE_API_URL` on the frontend). `vercel.json` at the repo root provides the SPA rewrite needed for `react-router-dom` client-side routes to survive a refresh.
