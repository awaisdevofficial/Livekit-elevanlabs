# Environment variables

## Where they live

| File | Use |
|------|-----|
| `backend/.env` | Local dev (backend, agent_worker). Not committed if in .gitignore. |
| `backend/.env.production` | Production backend + agent (create from `backend/.env.production.example`). |
| `frontend/.env` | Local dev frontend. |
| `frontend/.env.production` | Production frontend build (or root `.env` on server for Docker build). |
| **Server root** `.env` | On main server, used as frontend build env; must have `NEXT_PUBLIC_*` including **`NEXT_PUBLIC_API_URL=https://resonaai.duckdns.org/api`** (with `/api`). |

## Production rule (Nginx at /api)

When the API is behind Nginx at `/api`:

- **Backend** `backend/.env.production`: `API_BASE_URL=https://resonaai.duckdns.org/api` (with `/api`).
- **Frontend** (root `.env` or `frontend/.env.production` on server): `NEXT_PUBLIC_API_URL=https://resonaai.duckdns.org/api` (with `/api`).

If either is missing `/api`, the app will get 404 on API calls.

## Required vars (backend)

- `DATABASE_URL`, `REDIS_URL`, `INTERNAL_SECRET`
- `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `GROQ_API_KEY`, `PIPER_TTS_URL`, `WHISPER_STT_URL`
- `API_BASE_URL`, `FRONTEND_URL`, `SECRET_KEY`

## Required vars (frontend build)

- `NEXT_PUBLIC_API_URL` (with `/api` in production)
- `NEXT_PUBLIC_LIVEKIT_URL`, `NEXT_PUBLIC_ORIGINATION_URI`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
