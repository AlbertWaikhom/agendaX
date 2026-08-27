import * as Crypto from 'expo-crypto';

export const Encryption = {

  async getDerivedKeyHash(seed: string): Promise<string> {
    return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, seed);
  },

  generateUUID(): string {
    return Crypto.randomUUID();
  },

  encryptString(text: string, secretKey: string): string {
    const chars = text.split('');
    const keyChars = secretKey.split('');
    const encrypted = chars.map((c, i) => {
      const k = keyChars[i % keyChars.length];
      return String.fromCharCode(c.charCodeAt(0) ^ k.charCodeAt(0));
    });
    return btoa(unescape(encodeURIComponent(encrypted.join(''))));
  },

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
