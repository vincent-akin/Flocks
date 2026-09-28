# Flocks

Church Community, Discipleship, Pastoral Care & Administration Platform.

```
flocks/
├── server/            Node.js + Express + MongoDB backend
├── client/            Next.js + Tailwind frontend
└── docker-compose.yml Run MongoDB (as a replica set) + API + frontend together
```

## Quick start (Docker)

```bash
cp .env.example .env   # set JWT secrets at minimum
docker compose up --build
```
- Frontend: http://localhost:3000
- API: http://localhost:5000/api/v1

The `mongo` service starts as a single-node replica set (not a plain
standalone instance) because the API relies on multi-document transactions,
which MongoDB only supports on a replica set. See `server/README.md` if
you're running MongoDB yourself instead of via this compose file.

## Quick start (manual)

**1. Backend**
```bash
cd server
npm install
cp .env.example .env    # set MONGO_URI (see the replica-set note below) and JWT secrets
npm run dev               # http://localhost:5000
npm run seed               # optional: creates demo org + login, printed to console
```

**2. Frontend**
```bash
cd client
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
npm run dev                    # http://localhost:3000
```

See `server/README.md` + `server/API_DOCUMENTATION.md` and `client/README.md`
for full details on each half.

## Honest status - what's verified vs. what isn't

I do not have a straightforward way to say this other than directly: **this
has not been run end-to-end against a real database.** The sandbox this was
built in has no path to install or run MongoDB, so nothing here has been
exercised through an actual register → login → create member → view
dashboard flow. Here's exactly what was and wasn't checked, so you know
where to spend your own testing time first.

**Verified directly:**
- Backend: every file passes `node --check`; the full Express app module
  graph loads without errors.
- Frontend: `next build` compiles all 21 routes with no errors; every route
  was hit with `curl` and confirmed to return the right status code -
  including confirming edge middleware actually redirects `/dashboard/*` to
  `/login` when no session cookie is present, and lets requests through
  (without crashing) when one is.
- Dependency versions: the Next.js version was checked against known CVEs
  and bumped to a patched release.

**Reasoned through and fixed, but not runtime-tested:** while re-examining
the backend to answer this question honestly, I found that
`registerOrganization`, `createMember`, and `transferMember` use MongoDB
multi-document transactions, which only work on a replica set - and the
`docker-compose.yml` I'd written started a plain standalone MongoDB
container. That would have made account registration itself fail on first
use. It's fixed now (the compose file initializes a proper single-node
replica set), but I could not actually run it here to confirm the fix
works, because Docker isn't available in this environment either. **Treat
`docker compose up --build` as an unverified claim until you've run it
yourself.**

**Not done at all:** no automated tests (unit, integration, or E2E) for
either half; no CI/CD; no error-tracking/observability setup (Sentry or
equivalent); no load testing; legal pages (Privacy/Terms) in the footer are
placeholder links; no image/file upload flow (profile photos are a URL
field only); in-app messaging has no backend. None of this is disguised
elsewhere in this repo - it's the real remaining gap between "compiles and
passes static checks" and "production grade."

**What I'd actually do before calling this production-ready:** run
`docker compose up --build` (or the manual setup) locally, walk through
register → login → create a parish → add a member → create a unit → submit
a prayer request → generate an attendance QR code → check analytics, by
hand, once. That single pass would catch far more than anything I can do
without a database.
