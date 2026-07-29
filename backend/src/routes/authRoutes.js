import { Router } from 'express';
import { kakaoLogin, kakaoSignUp, me, updateUserRole } from '../controllers/authController.js';
import { allowRoles, authenticate } from '../middleware/auth.js';
const router = Router();
router.post('/kakao/signup', kakaoSignUp);
router.post('/kakao/login', kakaoLogin);
router.get('/me', authenticate, me);
router.patch('/users/:id/role', authenticate, allowRoles('master'), updateUserRole);
export default router;
