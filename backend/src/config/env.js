import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const configDirectory = path.dirname(fileURLToPath(import.meta.url));

// Always load backend/.env, even when the server is started from the repository root.
dotenv.config({ path: path.resolve(configDirectory, '../../.env') });

export const env = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/eyebrow_backoffice',
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  frontendOriginUser: process.env.FRONTEND_ORIGIN_USER,
  jwtSecret: process.env.JWT_SECRET || 'change-this-secret-in-production',
  kakaoClientId: process.env.KAKAO_CLIENT_ID?.trim() || '',
  kakaoClientSecret: process.env.KAKAO_CLIENT_SECRET?.trim() || '',
  kakaoRedirectUri: process.env.KAKAO_REDIRECT_URI?.trim() || 'http://localhost:3000/auth/kakao/callback',
  enableTestAuth: process.env.NODE_ENV !== 'production' && process.env.ENABLE_TEST_AUTH === 'true',
  r2Endpoint: process.env.R2_ENDPOINT?.trim() || '',
  r2AccessKey: process.env.R2_ACCESS_KEY?.trim() || '',
  r2SecretKey: process.env.R2_SECRET_KEY?.trim() || '',
  r2Bucket: process.env.R2_BUCKET?.trim() || '',
  r2PublicUrl: process.env.R2_PUBLIC_URL?.trim().replace(/\/$/, '') || ''
};
