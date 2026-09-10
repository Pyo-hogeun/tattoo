export const KAKAO_OAUTH_STATE_KEY = 'kakao_oauth_state'
export const KAKAO_OAUTH_FLOW_KEY = 'kakao_oauth_flow'
export const KAKAO_USER_SIGNUP_FLOW = 'user-signup'
export const KAKAO_USER_LOGIN_FLOW = 'user-login'
export const KAKAO_PROFILE_NICKNAME_SCOPE = 'profile_nickname'
export const LEGACY_SHOP_SIGNUP_KEY = 'signup_shop'

export function clearKakaoSignupSession() {
  sessionStorage.removeItem(KAKAO_OAUTH_STATE_KEY)
  sessionStorage.removeItem(KAKAO_OAUTH_FLOW_KEY)
  sessionStorage.removeItem(LEGACY_SHOP_SIGNUP_KEY)
}

export type KakaoCustomerFlow = typeof KAKAO_USER_SIGNUP_FLOW | typeof KAKAO_USER_LOGIN_FLOW

export function createKakaoCustomerAuthUrl(clientId: string, redirectUri: string, flow: KakaoCustomerFlow) {
  const state = crypto.randomUUID()

  sessionStorage.setItem(KAKAO_OAUTH_STATE_KEY, state)
  sessionStorage.setItem(KAKAO_OAUTH_FLOW_KEY, flow)
  sessionStorage.removeItem(LEGACY_SHOP_SIGNUP_KEY)

  const query = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    state,
    scope: KAKAO_PROFILE_NICKNAME_SCOPE,
  })

  return `https://kauth.kakao.com/oauth/authorize?${query.toString()}`
}

export function validateKakaoCustomerCallback(search: string): { code: string; flow: KakaoCustomerFlow } | null {
  const query = new URLSearchParams(search)
  const code = query.get('code')
  const state = query.get('state')
  const storedState = sessionStorage.getItem(KAKAO_OAUTH_STATE_KEY)
  const storedFlow = sessionStorage.getItem(KAKAO_OAUTH_FLOW_KEY)

  const isCustomerFlow = storedFlow === KAKAO_USER_SIGNUP_FLOW || storedFlow === KAKAO_USER_LOGIN_FLOW
  if (!code || !state || !storedState || state !== storedState || !isCustomerFlow) {
    return null
  }

  return { code, flow: storedFlow }
}
