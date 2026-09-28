# Flocks — Backend (MVP Phase 1)

Church Community, Discipleship, Pastoral Care & Administration Platform.
Node.js + Express + MongoDB/Mongoose backend, built per the Flocks PRD v2.0.

## What's implemented

This covers the **MVP Phase 1** scope from the PRD, with the multi-parish
architecture and Role + Permission + Scope RBAC built in from the start
(not bolted on later):

- **Auth** — organization bootstrap (creates the tenant + main parish +
  Super Admin in one transaction), login, refresh, logout, forgot/reset
  password, **email verification** (sent on registration, resend endpoint
  for authenticated users), JWT access + refresh tokens in HTTP-only
  cookies, bcrypt hashing, account lockout after repeated failed logins.
  Emails are sent via a pluggable mailer (`src/utils/mailer.js`): set
  `SMTP_*` env vars for real delivery, or leave them blank and the app logs
  the email content to the console — fully functional either way.
- **Multi-tenant core** — `ChurchOrganization` (tenant) → `Parish` →
  `Unit` → `Member`, with every resource carrying the right combination
  of `organizationId` / `parishId` / `unitId` for tenant isolation.
- **RBAC** — `RoleAssignment` = User + Role + Scope (ORGANIZATION / PARISH
  / UNIT) + explicit permission list. Admins, Co-Admins, and Unit Admins
  are all the same model with different scope + permissions. Every
  sensitive route is protected server-side via `authorize(permission,
  resolveScope)`; nothing is enforced only in the frontend.
- **Members** — CRUD, independent membership/baptism/discipleship status
  fields, parish transfer (preserves `ParishMembership` history instead
  of overwriting it), append-only `MemberEvent` journey timeline.
- **Units** — CRUD, private-by-default, membership management, Unit Admin
  assignment.
- **Bible** — daily/weekly/yearly featured verses, reading plans, join +
  progress tracking with streaks.
- **Prayer** — requests with member-controlled visibility (PRIVATE /
  PASTOR_CARE_TEAM / CHURCH_WIDE), lifecycle status, assignment,
  testimonies with moderation.
- **Attendance** — dynamic, expiring, session-specific QR tokens; one
  record per member/session enforced at the DB level; manual admin
  corrections; optional geofencing.
- **Calendar** — org/parish/unit/admin-only scoped events with visibility
  filtering.
- **Analytics** — organization & parish dashboards, parish comparison
  (aggregate-only, no individual pastoral data), unit health, and
  **Follow-Up Intelligence** (recommendations, not automated judgments).
- **Audit logging** for sensitive administrative actions.
- **Notifications** — list, mark-one-read, mark-all-read for the
  authenticated member (in-app only for now; the `Notification` model
  supports `EMAIL`/`PUSH` channels for when those are wired up).

Phase 2/3 items from the PRD (Scripture discussions, discipleship programs
as a first-class module, AI layer, testimony wall, in-app messaging, etc.)
are intentionally not built yet, per the PRD's own phased scope.

## Project structure

```
server/
├── src/
│   ├── config/         # env + MongoDB connection
│   ├── controllers/     # request handlers, one per domain
│   ├── middleware/       # auth, authorize (RBAC+scope), error handling, validation
│   ├── models/          # Mongoose schemas
│   ├── permissions/      # permission constants + role defaults
│   ├── routes/          # Express routers, one per domain
│   ├── utils/           # ApiError, catchAsync, tokens, audit
│   ├── validators/       # lightweight input validators (no extra schema lib)
│   ├── app.js            # Express app assembly
│   └── server.js         # entrypoint
├── package.json
└── .env.example
```

## Setup

```bash
cd server
npm install
cp .env.example .env     # then edit values, especially the JWT secrets
npm run dev               # requires a running MongoDB at MONGO_URI
```

Requires Node.js 18+ and a MongoDB instance (local, Atlas, or otherwise).

### A MongoDB replica set is required, not optional

This API uses multi-document transactions (see `authController.js`'s
`registerOrganization` and `memberController.js`'s `createMember` /
`transferMember`) to keep related writes atomic - e.g. creating an
organization, its main parish, the admin's user + member record, and their
Super Admin role assignment all succeed or all roll back together. **MongoDB
only supports transactions on a replica set (or mongos), never on a plain
standalone instance.** Pointing `MONGO_URI` at a bare `mongod` will make
`register-organization`, `create member`, and `transfer member` fail with a
transaction error on every call.

- **MongoDB Atlas** (including the free M0 tier) is already a replica set -
  just use its connection string as-is, no extra setup needed.
- **Docker:** the root `docker-compose.yml` starts `mongod --replSet rs0`
  and runs a one-shot `mongo-init` service that initializes the replica set
  before the API container starts. Nothing to do manually.
- **Local MongoDB without Docker:** start it with a replica set name and
  initiate it once:
  ```bash
  mongod --replSet rs0 --dbpath /path/to/your/data
  # in another terminal, once mongod is running:
  mongosh --eval "rs.initiate({_id: 'rs0', members: [{_id: 0, host: 'localhost:27017'}]})"
  ```
  Then set `MONGO_URI=mongodb://127.0.0.1:27017/flocks?replicaSet=rs0`.

## Getting your first organization + Super Admin

```bash
curl -X POST http://localhost:5000/api/v1/auth/register-organization \
  -H "Content-Type: application/json" \
  -d '{
    "organizationName": "Grace Fellowship",
    "adminFirstName": "John",
    "adminLastName": "Doe",
    "adminEmail": "john@gracefellowship.org",
    "password": "SuperSecret123"
  }'
```

This creates the Church Organization (tenant), its Main Parish, a User +
Member record for the admin, and a `SUPER_ADMIN` RoleAssignment scoped to
the organization with every permission. The response sets `accessToken`
and `refreshToken` cookies — use those (or the returned `accessToken` as
a `Bearer` header) for subsequent requests.

## Core API routes

All routes are namespaced under `/api/v1`.

| Domain        | Base path          | Notes |
|---------------|---------------------|-------|
| Auth          | `/auth`             | register-organization, login, refresh, logout, me, forgot/reset-password |
| Organization  | `/organizations`    | view/update org settings |
| Parishes      | `/parishes`         | CRUD |
| Admins        | `/admins`           | create/list/revoke RoleAssignments (Super Admin only) |
| Members       | `/members`          | CRUD, `/status`, `/transfer`, `/history` |
| Units         | `/units`            | CRUD, `/members`, `/admins` |
| Bible         | `/bible`            | `/verses`, `/plans`, join/progress |
| Prayer        | `/prayers`          | requests, `/testimony`, `/testimonies` |
| Attendance    | `/attendance`       | `/sessions`, `/mark`, `/mark-manual` |
| Events        | `/events`           | scoped calendar |
| Analytics     | `/analytics`        | `/organization`, `/parishes/:id`, `/parishes/compare`, `/units/:id`, `/follow-up` |

## How authorization works

Every sensitive route calls `authorize(PERMISSION, resolveScope)`. The
middleware checks the caller's active `RoleAssignment`s for one that:

1. belongs to their own organization (the organization is always derived
   from the authenticated user server-side — never trusted from a client
   parameter, so cross-organization access is structurally impossible),
2. is `SUPER_ADMIN` at `ORGANIZATION` scope (implicitly grants everything), **or**
3. explicitly includes the requested permission **and** its scope
   (`ORGANIZATION` / `PARISH` / `UNIT`) covers the target resource.

For member- and unit-specific routes, a small scope-resolver middleware
(`loadMemberScope`, `loadUnitScope`) loads the target resource first so a
Parish Admin's `PARISH`-scoped grant is correctly matched against, say,
a member who belongs to their parish — not just an organization-wide grant.

## Seeding demo data

```bash
npm run seed
```

Creates a demo organization ("Riverside Church (Demo)") with two parishes,
five members, a unit, a published Bible plan, a featured verse, and a
prayer request, then prints the Super Admin login to sign in with
immediately. Safe to re-run — it skips creation if the demo org already
exists.

## Deploying

**Docker:** `docker build -t flocks-server .` then run with your `.env`
values, or use the root `docker-compose.yml` (`docker compose up --build`
from the repo root) to run MongoDB, the API, and the frontend together.

**Any Node host (Railway, Render, Fly.io, a VPS, etc.):** set the
environment variables from `.env.example` (a real `MONGO_URI`, strong
random `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET`, your frontend's URL as
`CLIENT_URL`, `COOKIE_SECURE=true` once served over HTTPS, and `SMTP_*` if
you want real emails instead of console-logged ones) and run
`npm install && npm start`.

## Notes / next steps

- Set real `SMTP_*` values before production use — without them, password
  reset and email verification links are logged to the console instead of
  emailed (fine for local dev, not for real users).
- Background jobs (reminders, weekly reports) aren't wired up yet — the
  PRD defers this until after the core system is stable (BullMQ + Redis
  recommended).
- The frontend (Next.js) lives in `../client` and is wired up to every
  endpoint documented above.
