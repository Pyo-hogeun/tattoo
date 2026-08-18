import { apiBaseUrl } from './auth'
import { customerToken } from './customerAuth'
import type { CustomerAuthResponse, CustomerUser } from './customerAuth'
import type { KakaoCustomerFlow } from './kakaoCustomerSignup'

interface ErrorBody {
  message?: unknown
}

export class CustomerAuthApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message)
    this.name = 'CustomerAuthApiError'
  }
}

async function errorFromResponse(response: Response, fallback: string) {
  let message = ''
  try {
    const body = await response.json() as ErrorBody
    message = typeof body.message === 'string' ? body.message.trim() : ''
  } catch {
    // Empty and non-JSON errors use the caller's fallback.
  }
  return new CustomerAuthApiError(message || fallback, response.status)
}

export async function exchangeKakaoCustomerCode(
  flow: KakaoCustomerFlow,
  input: { code: string; redirectUri: string; clientId: string },
) {
  const endpoint = flow === 'user-login' ? 'login' : 'signup'
  let response: Response
  try {
    response = await fetch(`${apiBaseUrl}/auth/kakao/user/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
  } catch {
    throw new CustomerAuthApiError('서버에 연결할 수 없습니다. 네트워크 상태를 확인해 주세요.')
  }
  if (!response.ok) {
    const fallback = flow === 'user-login' && response.status === 404
      ? '가입된 일반 사용자 계정을 찾을 수 없습니다. 먼저 회원가입해 주세요.'
      : flow === 'user-signup' && response.status === 409
        ? '이미 가입한 일반 사용자 카카오 계정입니다.'
        : '카카오 인증을 완료하지 못했습니다.'
    throw await errorFromResponse(response, fallback)
  }
  return { status: response.status, data: await response.json() as CustomerAuthResponse }
}

function customerHeaders() {
  if (!customerToken.value) throw new CustomerAuthApiError('일반 사용자 로그인이 필요합니다.', 401)
  return { Authorization: `Bearer ${customerToken.value}` }
}

export async function getCurrentCustomer() {
  let response: Response
  try {
    response = await fetch(`${apiBaseUrl}/auth/user/me`, { headers: customerHeaders() })
  } catch (error) {
    if (error instanceof CustomerAuthApiError) throw error
    throw new CustomerAuthApiError('서버에 연결할 수 없습니다. 네트워크 상태를 확인해 주세요.')
  }
  if (!response.ok) throw await errorFromResponse(response, '일반 사용자 세션을 확인하지 못했습니다.')
  return await response.json() as { user: CustomerUser }
}

export async function deleteCurrentCustomer() {
  let response: Response
  try {
    response = await fetch(`${apiBaseUrl}/auth/user/me`, {
      method: 'DELETE',
      headers: customerHeaders(),
    })
  } catch (error) {
    if (error instanceof CustomerAuthApiError) throw error
    throw new CustomerAuthApiError('서버에 연결할 수 없습니다. 네트워크 상태를 확인해 주세요.')
  }
  if (!response.ok) throw await errorFromResponse(response, '회원 탈퇴를 처리하지 못했습니다.')
}
