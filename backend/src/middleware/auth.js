import { User } from '../models/User.js';
import { verifyToken } from '../utils/token.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.match(/^Bearer (.+)$/i)?.[1];
    if (!token) return res.status(401).json({ message: '로그인이 필요합니다.' });
    const payload = verifyToken(token);
    const user = await User.findById(payload.sub).populate('shop');
    if (!user?.isActive) return res.status(401).json({ message: '유효하지 않은 계정입니다.' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: '인증 토큰이 유효하지 않습니다.' });
  }
};

export const allowRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) return res.status(403).json({ message: '접근 권한이 없습니다.' });
  next();
};
