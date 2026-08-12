import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

const IV_LENGTH = 12;
const TAG_LENGTH = 16;

/**
 * AES-256-GCM payload encryption service - mirrors the backend's
 * `utilities/encryption.util.js` byte layout: base64( iv[12] + authTag[16] + ciphertext ).
 *
 * Web Crypto's `encrypt()` appends the auth tag to the END of the ciphertext,
 * whereas Node's `crypto` module returns them separately. This service
 * re-arranges the bytes on each side so the two implementations interoperate.
 *
 * Enabled/disabled via `environment.encryptionEnabled` to match the server's
 * `ENCRYPTION_ENABLED` flag.
 */
@Injectable({ providedIn: 'root' })
export class EncryptionService {
  private keyPromise: Promise<CryptoKey> | null = null;

  get enabled(): boolean {
    return environment.encryptionEnabled;
  }

  private async getKey(): Promise<CryptoKey> {
    if (!this.keyPromise) {
      this.keyPromise = this.deriveKey(environment.encryptionKey);
    }
    return this.keyPromise;
  }

  private async deriveKey(rawKey: string): Promise<CryptoKey> {
    let keyBytes: Uint8Array;

    if (/^[0-9a-fA-F]{64}$/.test(rawKey)) {
      keyBytes = this.hexToBytes(rawKey);
    } else {
      const encoded = new TextEncoder().encode(rawKey);
      const digest = await crypto.subtle.digest('SHA-256', encoded);
      keyBytes = new Uint8Array(digest);
    }

    return crypto.subtle.importKey('raw', keyBytes as BufferSource, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
  }

  async encrypt(value: unknown): Promise<string> {
    const key = await this.getKey();
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const plaintext = new TextEncoder().encode(typeof value === 'string' ? value : JSON.stringify(value));

    const encryptedWithTag = new Uint8Array(
      await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv as BufferSource, tagLength: TAG_LENGTH * 8 }, key, plaintext as BufferSource)
    );

    const ciphertext = encryptedWithTag.slice(0, encryptedWithTag.length - TAG_LENGTH);
    const authTag = encryptedWithTag.slice(encryptedWithTag.length - TAG_LENGTH);

    const combined = new Uint8Array(iv.length + authTag.length + ciphertext.length);
    combined.set(iv, 0);
    combined.set(authTag, iv.length);
    combined.set(ciphertext, iv.length + authTag.length);

    return this.bytesToBase64(combined);
  }

  async decrypt<T = unknown>(payload: string): Promise<T> {
    const key = await this.getKey();
    const combined = this.base64ToBytes(payload);

    const iv = combined.slice(0, IV_LENGTH);
    const authTag = combined.slice(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const ciphertext = combined.slice(IV_LENGTH + TAG_LENGTH);

    const ciphertextWithTag = new Uint8Array(ciphertext.length + authTag.length);
    ciphertextWithTag.set(ciphertext, 0);
    ciphertextWithTag.set(authTag, ciphertext.length);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv as BufferSource, tagLength: TAG_LENGTH * 8 },
      key,
      ciphertextWithTag as BufferSource
    );

    const text = new TextDecoder().decode(decrypted);
    try {
      return JSON.parse(text) as T;
    } catch {
      return text as unknown as T;
    }
  }

  private hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
  }

  private bytesToBase64(bytes: Uint8Array): string {
    let binary = '';
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return btoa(binary);
  }

  private base64ToBytes(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  }
}
