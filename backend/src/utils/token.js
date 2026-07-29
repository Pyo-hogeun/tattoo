import crypto from 'crypto';
import { env } from '../config/env.js';

const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');
const signature = (value) => crypto.createHmac('sha256', env.jwtSecret).update(value).digest('base64url');

export const signToken = (user) => {
  const value = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: user.id, role: user.role, exp: Math.floor(Date.now() / 1000) + 604800 })}`;
  return `${value}.${signature(value)}`;
};

export const verifyToken = (token) => {
  const [header, body, providedSignature] = token.split('.');
  const value = `${header}.${body}`;
  const expectedSignature = signature(value);
  if (!providedSignature || providedSignature.length !== expectedSignature.length || !crypto.timingSafeEqual(Buffer.from(providedSignature), Buffer.from(expectedSignature))) throw new Error('Invalid signature');
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
  if (!payload.sub || payload.exp < Date.now() / 1000) throw new Error('Expired token');
  return payload;
};
