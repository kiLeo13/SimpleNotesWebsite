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
Routing is handled by `@tanstack/react-router`, state is managed with `zustand`, forms use `react-hook-form` plus `zod`, and the HTTP client is `axios`.

High-level flow:

1. `frontend/src/main.tsx` boots the app and mounts `RouterProvider`.
2. `frontend/src/router.tsx` creates the TanStack router from the generated route tree.
3. `frontend/src/routes/` defines the file-based route graph.
4. `frontend/src/pages/mainpage/MainPage.tsx` drives the authenticated app shell.
5. Zustand stores coordinate user/session state, note state, and presence state.
6. Service modules define API access and websocket event routing.
7. Board/renderer components choose how a note is displayed based on type and file extension.

Important frontend behavior:

- Auth state is stored locally and route protection is enforced in TanStack Router `beforeLoad` checks.
- The currently opened note is driven by the typed `?id=` search parameter on the `/` route.
- Search-enabled custom selects move focus directly into their filter input when opened, and that autofocus is managed in the component after the menu opens instead of relying on undocumented Radix props.
- Notes can render as markdown, Mermaid flowcharts, or reference/file views.
- The update-note modal keeps its primary actions in a slim left-side rail so save and future note actions do not bloat the bottom edge of the form as the editor grows.
- The notes sidebar keeps its utility actions in a fixed non-resizable left rail inside the sidebar panel, while note search and the note list occupy the remaining resizable sidebar width.
- Sidebar note rows expose menu actions for all users to copy the note ID and download the note without opening a new tab. Markdown notes download as `.md`, reference notes download the stored attachment file, and Mermaid flowcharts export through the shared Mermaid SVG renderer as `.svg`.
- Heavy optional UI is loaded on demand instead of from the permanent shell:
  - Sidebar utility modals are imported only when opened.
  - Board renderers are imported only when the active note needs them.
  - Markdown syntax highlighting styles now load from the markdown renderer path instead of the app root.
- Realtime updates come through the websocket manager and fan into stores.
- The websocket client now identifies itself with a stable per-tab `session_id` stored in `sessionStorage`, and that identifier is generated with Web Crypto APIs instead of non-cryptographic randomness. Reconnects reuse that logical session so brief transport drops do not create duplicate backend sessions for the same tab.
- The `$connect` Lambda shim must forward that `session_id` as `X-Session-Id` to the Go API. The backend intentionally rejects connect requests that do not provide it, so frontend and connect-shim deployments need to stay in lockstep.
- Frontend websocket heartbeats are driven only while the document is visible. When a socket reconnects after a temporary drop, the client performs a lightweight users/notes resync before continuing with live events.
- Note websocket delivery is permission-aware: recipients only receive note events for notes they can currently access. Visibility transitions are translated per recipient, so losing access becomes `NOTE_DELETED`, gaining access becomes `NOTE_CREATED`, and only users who can still see the note receive `NOTE_UPDATED`.
- Audit logs are surfaced through a permission-gated modal in that sidebar rail, auto-apply frontend filters on change, resolve actor and user-subject names through the users store plus on-demand user fetches, and page through the backend with cursor-style `next_before_id` pagination.
- Frontend audit event metadata is owned by `frontend/src/components/modals/global/audit/AuditLogEvent.ts`, while `frontend/src/components/modals/global/audit/auditPresentation.ts` formats UI copy from that registry. Each supported audit event declares whether the UI should allow row expansion through an `expands` flag.
- Expanded audit entries render their change rows with a local sequential code (`1..n`) per event, and the visible code accent still derives from the frontend event metadata.

### Frontend Type Modeling

- Zod schemas are exported as `camelCase` runtime values ending in `Schema`.
- TypeScript types and interfaces stay in `PascalCase`.
- Discriminated unions should use explicit per-variant schemas when the discriminator meaningfully changes the payload shape, especially for note and websocket event contracts.
- Shared frontend/backend seams should keep transport keys in snake_case on the wire and only transform to camelCase in schemas that intentionally expose a UI-facing model.

### Frontend Routing And Code Splitting

- `frontend/src/routes/__root.tsx` owns the app-wide shell concerns such as the toaster and outlet.
- `frontend/src/routes/index.tsx` validates the home route search params and redirects unauthenticated access to `/login`.
- `frontend/src/routes/login.tsx` and `frontend/src/routes/register.tsx` keep auth screens outside the authenticated home route.
- `frontend/src/routeTree.gen.ts` is generated by TanStack Router and should be treated as build output, not handwritten source.
- `frontend/src/utils/createAsyncComponent.tsx` provides an `import()`-based async component helper so the app can lazy-load modal and renderer boundaries without relying on `React.lazy`.

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

### Backend Naming

- Backend entity and contract types should prefer full domain words over abbreviations, such as `RegistrationStatus` and `Permissions`.
- Renaming Go struct fields for clarity must not change the published JSON contract unless the API behavior is intentionally changing.

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

The `connections` table now models logical websocket sessions, not only raw API Gateway transport IDs. Each row stores:

- the current API Gateway `connection_id`
- a stable frontend-provided `session_id`
- heartbeat timestamps for active transports
- disconnect/grace timestamps for temporarily resumable sessions

This allows the backend to keep a session logically online for a short reconnect window while still preventing duplicate active transports for the same browser tab.

Current audit coverage includes:

- note create, update, and delete
- user update, suspend/unsuspend, and delete
- company lookup by CNPJ, including not-found lookups with outcome metadata

Audit log reads are exposed through `GET /audit-logs`.
That endpoint is protected by the dedicated `PermissionReadAuditLogs` bit and returns the newest entries first with `limit` and `before_id` pagination.

## Frontend/Backend Integration

The SPA talks to the Go API over HTTP and uses websocket connectivity for realtime updates.
That creates a few important cross-project seams:

- authentication tokens issued by the backend auth stack are stored and consumed by the frontend session store
- note contracts must stay aligned between frontend `types/` and backend `contract/` plus service behavior
- audit log contracts and permission bit offsets must stay aligned between frontend `types/models` and backend `contract/entity` layers
- websocket event shapes must stay aligned between backend event emitters and frontend event schemas
- file and reference note handling depends on both backend storage behavior and frontend renderer support
- websocket reconnect semantics span both sides: the frontend must reconnect with the same `session_id`, and the backend must replace old transports for that session instead of stacking rows
- the websocket `$connect` shim is part of that contract, because it is responsible for forwarding `session_id` from the browser query string into the backend request headers

When a change crosses one of those seams, validate both sides instead of trusting the universe to be kind for once.

## Deployment And Automation

### Frontend

The frontend is intended to be built from `frontend/` and deployed independently from the backend.
Its build inputs and package metadata now live entirely within that directory.
The Vite build now runs TanStack Router route generation before TypeScript compilation so the generated route tree stays aligned with `frontend/src/routes/`.
Production assets are emitted with hash-only filenames so downloaded chunks do not expose component or feature names.

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
