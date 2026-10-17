# Deployment Guide

## Overview

This document outlines how to deploy AFRAMP in production using Vercel (recommended) or Docker standalone.

## Prerequisites

- Node.js ≥20 (for local builds)
- Docker (for containerized deployment)
- Access to backend service (or run backend locally)
- Environment variables as defined in `.env.example`

## Vercel Deployment (Recommended)

1. **Connect Repository**
   - Import the repository to Vercel.
   - Select the `Aframp` project.

2. **Environment Variables**
   Set the following in Vercel → Settings → Environment Variables:
   - `NEXT_API_URL`: Backend origin (e.g., `https://api.aframp.org`)
   - `SENTRY_DSN`: Sentry DSN for error tracking (optional but recommended)
   - `NEXT_PUBLIC_STELLAR_NETWORK`: `MAINNET` or `TESTNET`
   - Any other variables from `.env.example` that are required for payment gateways, etc.
   - Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser; keep `NEXT_API_URL` server‑only.

3. **Build & Deploy**
   - Vercel runs `npm install`, `npm run build`, and starts the Next.js server.
   - Pushes to `main` trigger production deployments; preview deployments for PRs.

4. **Domain Configuration**
   - Add your custom domain in Vercel → Domains.
   - Vercel automatically provisions SSL.

5. **Rollback**
   - In Vercel → Deployments, select a previous deployment and click “Rollback”.

## Docker Standalone Deployment

### Building the Image

```bash
docker build -t aframp:latest .
```

### Running the Container

```bash
docker run -d \
  --name aframp \
  -p 3000:3000 \
  --env-file .env.local \
  aframp:latest
```

The container expects the backend to be reachable at the URL given in `NEXT_API_URL`. The Next.js rewrites (`/backend/* → NEXT_API_URL`) are built into the image.

### Environment Variables

Create a `.env.local` file (or pass `-e` flags) with at least:

- `NEXT_API_URL`: Backend origin (e.g., `http://host.docker.internal:3000` when backend runs on host)
- `SENTRY_DSN`: Optional Sentry DSN
- `NODE_ENV=production`
- Any other required variables (see `.env.example`)

### Health Check

The `Dockerfile` ships a `HEALTHCHECK` that requests `http://localhost:3000/api/health`, but this app
serves no `/api/health` route, so that probe reports the container unhealthy. `docker-compose.prod.yml`
overrides it with a probe on `/` (see its `healthcheck` block). If you rely on `docker run` alone, replace
the probe or add the route.

### Rollback

- Tag previous images: `docker tag aframp:previous aframp:latest` and redeploy.
- Or keep a history of image tags and reuse.

## What `vercel.json` already pins

- `buildCommand`: `npm run build`, `installCommand`: `npm install`, framework `nextjs`.
- Deployments are enabled for `main` and `develop` only; pushes to any other branch do not deploy.
- `NEXT_PUBLIC_STELLAR_NETWORK=MAINNET` is set in `env` **and** `build.env`, so a production build cannot
  silently target testnet. Override it in the dashboard only if you intend to.

## What the image contains

- Multi-stage build (`node:26-alpine`): dependencies → `next build` → runner.
- `next.config.mjs` sets `output: 'standalone'`, so the runner starts `node server.js` and does not need
  `node_modules` from the build stage.
- The container listens on **3000** (`ENV PORT=3000`, `ENV HOSTNAME="0.0.0.0"`); `docker-compose.prod.yml`
  maps `3000:3000` and reads variables from `.env.local` (`env_file`).

## Backend Proxy (Same‑Origin)

All API requests from the frontend go to `/backend/*`. In `next.config.mjs` a rewrite forwards them to the URL in `NEXT_API_URL`. This keeps the backend origin server‑only and avoids CORS.

## Sentry Integration

- The SDK is initialized in `sentry.server.config.ts` and `sentry.client.config.ts`.
- Required variable: `SENTRY_DSN` (or `NEXT_PUBLIC_SENTRY_DSN`).
- In development, Sentry is disabled unless `NODE_ENV=production`.
- Release is inferred from `NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA` when on Vercel, otherwise falls back to `dev`.

## Local Development with Docker Compose

For local testing of the production‑like setup:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

This reads `.env.local` and starts the container on port 3000.

## Verification

After deployment, verify:

- The UI loads at the assigned domain.
- API calls to `/backend/*` succeed (check network tab).
- Sentry receives test errors if configured.
- The container's health probe returns 200 (see the note under *Health Check* — the `Dockerfile` probe targets `/api/health`, which this app does not serve).
