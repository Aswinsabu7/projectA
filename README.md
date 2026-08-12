# ProjectA — Subscriber Management System

Full-stack subscriber/renewal management platform with role-based access control, WhatsApp/Email renewal reminders, audit logging, and a configurable admin dashboard.

- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Frontend:** Angular 20 (standalone components, signals) + PrimeNG 20
- **Auth:** JWT (access + refresh tokens), RBAC via DB-backed permissions
- **Security:** AES-256-GCM payload encryption (optional), bcrypt password hashing, rate limiting, audit logging

## Architecture

```
projectA/
├── docker-compose.yml       # mongo + server + client orchestration
├── server/                  # Express API
│   └── src/
│       ├── config/          # env, db connection
│       ├── constants/       # permission keys, enums
│       ├── models/          # Mongoose schemas
│       ├── middleware/      # auth, error handling, rate limit
│       ├── validators/      # Joi request validators
│       ├── controllers/     # route handlers
│       ├── services/        # business logic
│       ├── routes/          # /api/v1/* route definitions
│       ├── jobs/            # cron jobs (renewal reminders)
│       ├── utils/           # helpers (encryption, tokens, etc.)
│       ├── seed.js          # DB seed script (roles, permissions, super admin)
│       ├── app.js
│       └── server.js
└── client/                  # Angular 20 app
    └── src/app/
        ├── core/            # layout, guards-support, global error handler
        ├── guards/          # authGuard, permissionGuard
        ├── interceptors/    # auth, encryption, loading, error
        ├── services/        # HttpClient wrappers per domain
        ├── shared/          # models, constants, directives
        └── features/        # auth, dashboard, subscribers, users, roles,
                              # messages, audit-log, settings
```

## Getting Started (Local Development)

### Prerequisites
- Node.js 24+, npm 11+
- MongoDB 7 running locally (or via Docker, see below)

### 1. Server

```bash
cd server
cp .env.example .env      # edit secrets as needed
npm install
npm run seed               # creates permissions, system roles, super admin user
npm run dev                 # starts on http://localhost:5000
```

Default super admin credentials are configured via `SEED_SUPERADMIN_*` vars in `.env` (defaults: `superadmin` / `SuperAdmin@123` — **change in production**).

### 2. Client

```bash
cd client
npm install
ng serve                    # starts on http://localhost:4200
```

The client proxies API calls to `http://localhost:5000/api/v1` (see `src/environments/environment.ts`).

## Running with Docker

```bash
docker compose up --build
```

This starts:
- `mongo` on port `27017`
- `server` (Express API) on port `5000`
- `client` (Angular built + served via nginx) on port `4200`

The server container reads `./server/.env` via `env_file`, and connects to MongoDB via the `mongo` service name inside the Docker network.

## API Overview

Base path: `/api/v1`

| Domain | Base Route | Notes |
|---|---|---|
| Auth | `/auth` | login, refresh-token, logout |
| Dashboard | `/dashboard` | widgets, charts |
| Subscribers | `/subscribers` | CRUD, import (Excel), export |
| Users | `/users` | CRUD, activate/deactivate |
| Roles | `/roles` | CRUD, permission assignment |
| Permissions | `/permissions` | grouped permission list |
| Message History | `/messages` | list, resend, manual send |
| Audit Log | `/audit-logs` | read-only list |
| Settings | `/settings` | theme, WhatsApp, SMTP, password policy, token expiry |

All protected routes require `Authorization: Bearer <accessToken>` and are further gated by permission-based middleware matching the Angular `permissionGuard` route data.

See `postman/ProjectA.postman_collection.json` for a full request collection with example bodies.

## Security Notes

- Passwords hashed with bcryptjs (configurable salt rounds).
- JWT access tokens are short-lived (default 15m); refresh tokens (default 7d) are stored server-side and rotated on use.
- Optional AES-256-GCM request/response body encryption (`ENCRYPTION_ENABLED=true`), mirrored on the Angular side via `EncryptionService` + `encryptionInterceptor`.
- Rate limiting applied globally and more strictly on `/auth/login`.
- All mutating actions are recorded in the `AuditLog` collection (action, module, performed-by, IP, timestamp).

## Known Accepted Risks

- `npm audit` on the server reports 2 moderate advisories from a transitive `uuid` dependency inside `exceljs`. No non-breaking upstream fix is currently available; risk accepted as this dependency is only used for internal Excel import/export generation, not exposed to untrusted input parsing paths.
