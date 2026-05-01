import CryptoJS from 'crypto-js';
import bcrypt from 'bcryptjs';
import config from '../config/index.js';

const key = config.encryptionKey;

export function encrypt(text) {
  if (!text) return null;
  return CryptoJS.AES.encrypt(text, key).toString();
}

export function decrypt(ciphertext) {
  if (!ciphertext) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption failed:', error.message);
    return null;
  }
}

export function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

export function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}