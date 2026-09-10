import crypto from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(crypto.scrypt);
const KEY_LENGTH = 64;

export const hashPassword = async (password) => {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = await scrypt(password, salt, KEY_LENGTH);
  return `scrypt:${salt}:${derivedKey.toString('hex')}`;
};

export const verifyPassword = async (password, storedHash) => {
  const [algorithm, salt, encodedKey] = String(storedHash || '').split(':');
  if (algorithm !== 'scrypt' || !salt || !encodedKey) return false;

  const expectedKey = Buffer.from(encodedKey, 'hex');
  if (expectedKey.length !== KEY_LENGTH) return false;
  const derivedKey = await scrypt(password, salt, KEY_LENGTH);
  return crypto.timingSafeEqual(derivedKey, expectedKey);
};
