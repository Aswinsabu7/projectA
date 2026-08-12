const env = require('../config/env');
const logger = require('../config/logger');
const ApiError = require('../utilities/apiError');
const { encrypt, decrypt } = require('../utilities/encryption.util');

/**
 * Payload Encryption Middleware
 * ------------------------------------------------------------------
 * When ENCRYPTION_ENABLED=true, the API expects incoming request bodies
 * in the shape `{ payload: "<base64 AES-256-GCM ciphertext>" }` and will
 * respond in the same shape. Paths listed in ENCRYPTION_EXEMPT_PATHS
 * (e.g. /api/v1/auth/login) bypass encryption so clients can bootstrap
 * a session before exchanging keys.
 *
 * This keeps the encryption concern fully server-side configurable and
 * mirrors the Angular EncryptionInterceptor on the client.
 */
function isExempt(req) {
  const path = req.baseUrl + (req.path === '/' ? '' : req.path);
  return env.encryption.exemptPaths.some((p) => path.startsWith(p));
}

function decryptRequest(req, _res, next) {
  if (!env.encryption.enabled || isExempt(req)) return next();
  if (!req.body || typeof req.body.payload !== 'string') {
    return next(); // nothing to decrypt (e.g. GET requests with no body)
  }

  try {
    const decrypted = decrypt(req.body.payload);
    req.body = decrypted ? JSON.parse(decrypted) : {};
    next();
  } catch (err) {
    logger.warn(`Failed to decrypt request payload: ${err.message}`);
    next(ApiError.badRequest('Unable to decrypt request payload'));
  }
}

function encryptResponse(req, res, next) {
  if (!env.encryption.enabled || isExempt(req)) return next();

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    try {
      const encrypted = encrypt(body);
      return originalJson({ payload: encrypted });
    } catch (err) {
      logger.error(`Failed to encrypt response payload: ${err.message}`);
      return originalJson(body);
    }
  };

  next();
}

module.exports = { decryptRequest, encryptResponse };
