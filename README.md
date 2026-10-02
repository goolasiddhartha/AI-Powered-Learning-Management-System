"""
AI-Powered Learning Management System

Angular + FastAPI + MongoDB + LangChain + Gemini + RAG

## Current status

Phases 1–3 foundation are in place:

1. Project setup (folder structure, config, logging, CORS)
2. MongoDB connection + indexes
3. JWT authentication (`/api/auth/register`, `/login`, `/me`) + RBAC helpers

See `docs/ARCHITECTURE.md` for full design and roadmap.

## Quick start — Backend

```bash
cd backend
python -m venv .venv

# Windows PowerShell
.\.venv\Scripts\Activate.ps1

# macOS/Linux
# source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env   # then edit MONGODB_URI, JWT_SECRET, GEMINI_API_KEY
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- Swagger UI: http://localhost:8000/docs
- Health: http://localhost:8000/api/health

### Auth smoke test

```bash
curl -X POST http://localhost:8000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"firstName\":\"Ada\",\"lastName\":\"Lovelace\",\"email\":\"ada@example.com\",\"password\":\"password123\",\"role\":\"STUDENT\"}"

curl -X POST http://localhost:8000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"ada@example.com\",\"password\":\"password123\"}"

curl http://localhost:8000/api/me ^
  -H "Authorization: Bearer <accessToken>"
```

Note: `GET /api/auth/me` (not `/api/me`).

## Quick start — Frontend

The Angular app is being migrated from the Bolt/Supabase scaffold under `project/`
into `frontend/` (HttpClient + JWT). Until migration completes, you can still inspect
the scaffold UI shell in `project/`.

```bash
cd frontend
npm install
npm start
```

## Environment variables

Copy `backend/.env.example` → `backend/.env`. Never commit secrets.

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | Atlas / local Mongo connection |
| `DATABASE_NAME` | Database name (`ai_lms`) |
| `JWT_SECRET` | Signing key for tokens |
| `GEMINI_API_KEY` | Google Gemini (AI phases) |
| `FRONTEND_URL` | CORS origin |

## Legacy scaffold

`project/` is the original Bolt Angular + Supabase prototype. Domain models and
route map are reused; Supabase is **not** the production backend for this assignment.
"# AI-Powered-Learning-Management-System" 
