require('dotenv').config();

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  trustProxyHops: Number(process.env.TRUST_PROXY_HOPS || 0),

  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/affiliate_platform',

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev_access_secret',
    accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || '30d',
  },

  cookieSecret: process.env.COOKIE_SECRET || 'dev_cookie_secret',

  upload: {
    storage: process.env.UPLOAD_STORAGE || 'local',
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 20,
  },

  minio: {
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: Number(process.env.MINIO_PORT || 9000),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || '',
    secretKey: process.env.MINIO_SECRET_KEY || '',
    bucket: process.env.MINIO_BUCKET || 'affiliate-files',
  },

  rateLimit: {
    windowMin: parseInt(process.env.RATE_LIMIT_WINDOW_MIN, 10) || 15,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 300,
  },

  redisUrl: process.env.REDIS_URL || null,

  superAdmin: {
    email: process.env.SUPER_ADMIN_EMAIL || 'admin@affiliate.local',
    password: process.env.SUPER_ADMIN_PASSWORD || '',
    name: process.env.SUPER_ADMIN_NAME || 'Super Admin',
  },
};

if (!Number.isInteger(env.trustProxyHops) || env.trustProxyHops < 0) {
  throw new Error('TRUST_PROXY_HOPS must be a non-negative integer');
}
if (!['local', 'minio'].includes(env.upload.storage)) {
  throw new Error('UPLOAD_STORAGE must be local or minio');
}
if (env.upload.storage === 'minio' && (!env.minio.accessKey || !env.minio.secretKey)) {
  throw new Error('MinIO storage requires MINIO_ACCESS_KEY and MINIO_SECRET_KEY');
}
if (!Number.isInteger(env.minio.port) || env.minio.port < 1 || env.minio.port > 65535) {
  throw new Error('MINIO_PORT must be between 1 and 65535');
}
if (env.nodeEnv === 'production') {
  if (!process.env.MONGO_URI || !/^mongodb(\+srv)?:\/\//.test(process.env.MONGO_URI)) {
    throw new Error('Production requires an explicit MONGO_URI');
  }
  const secrets = [env.jwt.accessSecret, env.jwt.refreshSecret, env.cookieSecret];
  if (secrets.some((value) => value.length < 32 || /^(dev_|change_this)/.test(value)) ||
      new Set(secrets).size !== secrets.length) {
    throw new Error('Production requires distinct JWT and cookie secrets of at least 32 characters');
  }
  const origin = new URL(env.clientUrl);
  if (origin.protocol !== 'https:' || origin.origin !== env.clientUrl) {
    throw new Error('CLIENT_URL must be an HTTPS origin in production');
  }
}

module.exports = env;
