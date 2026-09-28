/**
 * Static sample data used to render the marketing site's product preview
 * and the dashboard shell before real API data is wired in. Keeping this
 * isolated in one file makes it trivial to delete once the backend is
 * connected (see lib/api.js).
 */

export const orgSummary = {
  name: 'Riverside Church',
  type: 'Multi-Parish Organization',
};

export const kpis = [
  { label: 'Total Members', value: '696', delta: '+12%', trend: 'up', accent: 'blue', note: 'vs. last month' },
  { label: 'Active Units', value: '26', delta: '+4%', trend: 'up', accent: 'green', note: 'vs. last month' },
  { label: "Today's Attendance", value: '482', delta: '+8%', trend: 'up', accent: 'purple', note: 'vs. last Sunday' },
  { label: 'Prayer Requests', value: '48', delta: '+15%', trend: 'up', accent: 'amber', note: 'vs. last week' },
];

export const attendanceTrend = [
  { month: 'Jan', value: 582 },
  { month: 'Feb', value: 614 },
  { month: 'Mar', value: 642 },
  { month: 'Apr', value: 671 },
  { month: 'May', value: 698 },
];

export const recentActivity = [
  { name: 'Sarah Johnson', action: 'joined the Grace Unit', time: '2 hours ago', tag: 'Member', accent: 'green' },
  { name: 'Michael Brown', action: 'submitted a prayer request', time: '3 hours ago', tag: 'Prayer', accent: 'purple' },
  { name: 'Emily Davis', action: "completed today's Bible reading plan", time: '4 hours ago', tag: 'Bible', accent: 'blue' },
  { name: 'Daniel Wilson', action: 'checked in for Sunday Service', time: '5 hours ago', tag: 'Attendance', accent: 'amber' },
  { name: 'Lisa Garcia', action: 'shared a testimony', time: '6 hours ago', tag: 'Testimony', accent: 'red' },
];

export const upcomingEvents = [
  { date: 'APR 20', title: 'Easter Sunday Service', location: 'Main Sanctuary • 9:00 AM', tag: 'Church Wide' },
  { date: 'APR 22', title: 'Leadership Meeting', location: 'Conference Room • 7:00 PM', tag: 'Leadership' },
  { date: 'APR 26', title: 'Youth Retreat', location: 'Camp Horizon • 9:00 AM', tag: 'Youth' },
  { date: 'APR 30', title: "Women's Fellowship", location: 'Fellowship Hall • 6:00 PM', tag: 'Women' },
];

export const prayerRequests = [
  { title: 'Healing for my mother', name: 'Sarah Johnson', time: '2 days ago', priority: 'High' },
  { title: 'Job opportunity', name: 'Michael Brown', time: '3 days ago', priority: 'Medium' },
  { title: 'Family reconciliation', name: 'Emily Davis', time: '4 days ago', priority: 'Medium' },
  { title: 'Guidance for my children', name: 'David Wilson', time: '5 days ago', priority: 'Low' },
];

export const parishes = [
  { name: 'Main Parish', units: 12, members: 342, accent: 'blue' },
  { name: 'North Campus', units: 8, members: 198, accent: 'green' },
  { name: 'West Campus', units: 6, members: 156, accent: 'purple' },
];

export const quickStats = [
  { label: 'Bible Reading', value: 62, accent: 'blue' },
  { label: 'Prayer Requests', value: 48, accent: 'purple' },
  { label: 'Discipleship Progress', value: 71, accent: 'green' },
  { label: 'Member Engagement', value: 68, accent: 'amber' },
];

export const memberOfWeek = {
  name: 'Sarah Johnson',
  unit: 'Grace Unit • Main Parish',
  quote: 'God has been so faithful in my life. Grateful for this church family!',
  badges: ['Baptized', 'Discipled'],
};

export const memberJourneyExample = {
  name: 'Jane Doe',
  status: 'Active Member',
  parish: 'Main Parish',
  discipleship: 82,
  attendance: 91,
  biblePlan: { day: 18, total: 30 },
};

export const biblePlanExample = {
  title: '30-Day Gospel Journey',
  day: 18,
  reading: 'John 15:1–17',
  progress: 60,
  streak: 12,
};
