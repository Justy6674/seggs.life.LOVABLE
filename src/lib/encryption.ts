import CryptoJS from 'crypto-js';

// Encryption key from environment variables
const getEncryptionKey = (): string => {
  const key = process.env.ENCRYPTION_KEY || process.env.NEXT_PUBLIC_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('Encryption key not found in environment variables');
  }
  return key;
};

/**
 * Encrypts sensitive text data using AES encryption
 * Used for thought bubbles, diary entries, and other private content
 */
export const encryptText = (text: string, userKey?: string): string => {
  try {
    const key = userKey || getEncryptionKey();
    const encrypted = CryptoJS.AES.encrypt(text, key).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypts sensitive text data
 */
export const decryptText = (encryptedText: string, userKey?: string): string => {
  try {
    const key = userKey || getEncryptionKey();
    const decrypted = CryptoJS.AES.decrypt(encryptedText, key);
    const originalText = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!originalText) {
      throw new Error('Failed to decrypt data - invalid key or corrupted data');
    }
    
    return originalText;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Generates a random encryption key for user-specific encryption
 * This can be stored securely on the user's device for additional privacy layers
 */
export const generateUserKey = (): string => {
  return CryptoJS.lib.WordArray.random(256/8).toString();
};

/**
 * Creates a hash of sensitive data for verification without storing the actual content
 */
export const hashData = (data: string): string => {
  return CryptoJS.SHA256(data).toString();
};

/**
 * Securely generates a random invite code for couple pairing
 */
export const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Generates a secure panic lock PIN
 */
export const generatePanicPin = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

/**
 * Utility to clear sensitive data from memory (best effort)
 */
export const clearSensitiveData = (obj: any): void => {
  if (typeof obj === 'object' && obj !== null) {
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'string') {
        obj[key] = '';
      } else if (typeof obj[key] === 'object') {
        clearSensitiveData(obj[key]);
      }
    });
  }
}; 