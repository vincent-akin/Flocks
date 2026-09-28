require('dotenv').config();

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    // eslint-disable-next-line no-console
    console.warn(`[config] Missing environment variable: ${name}`);
  }
  return value;
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),

  mongoUri: required('MONGODB_URI'),

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET', 'dev_access_secret'),
    refreshSecret: required('JWT_REFRESH_SECRET', 'dev_refresh_secret'),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  cookies: {
    domain: process.env.COOKIE_DOMAIN || undefined,
    secure: (process.env.COOKIE_SECURE || 'false') === 'true',
  },

  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',

  attendance: {
    qrTtlSeconds: parseInt(process.env.ATTENDANCE_QR_TTL_SECONDS || '300', 10),
  },

  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'Flocks <no-reply@flocks.app>',
  },
};
