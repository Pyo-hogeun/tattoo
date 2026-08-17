export const KAKAO_OAUTH_STATE_KEY = 'kakao_oauth_state'
export const KAKAO_OAUTH_FLOW_KEY = 'kakao_oauth_flow'
export const KAKAO_USER_SIGNUP_FLOW = 'user-signup'
export const LEGACY_SHOP_SIGNUP_KEY = 'signup_shop'

export function clearKakaoSignupSession() {
  sessionStorage.removeItem(KAKAO_OAUTH_STATE_KEY)
  sessionStorage.removeItem(KAKAO_OAUTH_FLOW_KEY)
  sessionStorage.removeItem(LEGACY_SHOP_SIGNUP_KEY)
}

export function createKakaoCustomerAuthUrl(clientId: string, redirectUri: string) {
  const state = crypto.randomUUID()

  sessionStorage.setItem(KAKAO_OAUTH_STATE_KEY, state)
  sessionStorage.setItem(KAKAO_OAUTH_FLOW_KEY, KAKAO_USER_SIGNUP_FLOW)
  sessionStorage.removeItem(LEGACY_SHOP_SIGNUP_KEY)

  const query = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    state,
  })

  return `https://kauth.kakao.com/oauth/authorize?${query.toString()}`
}

export function validateKakaoCustomerCallback(search: string) {
  const query = new URLSearchParams(search)
  const code = query.get('code')
  const state = query.get('state')
  const storedState = sessionStorage.getItem(KAKAO_OAUTH_STATE_KEY)
  const storedFlow = sessionStorage.getItem(KAKAO_OAUTH_FLOW_KEY)

  if (!code || !state || !storedState || state !== storedState || storedFlow !== KAKAO_USER_SIGNUP_FLOW) {
    return null
  }

  return { code }
}
