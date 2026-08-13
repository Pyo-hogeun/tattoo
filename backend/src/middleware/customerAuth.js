import { Customer } from '../models/Customer.js';
import { verifyToken } from '../utils/token.js';

export const authenticateCustomer = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.match(/^Bearer (.+)$/i)?.[1];
    if (!token) return res.status(401).json({ message: '일반 사용자 로그인이 필요합니다.' });
    const payload = verifyToken(token);
    if (payload.role !== 'user') return res.status(403).json({ message: '일반 사용자 토큰이 필요합니다.' });
    const customer = await Customer.findById(payload.sub);
    if (!customer?.isActive) return res.status(401).json({ message: '유효하지 않은 일반 사용자 계정입니다.' });
    req.customer = customer;
    next();
  } catch {
    res.status(401).json({ message: '일반 사용자 인증 토큰이 유효하지 않습니다.' });
  }
};
