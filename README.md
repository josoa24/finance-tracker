# Finance Tracker

Small README for the Finance Tracker project (backend + frontend).

## Overview

This repository contains two main parts:

- `finance-tracker-backend`: Spring Boot application (Java, Maven) exposing a REST API for accounts, transactions, authentication, categories, and analytics.
- `finance-tracker-frontend`: Vite + React + TypeScript single-page application that consumes the backend API and provides the UI.

## Setup

Prerequisites:

- Java 17+ (JDK 21 recommended)
- Maven
- Node.js 18+ and npm
- PostgreSQL (for production), H2 is used for tests

Backend:

1. Configure `src/main/resources/application.properties` with your database credentials and `jwt.secret`.
2. Build and run tests:

```bash
cd finance-tracker-backend
./mvnw clean test
```

3. Run the application:

```bash
./mvnw spring-boot:run
```

Frontend:

1. Install dependencies and run locally:

```bash
cd finance-tracker-frontend
npm install
npm run dev
```

2. Build for production:

```bash
npm run build
```

## Architecture decisions

- Backend: Spring Boot with layered architecture (controllers, services, repositories). JWT is used for stateless authentication.
- Frontend: React + TypeScript with a simple client-side router based on `window.location.pathname`. Vite is used for fast dev builds.
- Communication: RESTful API with JSON.
- Data storage: PostgreSQL in production; H2 for tests and CI.

## Trade-offs & notes

- Simplicity over complexity: client-side routing is implemented with manual pathname checks (not react-router) to keep the frontend lightweight. This trades standard routing features for lower dependency and easier bundling.
- JWT secret handling: Backend requires a sufficiently strong secret (>= 256 bits). The code includes safeguards to pad/decode secrets, but production should use a secure, environment-provided key or Key Management Service.
- UI styling: CSS modules and shared files are used; some duplication exists to avoid tightly coupling components early in development. Centralizing styles is a next-step improvement.
- Charts: `recharts` was added for data visualization — it's powerful and easy to integrate but increases bundle size (consider code-splitting).

## Decisions made during the day

- Added `recharts` to the frontend for analytics charts.
- Implemented a `UserProfile` component in the `Sidebar` showing username and logout.
- Hardened JWT key handling in `JwtUtil` to avoid WeakKeyException.
- Made analytics auto-run when filters change and unified button styles (`primary-button`).
- Moved quick actions into the sidebar and added a dropdown submenu for `Mes comptes` with `Liste` and `Nouveau compte`.
- Presentation slideshow: store `presentation_seen` in `localStorage` so users don't see it again after finishing/skipping.

## Next steps / improvements

- Centralize routing (consider using `react-router` for more robust navigation and link handling).
- Move global UI tokens/styles into a single design system file and remove duplicated CSS.
- Add E2E tests for critical flows (login, create account, transfer, analytics).
- Implement server-side pagination for transactions if dataset grows.

---

Writed on 2026-05-22.
