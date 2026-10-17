# 🌍 AFRAMP: Africa's Financial Bridge

[![CI](https://github.com/kellymusk/Aframp/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/kellymusk/Aframp/actions/workflows/ci.yml)
[![Uptime](https://github.com/kellymusk/Aframp/actions/workflows/uptime-monitor.yml/badge.svg?branch=main)](https://github.com/kellymusk/Aframp/actions/workflows/uptime-monitor.yml)
[![codecov](https://img.shields.io/badge/coverage-70%25-brightgreen)](https://codecov.io/gh/kellymusk/Aframp)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.0-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/next.js-16.1-black)](https://nextjs.org/)

## Don't Trust, Verify

AFRAMP is a blockchain payment platform designed specifically for the African market, enabling seamless conversion between local currencies and digital assets. We specialize in **onramp** (fiat-to-crypto) and **offramp** (crypto-to-fiat) transactions using African stablecoins and provide essential services like bill payments.

Built on the **Stellar network** with multi-chain compatibility, AFRAMP connects traditional African financial systems (like mobile money and local banks) to global blockchain ecosystems. Our platform tackles the high costs and slow speeds of cross-border payments by leveraging blockchain for near-instant, low-fee settlements.

### Who It's For

- **African Users & Diaspora**: Send remittances, pay bills, and manage finances with minimal fees.
- **Businesses & Developers**: Integrate pan-African payments and treasury solutions.
- **Contributors**: Help build the future of African fintech with open, verifiable systems.

---

## 🏗️ Project Structure

The AFRAMP frontend repository is organized for clarity and scalability:

```
Aframp/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images, fonts, icons
│   ├── components/        # Reusable UI components (Buttons, Modals, etc.)
│   ├── contexts/          # React contexts (Auth, Wallet, Theme)
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Top-level page components (Dashboard, Onramp, Bills)
│   ├── services/          # API and blockchain service integrations
│   ├── styles/            # Global and module CSS/Tailwind config
│   └── App.js             # Main application component
├── .env.example           # Environment variables template
├── package.json
└── README.md
```

---

## Architecture Decisions

- [ADR 001: Keep Backend Requests Behind a Same-Origin Proxy](docs/adr-001-backend-proxy.md)

---

## 📚 API Reference

The client-side contract is documented in the repository root OpenAPI file:

- [openapi.yaml](openapi.yaml)

This spec covers the backend endpoints used by the frontend in [lib/api.ts](lib/api.ts).

### PWA Status

Offline caching and installable PWA support are currently disabled. Web Push payment alerts
remain available through a push-only service worker; the app does not cache pages or API data
for offline use.

## 🚀 Quick Start (5 Minutes)

Get AFRAMP running locally in under 5 minutes with our automated setup script or manual installation.

> ⚠️ **Port constraint — read this first.** The backend binds port **3000**, so the frontend cannot use it; `npm run dev` and `npm start` pin this app to **3001**, and `docker-compose.dev.yml` maps it to 3001 as well. Browser requests never reach the backend directly: they go to this app's own origin at `/backend/*` and Next.js forwards them server-side to `NEXT_API_URL` (see `.env.example`).

### Automated Setup (Easiest) ⚡

**Linux/Mac:**
```bash
git clone https://github.com/your-org/Aframp.git
cd Aframp
chmod +x scripts/setup.sh
./scripts/setup.sh
```

**Windows (PowerShell):**
```powershell
git clone https://github.com/your-org/Aframp.git
cd Aframp
.\scripts\setup.ps1
```

The script will:
- ✅ Check prerequisites (Node.js, Docker)
- ✅ Create `.env.local` from template
- ✅ Let you choose Docker or Node.js setup
- ✅ Install dependencies and start the app

Access the app at `http://localhost:3001` ✅

### Manual Setup

#### Option 1: Docker (Recommended) 🐳

**Prerequisites:** Docker & Docker Compose installed

```bash
# Clone and start
git clone https://github.com/your-org/Aframp.git
cd Aframp
cp .env.example .env.local
docker-compose -f docker-compose.dev.yml up
```

Access the app at `http://localhost:3001` ✅ (the frontend is mapped to 3001 so it matches the backend's default `CORS_ALLOWED_ORIGINS`; see `docker-compose.dev.yml`).

#### Option 2: Node.js

**Prerequisites:** Node.js v18+ & npm

```bash
# Clone and install
git clone https://github.com/your-org/Aframp.git
cd Aframp
npm install

# Configure and run
cp .env.example .env.local
npm run dev -- -p 3001
```

Access the app at `http://localhost:3001` ✅ (run on 3001 so the backend's default `CORS_ALLOWED_ORIGINS=http://localhost:3001` accepts your requests).

---

## 🔧 Environment Variables

Copy `.env.example` to `.env.local` and configure the following:

### Required Variables

| Variable                  | Description                                                   | Example      |
| ------------------------- | ------------------------------------------------------------- | ------------ |
| `NEXT_PUBLIC_DEMO_MODE`   | Enable mock wallet for testing (set to `false` in production) | `false`      |
| `NEXT_PUBLIC_CNGN_ISSUER` | Stellar CNGN token issuer address                             | `GXXXXXX...` |

### Payment Gateway Configuration

| Variable                             | Description                          | Required For        |
| ------------------------------------ | ------------------------------------ | ------------------- |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`    | Paystack public key                  | Card payments       |
| `PAYSTACK_SECRET_KEY`                | Paystack secret key (server-side)    | Payment processing  |
| `NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY` | Flutterwave public key               | Mobile money        |
| `FLUTTERWAVE_SECRET_KEY`             | Flutterwave secret key (server-side) | Payment processing  |
| `FLUTTERWAVE_ENCRYPTION_KEY`         | Flutterwave encryption key           | Secure transactions |

### Optional Variables

| Variable                   | Description                              | Default |
| -------------------------- | ---------------------------------------- | ------- |
| `NEXT_PUBLIC_BILLS_WS_URL` | WebSocket URL for real-time bill updates | N/A     |

### Getting API Keys

- **Paystack**: Sign up at [paystack.com](https://paystack.com) → Settings → API Keys
- **Flutterwave**: Sign up at [flutterwave.com](https://flutterwave.com) → Settings → API
- **Stellar Issuer**: Use testnet issuer for development or contact AFRAMP team for production issuer

---

## 🐳 Docker Deployment

### Development

```bash
# Start with hot-reload
docker-compose up

# Rebuild after dependency changes
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

> ⚠️ The dev compose file maps the frontend to port **3001** to avoid colliding with the backend on 3000; API requests are proxied via `/backend/*` so no CORS configuration is needed. See `docker-compose.dev.yml`.

### Production

```bash
# Build production image
docker build -t aframp:latest .

# Run production container
docker run -p 3000:3000 --env-file .env.local aframp:latest

# Or use docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

### Docker Environment Variables

Pass environment variables via:

- `.env.local` file (recommended)
- Docker Compose `environment` section
- `docker run -e` flags

---

## 🚀 Backend Deployment

### Vercel (Recommended)

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

### Docker Standalone Deployment

#### Building the Image

```bash
docker build -t aframp:latest .
```

#### Running the Container

```bash
docker run -d \
  --name aframp \
  -p 3000:3000 \
  --env-file .env.local \
  aframp:latest
```

The container expects the backend to be reachable at the URL given in `NEXT_API_URL`. The Next.js rewrites (`/backend/* → NEXT_API_URL`) are built into the image.

#### Environment Variables

Create a `.env.local` file (or pass `-e` flags) with at least:

- `NEXT_API_URL`: Backend origin (e.g., `http://host.docker.internal:3000` when backend runs on host)
- `SENTRY_DSN`: Optional Sentry DSN
- `NODE_ENV=production`
- Any other required variables (see `.env.example`)

#### Health Check

The container includes a healthcheck that queries `http://localhost:3000`; ensure the port mapping matches.

#### Rollback

- Tag previous images: `docker tag aframp:previous aframp:latest` and redeploy.
- Or keep a history of image tags and reuse.

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
- Health endpoint returns 200.

---

## 🛠️ Troubleshooting

### All API calls fail with a network error

If every request to the backend fails (browser console shows network errors), check that the frontend is configured to call the backend via the `/backend/*` proxy.

- The backend binds port **3000** and is reachable via the Next.js rewrite from `/backend/:path*` to the URL in `NEXT_API_URL`.
- Ensure `NEXT_API_URL` is set in `.env.local` to the backend URL (e.g., `http://localhost:3000`).
- The frontend can run on any port because API requests are same-origin to `/backend/*`; with the backend on 3000, the repo's `dev`/`start` scripts pin the app to 3001 to avoid the collision.

**Fix:** verify `.env.local` contains `NEXT_API_URL=http://localhost:3000` (or appropriate backend URL) and that the frontend is calling `/backend/*` endpoints (as done in lib/api.ts). Then start the frontend:

```bash
# Node.js
npm run dev
```

Docker compose already maps frontend to 3001 and backend to 3000; the proxy works automatically.

Make sure `.env.local` sets `NEXT_API_URL` to the backend URL (e.g. `http://localhost:3000`). See `.env.example` for details.

---

## 📦 Available Scripts

| Command | Description |
| ------- | ----------- |
| `build` | `next build` |
| `build:analyze` | `ANALYZE=true next build` |
| `dev` | `next dev -p 3001` |
| `lint` | `eslint .` |
| `lint:next` | `next lint` |
| `start` | `next start -p 3001` |
| `test` | `jest --passWithNoTests` |
| `test:watch` | `jest --watch` |
| `test:coverage` | `jest --coverage --passWithNoTests` |
| `test:e2e` | `playwright test` |
| `test:diff-coverage` | `node scripts/check-diff-coverage.js` |
| `format` | `prettier --write .` |
| `format:check` | `prettier --check '**/*.{ts,tsx,css,json,md}'` |
| `type-check` | `tsc --noEmit` |
| `prepare` | `husky install || true` |
| `lighthouse` | `lhci autorun` |
| `security:audit` | `npm audit --audit-level=high` |
| `security:owasp` | `bash scripts/owasp-scan.sh` |
| `security:all` | `npm run security:audit && npm run security:owasp` |

_Built for Africa, Verified by Blockchain. Onramp to the future. Offramp to opportunity._ 🔗🌍

## Handsoff notes