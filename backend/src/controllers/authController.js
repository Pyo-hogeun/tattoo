import { env } from '../config/env.js';
import { Shop } from '../models/Shop.js';
import { User } from '../models/User.js';
import { signToken } from '../utils/token.js';

const getKakaoProfile = async ({ accessToken, code, redirectUri }) => {
  let token = accessToken;
  if (!token && code) {
    const body = new URLSearchParams({ grant_type: 'authorization_code', client_id: env.kakaoClientId, redirect_uri: redirectUri, code });
    if (env.kakaoClientSecret) body.set('client_secret', env.kakaoClientSecret);
    const response = await fetch('https://kauth.kakao.com/oauth/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error_description || '카카오 토큰 발급에 실패했습니다.');
    token = data.access_token;
  }
  if (!token) throw new Error('카카오 인증 정보가 필요합니다.');
  const response = await fetch('https://kapi.kakao.com/v2/user/me', { headers: { Authorization: `Bearer ${token}` } });
  const profile = await response.json();
  if (!response.ok) throw new Error('카카오 사용자 확인에 실패했습니다.');
  return profile;
};

const publicUser = (user) => ({ id: user.id, nickname: user.nickname, role: user.role, shop: user.shop });

export const kakaoSignUp = async (req, res, next) => {
  try {
    const { shopName, address, phone } = req.body;
    if (![shopName, address, phone].every((value) => typeof value === 'string' && value.trim())) {
      return res.status(400).json({ message: '매장명, 주소, 전화번호는 필수입니다.' });
    }
    const profile = await getKakaoProfile(req.body);
    if (await User.exists({ kakaoId: String(profile.id) })) return res.status(409).json({ message: '이미 가입한 카카오 계정입니다.' });
    const shop = await Shop.create({ name: shopName.trim(), address: address.trim(), phone: phone.trim(), dataSourceType: 'manual', sourceName: 'signup' });
    try {
      const user = await User.create({ kakaoId: String(profile.id), nickname: profile.properties?.nickname || profile.kakao_account?.profile?.nickname, role: 'manager', shop: shop._id });
      await user.populate('shop');
      const token = signToken(user);
      res.status(201).json({ token, user: publicUser(user) });
    } catch (error) {
      await Shop.findByIdAndDelete(shop._id);
      throw error;
    }
  } catch (error) { next(error); }
};

export const kakaoLogin = async (req, res, next) => {
  try {
    const profile = await getKakaoProfile(req.body);
    const user = await User.findOne({ kakaoId: String(profile.id) }).populate('shop');
    if (!user) return res.status(404).json({ message: '가입되지 않은 계정입니다.' });
    if (!user.isActive) return res.status(403).json({ message: '비활성 계정입니다.' });
    const token = signToken(user);
    res.json({ token, user: publicUser(user) });
  } catch (error) { next(error); }
};

export const me = (req, res) => res.json({ user: publicUser(req.user) });

export const updateUserRole = async (req, res, next) => {
  try {
    if (!['master', 'admin', 'manager'].includes(req.body.role)) return res.status(400).json({ message: '올바른 권한을 선택해 주세요.' });
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true, runValidators: true }).populate('shop');
    if (!user) return res.status(404).json({ message: '회원을 찾을 수 없습니다.' });
    res.json({ user: publicUser(user) });
  } catch (error) { next(error); }
};
