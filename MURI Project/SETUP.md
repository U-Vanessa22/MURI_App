# MURI Setup Guide

## Backend

### Prerequisites
- Python 3.10+
- The shared Neon Postgres connection string (ask Chance — not in git, see Database section)

### First-time setup
```bash
cd "MURI Project/backend"
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
```

`requirements.txt` must be plain UTF-8/ASCII — if `pip install` fails with encoding errors, check
`file requirements.txt`. (It was UTF-16 in an earlier version of this repo, which is why the
backend wouldn't install at all; a UTF-8 backup of that broken version is kept as
`requirements.txt.bak-utf16` for reference and can be deleted once everyone's confirmed clean.)

### Database
We use one shared Postgres database (hosted on Neon) so everyone sees the same tickets/assets
during integration — you don't need to create a role or database yourself, it already exists.

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Paste it into your local `.env`:
   ```
   DATABASE_URL=postgresql://<user>:<password>@<neon-host>/<dbname>?sslmode=require&channel_binding=require
   ```

`app.db` (the old local SQLite file) has already been migrated into this shared database — you
don't need to run the migration again. `README_MIGRATE.md` documents the migration script itself
if it's ever needed against a fresh database; it now imports the model modules before creating
tables, and commits inserted rows — earlier versions silently created zero tables / rolled back
every insert.

### Running the server
```bash
.venv/bin/python run_server.py
```
Serves on http://127.0.0.1:8000 — check http://127.0.0.1:8000/docs for the interactive API.

The chatbot logs "Ollama client initialization failed" on startup if Ollama isn't running
locally — that's expected outside of Bundle C's work; the chatbot falls back gracefully.

## Frontend

### Prerequisites
- Node.js (repo was set up against v22; anything reasonably recent works) and npm

### First-time setup
```bash
cd "MURI Project/frontend"
npm install
```

There's no `.env` required — `src/config/apiConfig.js` and `src/services/api.js` both default to
`http://localhost:8000` automatically when running in dev mode. If you do want to override it
(e.g. pointing at a deployed backend), copy `.env.example` and set `REACT_APP_API_URL`:
```bash
cp .env.example .env
```

**Package manager note:** the repo's tracked lockfile is `package-lock.json` (npm). A
`pnpm-lock.yaml` also exists locally from testing with pnpm — it's gitignored, so it won't get
committed, but if everyone uses a different package manager you can end up with subtly different
dependency trees. Stick to `npm install`/`npm start` unless the team agrees to switch.

### Running the frontend
```bash
npm start
```
This is Create React App (`react-scripts`), not Vite — `start`, not `dev`. Opens on
`http://localhost:3000` (CRA's default; nothing in this repo overrides `PORT`). The backend's
`CORS_ORIGINS` already allows both `3000` and `3001`, so either works if you ever do change it.

## Running both together
Two terminals, both from `MURI Project/`:
```bash
# terminal 1
cd backend && .venv/bin/python run_server.py

# terminal 2
cd frontend && npm start
```
Backend on `:8000`, frontend on `:3000`. Log in at `http://localhost:3000` with an account you
created via `POST /auth/register` (see `http://localhost:8000/docs`) — there's no sign-up screen
in the UI yet.
