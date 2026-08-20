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

const env = require('./config/env');
const logger = require('./config/logger');
const apiRoutes = require('./routes');
const { notFoundHandler, errorHandler } = require('./common/middleware/errorHandler');
const { apiLimiter } = require('./common/middleware/rateLimit');

const app = express();

// --- Security & core middleware ---
app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
console.log("env.clientUrl is :",env.clientUrl)
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser(env.cookieSecret));
app.use(mongoSanitize()); // strip $/. operators from user input (NoSQL injection)
app.use(xss()); // sanitize user input against XSS
app.use(hpp()); // prevent HTTP param pollution

if (env.nodeEnv !== 'test') {
  app.use(
    morgan('combined', {
      stream: { write: (msg) => logger.info(msg.trim()) },
    })
  );
}

app.use(env.apiPrefix, apiLimiter);

// --- Static file serving for local uploads (swap for CDN/S3 URL later) ---
app.use(`/${env.upload.dir}`, express.static(path.join(process.cwd(), env.upload.dir)));

// --- Health check ---
app.get('/health', (req, res) => res.json({ success: true, status: 'ok', env: env.nodeEnv }));

// --- API routes ---
app.use(env.apiPrefix, apiRoutes);

// --- 404 + error handling (must be last) ---
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
