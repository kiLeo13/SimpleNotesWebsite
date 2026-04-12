# AGENTS.md

## Purpose

This repository is a frontend-only `React + TypeScript + Vite` SPA for ZenKeep / SimpleNotes.
Use this file as the first stop before reading the codebase in depth.

Primary goals for future agents:

- Avoid re-scanning the entire repo.
- Start from the smallest relevant slice.
- Prefer store/service/type entry points over leaf UI files.

## Fast Project Summary

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
- Styling: CSS modules plus global `src/index.css`

## What To Read First

For most tasks, read these in order:

1. `package.json`
2. `src/App.tsx`
3. `src/pages/mainpage/MainPage.tsx`
4. Relevant store in `src/stores/`
5. Relevant service in `src/services/`
6. Matching schema/type file in `src/types/`

That path usually gives enough context without opening dozens of components.

## High-Signal Index

### App Shell And Routing

- `src/main.tsx`: React bootstrap, `BrowserRouter`, global CSS.
- `src/App.tsx`: route table and toaster setup.
- `src/pages/mainpage/ProtectedRoute.tsx`: auth gate based on local JWT presence.

### Main Screen Flow

- `src/pages/mainpage/MainPage.tsx`: main authenticated screen.
  - Reads `?id=` query param.
  - Opens/closes notes.
  - Initializes websocket manager.
  - Loads current user.
  - Renders sidebar + content board layout.
- `src/components/sidebar/Sidebar.tsx`: note search, note list, sidebar reload shortcuts.
- `src/components/board/ContentBoard.tsx`: dispatches note rendering by note type/file extension.

### Stores

- `src/stores/useSessionStore.ts`
  - Stores current user.
  - Persists/retrieves JWTs from `localStorage`.
  - Handles login/logout helpers.
- `src/stores/useNotesStore.ts`
  - Central source for note list and currently opened note.
  - Handles list caching, note fetch, note open/close, render loading state.
  - Start here for note bugs.
- `src/stores/useUsersStore.ts`
  - User list cache and presence updates.

### Services

- `src/services/apiClient.ts`
  - Axios instance.
  - Injects `id_token` into `Authorization`.
  - Redirects to `/login` on `401`.
- `src/services/safeApiCall.ts`
  - Shared API wrapper with Zod parsing and normalized error handling.
- `src/services/noteService.ts`
  - CRUD for notes.
  - Upload vs editor note creation logic.
  - File extension/size constants.
- `src/services/userService.ts`
  - Auth and user management requests.
- `src/services/i18n.ts`
  - i18n bootstrap.
- `src/services/socketBus.ts`
  - Internal pub/sub for websocket events.

### Websocket / Realtime

- `src/hooks/useWebSocketManager.ts`
  - Main websocket connection lifecycle.
  - Routes socket events into stores and toast/logout behavior.
  - Start here for realtime sync issues.
- `src/models/events/GatewayEvent.ts`
  - Server event registry and discriminated union schema.
- `src/types/websocket/events.ts`
  - Kill codes and presence payload schemas.

### API Contracts And Validation

- `src/types/api/notes.ts`: note payloads and response schemas.
- `src/types/api/users.ts`: auth/user payloads and response schemas.
- `src/types/api/api.ts`: common API response types.
- `src/types/forms/notes.ts`: note creation/update form schemas.
- `src/types/forms/users.ts`: user form schemas.

### Auth / Permissions

- `src/utils/authutils.ts`: token validity/session checks.
- `src/models/Permission.ts`: permission bitmask model and helpers.
- `src/hooks/usePermission.ts`: permission-aware UI logic.

### Note Rendering

- `src/components/board/renderers/`
  - Media/file note viewers.
- `src/components/board/renderers/mermaid/MermaidBoardFrame.tsx`
  - Mermaid rendering path.
- `src/components/board/renderers/TextBoardFrame.tsx`
  - Text note viewer wrapper.
- `src/components/displays/markdowns/MarkdownDisplay.tsx`
  - Markdown renderer with rehype/remark pipeline.
- `src/components/displays/markdowns/remarkCustomDirectives.ts`
  - Custom directives:
  - `:note[id=...]`
  - `:tooltip[...]{content=...}`

### Note Creation / Editing

- `src/components/modals/notes/creations/editors/CreateEditorModal.tsx`
  - Markdown / flowchart creation.
- `src/components/modals/notes/creations/editors/LivePreview.tsx`
  - Editor preview path.
- `src/components/modals/notes/creations/uploads/CreateNoteModalForm.tsx`
  - File upload note creation.
- `src/components/modals/notes/updates/`
  - Existing note metadata update flow.

### User Management

- `src/components/modals/users/management/`
  - User admin UI, permissions, suspension, deletion.

### Misc Feature Areas

- `src/components/modals/global/lookup/`
  - Company/CNPJ lookup UI.
- `src/components/modals/global/algorithm/`
  - Algorithm calculator/flow explanation UI.

## Environment And Config

- `.env`
  - `VITE_API_BASE_URL`
  - `VITE_WS_URL`
- `vite.config.ts`
  - `@` alias to `src`
  - React compiler Babel plugin enabled
- `tsconfig.app.json`
  - strict mode enabled
  - alias path mapping for `@/*`
- `eslint.config.js`
  - lint rules

Do not copy environment values into docs or comments unless explicitly needed.

## Practical Read Paths By Task

### If The Task Is About Auth

Read:

1. `src/pages/auth/`
2. `src/stores/useSessionStore.ts`
3. `src/services/userService.ts`
4. `src/utils/authutils.ts`
5. `src/types/api/users.ts`

### If The Task Is About Notes CRUD

Read:

1. `src/stores/useNotesStore.ts`
2. `src/services/noteService.ts`
3. `src/types/api/notes.ts`
4. `src/types/forms/notes.ts`
5. Relevant modal or board component

### If The Task Is About Rendering A Note

Read:

1. `src/components/board/ContentBoard.tsx`
2. Relevant file in `src/components/board/renderers/`
3. `src/components/displays/markdowns/MarkdownDisplay.tsx`
4. `src/stores/useNotesStore.ts`

### If The Task Is About Realtime Updates

Read:

1. `src/hooks/useWebSocketManager.ts`
2. `src/models/events/GatewayEvent.ts`
3. `src/types/websocket/events.ts`
4. Affected zustand store

### If The Task Is About Permissions

Read:

1. `src/models/Permission.ts`
2. `src/hooks/usePermission.ts`
3. `src/stores/useSessionStore.ts`
4. Affected admin/user-management component

## Token-Saving Guidance

Usually safe to skip on first pass:

- `node_modules/`
- Most `*.module.css` files
- `public/` unless asset work is requested
- `src/locales/pt-br.json` unless changing copy or translation keys
- Leaf modal/input components until the relevant store/service/schema is understood

Prefer reading:

- Store before UI
- Service before debugging network behavior
- Zod schema before changing payload/response handling
- Main container component before leaf children

## Important Behavior Notes

- Auth uses both `access_token` and `id_token`, but API requests currently attach `id_token`.
- `ProtectedRoute` only checks local token validity; it does not fetch the user.
- `MainPage` drives note opening via query param `?id=`.
- `useNotesStore.openNote()` treats `REFERENCE` notes differently from text notes.
- Websocket events can mutate both notes and users state directly through store singletons.
- Markdown supports custom directives transformed into custom HTML tags/components.
- The repo is frontend-only; backend behavior is inferred from typed contracts and README notes.

## Known Repo Quirks

- README text has encoding artifacts, so trust source files more than README wording.
- `.env` is committed locally in this workspace; treat it as sensitive.
- Some features are internal/admin-oriented and hidden behind permission bitmasks.
- There are many UI components; most tasks do not require reading all of them.

## Suggested Workflow For Future Agents

1. Read this file.
2. Identify the feature area from the index above.
3. Open the store, service, and type/schema first.
4. Only then open the smallest relevant UI component chain.
5. Avoid broad repo-wide scans unless the task is truly cross-cutting.
