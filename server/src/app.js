const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');
const { storageClient } = require('./config/storage');

const env = require('./config/env');
const logger = require('./config/logger');
const apiRoutes = require('./routes');
const { notFoundHandler, errorHandler } = require('./common/middleware/errorHandler');
const { apiLimiter } = require('./common/middleware/rateLimit');

const app = express();
app.set('trust proxy', env.trustProxyHops);

// --- Security & core middleware ---
app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser(env.cookieSecret));
app.use(mongoSanitize()); // strip $/. operators from user input (NoSQL injection)
app.use(xss()); // sanitize user input against XSS
app.use(hpp()); // prevent HTTP param pollution

if (env.nodeEnv !== 'test') {
  app.use(
    // Exclude query strings, which may contain media tokens.
    morgan(':remote-addr :method :safe-path :status :response-time ms', {
      stream: { write: (msg) => logger.info(msg.trim()) },
    })
  );
}

morgan.token('safe-path', (req) => req.originalUrl.split('?')[0]);

// --- Static file serving for local uploads (swap for CDN/S3 URL later) ---
app.use(`/${env.upload.dir}`, express.static(path.join(process.cwd(), env.upload.dir)));

// --- Health check ---
app.get('/health', (req, res) => res.json({ success: true, status: 'ok', env: env.nodeEnv }));
app.get(['/api/health', `${env.apiPrefix}/health`], async (req, res) => {
  let deadline;
  try {
    if (mongoose.connection.readyState !== 1) throw new Error('Database unavailable');
    await Promise.race([
      (async () => {
        await mongoose.connection.db.admin().ping({ maxTimeMS: 2000 });
        if (storageClient && !(await storageClient.bucketExists(env.minio.bucket))) {
          throw new Error('Storage unavailable');
        }
      })(),
      // eslint-disable-next-line no-unused-vars
      new Promise((resolve, reject) => {
        deadline = setTimeout(() => reject(new Error('Readiness timed out')), 3000);
      }),
    ]);
    res.json({ success: true, status: 'ok' });
  } catch {
    res.status(503).json({ success: false, status: 'unavailable' });
  } finally {
    clearTimeout(deadline);
  }
});

// Product media is public in this application; MinIO itself stays private.
app.get('/uploads/objects/:objectKey', async (req, res, next) => {
  if (!storageClient) return next();
  try {
    const File = require('./modules/files/file.model');
    const record = await File.findOne({ storage: 'minio', objectKey: req.params.objectKey });
    if (!record) return res.sendStatus(404);
    let start = 0;
    let end = record.size - 1;
    const range = req.headers.range;
    if (range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (match && (match[1] || match[2])) {
        if (match[1]) {
          start = Number(match[1]);
          if (match[2]) end = Math.min(Number(match[2]), end);
        } else {
          start = Math.max(0, record.size - Number(match[2]));
        }
      }
      if (!match || (!match[1] && !match[2]) || !Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= record.size) {
        res.setHeader('Content-Range', `bytes */${record.size}`);
        return res.sendStatus(416);
      }
    }
    const stream = range
      ? await storageClient.getPartialObject(env.minio.bucket, record.objectKey, start, end - start + 1)
      : await storageClient.getObject(env.minio.bucket, record.objectKey);
    if (range) {
      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${record.size}`);
    }
    res.type(record.mimeType);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Length', range ? end - start + 1 : record.size);
    stream.on('error', (error) => {
      if (res.headersSent) res.destroy(error);
      else next(error);
    });
    req.on('aborted', () => stream.destroy());
    res.on('close', () => stream.destroy());
    stream.pipe(res);
  } catch (error) {
    next(error);
  }
});
app.use(env.apiPrefix, apiLimiter);

// --- API routes ---
app.use(env.apiPrefix, apiRoutes);

// --- 404 + error handling (must be last) ---
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
