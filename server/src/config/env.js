require('dotenv').config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/affiliate_platform',

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev_access_secret',
    accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || '30d',
  },

  cookieSecret: process.env.COOKIE_SECRET || 'dev_cookie_secret',

  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 20,
  },

  rateLimit: {
    windowMin: parseInt(process.env.RATE_LIMIT_WINDOW_MIN, 10) || 15,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 300,
  },

  redisUrl: process.env.REDIS_URL || null,

  superAdmin: {
    email: process.env.SUPER_ADMIN_EMAIL || 'admin@affiliate.local',
    password: process.env.SUPER_ADMIN_PASSWORD || 'Admin@123456',
    name: process.env.SUPER_ADMIN_NAME || 'Super Admin',
  },
};

module.exports = env;
