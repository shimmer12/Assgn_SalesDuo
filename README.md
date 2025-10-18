# SalesDuo — Combined repository

This repository contains the SalesDuo project with two main parts:

- `backend_SalesDuo/` — Node + TypeScript backend (API, scraping, AI services)
- `frontend_SalesDuo/` — React + Vite frontend (UI)

## Quick start (recommended): Docker Compose

This repository includes a `docker-compose.yml` that runs both backend and frontend together.

1. Install Docker and Docker Compose.
2. From the repo root run:

```powershell
docker-compose up --build
```

3. Backend API will be available at the port configured in `backend_SalesDuo` (see `backend_SalesDuo/README.md` if present). Frontend will be served by the frontend container.

To run in background:

```powershell
docker-compose up -d --build
```

To stop and remove containers:

```powershell
docker-compose down
```

## Running locally (development)

Backend

1. Open a terminal in `backend_SalesDuo/`.
2. Install dependencies:

```powershell
# using npm
cd backend_SalesDuo
npm install
```

3. Start the dev server (project has a `package.json` — check scripts):

```powershell
npm run dev
```

Frontend

1. Open a terminal in `frontend_SalesDuo/`.
2. Install dependencies and start the dev server:

```powershell
cd frontend_SalesDuo
npm install
npm run dev
```

## Environment variables

Both backend and frontend may use `.env` files. Example variables to set (check `backend_SalesDuo` and `frontend_SalesDuo` code for exact names):

- Backend: DATABASE_URL, OPENAI_API_KEY, PORT, etc.
- Frontend: VITE_API_URL or similar.

Never commit `.env` files with secrets — `.gitignore` already contains `*.env` patterns.

## Git / GitHub notes

- The repository was pushed to `origin` and the initial branch created. If you prefer `main` instead of `master`, you can rename branches locally and on GitHub.
- Use a Personal Access Token (PAT) for HTTPS pushes if your machine is not using SSH keys.

## Useful commands

- Linting (if configured): `npm run lint` in each package.
- Run tests (if present): `npm test`.
- Build production frontend: `npm run build` in `frontend_SalesDuo/`.

## Project structure

Top-level:

- `docker-compose.yml` — orchestration for backend + frontend
- `backend_SalesDuo/` — backend source code
- `frontend_SalesDuo/` — frontend source code

## Troubleshooting

- If docker containers fail, run `docker-compose logs` to inspect output.
- If a git push fails, ensure authentication (PAT or gh login) is set up.

---

If you want, I can also:
- Create individual READMEs inside `backend_SalesDuo/` and `frontend_SalesDuo/` with commands specific to each service.
- Rename the repository default branch from `master` to `main` and update remote branches.