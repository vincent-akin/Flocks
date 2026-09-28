# Flocks API Documentation

**Version:** MVP Phase 1
**Base URL:** `http://localhost:5000/api/v1` (replace with your deployed host)
**Content type:** `application/json` for all requests unless noted otherwise.

---

## 1. Conventions

### 1.1 Response envelope

Every response is JSON with a `success` boolean.

**Success:**
```json
{
  "success": true,
  "data": { },
  "pagination": { "page": 1, "limit": 25, "total": 42, "pages": 2 }
}
```
`pagination` is only present on paginated list endpoints (currently `GET /members`).

**Error:**
```json
{
  "success": false,
  "message": "Human-readable error message",
  "details": ["Optional array of field-level validation errors"]
}
```

### 1.2 HTTP status codes

| Code | Meaning |
|------|---------|
| 200  | Success |
| 201  | Resource created |
| 400  | Validation error / malformed request |
| 401  | Not authenticated (missing/invalid/expired token) |
| 403  | Authenticated but not authorized (missing permission or wrong scope) |
| 404  | Resource not found (or not visible to you, to avoid leaking existence) |
| 409  | Conflict (duplicate email, duplicate attendance record, etc.) |
| 500  | Internal server error |

### 1.3 IDs

All resource IDs are MongoDB ObjectId strings (24 hex characters), referenced in this doc as `<id>`.

### 1.4 Dates

All dates are ISO 8601 strings, e.g. `"2026-09-23T09:00:00.000Z"`.

---

## 2. Authentication

Flocks uses JWT access + refresh tokens delivered as **HTTP-only cookies** (`accessToken`, `refreshToken`), so browser clients don't need to manage tokens manually. Non-browser clients may instead send:

```
Authorization: Bearer <accessToken>
```

The `accessToken` expires quickly (default 15 minutes); call `POST /auth/refresh` (the `refreshToken` cookie is sent automatically by the browser) to get a new one. The `refreshToken` cookie is scoped to the `/api/v1/auth` path.

### 2.1 Tenancy

Every authenticated user belongs to exactly **one** Church Organization. The organization is always derived server-side from the logged-in user — it is never accepted as a client-supplied parameter — so cross-organization access is structurally impossible, not just policy.

### 2.2 Authorization model (read this before calling anything else)

Access is controlled by **Role Assignments**: `User + Role + Scope (ORGANIZATION | PARISH | UNIT) + explicit permission list`.

- A **Super Admin** holds an `ORGANIZATION`-scoped `SUPER_ADMIN` assignment and implicitly has every permission across the whole organization.
- An **Admin**, **Co-Admin**, or **Parish Admin** is the same underlying `ADMIN` role with whatever permission list and scope (`ORGANIZATION` or `PARISH`) they were granted.
- A **Unit Admin** holds a `UNIT`-scoped `UNIT_ADMIN` assignment.
- A plain **Member** has no Role Assignment; they can only access their own data and permission-free member endpoints (submitting prayer requests, joining Bible plans, marking their own attendance, etc.).

Each endpoint below lists the **permission** it requires and the **scope** that permission must cover (e.g. "must cover the target member's parish"). If your Role Assignment's scope doesn't cover the resource, you'll get a `403`, even if you hold that permission somewhere else in the organization.

See `src/permissions/permissions.js` in the codebase for the full permission constant list.

---

### `POST /auth/register-organization`
Creates a brand-new Church Organization (tenant): the organization itself, its Main Parish, a User + Member record for the founding admin, and a `SUPER_ADMIN` Role Assignment scoped to the organization with every permission. This is the **only** unauthenticated way a Super Admin is created.

**Auth:** None required.

**Body:**
```json
{
  "organizationName": "Grace Fellowship",
  "adminFirstName": "John",
  "adminLastName": "Doe",
  "adminEmail": "john@gracefellowship.org",
  "password": "SuperSecret123",
  "adminPhone": "+2348012345678"
}
```
`adminPhone` is optional. `password` must be at least 8 characters.

**Response `201`:**
```json
{
  "success": true,
  "message": "Church organization created successfully",
  "data": {
    "organization": { "id": "<id>", "name": "Grace Fellowship", "slug": "grace-fellowship" },
    "user": { "id": "<id>", "email": "john@gracefellowship.org" },
    "accessToken": "<jwt>"
  }
}
```
Also sets `accessToken` and `refreshToken` cookies. Errors `409` if the email is already registered.

---

### `POST /auth/login`
Rate-limited to 20 attempts / 15 minutes per IP. Locks the account for 15 minutes after 5 consecutive failed attempts.

**Auth:** None required.

**Body:**
```json
{ "email": "john@gracefellowship.org", "password": "SuperSecret123" }
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "<id>", "email": "...", "member": "<id>" },
    "roleAssignments": [ { "role": "SUPER_ADMIN", "scopeType": "ORGANIZATION", "scopeId": "<id>", "permissions": ["..."] } ],
    "accessToken": "<jwt>"
  }
}
```

---

### `POST /auth/refresh`
Reads the `refreshToken` cookie and issues a fresh `accessToken` + `refreshToken` pair.

**Auth:** Valid `refreshToken` cookie.
**Response `200`:** `{ "success": true, "data": { "accessToken": "<jwt>" } }`

---

### `POST /auth/logout`
Clears both cookies. **Auth:** None required (idempotent). **Response `200`.**

---

### `GET /auth/me`
Returns the current user, their Member profile, and their active Role Assignments.

**Auth:** Required (any authenticated user).
**Response `200`:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "<id>", "email": "...", "organization": "<id>" },
    "member": { "...Member fields" },
    "roleAssignments": [ "..." ]
  }
}
```

---

### `POST /auth/forgot-password`
Always responds identically whether or not the email exists, to avoid leaking registered emails. In development, the reset token is logged to the server console instead of emailed.

**Auth:** None. Rate-limited like login.
**Body:** `{ "email": "john@gracefellowship.org" }`
**Response `200`:** `{ "success": true, "message": "If that email exists, a reset link has been sent." }`

---

### `POST /auth/reset-password`
**Auth:** None.
**Body:** `{ "token": "<reset token>", "password": "NewSecret123" }`
**Response `200`** or `400` if the token is invalid/expired.

---

## 3. Organizations

Base path: `/organizations`. All routes require authentication.

### `GET /organizations`
Returns the caller's own Church Organization.
**Permission:** `view_organization` — scope: `ORGANIZATION`.

### `PATCH /organizations`
Updates organization settings.
**Permission:** `update_organization` — scope: `ORGANIZATION`.
**Body (all optional):** `name`, `description`, `logoUrl`, `contactEmail`, `contactPhone`, `address`, `timezone`, `settings`.

---

## 4. Parishes

Base path: `/parishes`. All routes require authentication.

| Method | Path | Permission (scope) | Notes |
|---|---|---|---|
| GET | `/parishes` | `view_parish` (ORGANIZATION) | Lists all active parishes in the organization |
| POST | `/parishes` | `create_parish` (ORGANIZATION) | Body: `name` (required), `address`, `city`, `state`, `country`, `contactEmail`, `contactPhone` |
| GET | `/parishes/:parishId` | `view_parish` (that PARISH or ORGANIZATION) | |
| PATCH | `/parishes/:parishId` | `update_parish` (that PARISH or ORGANIZATION) | Body: any of the create fields, plus `isActive` |
| DELETE | `/parishes/:parishId` | `delete_parish` (ORGANIZATION) | Soft-deletes (deactivates). The Main Parish cannot be deleted — returns `400` |

---

## 5. Admins & Role Assignments

Base path: `/admins`. **All routes require Super Admin** (not just a permission — creating/revoking admin access is deliberately not delegable in the MVP, since it's the mechanism that grants every other permission).

### `POST /admins/role-assignments`
Grants a Role Assignment to a Member. If the target Member has no login yet, one is created for them.

**Body:**
```json
{
  "memberId": "<id>",
  "role": "ADMIN",
  "scopeType": "PARISH",
  "scopeId": "<parishId>",
  "permissions": ["view_members", "manage_prayer_requests", "view_analytics"],
  "password": "OnlyRequiredIfMemberHasNoLoginYet123"
}
```
- `role`: one of `ADMIN`, `UNIT_ADMIN`, `SUPER_ADMIN` (not `MEMBER` — plain members have no assignment).
- `scopeType`: `ORGANIZATION`, `PARISH`, or `UNIT`.
- `scopeId`: the org/parish/unit ID matching `scopeType`.
- `permissions`: array of permission strings (see §2.2).
- `password`: required only if the target Member doesn't already have a `User` login (min 8 chars).

This is how **Admins, Co-Admins** (an Admin with a narrower permission list), and **Parish Admins** are all created — same endpoint, different `permissions`/`scopeType`/`scopeId`.

**Response `201`:** the created Role Assignment.

### `GET /admins/role-assignments`
Lists Role Assignments in the organization. Optional query filters: `userId`, `scopeType`, `scopeId`, `status` (`ACTIVE`/`REVOKED`).

### `PATCH /admins/role-assignments/:assignmentId/permissions`
**Body:** `{ "permissions": ["view_members", "..."] }` — replaces the assignment's permission list.

### `DELETE /admins/role-assignments/:assignmentId`
Revokes the assignment (soft — sets `status: REVOKED`, records who revoked it and when).

---

## 6. Members

Base path: `/members`. All routes require authentication.

### `GET /members`
**Permission:** `view_members` — scope: must cover the queried parish (or be ORGANIZATION-wide).

**Query params:** `parishId`, `membershipStatus` (`NEW`/`ACTIVE`/`INACTIVE`/`TRANSFERRED`/`MOVED_AWAY`/`DECEASED`), `baptismStatus` (`NOT_BAPTIZED`/`BAPTIZED`/`BAPTISM_PENDING`), `discipleshipStatus` (`NOT_STARTED`/`IN_PROGRESS`/`COMPLETED`), `search` (matches first/last name or email), `page` (default 1), `limit` (default 25, max 100).

**Response `200`:** `{ "success": true, "data": [ "...Member objects" ], "pagination": { "page": 1, "limit": 25, "total": 42, "pages": 2 } }`

### `POST /members`
**Permission:** `create_member` — scope: must cover `primaryParish`.

**Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "primaryParish": "<parishId>",
  "preferredName": "Janey",
  "gender": "FEMALE",
  "dateOfBirth": "1990-05-14",
  "phone": "+2348000000000",
  "email": "jane@example.com",
  "address": "12 Church Rd, Lagos",
  "emergencyContact": { "name": "Bob Smith", "phone": "+2348011111111", "relationship": "Spouse" },
  "membershipStatus": "NEW"
}
```
`firstName`, `lastName`, and `primaryParish` are required. Creates the Member, an initial `ParishMembership` record, and a `JOINED_CHURCH` journey event.

### `GET /members/:memberId`
**Permission:** the caller is the member themself, **or** holds `view_members` covering the member's parish.

### `PATCH /members/:memberId`
**Permission:** self, or `update_member` covering the member's parish.
**Body (any subset):** `firstName`, `lastName`, `preferredName`, `profilePhotoUrl`, `gender`, `dateOfBirth`, `phone`, `email`, `address`, `emergencyContact`, `isActive`.

### `PATCH /members/:memberId/status`
**Permission:** `update_member` covering the member's parish.

**Body (any subset — the three statuses are independent, never a single combined field):**
```json
{ "membershipStatus": "ACTIVE", "baptismStatus": "BAPTIZED", "discipleshipStatus": "IN_PROGRESS" }
```
Automatically records the relevant `MemberEvent`(s) — e.g. setting `baptismStatus` to `BAPTIZED` logs a `BAPTIZED` event; `discipleshipStatus` transitions log `DISCIPLESHIP_STARTED` / `DISCIPLESHIP_COMPLETED`.

### `POST /members/:memberId/transfer`
**Permission:** `transfer_member` covering the member's **current** parish.

**Body:** `{ "newParishId": "<id>", "transferReason": "Relocated to Abuja" }`

Closes out the current `ParishMembership` (sets `leftAt`/`transferReason`), opens a new one for the destination parish, updates `Member.primaryParish`, sets `membershipStatus` to `TRANSFERRED`, and logs a `PARISH_TRANSFER` journey event. History is preserved, never overwritten. Returns `400` if the member already belongs to the target parish.

### `GET /members/:memberId/history`
**Permission:** self, or `view_member_history` covering the member's parish.

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "events": [ { "type": "BAPTIZED", "title": "Baptized", "occurredAt": "..." }, "..." ],
    "parishHistory": [ { "parish": { "name": "Lagos Parish" }, "joinedAt": "...", "leftAt": null, "isCurrent": true }, "..." ]
  }
}
```

---

## 7. Units

Base path: `/units`. All routes require authentication.

| Method | Path | Permission (scope) |
|---|---|---|
| GET | `/units?parishId=<id>` | `view_members` (covering the queried parish or ORGANIZATION) |
| POST | `/units` | `create_unit` (covering `parish` in body) |
| GET | `/units/:unitId` | `view_members` (covering the unit's parish or the unit itself) |
| PATCH | `/units/:unitId` | `update_unit` (covering the unit's parish or the unit itself) |
| DELETE | `/units/:unitId` | `delete_unit` (same) — soft-deletes (deactivates) |
| GET | `/units/:unitId/members` | `manage_unit_members` (same) |
| POST | `/units/:unitId/members` | `manage_unit_members` (same) |
| DELETE | `/units/:unitId/members/:memberId` | `manage_unit_members` (same) |
| POST | `/units/:unitId/admins` | `manage_unit_admins` (same) |

**`POST /units` body:**
```json
{ "name": "Media Ministry", "parish": "<parishId>", "description": "...", "category": "MEDIA", "isPrivate": true }
```
`category` is one of `CHOIR`, `MEDIA`, `PROTOCOL`, `USHERING`, `YOUTH`, `CHILDREN`, `PRAYER`, `EVANGELISM`, `MENS_FELLOWSHIP`, `WOMENS_FELLOWSHIP`, `OTHER`. Units are `isPrivate: true` by default.

**`POST /units/:unitId/members` body:** `{ "memberId": "<id>" }` — adds (or reactivates) the member's `UnitMembership` and logs a `JOINED_UNIT` journey event.

**`DELETE /units/:unitId/members/:memberId`** — deactivates the membership and logs a `LEFT_UNIT` journey event.

**`POST /units/:unitId/admins` body:**
```json
{ "memberId": "<id>", "permissions": ["manage_unit_members", "view_unit_analytics"] }
```
`permissions` is optional — defaults to a sensible Unit Admin set if omitted. The target member **must already have a login** (`User` record); if not, create one first via `POST /admins/role-assignments`. Grants a `UNIT_ADMIN` Role Assignment scoped to this unit.

---

## 8. Bible

Base path: `/bible`. All routes require authentication.

### `GET /bible/verses/current`
No permission required. Returns the currently active daily/weekly/yearly verse.
**Response `200`:** `{ "success": true, "data": { "daily": { "...FeaturedVerse" }, "weekly": { "..." }, "yearly": { "..." } } }` (any of the three may be `null` if none is currently configured).

### `POST /bible/verses`
**Permission:** `set_daily_verse` — scope: `ORGANIZATION`. (Used for all three verse types in the MVP; see codebase note below.)

**Body:**
```json
{ "type": "DAILY", "reference": "Romans 8:28", "text": "And we know that all things work together for good...", "translation": "KJV", "startDate": "2026-09-23" }
```
`type` is `DAILY`, `WEEKLY`, or `YEARLY`; `startDate` defaults to now if omitted. `endDate` is computed automatically (start + 1 day / + 7 days / + 1 year respectively).

### `GET /bible/plans?published=true`
No permission required. `published` query param optional (`true`/`false`) to filter.

### `GET /bible/plans/mine`
No permission required (returns the caller's own reading progress across all plans they've joined, each annotated with `completionPercentage`).

### `GET /bible/plans/:planId`
No permission required.

### `POST /bible/plans`
**Permission:** `create_bible_plan` — scope: covering `parish` in body (omit `parish` for an organization-wide plan, which requires ORGANIZATION scope).

**Body:**
```json
{
  "title": "30 Days Through Romans",
  "description": "...",
  "planType": "THIRTY_DAY",
  "startDate": "2026-10-01",
  "endDate": "2026-10-30",
  "parish": null,
  "dailyReadings": [
    { "day": 1, "references": ["Romans 1"], "title": "Introduction" },
    { "day": 2, "references": ["Romans 2"] }
  ]
}
```
`planType` is one of `SEVEN_DAY`, `FOURTEEN_DAY`, `THIRTY_DAY`, `NINETY_DAY`, `ONE_EIGHTY_DAY`, `THREE_SIXTY_FIVE_DAY`, `CUSTOM`. Plans are created unpublished (`isPublished: false`).

### `POST /bible/plans/:planId/publish`
**Permission:** `publish_bible_plan` — scope: `ORGANIZATION`.

### `POST /bible/plans/:planId/join`
No permission required — any member with a Member profile can join a published plan. Idempotent (returns the existing `BibleReading` if already joined).

### `POST /bible/plans/:planId/progress`
No permission required — a member marking their own progress.

**Body:** `{ "day": 3, "note": "Optional reflection text" }`

Marks the day complete, updates `currentStreak`/`longestStreak` (a gap of more than 1.5 days resets the streak), and returns the reading with a computed `completionPercentage`.

---

## 9. Prayer

Base path: `/prayers`. All routes require authentication.

### `POST /prayers`
No permission required — any member submits their own request, attached to their `primaryParish`.

**Body:**
```json
{ "title": "Job interview", "description": "Please pray for my interview on Friday", "category": "CAREER", "visibility": "PRIVATE" }
```
`category`: `HEALTH`, `FAMILY`, `CAREER`, `FINANCE`, `SPIRITUAL`, `MARRIAGE`, `CHILDREN`, `THANKSGIVING`, `OTHER` (default `OTHER`). `visibility`: `PRIVATE` (default), `PASTOR_CARE_TEAM`, or `CHURCH_WIDE` — **the submitting member always controls this.**

### `GET /prayers?parishId=<id>&status=<status>`
No single permission gate — visibility is computed per-request inside the controller:
- You always see your own requests.
- You see any `CHURCH_WIDE` request in the organization.
- If you hold `view_prayer_requests` covering the queried parish, you additionally see `PASTOR_CARE_TEAM` (and other) requests for that parish.

### `GET /prayers/:requestId`
Same visibility rule as the list endpoint, applied to a single request; returns `403` if none of the conditions are met, `404` if it doesn't exist in your organization.

### `PATCH /prayers/:requestId/status`
**Permission:** `manage_prayer_requests` — scope: covering the request's parish.
**Body:** `{ "status": "BEING_PRAYED_FOR" }` — one of `SUBMITTED`, `ACTIVE`, `BEING_PRAYED_FOR`, `FOLLOW_UP`, `ANSWERED`, `CONTINUING`.

### `PATCH /prayers/:requestId/assign`
**Permission:** `assign_prayer_request` — scope: covering the request's parish.
**Body:** `{ "userId": "<userId>" }` — assigns the request to a care-team User.

### `POST /prayers/:requestId/testimony`
No standalone permission — **only the member who submitted the original request** may add its testimony (enforced in the controller, `403` otherwise).

**Body:** `{ "testimony": "I got the job!", "isPublicallyShareable": false }`
Also flips the parent request's `status` to `ANSWERED`.

### `GET /prayers/testimonies?parishId=<id>&moderationStatus=<status>`
**Permission:** `view_testimonies` — scope: covering the queried parish.

### `PATCH /prayers/testimonies/:testimonyId/moderate`
**Permission:** `moderate_testimonies` — scope: `ORGANIZATION`.
**Body:** `{ "moderationStatus": "APPROVED" }` (or `"REJECTED"`).

---

## 10. Attendance

Base path: `/attendance`. All routes require authentication.

Security model: the QR "token" is a random 32-byte hex value; only its SHA-256 hash is stored. It expires after `ATTENDANCE_QR_TTL_SECONDS` (default 300s = 5 minutes) and can be rotated on demand while a session stays open, so a screenshot of the projected code goes stale quickly. One `AttendanceRecord` per (session, member) pair is enforced at the database level (`409 Conflict` on a duplicate scan).

### `GET /attendance/sessions?parishId=<id>&unitId=<id>`
**Permission:** `view_attendance` — scope: covering the queried parish/unit.

### `POST /attendance/sessions`
**Permission:** `create_attendance_session` — scope: covering `parish`/`unit` in body.

**Body:**
```json
{
  "title": "Sunday Service — Sept 27, 2026",
  "scheduledStart": "2026-09-27T09:00:00.000Z",
  "scheduledEnd": "2026-09-27T11:00:00.000Z",
  "parish": "<parishId>",
  "unit": null,
  "event": "<eventId>",
  "location": { "latitude": 6.5244, "longitude": 3.3792, "radiusMeters": 150 }
}
```
`location` is optional; when set, attendees must be within `radiusMeters` to check in.

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "session": { "...AttendanceSession fields" },
    "token": "<raw one-time token — shown once, not stored>",
    "qrDataUrl": "data:image/png;base64,...",
    "expiresAt": "2026-09-27T09:05:00.000Z"
  }
}
```
Display `qrDataUrl` as the projected QR image; it encodes `{ sessionId, token }`.

### `POST /attendance/sessions/:sessionId/rotate`
**Permission:** `create_attendance_session` (organization-wide check). Issues a fresh token/QR for a still-open session — call this on an interval (e.g. every 4 minutes) from the display client to keep the code "dynamic" for the length of the service.
**Response `200`:** `{ "success": true, "data": { "token": "...", "qrDataUrl": "...", "expiresAt": "..." } }`

### `POST /attendance/sessions/:sessionId/close`
**Permission:** `edit_attendance`. Marks the session closed; no further check-ins are accepted.

### `GET /attendance/sessions/:sessionId/records`
**Permission:** `view_attendance`. Returns all `AttendanceRecord`s for the session, each with the member populated.

### `POST /attendance/sessions/:sessionId/mark`
No standalone permission — a member scanning the projected QR to mark **their own** attendance.

**Body:**
```json
{ "token": "<scanned token>", "location": { "latitude": 6.5241, "longitude": 3.3795 } }
```
`location` is required only if the session was created with a `location.radiusMeters`. Returns `400` for an expired/invalid token or an out-of-range location, `409` if attendance was already recorded for this member/session.

### `POST /attendance/sessions/:sessionId/mark-manual`
**Permission:** `edit_attendance`. Admin correction — marks or overwrites a member's record directly (bypasses the QR/token check).

**Body:** `{ "memberId": "<id>" }`

---

## 11. Calendar / Events

Base path: `/events`. All routes require authentication.

### `GET /events?from=<date>&to=<date>&parishId=<id>&unitId=<id>`
No single permission gate — visibility is computed per-caller:
- `ORGANIZATION`-scoped events: visible to everyone in the org.
- `PARISH`-scoped events: visible to everyone (optionally filter to one parish via `parishId`).
- `UNIT`-scoped events: visible only if you belong to that unit.
- `ADMIN_ONLY`-scoped events: visible only if you hold at least one active Role Assignment (i.e., you're some kind of admin).

### `POST /events`
**Permission:** `create_event` — scope: covering `parish`/`unit` in body (no scope requirement for `ORGANIZATION`/`ADMIN_ONLY` events beyond holding the permission at ORGANIZATION scope).

**Body:**
```json
{
  "title": "Sunday Service",
  "description": "...",
  "scopeType": "PARISH",
  "parish": "<parishId>",
  "unit": null,
  "type": "SUNDAY_SERVICE",
  "startsAt": "2026-09-27T09:00:00.000Z",
  "endsAt": "2026-09-27T11:00:00.000Z",
  "location": "Main Auditorium",
  "createsAttendanceSession": false
}
```
`scopeType`: `ORGANIZATION`, `PARISH`, `UNIT`, or `ADMIN_ONLY`. `parish` is required when `scopeType` is `PARISH`; `unit` is required when `scopeType` is `UNIT`. `type`: `SUNDAY_SERVICE`, `BIBLE_STUDY`, `PRAYER_MEETING`, `UNIT_MEETING`, `SMALL_GROUP`, `OUTREACH`, `CONFERENCE`, `DISCIPLESHIP_CLASS`, `LEADERSHIP_MEETING`, `SPECIAL_EVENT` (default).

### `PATCH /events/:eventId`
**Permission:** `update_event` (organization-wide check in the MVP).
**Body (any subset):** `title`, `description`, `type`, `startsAt`, `endsAt`, `location`, `isActive`.

### `DELETE /events/:eventId`
**Permission:** `delete_event`. Soft-deletes (deactivates).

---

## 12. Analytics

Base path: `/analytics`. All routes require authentication. These are **pastoral indicators for leadership**, not public rankings — none of these endpoints are reachable by plain Members.

### `GET /analytics/organization`
**Permission:** `view_organization_analytics` — scope: `ORGANIZATION`.

**Response `200` (shape):**
```json
{
  "success": true,
  "data": {
    "members": {
      "total": 1284,
      "membershipStatus": { "ACTIVE": 1100, "NEW": 90, "INACTIVE": 60, "TRANSFERRED": 30, "MOVED_AWAY": 4 },
      "baptismStatus": { "BAPTIZED": 900, "NOT_BAPTIZED": 384 },
      "discipleshipStatus": { "NOT_STARTED": 400, "IN_PROGRESS": 600, "COMPLETED": 284 }
    },
    "membersByParish": [ { "parishId": "<id>", "parishName": "Lagos Parish", "total": 620 }, "..." ],
    "activeUnits": 18,
    "prayerRequests": 342,
    "testimonies": 87,
    "biblePlanParticipants": 511
  }
}
```

### `GET /analytics/parishes/compare`
**Permission:** `view_organization_analytics` — scope: `ORGANIZATION`. Returns aggregate-only metrics per parish (no individual pastoral data), sorted by total members descending: `totalMembers`, `activeMembers`, `baptizedMembers`, `inDiscipleship`, `completedDiscipleship`.

### `GET /analytics/parishes/:parishId`
**Permission:** `view_parish_analytics` — scope: covering that parish. Same `members` breakdown shape as the organization endpoint, plus `unitCount` and `prayerCount`, scoped to the one parish.

### `GET /analytics/units/:unitId`
**Permission:** `view_unit_analytics` — scope: covering the unit or its parish.

**Response `200` (shape):**
```json
{
  "success": true,
  "data": {
    "unit": { "id": "<id>", "name": "Media Ministry" },
    "totalMembers": 34,
    "activeMembers": 31,
    "sessionsHeld": 12,
    "attendanceRate": 88
  }
}
```
`attendanceRate` is `null` if no sessions have been held yet.

### `GET /analytics/follow-up?parishId=<id>`
**Permission:** `view_member_analytics` — scope: covering the queried parish (or organization-wide if omitted). Returns **recommendations, never automatic judgments** — pastors decide what to do with these.

**Response `200` (shape):**
```json
{
  "success": true,
  "data": {
    "membersNotAttendingIn4Weeks": { "count": 23, "members": [ "..." ] },
    "newMembersPendingFollowUp": { "count": 14, "members": [ "..." ] },
    "baptizedNotYetDiscipling": { "count": 8, "members": [ "..." ] },
    "prayerRequestsNeedingFollowUp": { "count": 7, "requests": [ "..." ] }
  }
}
```

---

## 13. Health check

### `GET /health`
No authentication required. `{ "success": true, "message": "Flocks API is healthy", "timestamp": "..." }`

---

## 14. Data model quick reference

| Status field | Values |
|---|---|
| `Member.membershipStatus` | `NEW`, `ACTIVE`, `INACTIVE`, `TRANSFERRED`, `MOVED_AWAY`, `DECEASED` |
| `Member.baptismStatus` | `NOT_BAPTIZED`, `BAPTIZED`, `BAPTISM_PENDING` |
| `Member.discipleshipStatus` | `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED` |
| `PrayerRequest.visibility` | `PRIVATE`, `PASTOR_CARE_TEAM`, `CHURCH_WIDE` |
| `PrayerRequest.status` | `SUBMITTED`, `ACTIVE`, `BEING_PRAYED_FOR`, `FOLLOW_UP`, `ANSWERED`, `CONTINUING` |
| `RoleAssignment.role` | `SUPER_ADMIN`, `ADMIN`, `UNIT_ADMIN`, `MEMBER` (MEMBER never has an actual assignment record) |
| `RoleAssignment.scopeType` | `ORGANIZATION`, `PARISH`, `UNIT` |
| `Event.scopeType` | `ORGANIZATION`, `PARISH`, `UNIT`, `ADMIN_ONLY` |

These three Member status fields are always independent — never combined into one field — per the platform's core data model.

---

## 15. Example end-to-end flow

```bash
# 1. Bootstrap a new church + Super Admin
curl -c cookies.txt -X POST http://localhost:5000/api/v1/auth/register-organization \
  -H "Content-Type: application/json" \
  -d '{"organizationName":"Grace Fellowship","adminFirstName":"John","adminLastName":"Doe","adminEmail":"john@gracefellowship.org","password":"SuperSecret123"}'

# 2. Create a second parish (as the Super Admin, using the saved cookies)
curl -b cookies.txt -X POST http://localhost:5000/api/v1/parishes \
  -H "Content-Type: application/json" \
  -d '{"name":"Abuja Parish","city":"Abuja"}'

# 3. Add a member to the new parish
curl -b cookies.txt -X POST http://localhost:5000/api/v1/members \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Jane","lastName":"Smith","primaryParish":"<abujaParishId>"}'

# 4. Start a Sunday attendance session
curl -b cookies.txt -X POST http://localhost:5000/api/v1/attendance/sessions \
  -H "Content-Type: application/json" \
  -d '{"title":"Sunday Service","scheduledStart":"2026-09-27T09:00:00.000Z","parish":"<abujaParishId>"}'
```
