# AGENTS.md

## Purpose

This repository is the ZenKeep monorepo.
It contains the React frontend in `frontend/` and the Go backend in `backend/`.
Use this file as the single repo-level guide before reading code in depth.

Primary goals for future agents:

- Avoid broad repo scans when a narrower read path will do.
- Start from the smallest relevant slice of the monorepo.
- Prefer store/service/type entry points in the frontend and handler/service/repository entry points in the backend.
- Keep monorepo changes scoped so frontend and backend work do not accidentally bleed into each other.

## Monorepo Layout

- `frontend/`
  React 19 + TypeScript + Vite SPA.
- `backend/`
  Go API with Echo, GORM, SQLite, AWS integrations, and websocket shims.
- `.github/workflows/`
  Repository-level automation. Backend deploy workflow lives here.
- `AGENTS.md`
  The only agent guidance file in the repo.
- `ARCHITECTURE.md`
  The only architecture overview file in the repo.

## What To Read First

For frontend work, read these in order:

1. `frontend/package.json`
2. `frontend/src/App.tsx`
3. `frontend/src/pages/mainpage/MainPage.tsx`
4. Relevant store in `frontend/src/stores/`
5. Relevant service in `frontend/src/services/`
6. Matching schema/type file in `frontend/src/types/`

For backend work, read these in order:

1. `backend/go.mod`
2. `backend/cmd/api/main.go`
3. Relevant handler in `backend/cmd/internal/http/handler/`
4. Relevant service in `backend/cmd/internal/service/`
5. Relevant repository in `backend/cmd/internal/domain/sqlite/repository/`
6. Matching entity or contract file in `backend/cmd/internal/domain/entity/` or `backend/cmd/internal/contract/`

That sequence usually gives enough context without spelunking the whole repo like a cursed cave system.

## Fast Project Summary

### Frontend

- Framework: `React 19` with `react-router-dom`
- State: `zustand`
- Forms/validation: `react-hook-form` + `zod`
- API client: `axios`
- Realtime: `react-use-websocket`
- Rendering modes:
  - Markdown notes
  - Mermaid flowcharts
  - File/reference notes (`pdf`, image, video, audio)
- i18n: `i18next`, currently `pt-BR` only
- Styling: CSS modules plus global `frontend/src/index.css`

### Backend

- Runtime: `Go`
- HTTP framework: `Echo`
- Persistence: `SQLite` via `GORM`
- Auth/storage/integration: AWS Cognito, S3, API Gateway websocket support, SSM
- Background jobs:
  - stale websocket connection cleanup
  - expired company cache cleanup
- Deployment artifact: Docker image built from `backend/Dockerfile`

## High-Signal Index

### Frontend App Shell And Routing

- `frontend/src/main.tsx`: React bootstrap, `BrowserRouter`, global CSS.
- `frontend/src/App.tsx`: route table and toaster setup.
- `frontend/src/pages/mainpage/ProtectedRoute.tsx`: auth gate based on local JWT presence.

### Frontend Main Screen Flow

- `frontend/src/pages/mainpage/MainPage.tsx`: main authenticated screen.
  - Reads `?id=` query param.
  - Opens/closes notes.
  - Initializes websocket manager.
  - Loads current user.
  - Renders sidebar + content board layout.
- `frontend/src/components/sidebar/Sidebar.tsx`: note search, note list, sidebar reload shortcuts.
- `frontend/src/components/sidebar/SidebarFooter.tsx`: footer action hub for utility modals and permission-gated audit log access.
- `frontend/src/components/board/ContentBoard.tsx`: dispatches note rendering by note type/file extension.

### Frontend Stores

- `frontend/src/stores/useSessionStore.ts`
  - Stores current user.
  - Persists/retrieves JWTs from `localStorage`.
  - Handles login/logout helpers.
- `frontend/src/stores/useNotesStore.ts`
  - Central source for note list and currently opened note.
  - Handles list caching, note fetch, note open/close, render loading state.
  - Start here for note bugs.
- `frontend/src/stores/useUsersStore.ts`
  - User list cache and presence updates.

### Frontend Services

- `frontend/src/services/apiClient.ts`
  - Axios instance.
  - Injects `id_token` into `Authorization`.
  - Redirects to `/login` on `401`.
- `frontend/src/services/safeApiCall.ts`
  - Shared API wrapper with Zod parsing and normalized error handling.
- `frontend/src/services/noteService.ts`
  - CRUD for notes.
  - Upload vs editor note creation logic.
  - File extension/size constants.
- `frontend/src/services/auditService.ts`
  - Audit log listing client.
  - Uses `limit` + `before_id` cursor pagination against `/audit-logs`.
  - Supports actor/action/subject filters used by the audit modal.
- `frontend/src/services/userService.ts`
  - Auth and user management requests.
- `frontend/src/services/i18n.ts`
  - i18n bootstrap.
- `frontend/src/services/socketBus.ts`
  - Internal pub/sub for websocket events.

### Frontend Websocket / Realtime

- `frontend/src/hooks/useWebSocketManager.ts`
  - Main websocket connection lifecycle.
  - Routes socket events into stores and toast/logout behavior.
- `frontend/src/models/events/GatewayEvent.ts`
  - Server event registry and discriminated union schema.
- `frontend/src/types/websocket/events.ts`
  - Kill codes and presence payload schemas.

### Backend Entrypoints

- `backend/cmd/api/main.go`: main API process bootstrap.
- `backend/infrastructure/aws/lambda/ws-connect-shim/index.mjs`: websocket connect shim.
- `backend/infrastructure/aws/lambda/ws-message-shim/index.mjs`: websocket message shim.

### Backend HTTP Flow

- `backend/cmd/internal/http/handler/`: Echo route handlers.
- `backend/cmd/internal/http/middleware/auth_middleware.go`: resolves authenticated user by `sub_uuid`.
- `backend/cmd/internal/service/`: application services and background jobs.
- `backend/cmd/internal/domain/sqlite/repository/`: SQLite-backed repositories.

### Backend Persistence And Domain

- `backend/cmd/internal/domain/sqlite/db.go`: SQLite bootstrap and automigration.
- `backend/cmd/internal/domain/entity/`: GORM entities and schema tags.
- `backend/cmd/internal/contract/`: API contracts.
- `backend/cmd/internal/domain/events/events.go`: event payloads.

## Practical Read Paths By Task

### If The Task Is About Frontend Auth

Read:

1. `frontend/src/pages/auth/`
2. `frontend/src/stores/useSessionStore.ts`
3. `frontend/src/services/userService.ts`
4. `frontend/src/utils/authutils.ts`
5. `frontend/src/types/api/users.ts`

### If The Task Is About Frontend Notes CRUD

Read:

1. `frontend/src/stores/useNotesStore.ts`
2. `frontend/src/services/noteService.ts`
3. `frontend/src/types/api/notes.ts`
4. `frontend/src/types/forms/notes.ts`
5. Relevant modal or board component

### If The Task Is About Frontend Realtime Updates

Read:

1. `frontend/src/hooks/useWebSocketManager.ts`
2. `frontend/src/models/events/GatewayEvent.ts`
3. `frontend/src/types/websocket/events.ts`
4. Affected zustand store

### If The Task Is About Frontend Audit Logs

Read:

1. `frontend/src/components/sidebar/SidebarFooter.tsx`
2. `frontend/src/components/modals/global/audit/AuditLogsModal.tsx`
3. `frontend/src/services/auditService.ts`
4. `frontend/src/types/api/audit.ts`
5. `frontend/src/models/Permission.ts`

### If The Task Is About Backend Auth Or User Resolution

Read:

1. `backend/cmd/internal/http/middleware/auth_middleware.go`
2. `backend/cmd/internal/service/user_service.go`
3. `backend/cmd/internal/domain/sqlite/repository/user_repository.go`
4. `backend/cmd/internal/domain/entity/user.go`
5. `backend/cmd/internal/contract/user_contract.go`

### If The Task Is About Backend Notes

Read:

1. `backend/cmd/internal/http/handler/note_routes.go`
2. `backend/cmd/internal/service/note_service.go`
3. `backend/cmd/internal/domain/sqlite/repository/note_repository.go`
4. `backend/cmd/internal/domain/entity/note.go`
5. `backend/cmd/internal/contract/note_contract.go`

### If The Task Is About Backend Audit Logs

Read:

1. `backend/cmd/internal/http/handler/audit_routes.go`
2. `backend/cmd/internal/service/audit_service.go`
3. `backend/cmd/internal/service/audit_helpers.go`
4. `backend/cmd/internal/domain/sqlite/repository/audit_repository.go`
5. `backend/cmd/internal/service/audit_integration_test.go`

### If The Task Is About Backend Realtime

Read:

1. `backend/cmd/internal/http/handler/websocket_routes.go`
2. `backend/cmd/internal/service/websocket_service.go`
3. `backend/cmd/internal/domain/sqlite/repository/connection_repository.go`
4. `backend/cmd/internal/domain/entity/connection.go`
5. `backend/infrastructure/aws/lambda/ws-connect-shim/index.mjs`

## Environment And Config

### Frontend

- `frontend/.env`
  - `VITE_API_BASE_URL`
  - `VITE_WS_URL`
- `frontend/vite.config.ts`
  - `@` alias to `src`
  - React compiler Babel plugin enabled
- `frontend/tsconfig.app.json`
  - strict mode enabled
  - alias path mapping for `@/*`
- `frontend/eslint.config.js`
  - lint rules

### Backend

- `backend/.env`
  Local development values. Treat as sensitive.
- `backend/docker-compose.yml`
  Local container wiring.
- `backend/Dockerfile`
  Production image build definition.
- `backend/go.mod`
  Go module boundary for backend code.

Do not copy environment values into docs or comments unless explicitly needed.

## Important Behavior Notes

- The frontend currently sends `id_token` in API requests even though auth data also includes `access_token`.
- `frontend/src/pages/mainpage/ProtectedRoute.tsx` only checks local token validity; it does not fetch the user.
- `frontend/src/pages/mainpage/MainPage.tsx` drives note opening via query param `?id=`.
- Audit logs are opened from `SidebarFooter`, auto-apply frontend filters on change, and page through `/audit-logs` in chunks of `50` using `next_before_id`.
- The audit modal resolves actor names from `useUsersStore` first and falls back to `userService.getUserById` for users that are no longer present in the active list.
- Company lookup audit events are recorded for both hits and misses, with `found` and `cache_hit` change rows describing the outcome.
- `frontend/src/stores/useNotesStore.ts` treats `REFERENCE` notes differently from text notes.
- Backend startup loads config, initializes SQLite, wires AWS-backed dependencies, starts background jobs, and serves Echo on port `7070`.
- Backend audit log reads are protected by `PermissionReadAuditLogs`; admins still inherit access through effective permission checks.
- Backend websocket events can mutate frontend-visible state through the websocket pipeline, so frontend and backend changes around realtime need to be checked together.

## Workflow Notes

- Backend container publishing workflow lives at `.github/workflows/backend-ci-deploy.yml`.
- The backend workflow should only trigger when backend files or that workflow file change.
- There is no separate backend-local workflow file anymore. Keep repo automation at the root.

## Token-Saving Guidance

Usually safe to skip on first pass:

- `frontend/node_modules/`
- Most `frontend/*.module.css` descendants unless styling is the task
- `frontend/public/` unless asset work is requested
- `frontend/src/locales/pt-br.json` unless changing copy or translation keys
- Backend implementation areas unrelated to the feature at hand

Prefer reading:

- Frontend store before UI
- Frontend service before debugging network behavior
- Backend handler before route behavior
- Backend service before repository tweaks
- Backend repository before schema/index changes
- Zod schema or Go contract before changing payload handling

## Known Repo Quirks

- The root README has encoding artifacts, so trust source files more than README wording when they disagree.
- The frontend move already happened, so older assumptions that the SPA lives at repo root are stale.
- The backend import preserved history under `backend/`, which is what we want. No need to reinvent that wheel with file-copy chaos.
- Some features are internal/admin-oriented and hidden behind permission bitmasks or backend policy checks.

## Suggested Workflow For Future Agents

1. Read this file.
2. Identify whether the task is in `frontend/`, `backend/`, or both.
3. Open the relevant store/service/type or handler/service/repository chain first.
4. Keep diffs scoped to the affected package unless the change is intentionally cross-cutting.
5. Update the root docs when the monorepo layout or cross-project behavior changes.
