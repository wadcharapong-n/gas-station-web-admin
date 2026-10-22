# Gas Station — Back-Office Portal

Standalone React (Vite + TypeScript + Tailwind CSS v4) app for **Corporate Admin** and **Station Manager** roles. Not bundled with `public-web`.

## Run

```bash
npm install
npm run dev
```

Default dev server: `http://localhost:5173` (or the next free port).

## Demo accounts

| Role | Email | Password |
|------|--------|----------|
| Corporate Admin | `admin@gas.local` | `admin123` |
| Station Manager | `manager@gas.local` | `manager123` |

These accounts must exist in the backend database (see `gas-api` seeds / migrations).

## API

- **Dev:** Vite proxies `/api` → `http://localhost:8080` (see `vite.config.ts`), so the app uses base URL `/api` and paths like `/api/v1/...`.
- **Production:** set `VITE_API_BASE_URL` (e.g. `https://api.example.com`) or it defaults to `http://localhost:8080`. See `.env.example`.

## Routes (aligned with `requirement.md` §9.2)

| Path | Who |
|------|-----|
| `/login` | Public |
| `/dashboard` | All authenticated |
| `/stations`, `/stations/:id`, `/stations/:id/prices`, `/stations/:id/fuel` | Corporate Admin |
| `/users`, `/settings` | Corporate Admin |
| `/my-station/profile`, `/my-station/prices`, `/my-station/fuel` | Station Manager |

## Next steps

- Run the API on port **8080** (or set `VITE_API_BASE_URL`).
- Optional: JWT in httpOnly cookies and server-side session idle timeout instead of `localStorage` token.
