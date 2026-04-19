# ARCHITECTURE.md

## Overview

ZenKeep is a monorepo with two deployable applications:

- `frontend/`: a React + TypeScript + Vite single-page application for note browsing, editing, and realtime collaboration.
- `backend/`: a Go API that exposes REST endpoints through Echo, persists data in SQLite through GORM, and integrates with AWS services for authentication, storage, and websocket delivery.

The repository-level contract is simple:

- frontend code lives under `frontend/`
- backend code lives under `backend/`
- repository automation lives under `.github/workflows/`
- repo-wide guidance lives only in `AGENTS.md` and this file

## Repository Layout

- `frontend/src/`
  Main SPA source tree.
- `backend/cmd/api/`
  Main API entrypoint.
- `backend/cmd/internal/`
  Backend application layers and internal packages.
- `backend/infrastructure/aws/lambda/`
  Websocket API Gateway shims.
- `.github/workflows/backend-ci-deploy.yml`
  Backend container build and publish workflow.

## Frontend Architecture

The frontend is a client-rendered SPA built with React 19 and Vite.
Routing is handled by `react-router-dom`, state is managed with `zustand`, forms use `react-hook-form` plus `zod`, and the HTTP client is `axios`.

High-level flow:

1. `frontend/src/main.tsx` boots the app and router.
2. `frontend/src/App.tsx` defines the route graph.
3. `frontend/src/pages/mainpage/MainPage.tsx` drives the authenticated app shell.
4. Zustand stores coordinate user/session state, note state, and presence state.
5. Service modules define API access and websocket event routing.
6. Board/renderer components choose how a note is displayed based on type and file extension.

Important frontend behavior:

- Auth state is stored locally and route protection is client-side.
- The currently opened note is driven by the `?id=` query parameter.
- Notes can render as markdown, Mermaid flowcharts, or reference/file views.
- Realtime updates come through the websocket manager and fan into stores.

## Backend Architecture

The backend is a Go service built around Echo, GORM, and SQLite.
It exposes REST endpoints, performs JWT-backed authentication, coordinates domain services, and uses AWS services for Cognito auth, S3-backed file storage, and websocket delivery infrastructure.

High-level startup flow:

1. `backend/cmd/api/main.go` loads environment configuration from `.env` or AWS-backed sources.
2. SQLite is initialized and `AutoMigrate` aligns the schema.
3. External integrations are created for Cognito, storage, websocket delivery, and company lookup.
4. Repositories, policies, services, handlers, and middleware are wired together.
5. Background jobs start for stale websocket connection cleanup and expired company cache cleanup.
6. Echo starts serving HTTP traffic on port `7070`.

### Backend Layers

- `backend/cmd/internal/http/handler/`
  Route handlers and HTTP entrypoints.
- `backend/cmd/internal/http/middleware/`
  Request middleware such as auth resolution.
- `backend/cmd/internal/service/`
  Application services and jobs.
- `backend/cmd/internal/domain/sqlite/repository/`
  Persistence adapters over SQLite/GORM.
- `backend/cmd/internal/domain/entity/`
  GORM entities and schema/index tags.
- `backend/cmd/internal/contract/`
  Request and response contracts.

### Persistence Model

SQLite initialization lives in `backend/cmd/internal/domain/sqlite/db.go`.

Persisted entities include:

- `audit_log_events`
- `audit_log_changes`
- `users`
- `notes`
- `connections`
- `companies`
- `company_partners`

The audit system stores one parent event with zero or more child change rows.
Event IDs are application-generated `SonyFlake` `int64` values anchored at `2025-01-01T00:00:00Z`, then serialized as strings in API responses to avoid JavaScript precision issues.

Current audit coverage includes:

- note create, update, and delete
- user update, suspend/unsuspend, and delete
- company lookup by CNPJ

## Frontend/Backend Integration

The SPA talks to the Go API over HTTP and uses websocket connectivity for realtime updates.
That creates a few important cross-project seams:

- authentication tokens issued by the backend auth stack are stored and consumed by the frontend session store
- note contracts must stay aligned between frontend `types/` and backend `contract/` plus service behavior
- websocket event shapes must stay aligned between backend event emitters and frontend event schemas
- file and reference note handling depends on both backend storage behavior and frontend renderer support

When a change crosses one of those seams, validate both sides instead of trusting the universe to be kind for once.

## Deployment And Automation

### Frontend

The frontend is intended to be built from `frontend/` and deployed independently from the backend.
Its build inputs and package metadata now live entirely within that directory.

### Backend

The backend is built into a Docker image from `backend/Dockerfile`.
Repository automation for backend publishing lives at `.github/workflows/backend-ci-deploy.yml`.

That workflow is intentionally scoped to:

- changes under `backend/**`
- changes to `.github/workflows/backend-ci-deploy.yml`

This keeps backend publish automation asleep when only frontend files change.

## Local Development Boundaries

- Frontend commands should be run from `frontend/`.
- Backend commands should be run from `backend/`.
- Treat `frontend/.env` and `backend/.env` as sensitive local configuration.
- The backend Go module boundary is `backend/go.mod`.
- The frontend Node/Vite boundary is `frontend/package.json`.

## Documentation Rules

- Repo-level architectural guidance belongs only in `AGENTS.md` and `ARCHITECTURE.md`.
- Do not reintroduce duplicate repo-level `AGENTS.md` or `ARCHITECTURE.md` files inside subdirectories.
- If the monorepo layout or the frontend/backend interaction model changes, update this file in the same change.
