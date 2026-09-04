# Flocks --- Product Requirements Document (PRD)

**Version:** 2.0 **Status:** Development Ready --- Multi-Parish
Architecture **Product Type:** Church Community, Discipleship, Pastoral
Care & Administration Platform **Primary Stack:** JavaScript, Node.js,
Express.js, MongoDB, Next.js **Frontend:** Next.js + JavaScript
**Backend:** Node.js + Express.js **Database:** MongoDB + Mongoose
**Authentication:** JWT + secure HTTP-only cookies **Deployment:**
Vercel (Frontend) + Railway/Render/AWS (Backend & Database as
appropriate)

---

# 1. Product Overview

Flocks is a multi-purpose church platform designed to help churches
manage their members, units, attendance, Bible engagement, prayer
requests, discipleship, communication, events, pastoral care, and
church-wide analytics from a single platform.

Unlike traditional church management software that focuses primarily on
administrative records, Flocks is designed around the **member
journey**.

The platform should help church leadership answer:

- Who are our members?
- Who is new?
- Who has been baptized?
- Who has been discipled?
- Who needs follow-up?
- Who is actively participating?
- Which members are becoming disengaged?
- Which units are healthy?
- Which units need attention?
- What is happening with attendance?
- What are members praying about?
- Which prayers have resulted in testimonies?
- How engaged are members with Scripture?
- What activities are happening across the church?
- What areas of the church need pastoral attention?

The core philosophy is:

> **Know the flock. Care for the flock. Grow the flock.**

---

# 2. Product Vision

To build a digital platform that helps churches move from simply
**managing members** to **understanding, caring for, discipling, and
growing people**.

---

# 3. Product Goals

## Primary Goals

1.  Provide centralized church member management.
2.  Provide secure role-based administration.
3.  Provide private communication spaces for church units.
4.  Facilitate Bible reading and Scripture engagement.
5.  Provide structured prayer-request and testimony management.
6.  Track attendance.
7.  Provide church, unit, and member analytics.
8.  Provide church and unit calendars.
9.  Track member spiritual and church journey.
10. Help pastors identify members who may need follow-up.
11. Track baptism and discipleship progression.
12. Provide a foundation for future AI-powered church intelligence.

---

# 4. Target Users

Flocks supports churches ranging from a single-parish church to a large
multi-parish church organization.

The organizational hierarchy is:

```text
Flocks Platform
    ↓
Church Organization (Tenant)
    ↓
Parish
    ↓
Unit
    ↓
Member
```

A **Church Organization** is the tenant and represents the overall
church organization. A Parish is a location, branch, congregation, or
operational subdivision within that church organization.

A single-parish church simply has one Parish, so the same architecture
works without forcing unnecessary complexity on smaller churches.

## 4.1 Super Admin

Normally the most senior pastor, general overseer, or highest-authority
church leader.

The Super Admin has organization-wide control and can coordinate all
parishes.

Responsibilities include:

- Church organization settings
- Parish creation and management
- Organization administrators
- Permissions
- Members across all parishes
- Units
- Bible content
- Church-wide announcements
- Attendance
- Organization and parish analytics
- Calendar
- Prayer management
- Discipleship
- System configuration

The Super Admin should be able to switch between parishes and view
organization-wide information.

---

## 4.2 Admin

An Admin is a trusted church leader whose access is determined by:

**Role + Permission + Scope**

An Admin may operate at:

- Organization scope
- Parish scope
- Specific functional scope where applicable

Example:

```text
Pastor John

Role:
ADMIN

Permissions:
- view_members
- manage_prayer_requests
- view_analytics

Scope:
Parish A
```

Pastor John therefore manages the permitted functions within Parish A
without automatically accessing Parish B.

---

## 4.3 Co-Admin

A Co-Admin is not a separate security model. It is an Admin with a
restricted permission set and defined scope.

For example:

```text
Role: ADMIN
Scope: Parish A
Permissions:
- view_members
- manage_events
- view_attendance
```

This keeps the permission system flexible instead of creating many rigid
roles.

---

## 4.4 Parish Admin

A Parish Admin is an administrator assigned to a specific parish.

A Parish Admin may be:

- Parish pastor
- Assistant pastor
- Parish administrator
- Parish coordinator
- Other authorized parish leader

Their access is restricted to the assigned parish unless they have
additional organization-level permissions.

---

## 4.5 Unit Admin

Responsible for one or more units within a parish.

Examples:

- Choir leader
- Media head
- Youth leader
- Protocol head
- Ushering head

Unit Admins only access information belonging to their assigned unit
unless explicitly granted additional permissions.

---

## 4.6 Member

Regular church member.

Can:

- Manage personal profile
- View permitted church content
- Read Bible plans
- Participate in Scripture discussions
- Submit prayer requests
- Add testimonies
- View permitted events
- Mark attendance
- Participate in assigned units
- Receive notifications
- Participate in permitted discussions

A member belongs to a Church Organization and has a current parish
assignment. Parish history must be preserved when a member transfers
between parishes.

# 5. Permission Architecture

Flocks must use granular Role-Based Access Control (RBAC) combined with
scope-based authorization.

Permissions should not be hard-coded directly into UI components.

## Permission Model

```text
User
  ↓
Role Assignment
  ↓
Permissions
  ↓
Scope
```

A role assignment contains:

- User
- Role
- Scope type
- Scope ID
- Granted permissions
- Status
- Created by
- Created date

## Scope Types

```text
ORGANIZATION
PARISH
UNIT
```

Future scope types may be introduced if required.

## Example

```text
User:
John

Role:
ADMIN

Permissions:
manage_prayer_requests
view_members
view_analytics

Scope:
PARISH
Parish A
```

The authorization layer must verify both the permission and the resource
scope.

## Core Authorization Rules

### Organization Scope

Organization-level administrators may access authorized data across all
parishes in the organization.

### Parish Scope

Parish administrators may access only authorized resources belonging to
their parish.

### Unit Scope

Unit administrators may access only authorized resources belonging to
their assigned unit.

### Member Scope

Members may access their own personal data and content explicitly made
available to them.

## Tenant Isolation

Every authenticated request must resolve the user's Church Organization
before accessing tenant-scoped data.

The server must reject cross-organization access even if a user knows
another organization's resource ID.

## Example Permissions

### Organization / Parish

- `view_organization`
- `update_organization`
- `create_parish`
- `update_parish`
- `delete_parish`
- `view_parish`
- `manage_parish_admins`

### Members

- `view_members`
- `create_member`
- `update_member`
- `delete_member`
- `view_member_history`
- `transfer_member`

### Units

- `create_unit`
- `update_unit`
- `delete_unit`
- `manage_unit_members`
- `manage_unit_admins`
- `view_unit_analytics`

### Bible

- `create_bible_plan`
- `update_bible_plan`
- `publish_bible_plan`
- `set_daily_verse`
- `set_weekly_verse`
- `set_yearly_verse`

### Prayer

- `view_prayer_requests`
- `manage_prayer_requests`
- `assign_prayer_request`
- `view_testimonies`
- `moderate_testimonies`

### Attendance

- `create_attendance_session`
- `view_attendance`
- `edit_attendance`
- `view_attendance_analytics`

### Analytics

- `view_organization_analytics`
- `view_parish_analytics`
- `view_unit_analytics`
- `view_member_analytics`

### Administration

- `manage_admins`
- `manage_roles`
- `manage_permissions`
- `manage_church_settings`

All sensitive authorization must be enforced server-side.

# 6. Member Management

Member management is the central foundation of Flocks.

Each member belongs to one Church Organization and has a current parish
assignment.

## Member Identity

A member should have one durable identity within a Church Organization.

A member record should not be duplicated simply because the member
transfers from one parish to another.

Core organizational fields:

- `organizationId`
- `primaryParishId`
- Membership status
- Baptism status
- Discipleship status

Parish membership history should be stored separately so transfers do
not destroy historical information.

## Personal Information

- First name
- Last name
- Preferred name
- Profile photo
- Gender
- Date of birth
- Phone
- Email
- Address
- Emergency contact

Only collect information that the church actually needs.

## Parish Membership

A member may have:

- Current parish
- Previous parishes
- Parish join date
- Parish transfer date
- Transfer reason where appropriate

Example:

```text
Member: John Doe

Church Organization: Grace Fellowship

Current Parish:
Lagos Parish

Previous Parish:
Ibadan Parish

Transferred:
August 2026
```

Historical records such as attendance, member events, discipleship
activity, and prayer records must remain associated with the context in
which they occurred.

# 7. Member Status System

Do NOT use one single status field for everything.

Membership status and spiritual/discipleship status must be separated.

## Membership Status

Possible values:

- `NEW`
- `ACTIVE`
- `INACTIVE`
- `TRANSFERRED`
- `MOVED_AWAY`
- `DECEASED`

## Baptism Status

- `NOT_BAPTIZED`
- `BAPTIZED`

Optional future status:

- `BAPTISM_PENDING`

## Discipleship Status

- `NOT_STARTED`
- `IN_PROGRESS`
- `COMPLETED`

This allows combinations such as:

```text
Active
+
Baptized
+
Discipleship In Progress
```

or:

```text
New
+
Not Baptized
+
Discipleship Not Started
```

---

# 8. Member Journey

Flocks should maintain a chronological history of significant member
events.

Example:

```text
March 1
Joined Church

March 15
New Member

April 2
Baptized

April 10
Started Discipleship

June 20
Completed Discipleship Level 1

July 3
Joined Media Unit
```

Member events should be stored rather than simply overwriting previous
values.

This enables historical analytics.

---

# 9. Family Relationships

Members may be connected to family members.

Possible relationships:

- Spouse
- Parent
- Child
- Sibling
- Guardian

The system should allow authorized administrators to view relevant
family relationships.

---

# 10. Units

Units are private church communities belonging to a Parish.

Examples:

- Choir
- Media
- Protocol
- Ushering
- Youth
- Children's Ministry
- Prayer
- Evangelism
- Men's Fellowship
- Women's Fellowship

Each unit belongs to exactly one Parish.

## Unit Privacy

A unit is closed by default.

Only:

- Unit members
- Assigned Unit Admins
- Authorized Parish administrators
- Authorized organization-level administrators
- Super Admin

can access the unit's private content.

Members from other units or other parishes cannot access private unit
discussions.

All unit resources must be checked against both:

1.  Church Organization
2.  Parish
3.  Unit

The backend must enforce these boundaries on every relevant request.

# 11. Unit Features

Each unit should have:

- Unit profile
- Members
- Unit admins
- Private discussion
- Announcements
- Unit calendar
- Unit attendance
- Unit files
- Unit analytics

---

# 12. Bible Reading Plans

Flocks should provide structured Bible reading plans.

## Plan Types

- 7-day
- 14-day
- 30-day
- 90-day
- 180-day
- 365-day
- Custom

## Plan Features

- Plan title
- Description
- Start date
- End date
- Bible references
- Daily reading
- Progress tracking
- Completion percentage
- Reading streak
- Personal notes

Members can join available plans.

---

# 13. Daily, Weekly & Yearly Bible Verse

The Super Admin can configure:

### Verse of the Day

Changes daily.

### Verse of the Week

Changes weekly.

### Verse of the Year

Church-wide annual Scripture.

The home dashboard should prominently display the current verse.

---

# 14. Scripture Interaction

Each featured Scripture may have an associated discussion.

Example:

```text
Romans 12:2

Question:
"What does renewing your mind look like
in your everyday life?"
```

Members can:

- Respond
- Reply to responses
- Like/react where appropriate
- Report inappropriate content

Authorized pastors/admins can:

- Moderate responses
- Delete inappropriate responses
- Pin responses
- Post an official response

---

# 15. Prayer Requests

Members can submit prayer requests.

Fields:

- Title
- Description
- Category
- Visibility
- Created date
- Status

## Categories

Examples:

- Health
- Family
- Career
- Finance
- Spiritual
- Marriage
- Children
- Thanksgiving
- Other

## Visibility

Prayer requests should support:

- Private
- Pastor/Care Team
- Church-wide

The user must explicitly control whether a request is public.

---

# 16. Prayer Request Lifecycle

```text
Submitted
   ↓
Active
   ↓
Being Prayed For
   ↓
Follow-up
   ↓
Answered / Continuing
```

Administrators can assign requests to authorized care workers.

---

# 17. Prayer Testimonies

Every prayer request should have the option to record an
outcome/testimony.

Example:

```text
Prayer Request

"Please pray for my job interview."

↓

Testimony

"I received the job."
```

This creates the relationship:

```text
Prayer → Prayer → Answer → Testimony
```

The member controls whether the testimony can be shared publicly.

---

# 18. Testimony Wall

Future feature.

Approved testimonies can appear on a church-wide testimony feed.

Administrators should moderate testimonies before public publication.

---

# 19. Attendance

Attendance should support multiple methods eventually.

## MVP: Dynamic QR Code

The Super Admin or authorized admin creates an attendance session.

Example:

```text
Sunday Service
September 6, 2026
9:00 AM

[Dynamic QR Code]

Expires in 5 minutes
```

The QR code should:

- Be generated for a specific event/session
- Belong to the relevant Parish or organization-wide event
- Expire
- Be difficult to reuse outside the service
- Be associated with the member
- Prevent duplicate attendance

Attendance record:

```text
Member
Service
Date
Time
Method
Session
```

---

# 20. Attendance Security

A static QR code should NOT be used as the permanent attendance
mechanism.

MVP security:

1.  Dynamic QR code
2.  Short expiration
3.  Session-specific token
4.  One attendance record per member/session
5.  Optional location validation
6.  Admin correction capability

Future options:

- NFC
- Bluetooth
- Church Wi-Fi verification
- Kiosk
- Manual attendance
- Member lookup

---

# 21. Attendance Analytics

Track:

- Total attendance
- Attendance percentage
- Weekly trends
- Monthly trends
- Member consistency
- Unit consistency
- Service attendance
- New-member attendance

---

# 22. Member Consistency

The system should calculate participation patterns.

Examples:

```text
Highly Consistent
Consistent
Moderately Consistent
Needs Follow-up
```

Consistency can consider:

- Attendance
- Bible reading
- Unit participation
- Discipleship participation
- Church activity

This should be used as a **pastoral indicator**, not as a public
ranking.

---

# 23. Unit Analytics

For each unit:

- Total members
- Active members
- Attendance
- Participation
- Growth
- Engagement
- Activity
- Member consistency

Example:

```text
MEDIA UNIT

Members: 34

Attendance: 91%

Active Members: 31

Needs Follow-up: 3

Engagement: 86%

Health Score: 88%
```

---

# 24. Church Organization & Parish Analytics Dashboards

Flocks analytics must follow the organizational hierarchy.

```text
Organization
    ↓
Parish
    ↓
Unit
    ↓
Member
```

## Organization Dashboard

The Super Admin should see:

- Total members
- Members by parish
- Active members
- New members
- Inactive members
- Transferred members
- Baptized members
- Members not baptized
- Discipled members
- Members in discipleship
- Members not yet discipled
- Organization-wide attendance
- Attendance by parish
- Active units
- Prayer requests
- Testimonies
- Bible plan participation
- Parish engagement
- Follow-up indicators

## Parish Dashboard

A Parish Admin should see the same categories limited to the assigned
parish.

## Parish Comparison

The Super Admin may compare parishes using appropriate aggregate
metrics, such as:

- Membership growth
- Attendance
- Bible engagement
- Discipleship progression
- Unit participation
- Follow-up workload

Individual sensitive pastoral information must not be exposed merely
because aggregate parish comparison is available.

## Member-Level Analytics

Authorized administrators may drill down from:

```text
Organization
    ↓
Parish
    ↓
Unit
    ↓
Member
```

All drill-down operations must respect the user's permission scope.

# 25. Analytics Filters

Administrators should be able to filter analytics by:

- Date
- Unit
- Member status
- Baptism status
- Discipleship status
- Age range
- Gender
- Attendance
- Activity

---

# 26. Follow-Up Intelligence

The system should identify potential follow-up cases.

Examples:

```text
⚠ 23 members haven't attended
in 4 weeks.

⚠ 14 new members haven't completed
new-member follow-up.

⚠ 8 baptized members haven't started
discipleship.

⚠ 7 prayer requests haven't received
follow-up.
```

These are **recommendations**, not automatic judgments.

---

# 27. Calendar

Flocks should have a centralized calendar with hierarchical visibility.

## Event Scope

Events can belong to:

- Organization
- Parish
- Unit
- Group
- Admin-only scope

## Event Types

- Sunday service
- Bible study
- Prayer meeting
- Unit meeting
- Small group
- Outreach
- Conference
- Discipleship class
- Leadership meeting
- Special event

## Visibility Rules

### Organization Event

Visible to permitted members across the organization.

### Parish Event

Visible to permitted members of that parish.

### Unit Event

Visible only to permitted members of that unit.

### Admin-Only Event

Visible only to authorized administrators.

A user must never gain access to an event simply by knowing its ID.

# 28. Calendar Integration

An event can connect to other Flocks features.

Example:

```text
Sunday Service
     │
     ├── Attendance Session
     ├── Bible Verse
     ├── Sermon
     └── Notifications
```

Unit meeting:

```text
Media Meeting
     │
     ├── Unit Calendar
     ├── Unit Members
     ├── Attendance
     └── Unit Announcement
```

---

# 29. Church Feed

The member's home page should aggregate relevant information.

Example:

```text
Good Morning, Vincent

Verse of the Day
Romans 8:28

Bible Reading
Day 42 / 365

Upcoming
Sunday Service — 9:00 AM

Prayer
Your active prayer requests: 2

Bible Discussion
Today's question — 23 responses

Your Units
Media Ministry

Your Journey
Discipleship Level 1 — 67%
```

---

# 30. Notifications

Notifications should support:

- New church announcement
- Unit announcement
- Prayer update
- Event reminder
- Bible reading reminder
- Discipleship reminder
- Follow-up assignment
- Attendance reminder

Channels:

- In-app
- Email
- Push notification

SMS/WhatsApp can be considered later.

---

# 31. Communication

Communication should be permission-based.

Possible communication spaces:

```text
Church-wide
    ↓
Units
    ↓
Groups
    ↓
Individual/Pastoral
```

Private conversations should not be visible to unauthorized
administrators.

---

# 32. Admin Dashboard

Administrators should see information appropriate to their permissions
and scope.

## Super Admin

```text
Organization Overview
Parish Overview
Today's Events
Attendance
Prayer Requests
Follow-ups
Unit Activity
Member Activity
Notifications
```

## Parish Admin

```text
Parish Overview
Today's Events
Parish Attendance
Prayer Requests
Follow-ups
Unit Activity
Member Activity
Notifications
```

## Unit Admin

```text
Unit Overview
Unit Events
Unit Attendance
Unit Members
Unit Announcements
Unit Activity
```

The dashboard must never expose information outside the administrator's
authorized scope.

# 33. Super Admin Dashboard

The Super Admin should have the most comprehensive dashboard.

Sections:

### Church Overview

- Members
- Attendance
- Growth

### Spiritual Engagement

- Bible plans
- Scripture discussions
- Discipleship

### Pastoral Care

- Prayer requests
- Follow-ups
- Testimonies

### Units

- Unit health
- Unit participation
- Unit consistency

### Alerts

- Members needing follow-up
- Units needing attention
- Pending administrative tasks

---

# 34. Member Dashboard

Members should have a much simpler interface.

Main sections:

- Home
- Bible
- Prayer
- Community
- Calendar
- My Units
- My Profile

---

# 35. Authentication

Authentication should use:

- Email/password
- JWT
- HTTP-only secure cookies
- Password hashing with bcrypt
- Refresh token strategy
- Email verification
- Password reset
- Account lock/rate limiting where appropriate

Future:

- Google authentication
- Apple authentication
- Passkeys

---

# 36. Security Requirements

Flocks handles sensitive personal and pastoral information.

Security is therefore a core requirement.

Implement:

- Password hashing
- JWT security
- HTTP-only cookies
- CSRF protection where applicable
- Rate limiting
- Helmet
- Input validation
- Request sanitization
- Authorization middleware
- Role checks
- Scope checks
- Audit logging
- Secure file handling
- Data encryption where appropriate
- Database access controls

Never rely on frontend authorization alone.

Every sensitive API endpoint must verify authorization server-side.

---

# 37. Audit Logs

Important administrative actions should be logged.

Examples:

```text
Pastor John changed member status.

Admin Sarah created Youth Unit.

Super Admin changed yearly Bible verse.

Admin David deleted a prayer response.
```

Audit log fields:

- Actor
- Action
- Resource
- Resource ID
- Previous value
- New value
- Timestamp
- IP/device metadata where appropriate

---

# 38. MongoDB Data Model

Initial collections:

```text
users
members
roles
permissions
userRoleAssignments

churchOrganizations
parishes
parishMemberships

units
unitMemberships

biblePlans
bibleReadings
featuredVerses

scriptureQuestions
scriptureResponses

prayerRequests
prayerTestimonies

attendanceSessions
attendanceRecords

events
notifications
discipleshipPrograms
discipleshipProgress
memberEvents
announcements
auditLogs
```

## Core Relationship Model

```text
User
  │
  └── Member
        │
        ├── Church Organization
        │
        ├── Current Parish
        │
        ├── Parish Membership History
        │
        └── Unit Memberships
```

## Tenant-Scoped Fields

Tenant-owned documents should contain:

```text
organizationId
```

Where a resource belongs specifically to a parish:

```text
organizationId
parishId
```

Where a resource belongs specifically to a unit:

```text
organizationId
parishId
unitId
```

This makes the hierarchy explicit and makes authorization easier to
enforce.

## Important Indexing

Indexes should be planned around common scope queries, including:

```text
organizationId
organizationId + parishId
organizationId + parishId + unitId
organizationId + memberId
```

Additional indexes should be introduced based on measured query
patterns.

# 39. Multi-Tenant Architecture

Flocks must be designed as a multi-tenant SaaS from the beginning.

## Tenant Definition

The **Church Organization is the tenant**.

A Parish is not a tenant. A Parish is an organizational subdivision
inside a tenant.

The hierarchy is:

```text
Flocks Platform
    │
    ├── Church Organization A
    │      ├── Lagos Parish
    │      │      ├── Units
    │      │      └── Members
    │      ├── Abuja Parish
    │      │      ├── Units
    │      │      └── Members
    │      └── Ibadan Parish
    │             ├── Units
    │             └── Members
    │
    └── Church Organization B
           ├── Parish
           └── Parish
```

## Why This Model

A senior pastor or general overseer may coordinate several parishes
while retaining organization-wide oversight.

A Parish Pastor should normally operate within one parish.

A Unit Admin should normally operate within one unit.

A member can transfer from one parish to another without becoming a new
member in the system.

## Single-Parish Churches

A single-parish church still uses the same architecture:

```text
Church Organization
    ↓
Main Parish
    ↓
Units
    ↓
Members
```

The Parish layer can remain nearly invisible to members if the church
only has one parish.

## Tenant Isolation

Data belonging to one Church Organization must never be accessible to
another Church Organization.

Every tenant-scoped document must include `organizationId`.

Parish-scoped documents must include both:

```text
organizationId
parishId
```

Unit-scoped documents must include:

```text
organizationId
parishId
unitId
```

All backend queries must enforce organization isolation before resource
access.

## Cross-Parish Access

Cross-parish access is allowed only when the authenticated user's role
assignment and permissions explicitly allow it.

For example:

```text
Super Admin
    → All Parishes

Organization Admin
    → Authorized Organization Data

Parish Admin
    → Assigned Parish

Unit Admin
    → Assigned Unit

Member
    → Own Data + Permitted Community Data
```

## Cross-Organization Access

Cross-organization access is never permitted.

A user belonging to Organization A must not be able to access
Organization B's members, units, events, prayers, analytics, or other
private data.

# 40. Core API Architecture

Backend:

```text
Node.js
Express.js
MongoDB
Mongoose
```

Recommended structure:

```text
src/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── utils/
├── validators/
├── jobs/
├── permissions/
└── server.js
```

---

# 41. API Design

Use REST initially.

Example:

```text
/api/v1/auth
/api/v1/organizations
/api/v1/parishes
/api/v1/users
/api/v1/members
/api/v1/units
/api/v1/bible
/api/v1/prayers
/api/v1/attendance
/api/v1/events
/api/v1/analytics
/api/v1/notifications
/api/v1/discipleship
```

---

# 42. Frontend Architecture

Next.js application.

Suggested structure:

```text
app/
├── (auth)/
├── dashboard/
├── members/
├── units/
├── bible/
├── prayers/
├── attendance/
├── calendar/
├── analytics/
├── discipleship/
├── settings/
└── profile/
```

Use reusable components.

Example:

```text
components/
├── ui/
├── dashboard/
├── members/
├── units/
├── bible/
├── prayer/
├── attendance/
├── calendar/
└── analytics/
```

---

# 43. State Management

Do not introduce a state-management library unnecessarily.

Start with:

- React state
- Context where appropriate
- Server-side data fetching
- API service layer

Introduce TanStack Query or another solution when application complexity
justifies it.

---

# 44. Background Jobs

Some operations should not happen synchronously during normal API
requests.

Examples:

- Reminder notifications
- Bible reading reminders
- Attendance analytics calculations
- Weekly reports
- Follow-up reminders
- Email notifications

Node.js background jobs can handle these.

Potential technologies:

- BullMQ
- Redis
- Cron jobs

These can be introduced after the core system is stable.

---

# 45. Analytics Architecture

Do not calculate every statistic from millions of records on every
dashboard request.

Initially, MongoDB aggregation pipelines can handle analytics.

As usage grows, introduce:

- Aggregation collections
- Scheduled analytics jobs
- Cached metrics
- Redis
- Data warehouse if necessary

---

# 46. AI Layer

AI should not be the foundation of the MVP.

Later, AI can provide:

### Pastoral Insights

> "Which members may need follow-up?"

### Bible Assistance

> "Generate discussion questions from today's Scripture."

### Sermon Processing

Upload sermon → generate:

- Summary
- Discussion questions
- Devotional
- Prayer points
- Bible references

### Church Intelligence

> "Why has attendance dropped in Youth Ministry?"

AI can analyze available church data and summarize trends.

AI must respect permission boundaries.

An AI assistant must never expose information that the requesting user
is not authorized to access.

---

# 47. Privacy

Pastoral information can be highly sensitive.

Prayer requests and pastoral-care information must have strict
visibility controls.

A unit admin should not automatically see:

- Private prayer requests
- Pastoral counseling notes
- Sensitive member information

unless explicitly authorized.

---

# 48. Non-Functional Requirements

## Performance

Target:

- API response \<500ms for common requests
- Dashboard initial load optimized
- Pagination for large datasets
- Lazy loading where appropriate

## Scalability

System should support:

- Small churches
- Medium churches
- Large churches
- Multiple parishes

## Availability

Target high availability for production.

## Accessibility

The frontend should follow reasonable WCAG accessibility practices.

## Responsiveness

The application must work on:

- Desktop
- Tablet
- Mobile

---

# 49. MVP Scope

Do NOT attempt to build every feature simultaneously.

The multi-parish hierarchy is part of the foundation, not a later
add-on.

## MVP Phase 1

### Authentication

- Registration
- Login
- Logout
- Password reset
- Email verification

### Church Organization

- Church organization creation
- Organization settings
- Super Admin
- Create first parish
- Create additional parishes
- Assign organization/parish administrators

### Members

- Create member
- Edit member
- View member
- Assign current parish
- Transfer member between parishes
- Membership status
- Baptism status
- Discipleship status
- Member history
- Parish membership history

### Roles & Authorization

- Super Admin
- Admin
- Unit Admin
- Member
- Role + Permission + Scope
- Organization scope
- Parish scope
- Unit scope
- Server-side authorization

### Units

- Create unit
- Add members
- Assign admins
- Private unit space
- Parish association

### Bible

- Daily verse
- Weekly verse
- Yearly verse
- Bible reading plans

### Prayer

- Submit prayer
- Prayer dashboard
- Testimony
- Visibility controls

### Attendance

- Attendance session
- Dynamic QR
- Attendance records
- Parish-aware attendance

### Calendar

- Organization events
- Parish events
- Unit events

### Analytics

- Organization overview
- Parish overview
- Member overview
- Attendance
- Unit analytics
- Basic consistency
- Basic parish comparison for Super Admin

# 50. MVP Phase 2

Add:

- Scripture discussions
- Replies
- Notifications
- Advanced analytics
- Follow-up management
- Discipleship programs
- Member journey timeline
- Announcements
- Testimony wall

---

# 51. MVP Phase 3

Add:

- AI church intelligence
- Sermon processing
- Advanced church health scoring
- Automated follow-up recommendations
- Volunteer management
- Small groups
- Advanced reporting
- Advanced multi-parish analytics
- Cross-parish organization reporting
- Advanced member transfer workflows

Multi-parish support itself is NOT a Phase 3 feature; the organizational
hierarchy is part of the core architecture from MVP Phase 1.

# 52. Future Features

Potential future modules:

- Volunteer management
- Small groups
- Giving/donations
- Church finance
- SMS
- WhatsApp integration
- Livestream integration
- Sermon library
- Children's ministry
- Event registration
- Visitor management
- Church website integration
- Mobile applications
- Offline attendance
- NFC attendance
- Advanced AI assistant

These should not be allowed to distract from the core product.

---

# 53. Core Product Differentiator

Flocks should not compete simply as:

> "Another church management system."

Its differentiation is:

### Member-Centered Church Intelligence

The system connects:

```text
Member
 ↓
Attendance
 ↓
Bible Engagement
 ↓
Prayer
 ↓
Discipleship
 ↓
Units
 ↓
Relationships
 ↓
Church Participation
 ↓
Pastoral Care
```

This produces a meaningful picture of the member's journey.

---

# 54. Primary Success Metrics

The platform should measure:

### Adoption

- Number of churches
- Active churches
- Active administrators
- Active members

### Engagement

- Weekly active members
- Bible plan participation
- Scripture discussions
- Prayer requests
- Testimonies

### Church Health

- Attendance consistency
- Discipleship progression
- Unit engagement
- Member retention

### Product Health

- Daily active users
- Monthly active users
- Notification engagement
- Feature usage
- Retention

---

# 55. Product Principles

1.  **People before administration.**
2.  **Privacy before convenience.**
3.  **Pastoral care before gamification.**
4.  **Simple member experience.**
5.  **Powerful administrator experience.**
6.  **Permissions must be granular.**
7.  **Data must be tenant-isolated.**
8.  **Historical member activity should not be destroyed.**
9.  **Analytics should inform pastoral action, not replace pastoral
    judgment.**
10. **Build the MVP before building the ecosystem.**

---

# 56. Recommended Initial Development Order

Build in this order:

```text
1. Project setup
        ↓
2. Authentication
        ↓
3. Church/Tenant
        ↓
4. User + RBAC
        ↓
5. Member management
        ↓
6. Units
        ↓
7. Bible/Featured verses
        ↓
8. Prayer
        ↓
9. Calendar
        ↓
10. Attendance
        ↓
11. Analytics
        ↓
12. Member journey
        ↓
13. Notifications
        ↓
14. Scripture interaction
        ↓
15. Discipleship
        ↓
16. AI intelligence
```

---

# 57. Initial Repository Structure

Recommended monorepo:

```text
flocks/
│
├── client/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── services/
│   └── public/
│
├── server/
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       ├── validators/
│       ├── permissions/
│       ├── utils/
│       └── server.js
│
├── README.md
├── .gitignore
└── package.json
```

---

# 58. Development Philosophy

Do not attempt to create the final Flocks architecture before writing
the first feature.

Build vertically.

For example:

```text
Authentication
Frontend
   ↓
API
   ↓
Controller
   ↓
Service
   ↓
Model
   ↓
MongoDB
```

Complete the feature end-to-end before moving to the next major feature.

Every feature should include:

- Database model
- Validation
- Controller
- Service
- Routes
- Authorization
- Frontend
- Error handling
- Tests

---

# 59. Definition of MVP Success

The MVP is successful when a real church can:

1.  Create its church account.
2.  Create administrators.
3.  Create units.
4.  Add members.
5.  Assign members to units.
6.  Track member statuses.
7.  Set daily/weekly/yearly Bible verses.
8.  Create Bible reading plans.
9.  Receive prayer requests.
10. Record prayer testimonies.
11. Create church events.
12. Generate attendance sessions.
13. Allow members to mark attendance.
14. View attendance analytics.
15. View member consistency.
16. View unit consistency.
17. View member baptism/disciple status.
18. View member history.
19. Restrict access according to permissions.
20. Give the pastor a useful picture of the church.

---

# 60. Final Product Definition

Flocks is a:

> **Church Community, Discipleship, Pastoral Care and Intelligence
> Platform.**

It combines:

- **Church Organization Management**
- **Parishes**
- **Members**
- **Units**
- **Bible**
- **Prayer**
- **Scripture Interaction**
- **Attendance**
- **Calendar**
- **Discipleship**
- **Pastoral Care**
- **Analytics**
- **Member Journey**
- **Church Intelligence**

into one connected system.

The platform is designed around the hierarchy:

```text
Church Organization
       ↓
     Parish
       ↓
      Unit
       ↓
     Member
```

The ultimate goal is not simply to tell a senior pastor:

> "You have 1,284 members across 5 parishes."

It should eventually help the pastor understand:

> **"Who are these people, how are they engaging with the church, where
> are they in their journey, who may need care, what is happening in
> each parish, what is working, what needs attention, and how is the
> church growing?"**

That is the core of Flocks.

# 61. Architecture Invariants

These rules must remain true throughout development.

1.  **Church Organization is the tenant.**
2.  **Parish is a subdivision of a Church Organization, not a tenant.**
3.  **Every tenant-owned resource is organization-scoped.**
4.  **Every parish-owned resource is organization + parish scoped.**
5.  **Every unit-owned resource is organization + parish + unit scoped.**
6.  **A member should not be duplicated when transferred between parishes.**
7.  **Member history must be preserved.**
8.  **Role assignments must support scope.**
9.  **Authorization must be enforced server-side.**
10. **Unit content is private by default.**
11. **Pastoral and prayer information requires explicit visibility controls.**
12. **Organization-level administrators may coordinate multiple parishes only when their permissions allow it.**
13. **Parish administrators do not automatically gain access to other parishes.**
14. **Members should experience a simple interface regardless of the complexity of the underlying permission system.**
15. **Analytics are pastoral indicators and must not become public rankings of members.**
16. **AI must respect the same permission and scope boundaries as human users.**
17. **A single-parish church must be able to use Flocks without unnecessary multi-parish complexity.**
18. **The MVP must establish the correct organizational model before feature expansion.**
