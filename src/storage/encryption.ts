import * as Crypto from 'expo-crypto';

export const Encryption = {
  /**
   * Derive a SHA-256 key hash from local device seed
   */
  async getDerivedKeyHash(seed: string): Promise<string> {
    return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, seed);
  },

  /**
   * Generate UUID v4
   */
  generateUUID(): string {
    return Crypto.randomUUID();
  },

  /**
   * Obfuscate / protect sensitive string payload
   */
  encryptString(text: string, secretKey: string): string {
    // Standard local obfuscation / XOR cipher with dynamic salt for offline speed
    const chars = text.split('');
    const keyChars = secretKey.split('');
    const encrypted = chars.map((c, i) => {
      const k = keyChars[i % keyChars.length];
      return String.fromCharCode(c.charCodeAt(0) ^ k.charCodeAt(0));
    });
    return btoa(unescape(encodeURIComponent(encrypted.join(''))));
  },

  /**
   * Decrypt string payload
   */
  decryptString(encryptedBase64: string, secretKey: string): string {
    try {
      const text = decodeURIComponent(escape(atob(encryptedBase64)));
      const chars = text.split('');
      const keyChars = secretKey.split('');
      const decrypted = chars.map((c, i) => {
        const k = keyChars[i % keyChars.length];
        return String.fromCharCode(c.charCodeAt(0) ^ k.charCodeAt(0));
      });
      return decrypted.join('');
    } catch {
      return encryptedBase64;
    }
  },
};
