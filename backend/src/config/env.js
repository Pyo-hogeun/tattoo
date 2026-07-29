import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/eyebrow_backoffice',
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  frontendOriginUser: process.env.FRONTEND_ORIGIN_USER,
  jwtSecret: process.env.JWT_SECRET || 'change-this-secret-in-production',
  kakaoClientId: process.env.KAKAO_CLIENT_ID || '',
  kakaoClientSecret: process.env.KAKAO_CLIENT_SECRET || ''
};
