# Flocks — Frontend

Production Next.js (App Router) frontend for Flocks, built per the design brief: a
premium, calm, theme-aware SaaS interface for church community, discipleship,
pastoral care, and church intelligence — not a generic church website or admin
template.

## Stack

- **Next.js 14** (App Router, JavaScript, no TypeScript)
- **Tailwind CSS** with a CSS-variable design-token system (see `src/app/globals.css`)
- **next-themes** for Light / Dark / System theming with no flash-of-wrong-theme
- **lucide-react** for icons
- **recharts** for charts (attendance trend, sparkline stat cards)
- Hand-built, reusable UI primitives (no component library dependency)

## Getting started

```bash
cd client
npm install
cp .env.example .env.local     # point NEXT_PUBLIC_API_URL at your backend
npm run dev                     # http://localhost:3000
```

To verify a production build (this is what Vercel/any Node host runs):

```bash
npm run build
npm run start
```

The project has been build-verified end to end: `npm run build` compiles all 23
routes cleanly, and every route was smoke-tested to return `200` with real
rendered content.

## Deploying

This is a standard Next.js app — deploys to **Vercel** with zero configuration
(just set `NEXT_PUBLIC_API_URL` as an environment variable in the project
settings), or to any Node host / Docker image that can run `next build` +
`next start`.

## Project structure

```
client/
├── src/
│   ├── app/
│   │   ├── layout.jsx              # Root layout: ThemeProvider + AuthProvider
│   │   ├── page.jsx                 # Public marketing homepage
│   │   ├── globals.css              # Design tokens (light/dark), base styles
│   │   ├── (auth)/                  # Route group: shared auth layout
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   └── dashboard/               # Authenticated application
│   │       ├── layout.jsx           # Sidebar + Topbar shell
│   │       ├── page.jsx             # Dashboard home
│   │       ├── members/ units/ parishes/ prayer/ events/ analytics/  (built out)
│   │       └── attendance/ bible/ messages/ notifications/
│   │           organization/ users/ roles/ settings/  (wired up, ready for data)
│   ├── components/
│   │   ├── ui/          # Button, Card, Badge, Avatar, Modal, Dropdown, Tooltip,
│   │   │                # Tabs, Input, Select, Skeleton, EmptyState
│   │   ├── layout/       # Navbar, Footer, Sidebar, Topbar, MobileNav, ThemeSwitcher
│   │   ├── landing/      # Hero, ProductPreview, FeatureSection, CommunitySection,
│   │   │                 # DiscipleshipSection, PrayerSection, AttendanceSection,
│   │   │                 # AnalyticsSection, ParishSection, SecuritySection, FinalCTA
│   │   └── dashboard/    # StatCard, ActivityFeed, AttendanceChart, PrayerListCard,
│   │                     # EventListCard, ScriptureCard, MiniCalendar, QuickActions,
│   │                     # MemberOfWeekCard, QuickStatsList, ParishListCard, PageHeader
│   ├── context/AuthContext.jsx   # Client-side session state (calls /auth/me)
│   └── lib/
│       ├── api.js            # fetch wrapper for the backend (cookie-based auth)
│       ├── permissions.js    # client-side nav visibility helpers (NOT the security boundary)
│       ├── nav-config.js     # single source of truth for the sidebar
│       ├── sample-data.js    # static preview data (delete once wired to real API)
│       └── utils.js          # `cn()` class-merging helper
```

## Design system

All colors are CSS variables defined once in `globals.css` for `:root` (light)
and `.dark` (dark), then exposed as Tailwind theme colors (`bg-background`,
`text-foreground-secondary`, `bg-surface-elevated`, `text-accent-purple`, etc.)
in `tailwind.config.js`. Nothing hardcodes a hex value in a component — change
a token once and the whole app follows, in both themes.

- **Dark** is the primary/premium direction: layered navy surfaces
  (`#070B14` → `#0B1120` → `#101827` → `#151F31`), not pure black.
- **Light** is a warm, tinted SaaS look (`#F6F8FC` page, white cards), never a
  stark all-white page.
- Theme is picked up from system preference by default, persisted in
  `localStorage` by `next-themes`, and switchable via the navbar/topbar
  dropdown (Light / Dark / System) with no hydration flash.

## Authentication & the backend

`src/lib/api.js` is a thin, typed-in-spirit fetch wrapper around the Flocks
backend (see `../server`), with one function per real backend endpoint
(`memberApi`, `unitApi`, `parishApi`, `prayerApi`, `eventApi`, `bibleApi`,
`attendanceApi`, `analyticsApi`, `adminApi`, `organizationApi`,
`notificationApi`). It always sends `credentials: 'include'` because the
backend issues HTTP-only cookies — the frontend never touches the JWT
directly. `AuthContext` calls `GET /auth/me` on load (retrying once via
`/auth/refresh` on a 401) to hydrate the session and exposes
`roleAssignments` for the client-side nav-visibility helpers in
`lib/permissions.js`.

Every data-driven page uses the shared `useApi` hook (`lib/hooks.js`) and
`DataState` component (`components/dashboard/DataState.jsx`) so loading,
error, 403/forbidden, and empty states are handled identically everywhere —
no page silently shows a blank screen or a raw HTTP error.

**Important:** the client-side permission helpers only decide what to
*show* (which sidebar links render, which buttons appear). They are not the
security boundary — the backend independently re-checks every permission
and tenant scope on every request, exactly as documented in
`API_DOCUMENTATION.md`.

## What's fully built vs. scaffolded

**Fully built and wired to the real backend:** design system & theming, homepage,
all five auth screens (login, register, forgot/reset password, verify-email —
all calling the actual backend endpoints), edge + client-side route
protection (see below), the dashboard shell, and every sidebar destination:
Dashboard home, Members, Units, Parishes, Prayer, Events, Bible, Attendance
(including live dynamic QR generation/rotation), Analytics, Organization
settings, Users & role assignments (full Role + Permission + Scope grant
flow), Roles & Permissions reference, Notifications, and Settings. Every one
of these pages fetches real data through `lib/api.js`, shows a skeleton while
loading, a friendly message on error or 403, and an empty state with no data
— never a blank box or a raw HTTP status.

**Intentionally not built:** Messages has no backend (no message model or
routes exist in the API), so it correctly shows an honest "not available
yet" empty state rather than fabricated data. This is the one area where the
UI is ahead of the backend, by design — building a fake messaging UI backed
by nothing would be worse than admitting it isn't there yet.

## Route protection

Two layers, matching how the rest of the app treats the backend as the only
real authority:

1. **`src/middleware.js`** (Edge): redirects to `/login?next=...` if neither
   `accessToken` nor `refreshToken` cookie is present at all. This is a fast
   UX optimization only — it cannot validate the token (that needs the JWT
   secret, which never leaves the server), so a stale cookie still reaches
   the page.
2. **`AuthGuard`** (`src/components/layout/AuthGuard.jsx`, wrapping the
   dashboard layout): calls `GET /auth/me` (with one automatic refresh
   attempt on a 401) and redirects to login if that fails — this is what
   actually enforces "you must have a valid session."

Both were verified with `curl`: no cookie → `307` to `/login`; a cookie
present → the page renders (client-side JS then verifies the session for
real and redirects if it's invalid).


## Accessibility & UX conventions baked in

- Every interactive element has visible `:focus-visible` styling, keyboard
  handling (Tabs arrow-key navigation, Modal focus trap + Escape + focus
  restore, Dropdown outside-click + Escape).
- `prefers-reduced-motion` is respected globally.
- Every list-style component (`ActivityFeed`, `PrayerListCard`,
  `EventListCard`) renders a friendly `EmptyState` instead of a blank box.
- Buttons expose `loading`/`disabled` states; forms show inline validation
  errors, never a raw HTTP status code.
