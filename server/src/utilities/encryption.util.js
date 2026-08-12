const crypto = require('crypto');
const env = require('../config/env');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // recommended for GCM

/**
 * Derives a 32-byte key from the configured ENCRYPTION_KEY.
 * Accepts either a 64-char hex string or an arbitrary passphrase (hashed with sha256).
 */
function getKey() {
  const raw = env.encryption.key || '';
  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    return Buffer.from(raw, 'hex');
  }
  return crypto.createHash('sha256').update(raw).digest();
}

/**
 * Encrypts a JS value (object/string) using AES-256-GCM.
 * Returns a base64 payload string containing iv + authTag + ciphertext.
 * @param {*} value
 * @returns {string}
 */
function encrypt(value) {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const plaintext = typeof value === 'string' ? value : JSON.stringify(value);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

/**
 * Decrypts a base64 payload produced by `encrypt`.
 * @param {string} payload
 * @returns {string} decrypted plaintext (caller should JSON.parse if needed)
 */
function decrypt(payload) {
  const key = getKey();
  const buffer = Buffer.from(payload, 'base64');

  const iv = buffer.subarray(0, IV_LENGTH);
  const authTag = buffer.subarray(IV_LENGTH, IV_LENGTH + 16);
  const encrypted = buffer.subarray(IV_LENGTH + 16);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

  return decrypted.toString('utf8');
}

module.exports = { encrypt, decrypt };
