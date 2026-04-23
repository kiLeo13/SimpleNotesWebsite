# ZenKeep

ZenKeep is a note-taking and internal file-management app built for fast access instead of deep folder archaeology.
The project lives in a monorepo with a React frontend in `frontend/` and a Go backend in `backend/`.

The UI is intentionally simple: notes live close at hand, the main workspace stays focused, and realtime updates keep the app feeling alive without turning it into a circus.

## What lives here

- `frontend/`: React 19 + TypeScript + Vite single-page app
- `backend/`: Go API with Echo, GORM, SQLite, AWS integrations, and websocket delivery
- `.github/workflows/`: repository automation, including backend container publishing
- `AGENTS.md` and `ARCHITECTURE.md`: repo-level guidance and architecture notes

## Architecture at a glance

ZenKeep is split into a fairly practical setup:

- The frontend is a client-rendered SPA.
- The backend is a Go API that handles auth, notes, files, audit logs, and realtime events.
- AWS is used for identity, storage, secrets, and websocket infrastructure.
- Cloudflare Pages is used for frontend hosting.

### Frontend

The frontend is built with React, TypeScript, Vite, TanStack Router, Zustand, Zod, and Axios.
It connects to the API over HTTP and opens a websocket connection for presence and note updates.

Important frontend behavior:

- route protection is handled in the router
- auth state is kept locally in the session store
- notes can render as markdown, Mermaid diagrams, or file/reference views
- websocket events are routed into the stores so note and user state stay in sync

### Backend

The backend is a Go service built around Echo and GORM, with SQLite for persistence.
It owns the application logic for notes, users, permissions, audit logging, file handling, and realtime delivery.

On startup, the backend:

1. loads local `.env` values or production values from AWS SSM Parameter Store
2. initializes SQLite and runs schema migration
3. wires Cognito, S3 storage, websocket delivery, repositories, services, and handlers
4. starts background cleanup jobs
5. serves HTTP traffic on port `7070`

### Realtime and AWS WebSocket API

ZenKeep uses an AWS API Gateway WebSocket API for realtime traffic.
This is one of the more important moving parts in the stack, so it deserves to be called out directly instead of being treated like a mysterious cloud blob.

The flow looks like this:

1. the frontend opens a websocket connection using `VITE_WS_URL`, sending the Cognito token in the connection query string
2. API Gateway handles the websocket lifecycle routes: `$connect`, `$disconnect`, and `$default`
3. those route events are forwarded to the backend endpoints under `/ws/connect`, `/ws/disconnect`, and `/ws/default`
4. the backend registers and removes connection IDs in SQLite and processes incoming socket messages
5. when the app needs to push an event back to connected users, the backend uses the AWS API Gateway Management API to post to those saved connection IDs

In practice, that powers things like:

- note create, update, and delete events
- presence updates
- session expiration handling
- connection kill events such as suspended accounts or idle timeout flows

There are also AWS Lambda websocket shims in `backend/infrastructure/aws/lambda/` for the infrastructure side of the integration.

## AWS services in use

ZenKeep leans on a small set of AWS services that each have a pretty clear job:

- `Cognito`: authentication, signup/login flows, and JWT issuance
- `S3`: file and attachment storage
- `CloudFront`: global delivery for stored files
- `API Gateway`: HTTP edge/proxy behavior and websocket API lifecycle
- `SSM Parameter Store`: production configuration and secrets
- `EC2`: backend runtime host for the containerized API

## Local development

Local development is split by package.
Run frontend commands from `frontend/` and backend commands from `backend/`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Useful frontend commands:

- `npm run build`
- `npm run lint`
- `npm run test`

### Backend

The backend Go module lives in `backend/`.
There is also a production-style container setup in `backend/docker-compose.yml`.

If you want to work with the Go app directly:

```bash
cd backend
go run ./cmd/api
```

If you want the production container shape:

```bash
cd backend
docker compose up
```

One honest warning: local backend work is not fully plug-and-play unless the required AWS configuration exists.
Cognito, S3, SSM, and the websocket gateway are part of the runtime shape, so a bare clone will not magically behave like production just because we believe in it really hard.

## Deployment

### Frontend deployment

The frontend is intended to be built from `frontend/` and deployed independently, currently through Cloudflare Pages.

### Backend deployment

The backend is built into a Docker image from `backend/Dockerfile`.
Repository automation publishes the backend container when backend files change, and the server-side `docker-compose.yml` is set up to run:

- the `zenkeep` API container
- `watchtower`, which polls for updated images and restarts the app container when needed

The backend serves on port `7070`.

## Useful things to know

- The repo is a monorepo, but frontend and backend changes should stay scoped unless a contract actually crosses both sides.
- SQLite is used as the application database and is persisted through a mounted data path in the deployed container setup.
- Audit logs exist for important actions such as note changes, user management events, and company lookups.
- The current frontend still sends Cognito `id_token` values for API authorization. That works with the current stack, but it is worth knowing because `access_token` use would be the more standard long-term direction.
- The websocket connection store matters: if realtime behavior looks haunted, the connection lifecycle is one of the first places worth checking.

## Tech stack

### Frontend

- React 19
- TypeScript
- Vite
- TanStack Router
- Zustand
- Zod
- Axios
- react-use-websocket

### Backend

- Go 1.24+
- Echo
- GORM
- SQLite
- AWS SDK for Go v2

### Infrastructure

- AWS Cognito
- AWS S3
- AWS CloudFront
- AWS API Gateway
- AWS SSM Parameter Store
- AWS EC2
- Cloudflare Pages
- Docker

## Repo docs

If you want the deeper version instead of the README tour:

- `AGENTS.md` explains how to approach the repo without reading the entire planet first
- `ARCHITECTURE.md` documents the current frontend/backend structure in more detail
