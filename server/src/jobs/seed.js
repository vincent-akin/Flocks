/**
 * Seeds a demo Church Organization with a couple of parishes, units,
 * members, a featured verse, a Bible plan, and a prayer request - enough
 * to explore the dashboard without manually clicking through every form.
 *
 * Usage: npm run seed   (reads MONGO_URI from .env, same as the server)
 *
 * Safe to re-run: it skips creating the organization if one with the
 * same slug already exists, and always prints the Super Admin login.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const env = require('../config/env');

const User = require('../models/User');
const Member = require('../models/Member');
const ChurchOrganization = require('../models/ChurchOrganization');
const Parish = require('../models/Parish');
const ParishMembership = require('../models/ParishMembership');
const Unit = require('../models/Unit');
const UnitMembership = require('../models/UnitMembership');
const RoleAssignment = require('../models/RoleAssignment');
const FeaturedVerse = require('../models/FeaturedVerse');
const BiblePlan = require('../models/BiblePlan');
const PrayerRequest = require('../models/PrayerRequest');
const MemberEvent = require('../models/MemberEvent');
const { ROLES, SCOPE_TYPES, ALL_PERMISSIONS } = require('../permissions/permissions');

const DEMO_SLUG = 'riverside-church-demo';
const DEMO_ADMIN_EMAIL = 'admin@riverside-demo.org';
const DEMO_ADMIN_PASSWORD = 'DemoPass123!';

async function seed() {
  await mongoose.connect(env.mongoUri);
  // eslint-disable-next-line no-console
  console.log(`[seed] Connected to ${mongoose.connection.name}`);

  const existing = await ChurchOrganization.findOne({ slug: DEMO_SLUG });
  if (existing) {
    // eslint-disable-next-line no-console
    console.log('[seed] Demo organization already exists - skipping creation.');
    printCredentials();
    await mongoose.disconnect();
    return;
  }

  const organization = await ChurchOrganization.create({ name: 'Riverside Church (Demo)', slug: DEMO_SLUG });

  const mainParish = await Parish.create({ organization: organization._id, name: 'Main Parish', isMainParish: true, city: 'Lagos' });
  const northParish = await Parish.create({ organization: organization._id, name: 'North Campus', city: 'Abuja' });

  organization.settings.defaultParish = mainParish._id;
  await organization.save();

  const passwordHash = await User.hashPassword(DEMO_ADMIN_PASSWORD);
  const adminUser = await User.create({
    organization: organization._id,
    email: DEMO_ADMIN_EMAIL,
    passwordHash,
    isEmailVerified: true,
  });

  const adminMember = await Member.create({
    organization: organization._id,
    user: adminUser._id,
    primaryParish: mainParish._id,
    firstName: 'Pastor',
    lastName: 'John',
    email: DEMO_ADMIN_EMAIL,
    membershipStatus: 'ACTIVE',
    baptismStatus: 'BAPTIZED',
    discipleshipStatus: 'COMPLETED',
    createdBy: adminUser._id,
  });
  adminUser.member = adminMember._id;
  await adminUser.save();

  await ParishMembership.create({ organization: organization._id, member: adminMember._id, parish: mainParish._id, isCurrent: true });

  await RoleAssignment.create({
    user: adminUser._id,
    organization: organization._id,
    role: ROLES.SUPER_ADMIN,
    scopeType: SCOPE_TYPES.ORGANIZATION,
    scopeId: organization._id,
    permissions: ALL_PERMISSIONS,
    createdBy: adminUser._id,
  });

  await MemberEvent.create({
    organization: organization._id,
    member: adminMember._id,
    parish: mainParish._id,
    type: 'JOINED_CHURCH',
    title: 'Joined Church',
    recordedBy: adminUser._id,
  });

  // A handful of ordinary members
  const memberNames = [
    ['Sarah', 'Johnson', mainParish],
    ['Michael', 'Brown', mainParish],
    ['Emily', 'Davis', northParish],
    ['Daniel', 'Wilson', northParish],
    ['Lisa', 'Garcia', mainParish],
  ];
  const members = [];
  for (const [firstName, lastName, parish] of memberNames) {
    // eslint-disable-next-line no-await-in-loop
    const member = await Member.create({
      organization: organization._id,
      primaryParish: parish._id,
      firstName,
      lastName,
      membershipStatus: 'ACTIVE',
      baptismStatus: 'BAPTIZED',
      discipleshipStatus: 'IN_PROGRESS',
      createdBy: adminUser._id,
    });
    // eslint-disable-next-line no-await-in-loop
    await ParishMembership.create({ organization: organization._id, member: member._id, parish: parish._id, isCurrent: true });
    members.push(member);
  }

  const mediaUnit = await Unit.create({
    organization: organization._id,
    parish: mainParish._id,
    name: 'Media Ministry',
    category: 'MEDIA',
    createdBy: adminUser._id,
  });
  await UnitMembership.create({ organization: organization._id, unit: mediaUnit._id, member: members[0]._id, addedBy: adminUser._id });

  const now = new Date();
  await FeaturedVerse.create({
    organization: organization._id,
    type: 'DAILY',
    reference: 'Galatians 6:9',
    text: 'Let us not grow weary in doing good, for in due season we will reap, if we do not give up.',
    startDate: now,
    endDate: new Date(now.getTime() + 24 * 60 * 60 * 1000),
    setBy: adminUser._id,
  });

  await BiblePlan.create({
    organization: organization._id,
    title: '7-Day Gospel of John',
    planType: 'SEVEN_DAY',
    startDate: now,
    endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
    isPublished: true,
    dailyReadings: Array.from({ length: 7 }, (_, i) => ({ day: i + 1, references: [`John ${i + 1}`] })),
    createdBy: adminUser._id,
  });

  await PrayerRequest.create({
    organization: organization._id,
    parish: mainParish._id,
    member: members[0]._id,
    title: 'Healing for my mother',
    description: 'Please pray for my mother who is recovering from surgery.',
    category: 'HEALTH',
    visibility: 'PASTOR_CARE_TEAM',
    status: 'BEING_PRAYED_FOR',
  });

  // eslint-disable-next-line no-console
  console.log('[seed] Demo data created successfully.');
  printCredentials();

  await mongoose.disconnect();
}

function printCredentials() {
  // eslint-disable-next-line no-console
  console.log(`
[seed] Sign in with:
  Email:    ${DEMO_ADMIN_EMAIL}
  Password: ${DEMO_ADMIN_PASSWORD}
`);
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[seed] Failed:', err);
  process.exit(1);
});
