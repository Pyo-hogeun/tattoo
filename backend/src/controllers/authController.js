import { env } from '../config/env.js';
import { Shop } from '../models/Shop.js';
import { User } from '../models/User.js';
import { signToken } from '../utils/token.js';
import { hashPassword, verifyPassword } from '../utils/password.js';

const testAuthUnavailable = () => {
  const error = new Error('임시 ID/PW 인증이 비활성화되어 있습니다.');
  error.statusCode = 404;
  return error;
};

const normalizeLoginId = (value) => typeof value === 'string' ? value.trim().toLowerCase() : '';

const validateTestPassword = (password) => typeof password === 'string' && password.length >= 8;

const getKakaoProfile = async ({ accessToken, code, redirectUri, clientId }) => {
  let token = accessToken;
  if (!token && code) {
    if (!env.kakaoClientId) {
      const error = new Error('백엔드의 KAKAO_CLIENT_ID가 설정되지 않았습니다. backend/.env를 확인하고 서버를 다시 시작해 주세요.');
      error.statusCode = 503;
      throw error;
    }
    if (clientId && clientId !== env.kakaoClientId) {
      const error = new Error('프론트엔드와 백엔드의 카카오 REST API 키가 서로 다릅니다. 두 .env 파일의 키를 동일하게 설정해 주세요.');
      error.statusCode = 400;
      throw error;
    }
    if (redirectUri && redirectUri !== env.kakaoRedirectUri) {
      const error = new Error('카카오 Redirect URI 설정이 프론트엔드와 백엔드에서 일치하지 않습니다.');
      error.statusCode = 400;
      throw error;
    }
    const body = new URLSearchParams({ grant_type: 'authorization_code', client_id: env.kakaoClientId, redirect_uri: env.kakaoRedirectUri, code });
    if (env.kakaoClientSecret) body.set('client_secret', env.kakaoClientSecret);
    const response = await fetch('https://kauth.kakao.com/oauth/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
    const data = await response.json();
    if (!response.ok) {
      const isBadCredentials = data.error_description === 'Bad client credentials';
      const message = isBadCredentials
        ? '카카오 앱 인증 정보가 올바르지 않습니다. REST API 키가 같은 앱의 키인지 확인하고, Client Secret을 활성화하지 않았다면 backend/.env의 KAKAO_CLIENT_SECRET을 비워 주세요. 활성화했다면 카카오 콘솔의 Client Secret 코드와 정확히 일치시켜 주세요.'
        : `카카오 토큰 발급에 실패했습니다: ${data.error_description || data.error || 'unknown error'}`;
      const error = new Error(message);
      error.statusCode = 400;
      throw error;
    }
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

export const testSignUp = async (req, res, next) => {
  let shop;
  try {
    if (!env.enableTestAuth) throw testAuthUnavailable();
    const body = req.body || {};
    const { nickname, shopName, address, phone } = body;
    const loginId = normalizeLoginId(body.loginId);
    const password = body.password;
    const role = ['master', 'admin', 'manager'].includes(body.role) ? body.role : 'manager';

    if (!/^[a-z0-9._-]{4,40}$/.test(loginId)) {
      return res.status(400).json({ message: 'ID는 영문 소문자, 숫자, ., _, - 조합으로 4~40자여야 합니다.' });
    }
    if (!validateTestPassword(password)) return res.status(400).json({ message: '비밀번호는 8자 이상이어야 합니다.' });
    if (![shopName, address, phone].every((value) => typeof value === 'string' && value.trim())) {
      return res.status(400).json({ message: '매장명, 주소, 전화번호는 필수입니다.' });
    }
    if (await User.exists({ loginId })) return res.status(409).json({ message: '이미 사용 중인 ID입니다.' });

    shop = await Shop.create({
      name: shopName.trim(), address: address.trim(), phone: phone.trim(),
      dataSourceType: 'manual', sourceName: 'test-signup'
    });
    const user = await User.create({
      loginId,
      passwordHash: await hashPassword(password),
      nickname: typeof nickname === 'string' ? nickname.trim() : loginId,
      role,
      shop: shop._id
    });
    await user.populate('shop');
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (error) {
    if (shop) await Shop.findByIdAndDelete(shop._id).catch(() => {});
    next(error);
  }
};

export const testLogin = async (req, res, next) => {
  try {
    if (!env.enableTestAuth) throw testAuthUnavailable();
    const body = req.body || {};
    const loginId = normalizeLoginId(body.loginId);
    const user = await User.findOne({ loginId }).select('+passwordHash').populate('shop');
    if (!user || !await verifyPassword(body.password, user.passwordHash)) {
      return res.status(401).json({ message: 'ID 또는 비밀번호가 올바르지 않습니다.' });
    }
    if (!user.isActive) return res.status(403).json({ message: '비활성 계정입니다.' });
    res.json({ token: signToken(user), user: publicUser(user) });
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
