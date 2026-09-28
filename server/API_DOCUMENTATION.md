# Flocks API Documentation

**Version:** MVP Phase 1
**Base URL:** `http://localhost:5000/api/v1` (replace host/port per environment)
**Format:** JSON over HTTPS in production

---

## 1. Conventions

### 1.1 Response envelope

Every response is JSON with a `success` flag.

**Success:**
```json
{
  "success": true,
  "data": { },
  "pagination": { "page": 1, "limit": 25, "total": 132, "pages": 6 }
}
```
`pagination` is only present on paginated list endpoints (currently `GET /members`).

**Error:**
```json
{
  "success": false,
  "message": "You do not have the 'view_members' permission for this resource",
  "details": ["optional array of field-level validation errors"]
}
```

### 1.2 HTTP status codes

| Code | Meaning |
|------|---------|
| 200  | Success |
| 201  | Resource created |
| 400  | Validation error / bad request |
| 401  | Not authenticated (missing/invalid/expired session) |
| 403  | Authenticated but not authorized (permission or scope denied) |
| 404  | Resource not found (or not visible to this tenant) |
| 409  | Conflict (duplicate value, e.g. attendance already marked) |
| 500  | Internal server error |

### 1.3 Authentication

Flocks uses JWT access + refresh tokens delivered as **HTTP-only cookies**:

- `accessToken` — short-lived (default 15 minutes), sent on every request, path `/`.
- `refreshToken` — long-lived (default 30 days), path scoped to `/api/v1/auth`, used only to mint a new access token.

Non-browser clients may instead send `Authorization: Bearer <accessToken>`.

Almost every route (everything except `register-organization`, `login`, `refresh`, `logout`, `forgot-password`, `reset-password`) requires a valid access token. Unauthenticated requests receive `401`.

To refresh an expired access token:
```
POST /auth/refresh
```
(no body needed — reads the `refreshToken` cookie, issues new cookies)

### 1.4 Multi-tenancy

The Church Organization (tenant) a request operates against is **always derived server-side from the authenticated user** — it is never accepted as a client-supplied parameter. This makes cross-organization access structurally impossible: even a user who knows another organization's resource ID cannot reach it, because every query is filtered by the caller's own `organizationId` first.

### 1.5 Authorization model (Role + Permission + Scope)

Every sensitive endpoint checks the caller's active **RoleAssignments** — each one is `{ role, scopeType, scopeId, permissions[] }` where `scopeType` is `ORGANIZATION`, `PARISH`, or `UNIT`.

A request is allowed if the caller has an assignment that:
1. belongs to their own organization, **and**
2. is `SUPER_ADMIN` at `ORGANIZATION` scope (implicitly grants everything), **or**
3. explicitly lists the required permission **and** its scope covers the target resource (an `ORGANIZATION`-scoped grant covers every parish/unit inside it; a `PARISH`-scoped grant covers only that parish and its units; a `UNIT`-scoped grant covers only that unit).

Each endpoint below lists the **Permission** it requires and the **Scope** it's checked against. "Self or Permission" means the endpoint also allows a member to access their own record without any special permission.

Full permission list is in `src/permissions/permissions.js`.

---

## 2. Auth — `/auth`

### `POST /auth/register-organization`
Creates a new Church Organization (tenant), its Main Parish, and a Super Admin User + Member — all in one transaction. This is the only way a Super Admin is created without already being logged in.

**Auth:** none
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
`organizationName`, `adminFirstName`, `adminLastName`, `adminEmail`, `password` (min 8 chars) required. `adminPhone` optional.

**201 Response:**
```json
{
  "success": true,
  "message": "Church organization created successfully",
  "data": {
    "organization": { "id": "...", "name": "Grace Fellowship", "slug": "grace-fellowship" },
    "user": { "id": "...", "email": "john@gracefellowship.org" },
    "accessToken": "eyJ..."
  }
}
```
Sets `accessToken` and `refreshToken` cookies.

---

### `POST /auth/login`
**Auth:** none · **Rate limit:** 20 requests / 15 min per IP
**Body:** `{ "email": "...", "password": "..." }`
**200 Response:** `{ success, data: { user, roleAssignments, accessToken } }`
Sets cookies. After 5 consecutive failed attempts the account is locked for 15 minutes (`403`).

---

### `POST /auth/refresh`
**Auth:** reads `refreshToken` cookie · **Body:** none
**200 Response:** `{ success, data: { accessToken } }` — reissues both cookies.

### `POST /auth/logout`
**Auth:** none required · Clears both cookies. `{ success, message }`

### `GET /auth/me`
**Auth:** required
Returns the current user, their Member profile (if any), and their active `roleAssignments`.

### `POST /auth/forgot-password`
**Auth:** none · **Rate limit:** 20 / 15 min
**Body:** `{ "email": "..." }`
Always responds `200` with a generic message regardless of whether the email exists, to avoid leaking registered emails. (In this MVP the reset token is logged to the server console rather than emailed — wire up a real mail provider before production.)

### `POST /auth/reset-password`
**Auth:** none
**Body:** `{ "token": "...", "password": "newPassword123" }`
`400` if the token is invalid or expired (tokens expire after 1 hour).

### `POST /auth/verify-email`
**Auth:** none
**Body:** `{ "token": "..." }`
A verification email (containing this token as a `?token=` query param pointing at the frontend's `/verify-email` page) is sent automatically on `register-organization`. Tokens expire after 24 hours. `400` if invalid or expired.

### `POST /auth/resend-verification`
**Auth:** required
Re-sends the verification email to the caller's own address. No-ops with a `200` if already verified.

---

## 3. Organizations — `/organizations`

All routes require authentication. Scope for both endpoints is the caller's own organization (`ORGANIZATION` scope only — a Parish/Unit-scoped grant cannot view or edit organization settings).

### `GET /organizations`
**Permission:** `view_organization`
Returns the current organization's full record.

### `PATCH /organizations`
**Permission:** `update_organization`
**Body (any subset):** `name`, `description`, `logoUrl`, `contactEmail`, `contactPhone`, `address`, `timezone`, `settings`
Returns the updated organization. Logged to the audit trail.

---

## 4. Parishes — `/parishes`

### `GET /parishes`
**Permission:** `view_parish` · **Scope:** organization
Lists all active parishes in the organization.

### `POST /parishes`
**Permission:** `create_parish` · **Scope:** organization only (parish creation cannot be delegated to a parish-scoped admin)
**Body:** `{ "name": "Lagos Parish", "address": "...", "city": "...", "state": "...", "country": "...", "contactEmail": "...", "contactPhone": "..." }` (`name` required)

### `GET /parishes/:parishId`
**Permission:** `view_parish` · **Scope:** organization or that specific parish

### `PATCH /parishes/:parishId`
**Permission:** `update_parish` · **Scope:** organization or that specific parish
**Body:** any subset of `name`, `address`, `city`, `state`, `country`, `contactEmail`, `contactPhone`, `isActive`

### `DELETE /parishes/:parishId`
**Permission:** `delete_parish` · **Scope:** organization only
Soft-deletes (sets `isActive: false`). The Main Parish cannot be deleted (`400`).

---

## 5. Admins & Role Assignments — `/admins`

**All routes require Super Admin** (an `ORGANIZATION`-scoped `SUPER_ADMIN` assignment). This is deliberately not delegable through the generic permission system, since it's the mechanism that grants every other permission.

### `POST /admins/role-assignments`
Creates (or reuses) a login for an existing Member and grants them a role. This single endpoint is how a **Parish Admin**, a **Co-Admin** (an Admin with a restricted permission set), and a **Unit Admin** are all created — they are the same underlying model with different `scopeType`/`scopeId`/`permissions`.

**Body:**
```json
{
  "memberId": "665f...",
  "role": "ADMIN",
  "scopeType": "PARISH",
  "scopeId": "665a...",
  "permissions": ["view_members", "manage_prayer_requests", "view_parish_analytics"],
  "password": "OnlyRequiredIfMemberHasNoLoginYet123"
}
```
- `role`: `ADMIN`, `UNIT_ADMIN`, or `SUPER_ADMIN`
- `scopeType`: `ORGANIZATION`, `PARISH`, or `UNIT`; `scopeId` must match a real org/parish/unit id
- `permissions`: array of known permission strings (see §9)
- `password`: only required if the target Member doesn't already have a `User` login (a login is created using their on-file email)

**201 Response:** the created `RoleAssignment`.

### `GET /admins/role-assignments`
**Query params (all optional):** `userId`, `scopeType`, `scopeId`, `status` (`ACTIVE`/`REVOKED`)
Lists role assignments in the organization, newest first.

### `PATCH /admins/role-assignments/:assignmentId/permissions`
**Body:** `{ "permissions": [...] }` — replaces the assignment's permission list wholesale.

### `DELETE /admins/role-assignments/:assignmentId`
Revokes the assignment (`status: "REVOKED"`, records `revokedBy`/`revokedAt`). Assignments are never hard-deleted.

---

## 6. Members — `/members`

### `GET /members`
**Permission:** `view_members` · **Scope:** organization, or the parish given in `parishId`
**Query params:** `parishId`, `membershipStatus`, `baptismStatus`, `discipleshipStatus`, `search` (matches first/last name or email), `page` (default 1), `limit` (default 25, max 100)
**200 Response:** paginated list of members with `primaryParish` populated (name only).

### `POST /members`
**Permission:** `create_member` · **Scope:** organization, or the parish given as `primaryParish`
**Body:**
```json
{
  "firstName": "Jane", "lastName": "Doe", "primaryParish": "665a...",
  "preferredName": "Janey", "gender": "FEMALE", "dateOfBirth": "1990-04-12",
  "phone": "+234...", "email": "jane@example.com", "address": "...",
  "emergencyContact": { "name": "...", "phone": "...", "relationship": "..." },
  "membershipStatus": "NEW"
}
```
`firstName`, `lastName`, `primaryParish` required. Creates the Member, an initial `ParishMembership` record, and a `JOINED_CHURCH` timeline event, in one transaction.

### `GET /members/:memberId`
**Permission:** `view_members` (self or permission) · **Scope:** organization or the member's own parish
A member can always view their own record even without any admin permission.

### `PATCH /members/:memberId`
**Permission:** `update_member` (self or permission) · **Scope:** organization or the member's own parish
**Body (any subset):** `firstName`, `lastName`, `preferredName`, `profilePhotoUrl`, `gender`, `dateOfBirth`, `phone`, `email`, `address`, `emergencyContact`, `isActive`

### `PATCH /members/:memberId/status`
**Permission:** `update_member` · **Scope:** organization or the member's own parish
**Body (any subset):** `membershipStatus`, `baptismStatus`, `discipleshipStatus` — kept as three independent fields, never a single combined status. Each change is recorded as a `MemberEvent` (e.g. `BAPTIZED`, `DISCIPLESHIP_STARTED`, `DISCIPLESHIP_COMPLETED`) for the journey timeline.

Valid values:
- `membershipStatus`: `NEW`, `ACTIVE`, `INACTIVE`, `TRANSFERRED`, `MOVED_AWAY`, `DECEASED`
- `baptismStatus`: `NOT_BAPTIZED`, `BAPTIZED`, `BAPTISM_PENDING`
- `discipleshipStatus`: `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`

### `POST /members/:memberId/transfer`
**Permission:** `transfer_member` · **Scope:** organization or the member's *current* parish
**Body:** `{ "newParishId": "665b...", "transferReason": "Relocated to Abuja" }` (`newParishId` required)
Closes out the current `ParishMembership` (sets `leftAt`), opens a new one for the target parish, updates `Member.primaryParish`, sets `membershipStatus: TRANSFERRED`, and logs a `PARISH_TRANSFER` event — history is preserved, never overwritten.

### `GET /members/:memberId/history`
**Permission:** `view_member_history` (self or permission) · **Scope:** organization or the member's own parish
**200 Response:** `{ events: [MemberEvent...], parishHistory: [ParishMembership...] }`, both newest-first.

---

## 7. Units — `/units`

Units are **private by default**: only unit members, unit admins, and authorized parish/org admins can see their content.

### `GET /units`
**Permission:** `view_members` · **Scope:** organization, or the parish given in `parishId`
**Query:** `parishId` (optional filter)

### `POST /units`
**Permission:** `create_unit` · **Scope:** organization, or the parish given as `parish`
**Body:** `{ "name": "Media Ministry", "parish": "665a...", "description": "...", "category": "MEDIA", "isPrivate": true }`
`name` and `parish` required. `category` ∈ `CHOIR, MEDIA, PROTOCOL, USHERING, YOUTH, CHILDREN, PRAYER, EVANGELISM, MENS_FELLOWSHIP, WOMENS_FELLOWSHIP, OTHER`.

### `GET /units/:unitId`
**Permission:** `view_members` · **Scope:** organization, the unit's parish, or the unit itself

### `PATCH /units/:unitId`
**Permission:** `update_unit` · **Scope:** organization, the unit's parish, or the unit itself
**Body (any subset):** `name`, `description`, `category`, `isPrivate`, `isActive`

### `DELETE /units/:unitId`
**Permission:** `delete_unit` · **Scope:** organization, the unit's parish, or the unit itself
Soft-deletes (`isActive: false`).

### `GET /units/:unitId/members`
**Permission:** `manage_unit_members` · **Scope:** organization, the unit's parish, or the unit itself
Lists active `UnitMembership` records with the member's name/photo populated.

### `POST /units/:unitId/members`
**Permission:** `manage_unit_members` · same scope rule
**Body:** `{ "memberId": "665f..." }`
Adds (or reactivates) the member's unit membership and logs a `JOINED_UNIT` event.

### `DELETE /units/:unitId/members/:memberId`
**Permission:** `manage_unit_members` · same scope rule
Deactivates the membership (`leftAt` set) and logs a `LEFT_UNIT` event.

### `POST /units/:unitId/admins`
**Permission:** `manage_unit_admins` · **Scope:** organization, the unit's parish, or the unit itself
**Body:** `{ "memberId": "665f...", "permissions": ["optional", "override", "array"] }`
Promotes the member to Unit Admin: marks their `UnitMembership.isUnitAdmin = true` and grants a `UNIT_ADMIN` RoleAssignment scoped to this unit (default permission set if `permissions` omitted — see §9). The target member **must already have a User login** (create one first via `POST /admins/role-assignments`, or any prior admin action that gave them a login).

---

## 8. Bible — `/bible`

### `GET /bible/verses/current`
**Auth:** any authenticated user, no special permission
Returns the currently-active Verse of the Day/Week/Year: `{ daily, weekly, yearly }` (each `null` if none is currently set).

### `POST /bible/verses`
**Permission:** `set_daily_verse` · **Scope:** organization only (Super Admin configures these org-wide)
**Body:** `{ "type": "DAILY", "reference": "Romans 8:28", "text": "...", "translation": "KJV", "startDate": "2026-09-23" }`
`type` ∈ `DAILY | WEEKLY | YEARLY`; `reference` and `text` required. `startDate` defaults to now; the end date is computed automatically (+1 day / +7 days / +1 year).

### `GET /bible/plans`
**Query:** `published` (`true`/`false`, optional filter)
Lists Bible reading plans in the organization.

### `GET /bible/plans/mine`
Returns the caller's own `BibleReading` progress records (requires a Member profile), each annotated with `completionPercentage`.

### `GET /bible/plans/:planId`
Returns a single plan, including its `dailyReadings` array.

### `POST /bible/plans`
**Permission:** `create_bible_plan` · **Scope:** organization, or the parish given as `parish` (omit `parish` for an organization-wide plan)
**Body:**
```json
{
  "title": "365-Day Bible Reading",
  "description": "...",
  "planType": "THREE_SIXTY_FIVE_DAY",
  "startDate": "2026-01-01",
  "endDate": "2026-12-31",
  "parish": null,
  "dailyReadings": [
    { "day": 1, "references": ["Genesis 1-2"], "title": "In the Beginning" }
  ]
}
```
`title`, `startDate`, `endDate`, and a non-empty `dailyReadings` array are required. `planType` ∈ `SEVEN_DAY, FOURTEEN_DAY, THIRTY_DAY, NINETY_DAY, ONE_EIGHTY_DAY, THREE_SIXTY_FIVE_DAY, CUSTOM`. Plans are created unpublished.

### `POST /bible/plans/:planId/publish`
**Permission:** `publish_bible_plan` · **Scope:** organization only
Sets `isPublished: true`. Members can only join a published plan.

### `POST /bible/plans/:planId/join`
Joins the caller (their Member profile) to a published plan. Idempotent — returns the existing progress record if already joined.

### `POST /bible/plans/:planId/progress`
**Body:** `{ "day": 3, "note": "optional personal note" }`
Marks a day complete, updates the reading streak (a day counts as consecutive if the last read was ≤ 1.5 days ago), and appends a note if provided. Returns the updated progress with `completionPercentage`.

---

## 9. Prayer — `/prayers`

Prayer requests are pastorally sensitive; visibility is enforced both in the query filter and, for single-record reads, again explicitly in the controller.

### `POST /prayers`
**Auth:** any member (requires a Member profile)
**Body:** `{ "title": "...", "description": "...", "category": "HEALTH", "visibility": "PRIVATE" }`
`title`, `description` required. `category` ∈ `HEALTH, FAMILY, CAREER, FINANCE, SPIRITUAL, MARRIAGE, CHILDREN, THANKSGIVING, OTHER` (default `OTHER`). `visibility` ∈ `PRIVATE, PASTOR_CARE_TEAM, CHURCH_WIDE` (default `PRIVATE` — the member always explicitly controls this).

### `GET /prayers`
**Auth:** any authenticated user; no fixed permission — visibility is computed per-request:
- the caller's **own** requests, plus
- any **CHURCH_WIDE** request in the organization, plus
- if the caller holds `view_prayer_requests` for the relevant parish, **all** requests (any visibility) in that parish.

**Query:** `parishId`, `status`

### `GET /prayers/:requestId`
Same visibility rule as above, applied to a single record; otherwise `403`.

### `PATCH /prayers/:requestId/status`
**Permission:** `manage_prayer_requests` · **Scope:** organization or the request's parish
**Body:** `{ "status": "BEING_PRAYED_FOR" }`
Lifecycle: `SUBMITTED → ACTIVE → BEING_PRAYED_FOR → FOLLOW_UP → ANSWERED | CONTINUING`.

### `PATCH /prayers/:requestId/assign`
**Permission:** `assign_prayer_request` · **Scope:** organization or the request's parish
**Body:** `{ "userId": "665c..." }` — assigns the request to a care worker.

### `POST /prayers/:requestId/testimony`
**Auth:** only the member who submitted the original request
**Body:** `{ "testimony": "I received the job!", "isPublicallyShareable": false }`
Creates a `PrayerTestimony` and sets the parent request's status to `ANSWERED`. `isPublicallyShareable` is the member's own opt-in for any future public testimony wall.

### `GET /prayers/testimonies`
**Permission:** `view_testimonies` · **Scope:** organization, or the parish given in `parishId`
**Query:** `parishId`

### `PATCH /prayers/testimonies/:testimonyId/moderate`
**Permission:** `moderate_testimonies` · **Scope:** organization only
**Body:** `{ "moderationStatus": "APPROVED" }` (`APPROVED` or `REJECTED`)

---

## 10. Attendance — `/attendance`

Uses **dynamic, expiring, session-specific QR tokens**: never a static/reusable code. One attendance record per member per session is enforced at the database level.

### `POST /attendance/sessions`
**Permission:** `create_attendance_session` · **Scope:** organization, the parish given as `parish`, or the unit given as `unit`
**Body:**
```json
{
  "title": "Sunday Service", "scheduledStart": "2026-09-27T08:00:00.000Z",
  "scheduledEnd": "2026-09-27T10:00:00.000Z",
  "parish": "665a...", "unit": null, "event": null,
  "location": { "latitude": 9.05, "longitude": 7.49, "radiusMeters": 150 }
}
```
`title`, `scheduledStart` required. `location.radiusMeters` is optional geofencing — if set, `POST /sessions/:id/mark` rejects check-ins outside that radius.
**201 Response:** `{ session, token, qrDataUrl, expiresAt }` — `qrDataUrl` is a ready-to-display base64 PNG QR code encoding `{ sessionId, token }`. Default expiry is 5 minutes (`ATTENDANCE_QR_TTL_SECONDS`).

### `POST /attendance/sessions/:sessionId/rotate`
**Permission:** `create_attendance_session` · **Scope:** organization only
Issues a fresh token/QR for a still-open session (call this on an interval from the projector/display client to keep the code "dynamic" through the length of a service). Returns `{ token, qrDataUrl, expiresAt }`.

### `POST /attendance/sessions/:sessionId/close`
**Permission:** `edit_attendance` · **Scope:** organization only
Sets `isClosed: true` — no further check-ins accepted for this session.

### `GET /attendance/sessions`
**Permission:** `view_attendance` · **Scope:** organization, or the parish/unit given in `parishId`/`unitId`
**Query:** `parishId`, `unitId` — returns the 100 most recent sessions.

### `GET /attendance/sessions/:sessionId/records`
**Permission:** `view_attendance` · **Scope:** organization only
Lists all `AttendanceRecord`s for the session with member names populated.

### `POST /attendance/sessions/:sessionId/mark`
**Auth:** any member, scans the displayed QR (requires a Member profile)
**Body:** `{ "token": "the-scanned-token", "location": { "latitude": 9.05, "longitude": 7.49 } }`
`token` required. Fails with `400` if the session is closed, the token is expired or wrong, or (when geofencing is configured) the supplied location is outside the allowed radius. Fails with `409` if this member already has a record for this session.

### `POST /attendance/sessions/:sessionId/mark-manual`
**Permission:** `edit_attendance` · **Scope:** organization only
**Body:** `{ "memberId": "665f..." }`
Admin correction path — upserts a `MANUAL` attendance record for the given member, marked `isCorrection: true`.

---

## 11. Notifications — `/notifications`

In-app notifications for the caller's own Member profile.

### `GET /notifications`
**Auth:** required (needs a Member profile)
**Query:** `unreadOnly` (`true`/`false`)
**200 Response:** `{ success, data: [Notification...], meta: { unreadCount } }`, newest first, capped at 50.

### `PATCH /notifications/:notificationId/read`
Marks a single notification as read (only if it belongs to the caller).

### `PATCH /notifications/read-all`
Marks every unread notification belonging to the caller as read.

---

## 12. Events / Calendar — `/events`

### `GET /events`
**Auth:** any authenticated user; visibility is computed per-request based on event `scopeType`:
- `ORGANIZATION` events: visible to everyone in the org
- `PARISH` events: visible org-wide unless a `parishId` filter narrows it (refine as your frontend needs)
- `UNIT` events: visible only if the caller belongs to that unit
- `ADMIN_ONLY` events: visible only if the caller holds at least one active RoleAssignment (i.e., is some kind of admin)

**Query:** `from`, `to` (ISO date bounds on `startsAt`), `parishId`, `unitId`

### `POST /events`
**Permission:** `create_event` · **Scope:** organization, or the parish/unit given as `parish`/`unit`
**Body:**
```json
{
  "title": "Sunday Service", "description": "...", "type": "SUNDAY_SERVICE",
  "scopeType": "PARISH", "parish": "665a...", "unit": null,
  "startsAt": "2026-09-27T08:00:00.000Z", "endsAt": "2026-09-27T10:00:00.000Z",
  "location": "Main Auditorium", "createsAttendanceSession": false
}
```
`title`, `startsAt`, `scopeType` required. `scopeType` ∈ `ORGANIZATION, PARISH, UNIT, ADMIN_ONLY` (`parish` required if `PARISH`, `unit` required if `UNIT`). `type` ∈ `SUNDAY_SERVICE, BIBLE_STUDY, PRAYER_MEETING, UNIT_MEETING, SMALL_GROUP, OUTREACH, CONFERENCE, DISCIPLESHIP_CLASS, LEADERSHIP_MEETING, SPECIAL_EVENT`.

### `PATCH /events/:eventId`
**Permission:** `update_event` · **Scope:** organization only
**Body (any subset):** `title`, `description`, `type`, `startsAt`, `endsAt`, `location`, `isActive`

### `DELETE /events/:eventId`
**Permission:** `delete_event` · **Scope:** organization only
Soft-deletes (`isActive: false`).

---

## 13. Analytics — `/analytics`

Analytics are **pastoral indicators for leadership decision-making, not public rankings of members**, per product principle.

### `GET /analytics/organization`
**Permission:** `view_organization_analytics` · **Scope:** organization only
Returns member counts broken down by membership/baptism/discipleship status, members-by-parish, active unit count, prayer request count, testimony count, and Bible plan participant count.

### `GET /analytics/parishes/compare`
**Permission:** `view_organization_analytics` · **Scope:** organization only
Aggregate-only comparison across parishes (total/active/baptized members, discipleship counts) — deliberately excludes any individual pastoral information.

### `GET /analytics/parishes/:parishId`
**Permission:** `view_parish_analytics` · **Scope:** organization or that specific parish
Same status breakdown as the org dashboard, scoped to one parish, plus its unit count and open prayer-request count.

### `GET /analytics/units/:unitId`
**Permission:** `view_unit_analytics` · **Scope:** organization, the unit's parish, or the unit itself
Returns total/active member counts, sessions held, and a computed attendance rate.

### `GET /analytics/follow-up`
**Permission:** `view_member_analytics` · **Scope:** organization, or the parish given in `parishId`
**Query:** `parishId` (optional)
Returns four recommendation buckets — **recommendations, never automatic judgments**:
- `membersNotAttendingIn4Weeks`
- `newMembersPendingFollowUp` (status `NEW`)
- `baptizedNotYetDiscipling` (baptized, but discipleship `NOT_STARTED`)
- `prayerRequestsNeedingFollowUp` (unassigned, still `SUBMITTED`/`ACTIVE`)

---

## 14. Permission Reference

Full constants live in `src/permissions/permissions.js`. Grouped for reference:

| Group | Permissions |
|---|---|
| Organization / Parish | `view_organization`, `update_organization`, `create_parish`, `update_parish`, `delete_parish`, `view_parish`, `manage_parish_admins` |
| Members | `view_members`, `create_member`, `update_member`, `delete_member`, `view_member_history`, `transfer_member` |
| Units | `create_unit`, `update_unit`, `delete_unit`, `manage_unit_members`, `manage_unit_admins`, `view_unit_analytics` |
| Bible | `create_bible_plan`, `update_bible_plan`, `publish_bible_plan`, `set_daily_verse`, `set_weekly_verse`, `set_yearly_verse` |
| Prayer | `view_prayer_requests`, `manage_prayer_requests`, `assign_prayer_request`, `view_testimonies`, `moderate_testimonies` |
| Attendance | `create_attendance_session`, `view_attendance`, `edit_attendance`, `view_attendance_analytics` |
| Analytics | `view_organization_analytics`, `view_parish_analytics`, `view_unit_analytics`, `view_member_analytics` |
| Administration | `manage_admins`, `manage_roles`, `manage_permissions`, `manage_church_settings` |
| Calendar | `create_event`, `update_event`, `delete_event`, `view_events` |

**Roles:** `SUPER_ADMIN`, `ADMIN`, `UNIT_ADMIN`, `MEMBER`. `MEMBER` never gets a RoleAssignment — regular members act through the "self" checks on their own endpoints (e.g. viewing/editing their own profile, submitting their own prayer requests) rather than through granted permissions.

**Default Parish Admin permission set** (used as a starting point when creating a Parish Admin — customizable per assignment): `view_parish`, `view_members`, `create_member`, `update_member`, `view_member_history`, `transfer_member`, `create_unit`, `update_unit`, `manage_unit_members`, `manage_unit_admins`, `view_unit_analytics`, `view_prayer_requests`, `manage_prayer_requests`, `assign_prayer_request`, `view_testimonies`, `moderate_testimonies`, `create_attendance_session`, `view_attendance`, `edit_attendance`, `view_attendance_analytics`, `view_parish_analytics`, `view_member_analytics`, `create_event`, `update_event`, `delete_event`, `view_events`, `create_bible_plan`, `update_bible_plan`, `publish_bible_plan`.

**Default Unit Admin permission set:** `manage_unit_members`, `view_unit_analytics`, `view_attendance`, `create_attendance_session`, `edit_attendance`, `create_event`, `update_event`, `view_events`.

---

## 15. Example: end-to-end flow

```bash
# 1. Create the organization + Super Admin
curl -s -c cookies.txt -X POST http://localhost:5000/api/v1/auth/register-organization \
  -H "Content-Type: application/json" \
  -d '{"organizationName":"Grace Fellowship","adminFirstName":"John","adminLastName":"Doe","adminEmail":"john@grace.org","password":"SuperSecret123"}'

# 2. Create a second parish
curl -s -b cookies.txt -X POST http://localhost:5000/api/v1/parishes \
  -H "Content-Type: application/json" \
  -d '{"name":"Abuja Parish","city":"Abuja"}'

# 3. Add a member to that parish
curl -s -b cookies.txt -X POST http://localhost:5000/api/v1/members \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Jane","lastName":"Doe","primaryParish":"<abujaParishId>"}'

# 4. Open a Sunday attendance session
curl -s -b cookies.txt -X POST http://localhost:5000/api/v1/attendance/sessions \
  -H "Content-Type: application/json" \
  -d '{"title":"Sunday Service","scheduledStart":"2026-09-27T08:00:00.000Z","parish":"<abujaParishId>"}'

# 5. View the organization dashboard
curl -s -b cookies.txt http://localhost:5000/api/v1/analytics/organization
```

---

## 16. Not yet implemented (Phase 2 / 3, per PRD)

Scripture discussions & replies, in-app messaging between members, push notifications (in-app notifications and email are implemented; push is not), discipleship programs as a first-class module beyond the status field, testimony wall, AI church intelligence, sermon processing, volunteer management, small groups, giving/finance, and background job scheduling (reminders, weekly reports) are intentionally out of scope for this MVP Phase 1 delivery.
