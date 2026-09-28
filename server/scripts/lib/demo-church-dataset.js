/**
 * Pure, database-free generator for the demo church dataset: three
 * churches, their parishes, a Super Admin per church, a Parish Admin
 * (pastor) per parish, and 50-110 members per parish - names, emails,
 * passwords, and statuses for every single one of them.
 *
 * Everything here is a deterministic function of FLOCKS_DEMO_SEED_SECRET.
 * No Math.random() anywhere - member counts, genders, membership/baptism/
 * discipleship statuses, and passwords are all derived by hashing the
 * secret together with a stable key (a parish slug, a person's email,
 * etc.). That's what makes it safe to run this file standalone to preview
 * or hand out credentials, and separately run the real DB-seeding script
 * later, and be certain both produce the exact same people - same names,
 * same emails, same passwords - as long as the secret doesn't change.
 *
 * This module has no MongoDB/Mongoose dependency at all, on purpose: it
 * can run anywhere Node runs, with no database required.
 */

const crypto = require('crypto');

const SEED_SECRET = process.env.FLOCKS_DEMO_SEED_SECRET || 'FLOCKS-DEMO-SEED-2026';
const MIN_MEMBERS_PER_PARISH = 50;
const MAX_MEMBERS_PER_PARISH = 110;

const CHURCHES = [
  {
    name: 'Christ Apostolic Church',
    shortName: 'CAC',
    slug: 'christ-apostolic-church',
    parishes: [
      { name: 'CAC Oke Ayo', slug: 'cac-oke-ayo', city: 'Lagos' },
      { name: 'CAC Oke Ibukun', slug: 'cac-oke-ibukun', city: 'Ibadan' },
      { name: 'CAC Agbala Agbara', slug: 'cac-agbala-agbara', city: 'Abeokuta' },
    ],
  },
  {
    name: 'Church of Christ',
    shortName: 'COC',
    slug: 'church-of-christ',
    parishes: [
      { name: 'Ketu Parish', slug: 'coc-ketu-parish', city: 'Lagos' },
      { name: 'Mokola Parish', slug: 'coc-mokola-parish', city: 'Ibadan' },
      { name: 'Lugbe Parish', slug: 'coc-lugbe-parish', city: 'Abuja' },
    ],
  },
  {
    name: 'Mountain of Fire Ministry',
    shortName: 'MFM',
    slug: 'mountain-of-fire-ministry',
    parishes: [
      { name: 'Magodo District', slug: 'mfm-magodo-district', city: 'Lagos' },
      { name: 'Magboro District', slug: 'mfm-magboro-district', city: 'Ogun' },
      { name: 'Alakia District', slug: 'mfm-alakia-district', city: 'Ibadan' },
    ],
  },
];

const FIRST_NAMES = [
  'Adebayo', 'Adeola', 'Adesewa', 'Aisha', 'Akintunde', 'Amaka', 'Amina', 'Andrew', 'Anuoluwapo', 'Blessing',
  'Chiamaka', 'Chinedu', 'Chisom', 'Daniel', 'David', 'Deborah', 'Dorcas', 'Emeka', 'Esther', 'Faith',
  'Favour', 'Folake', 'Gabriel', 'Grace', 'Hannah', 'Ibrahim', 'Ifeoluwa', 'Ikenna', 'Janet', 'Joshua',
  'Joy', 'Kehinde', 'Kemi', 'Kingsley', 'Kunle', 'Lawrence', 'Mariam', 'Mary', 'Michael', 'Miriam',
  'Moses', 'Nathaniel', 'Nneka', 'Olamide', 'Olumide', 'Opeoluwa', 'Peace', 'Peter', 'Precious', 'Raphael',
  'Rebecca', 'Samuel', 'Sarah', 'Seun', 'Sharon', 'Simon', 'Sophia', 'Stephen', 'Taiwo', 'Temitope',
  'Titi', 'Tolu', 'Victor', 'Victoria', 'Wisdom', 'Yemi', 'Yetunde', 'Zainab', 'Chukwuemeka', 'Ngozi',
];

const LAST_NAMES = [
  'Adeyemi', 'Adebisi', 'Adewale', 'Afolabi', 'Ajayi', 'Akande', 'Akinola', 'Akinyemi', 'Alabi', 'Bello',
  'Chukwu', 'Dada', 'Eze', 'Fashola', 'Ibrahim', 'Idowu', 'James', 'Johnson', 'Joseph', 'Lawal',
  'Makinde', 'Mbakwe', 'Moses', 'Nwachukwu', 'Nwosu', 'Okafor', 'Okeke', 'Olawale', 'Oni', 'Onwuka',
  'Oseni', 'Osho', 'Oyediran', 'Oyewole', 'Salami', 'Samuel', 'Sanni', 'Taiwo', 'Thomas', 'Williams',
];

const PASTOR_FIRST_NAMES = [
  'Adewale', 'Oluwaseun', 'Temitope', 'Emmanuel', 'Daniel', 'Samuel', 'Joseph', 'Victor', 'David',
];

// ---------------------------------------------------------------------
// Deterministic "randomness" - every value below is a pure function of
// (SEED_SECRET, some stable key), never of Math.random() or Date.now().
// ---------------------------------------------------------------------

function seededFloat(key) {
  const hash = crypto.createHash('sha256').update(`${SEED_SECRET}:${key}`).digest();
  return hash.readUInt32BE(0) / 4294967296; // -> [0, 1)
}

function seededInt(key, min, max) {
  return min + Math.floor(seededFloat(key) * (max - min + 1));
}

function pick(arr, index) {
  return arr[((index % arr.length) + arr.length) % arr.length];
}

function weightedPick(key, options) {
  const roll = seededFloat(key);
  const total = options.reduce((sum, [, weight]) => sum + weight, 0);
  let remaining = roll * total;
  for (const [value, weight] of options) {
    remaining -= weight;
    if (remaining <= 0) return value;
  }
  return options[0][0];
}

/** The one password-generation function - used for pastors, super admins, and every member alike. */
function passwordFor(email) {
  const digest = crypto.createHash('sha256').update(`${SEED_SECRET}:${email}`).digest('base64url');
  return `Flocks!${digest.slice(0, 16)}9`;
}

function buildMemberName(index, parishSlug) {
  const offset = parishSlug.length;
  return {
    firstName: pick(FIRST_NAMES, index + offset),
    lastName: pick(LAST_NAMES, index * 7 + offset),
  };
}

function buildPerson({ church, parish, role, firstName, lastName, email }) {
  return {
    church: church.name,
    parish: parish ? parish.name : '(Organization-wide)',
    role,
    firstName,
    lastName,
    name: `${firstName} ${lastName}`,
    email,
    password: passwordFor(email),
  };
}

function buildParishMember(church, parish, index) {
  const { firstName, lastName } = buildMemberName(index, parish.slug);
  const email = `member${String(index).padStart(3, '0')}@${parish.slug}.demo.flocks.app`;
  const person = buildPerson({ church, parish, role: 'Member', firstName, lastName, email });

  return {
    ...person,
    gender: seededFloat(`gender:${email}`) < 0.5 ? 'MALE' : 'FEMALE',
    membershipStatus: weightedPick(`membership:${email}`, [
      ['ACTIVE', 70],
      ['NEW', 20],
      ['INACTIVE', 10],
    ]),
    baptismStatus: weightedPick(`baptism:${email}`, [
      ['BAPTIZED', 70],
      ['NOT_BAPTIZED', 25],
      ['BAPTISM_PENDING', 5],
    ]),
    discipleshipStatus: weightedPick(`discipleship:${email}`, [
      ['NOT_STARTED', 30],
      ['IN_PROGRESS', 45],
      ['COMPLETED', 25],
    ]),
  };
}

/**
 * Builds the full in-memory dataset: every church, parish, super admin,
 * pastor, and member, fully resolved (names/emails/passwords/statuses).
 * No side effects, no I/O, no database - safe to call from anywhere.
 */
function buildDataset() {
  return CHURCHES.map((churchSpec) => {
    const mainParishSlug = churchSpec.parishes[0].slug;
    const superAdminEmail = `superadmin@${churchSpec.slug}.demo.flocks.app`;
    const superAdmin = buildPerson({
      church: churchSpec,
      parish: null,
      role: 'Super Admin',
      firstName: 'General',
      lastName: `Overseer (${churchSpec.shortName})`,
      email: superAdminEmail,
    });

    const parishes = churchSpec.parishes.map((parishSpec, parishIndex) => {
      const memberCount = seededInt(`count:${parishSpec.slug}`, MIN_MEMBERS_PER_PARISH, MAX_MEMBERS_PER_PARISH);

      const pastorFirstName = pick(PASTOR_FIRST_NAMES, parishIndex + churchSpec.slug.length);
      const pastorEmail = `pastor@${parishSpec.slug}.demo.flocks.app`;
      const pastor = buildPerson({
        church: churchSpec,
        parish: parishSpec,
        role: 'Parish Admin (Pastor)',
        firstName: 'Pastor',
        lastName: pastorFirstName,
        email: pastorEmail,
      });

      const members = Array.from({ length: memberCount }, (_, i) => buildParishMember(churchSpec, parishSpec, i + 1));

      return {
        ...parishSpec,
        isMainParish: parishSpec.slug === mainParishSlug,
        pastor,
        members,
      };
    });

    return {
      name: churchSpec.name,
      shortName: churchSpec.shortName,
      slug: churchSpec.slug,
      superAdmin,
      parishes,
    };
  });
}

/** Renders the same dataset as a standalone Markdown credentials document. */
function renderCredentialsMarkdown(dataset) {
  const lines = [];
  const totalMembers = dataset.reduce((sum, c) => sum + c.parishes.reduce((s, p) => s + p.members.length, 0), 0);
  const totalLeaders = dataset.length + dataset.reduce((sum, c) => sum + c.parishes.length, 0);

  lines.push('# Flocks Demo Church Credentials');
  lines.push('');
  lines.push('> **Contains real, working plaintext passwords for every seeded account.**');
  lines.push('> Generated from `scripts/lib/demo-church-dataset.js`. Never commit this file to');
  lines.push('> version control, and rotate or delete these accounts before pointing this');
  lines.push('> deployment at a real church - this dataset exists to get the app running with');
  lines.push('> something real in it, not as a permanent fixture.');
  lines.push('');
  lines.push(
    'Every value here is deterministic (derived from `FLOCKS_DEMO_SEED_SECRET` + a stable ' +
      'key such as an email address) - running `npm run seed:demo-churches` against your ' +
      'database produces exactly these people, these emails, and these passwords, as long ' +
      'as the secret is left at its default.'
  );
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push('| Church | Parishes | Members (excl. pastors/super admin) |');
  lines.push('|---|---|---|');
  dataset.forEach((church) => {
    const memberCount = church.parishes.reduce((s, p) => s + p.members.length, 0);
    lines.push(`| ${church.name} | ${church.parishes.length} | ${memberCount} |`);
  });
  lines.push('');
  lines.push(`**Total login accounts across all three churches:** ${totalMembers + totalLeaders}`);

  dataset.forEach((church) => {
    lines.push('');
    lines.push(`## ${church.name}`);
    lines.push('');
    lines.push('### Super Admin');
    lines.push('');
    lines.push('| Name | Email | Password |');
    lines.push('|---|---|---|');
    lines.push(`| ${church.superAdmin.name} | \`${church.superAdmin.email}\` | \`${church.superAdmin.password}\` |`);

    church.parishes.forEach((parish) => {
      lines.push('');
      lines.push(`### ${parish.name}${parish.isMainParish ? ' (Main Parish)' : ''}`);
      lines.push('');
      lines.push(`${parish.members.length} members + 1 pastor`);
      lines.push('');
      lines.push('| Name | Role | Email | Password |');
      lines.push('|---|---|---|---|');
      lines.push(`| ${parish.pastor.name} | Parish Admin (Pastor) | \`${parish.pastor.email}\` | \`${parish.pastor.password}\` |`);
      parish.members.forEach((m) => {
        lines.push(`| ${m.name} | Member | \`${m.email}\` | \`${m.password}\` |`);
      });
    });
  });

  return lines.join('\n');
}

module.exports = {
  SEED_SECRET,
  CHURCHES,
  buildDataset,
  renderCredentialsMarkdown,
  passwordFor,
};
