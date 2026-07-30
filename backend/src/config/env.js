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
  kakaoRedirectUri: process.env.KAKAO_REDIRECT_URI?.trim() || 'http://localhost:3000/auth/kakao/callback'
};
