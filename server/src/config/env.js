const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const toBool = (val, def = false) => {
  if (val === undefined || val === null || val === '') return def;
  return String(val).toLowerCase() === 'true';
};

const toArray = (val) =>
  (val || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: parseInt(process.env.PORT, 10) || 5000,
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:4200',

  mongoUri:
    process.env.NODE_ENV === 'test'
      ? process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/projecta_test'
      : process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/projecta',

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev_access_secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: process.env.JWT_ISSUER || 'projectA',
    useSecureCookieRefresh: toBool(process.env.USE_SECURE_COOKIE_REFRESH, false),
  },

  password: {
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12,
    minLength: parseInt(process.env.PASSWORD_MIN_LENGTH, 10) || 8,
  },

  encryption: {
    enabled: toBool(process.env.ENCRYPTION_ENABLED, false),
    key: process.env.ENCRYPTION_KEY || '',
    exemptPaths: toArray(process.env.ENCRYPTION_EXEMPT_PATHS),
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 300,
    authMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 20,
  },

  seed: {
    superAdminEmail: process.env.SEED_SUPERADMIN_EMAIL || 'superadmin@projecta.com',
    superAdminUsername: process.env.SEED_SUPERADMIN_USERNAME || 'superadmin',
    superAdminPassword: process.env.SEED_SUPERADMIN_PASSWORD || 'SuperAdmin@123',
    superAdminFirstName: process.env.SEED_SUPERADMIN_FIRSTNAME || 'Super',
    superAdminLastName: process.env.SEED_SUPERADMIN_LASTNAME || 'Admin',
  },

  whatsapp: {
    provider: process.env.WHATSAPP_PROVIDER || 'meta',
    enabled: toBool(process.env.WHATSAPP_ENABLED, false),
    meta: {
      token: process.env.META_WHATSAPP_TOKEN || '',
      phoneNumberId: process.env.META_WHATSAPP_PHONE_NUMBER_ID || '',
      apiVersion: process.env.META_WHATSAPP_API_VERSION || 'v20.0',
    },
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID || '',
      authToken: process.env.TWILIO_AUTH_TOKEN || '',
      from: process.env.TWILIO_WHATSAPP_FROM || '',
    },
  },

  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: toBool(process.env.SMTP_SECURE, false),
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.SMTP_FROM || 'ProjectA <no-reply@projecta.com>',
  },

  reminder: {
    cronSchedule: process.env.REMINDER_CRON_SCHEDULE || '0 9 * * *',
    timezone: process.env.REMINDER_TIMEZONE || 'Asia/Kolkata',
  },

  logLevel: process.env.LOG_LEVEL || 'info',
};

module.exports = env;
