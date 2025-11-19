# WarriorBot MVP

An MVP for WarriorBot AI: a companion for people with Sickle Cell Disease.

Components
- backend: FastAPI API
- ml_service: risk scoring microservice (stub)
- mobile: Expo React Native app (risk card, logs, education)
- dashboard: Next.js HCP dashboard (charts, patients, detail)

Quickstart
1) Backend
- python -m venv .venv && .venv\Scripts\activate
- copy backend\.env.example backend\.env (and set SECRET_KEY, optional DATABASE_URL)
- pip install -r backend/requirements.txt
- uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000

2) ML Service (optional; backend will fallback if down)
- python -m venv .venv-ml && .venv-ml\Scripts\activate
- pip install -r ml_service/requirements.txt
- uvicorn ml_service.service:app --reload --host 0.0.0.0 --port 7000

3) Mobile App
- cd mobile
- npm install
- set EXPO_PUBLIC_API_URL=http://127.0.0.1:8000 && npm run start

4) HCP Dashboard
- cd dashboard
- npm install
- set NEXT_PUBLIC_API_URL=http://127.0.0.1:8000 && npm run dev
- Visit /dashboard for HCP, /patients for panel, /triage for cases, and /advocacy for aggregates + heatmap

5) Mobile (HCP mode)
- If signed in as HCP, Home shows buttons for HCP Patients and HCP Triage
- Use Admin Secret on dashboard login to register HCP, or call /admin/seed

Docker (optional)
- compose: docker compose up --build
- builds: CI builds images for backend, dashboard, server, and ml_service (workflow: Docker Images)
- docker compose up --build

Production (Docker Compose)
- Copy deploy/backend.env.example to deploy/backend.env and set secrets (SECRET_KEY, ADMIN_SECRET, DATA_KEY)
- Set these environment variables for compose:
  - POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB (e.g., warrior/warrior/warriorbot)
  - TFLITE_MODEL_PATH (optional)
- Build & run: docker compose -f docker-compose.prod.yml --env-file <(echo POSTGRES_USER=warrior; echo POSTGRES_PASSWORD=warrior; echo POSTGRES_DB=warriorbot) up --build
- Access: http://localhost (nginx) — dashboard at /, API via /api

One-click deploys
- Render: click "New +", "Blueprint" and point to render.yaml; this provisions DB, backend, ML, and dashboard. NEXT_PUBLIC_API_URL is auto-wired to backend.
- Fly.io: use fly.backend.toml and fly.dashboard.toml to create two apps; set NEXT_PUBLIC_API_URL on dashboard to backend URL.

Image publishing (GHCR)
- Enable Actions and run workflow "Docker Images" to push images to ghcr.io/<org>/warriorbot-*
- Use these images in your infra or on Fly/Render custom Docker.

Testing & Quality
- Backend: pip install -r backend/requirements.txt
  - Run tests: pytest backend/tests -q
  - Lint: ruff check backend
  - Typecheck: mypy backend

Auth & Notifications
- In app Home screen, register/login (dev UI)
- Allow notifications; Home has a Test Push button
- Logs require auth and are stored in DB

API endpoints
- POST /risk/predict
- POST /risk/forecast   (3–5 day outlook using weather + your last inputs)
- POST /logs
- GET  /education
- POST /simulate/therapy
- GET  /advocacy/aggregate
- GET  /advocacy/geo
- GET  /commons/export   (anonymized, opt-in research dataset)
- POST /commons/commit   (prototype blockchain-style hash commit)
- GET  /hcp/summary

Security/Compliance
- Prototype only. Add auth, PHI safeguards, and clinical validation before any real use.
- Mobile app shows a one-time consent disclaimer on first launch (Settings manage privacy).

Encryption at rest (prototype)
- Set DATA_KEY in backend/.env to a Fernet key generated via: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
- Logs are stored normally for computation; an encrypted copy of each log payload is written to LogSecure.

Triage workflow
- Search/assign patients (dashboard Assign; backend: GET /hcp/find-patient?q=, POST /hcp/assign)
- High-risk predictions auto-create triage cases for assigned HCPs; HCP dashboard shows Open Triage and allows resolving.

Privacy settings
- Mobile Settings screen controls: Share with HCPs, Data Commons opt-in
- HCP APIs respect patient sharing preference

Advocacy & Research data
- GET /advocacy/aggregate?days=30 returns opt-in, anonymized daily counts and averages (pain, hydration)
- Use for policy briefs and dashboards; respects Data Commons opt-in
