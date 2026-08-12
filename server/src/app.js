const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const env = require('./config/env');
const logger = require('./config/logger');
const routes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const { decryptRequest, encryptResponse } = require('./middleware/encryption');

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

// Compression & logging
app.use(compression());
app.use(morgan(env.isProduction ? 'combined' : 'dev', { stream: { write: (msg) => logger.info(msg.trim()) } }));

// Sanitization against NoSQL injection & XSS
app.use(mongoSanitize());
app.use(xss());

// Global rate limiting (auth routes have their own stricter limiter)
app.use(env.apiPrefix, apiLimiter);

// Payload encryption (configurable via ENCRYPTION_ENABLED)
app.use(env.apiPrefix, decryptRequest);
app.use(env.apiPrefix, encryptResponse);

// API routes
app.use(env.apiPrefix, routes);

app.get('/', (_req, res) => {
  res.json({ success: true, message: 'ProjectA API is running', docs: `${env.apiPrefix}/health` });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
