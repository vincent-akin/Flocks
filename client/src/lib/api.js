/**
 * Thin fetch wrapper around the Flocks backend (see /server). Talks to
 * NEXT_PUBLIC_API_URL, always sends credentials (the backend uses
 * HTTP-only cookies for auth), and normalizes errors into a single shape
 * so UI code can render friendly messages instead of raw HTTP failures.
 *
 * The frontend never treats its own state as authoritative for
 * authorization - every request still relies on the backend to enforce
 * RBAC/scope/tenant isolation. This layer only shapes requests/responses.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request(path, { method = 'GET', body, headers, ...rest } = {}) {
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      credentials: 'include',
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      ...rest,
    });
  } catch (err) {
    throw new ApiError(0, 'Unable to reach the server. Check your connection and try again.');
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch (err) {
    // No JSON body (e.g. 204) - fine.
  }

  if (!response.ok) {
    const message =
      payload?.message ||
      (response.status === 401
        ? 'Your session has expired. Please sign in again.'
        : response.status === 403
        ? "You don't have permission to view this information."
        : 'Something went wrong. Please try again.');
    throw new ApiError(response.status, message, payload?.details);
  }

  return payload;
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  delete: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
};

export const authApi = {
  registerOrganization: (payload) => api.post('/auth/register-organization', payload),
  login: (payload) => api.post('/auth/login', payload),
  refresh: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (payload) => api.post('/auth/reset-password', payload),
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  resendVerification: () => api.post('/auth/resend-verification'),
};

function toQuery(params = {}) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  if (!entries.length) return '';
  return `?${new URLSearchParams(entries).toString()}`;
}

export const parishApi = {
  list: () => api.get('/parishes'),
  get: (id) => api.get(`/parishes/${id}`),
  create: (payload) => api.post('/parishes', payload),
  update: (id, payload) => api.patch(`/parishes/${id}`, payload),
  remove: (id) => api.delete(`/parishes/${id}`),
};

export const memberApi = {
  list: (params) => api.get(`/members${toQuery(params)}`),
  get: (id) => api.get(`/members/${id}`),
  create: (payload) => api.post('/members', payload),
  update: (id, payload) => api.patch(`/members/${id}`, payload),
  updateStatus: (id, payload) => api.patch(`/members/${id}/status`, payload),
  transfer: (id, payload) => api.post(`/members/${id}/transfer`, payload),
  history: (id) => api.get(`/members/${id}/history`),
};

export const unitApi = {
  list: (params) => api.get(`/units${toQuery(params)}`),
  get: (id) => api.get(`/units/${id}`),
  create: (payload) => api.post('/units', payload),
  update: (id, payload) => api.patch(`/units/${id}`, payload),
  remove: (id) => api.delete(`/units/${id}`),
  members: (id) => api.get(`/units/${id}/members`),
  addMember: (id, memberId) => api.post(`/units/${id}/members`, { memberId }),
  removeMember: (id, memberId) => api.delete(`/units/${id}/members/${memberId}`),
  assignAdmin: (id, payload) => api.post(`/units/${id}/admins`, payload),
};

export const bibleApi = {
  currentVerses: () => api.get('/bible/verses/current'),
  setVerse: (payload) => api.post('/bible/verses', payload),
  listPlans: (params) => api.get(`/bible/plans${toQuery(params)}`),
  myProgress: () => api.get('/bible/plans/mine'),
  getPlan: (id) => api.get(`/bible/plans/${id}`),
  createPlan: (payload) => api.post('/bible/plans', payload),
  publishPlan: (id) => api.post(`/bible/plans/${id}/publish`),
  joinPlan: (id) => api.post(`/bible/plans/${id}/join`),
  markDay: (id, payload) => api.post(`/bible/plans/${id}/progress`, payload),
};

export const prayerApi = {
  list: (params) => api.get(`/prayers${toQuery(params)}`),
  get: (id) => api.get(`/prayers/${id}`),
  create: (payload) => api.post('/prayers', payload),
  updateStatus: (id, status) => api.patch(`/prayers/${id}/status`, { status }),
  assign: (id, userId) => api.patch(`/prayers/${id}/assign`, { userId }),
  addTestimony: (id, payload) => api.post(`/prayers/${id}/testimony`, payload),
  listTestimonies: (params) => api.get(`/prayers/testimonies${toQuery(params)}`),
  moderateTestimony: (id, moderationStatus) => api.patch(`/prayers/testimonies/${id}/moderate`, { moderationStatus }),
};

export const attendanceApi = {
  listSessions: (params) => api.get(`/attendance/sessions${toQuery(params)}`),
  createSession: (payload) => api.post('/attendance/sessions', payload),
  rotateToken: (id) => api.post(`/attendance/sessions/${id}/rotate`),
  closeSession: (id) => api.post(`/attendance/sessions/${id}/close`),
  records: (id) => api.get(`/attendance/sessions/${id}/records`),
  mark: (id, payload) => api.post(`/attendance/sessions/${id}/mark`, payload),
  markManual: (id, memberId) => api.post(`/attendance/sessions/${id}/mark-manual`, { memberId }),
};

export const eventApi = {
  list: (params) => api.get(`/events${toQuery(params)}`),
  create: (payload) => api.post('/events', payload),
  update: (id, payload) => api.patch(`/events/${id}`, payload),
  remove: (id) => api.delete(`/events/${id}`),
};

export const analyticsApi = {
  organization: () => api.get('/analytics/organization'),
  compareParishes: () => api.get('/analytics/parishes/compare'),
  parish: (id) => api.get(`/analytics/parishes/${id}`),
  unit: (id) => api.get(`/analytics/units/${id}`),
  followUp: (params) => api.get(`/analytics/follow-up${toQuery(params)}`),
};

export const adminApi = {
  listRoleAssignments: (params) => api.get(`/admins/role-assignments${toQuery(params)}`),
  createRoleAssignment: (payload) => api.post('/admins/role-assignments', payload),
  updatePermissions: (id, permissions) => api.patch(`/admins/role-assignments/${id}/permissions`, { permissions }),
  revoke: (id) => api.delete(`/admins/role-assignments/${id}`),
};

export const organizationApi = {
  get: () => api.get('/organizations'),
  update: (payload) => api.patch('/organizations', payload),
};

export const notificationApi = {
  list: (params) => api.get(`/notifications${toQuery(params)}`),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};
