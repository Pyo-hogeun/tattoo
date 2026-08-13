<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { apiBaseUrl } from '../services/auth'
import { isCustomerSignupResponse, saveCustomerSession } from '../services/customerAuth'
import {
  clearKakaoSignupSession,
  KAKAO_USER_LOGIN_FLOW,
  validateKakaoCustomerCallback,
} from '../services/kakaoCustomerSignup'
import { navigate } from '../router'

const errorMessage = ref('')
const errorReference = ref('')
const errorHelp = ref('')
const isProcessing = ref(false)
const isLoginFlow = ref(false)
let hasProcessedCallback = false

interface ApiErrorBody {
  code?: unknown
  errorCode?: unknown
  message?: unknown
}

async function readApiError(response: Response, fallback: string) {
  let body: ApiErrorBody = {}
  try {
    body = await response.json() as ApiErrorBody
  } catch {
    // Some proxies and server errors return an empty or non-JSON response.
  }

  const message = typeof body.message === 'string' && body.message.trim()
    ? body.message.trim()
    : fallback
  const codeValue = typeof body.code === 'string' ? body.code : body.errorCode
  const code = typeof codeValue === 'string' && codeValue.trim() ? codeValue.trim() : ''
  const requestId = response.headers.get('x-request-id')?.trim() ?? ''

  return {
    message,
    reference: [`HTTP ${response.status}`, code, requestId].filter(Boolean).join(' · '),
  }
}

async function completeCustomerAuth() {
  if (isProcessing.value || hasProcessedCallback) return
  hasProcessedCallback = true

  const callback = validateKakaoCustomerCallback(window.location.search)
  if (!callback) {
    errorMessage.value = '인증 요청이 만료되었거나 올바르지 않습니다. 카카오 인증을 다시 시작해 주세요.'
    clearKakaoSignupSession()
    return
  }
  isLoginFlow.value = callback.flow === KAKAO_USER_LOGIN_FLOW

  const clientId = import.meta.env.VITE_KAKAO_CLIENT_ID?.trim()
  const redirectUri = import.meta.env.VITE_KAKAO_REDIRECT_URI?.trim()
  if (!clientId || !redirectUri) {
    errorMessage.value = '카카오 회원가입 환경 설정이 누락되었습니다.'
    clearKakaoSignupSession()
    return
  }

  // Claim the one-time callback before the request so a remount or refresh cannot
  // exchange the same Kakao authorization code a second time.
  clearKakaoSignupSession()
  isProcessing.value = true
  try {
    const endpoint = callback.flow === KAKAO_USER_LOGIN_FLOW ? 'login' : 'signup'
    const response = await fetch(`${apiBaseUrl}/auth/kakao/user/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: callback.code, redirectUri, clientId }),
    })

    if (!response.ok) {
      const fallback = response.status === 409
        ? '이미 가입한 일반 사용자 카카오 계정입니다.'
        : response.status === 404 && isLoginFlow.value
          ? '가입된 일반 사용자 계정을 찾을 수 없습니다. 먼저 회원가입해 주세요.'
        : response.status === 503
          ? '현재 카카오 회원가입을 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.'
          : '카카오 인증 정보를 확인하지 못했습니다. 회원가입을 다시 시도해 주세요.'
      const error = await readApiError(response, fallback)
      errorMessage.value = error.message
      errorReference.value = error.reference
      if (response.status === 409 && !isLoginFlow.value) {
        errorHelp.value = '백오피스 계정을 삭제했는데도 반복된다면 Customer 또는 OAuth 연결 데이터가 남아 있거나, 회원가입과 로그인이 서로 다른 사용자 범위를 조회하고 있을 수 있습니다. 아래 오류 정보를 백엔드 담당자에게 전달해 주세요.'
      } else if (response.status === 404 && isLoginFlow.value) {
        errorHelp.value = '회원가입에서는 중복으로 판단했지만 로그인에서는 Customer를 찾지 못한 상태입니다. 프론트엔드가 임의로 계정을 합치지 않으며, 백엔드의 Customer 및 OAuth 연결 데이터 확인이 필요합니다.'
      }
      return
    }

    const data: unknown = await response.json()
    const expectedStatus = callback.flow === KAKAO_USER_LOGIN_FLOW ? 200 : 201
    if (response.status !== expectedStatus || !isCustomerSignupResponse(data)) {
      errorMessage.value = callback.flow === KAKAO_USER_LOGIN_FLOW
        ? '일반 사용자 로그인 응답을 확인할 수 없습니다.'
        : '일반 사용자 회원가입 응답을 확인할 수 없습니다.'
      return
    }

    saveCustomerSession(data)
    window.history.replaceState({}, '', '/auth/kakao/callback')
    navigate(callback.flow === KAKAO_USER_LOGIN_FLOW ? '/' : '/signup/complete')
  } catch {
    errorMessage.value = '서버에 연결할 수 없습니다. 네트워크 상태를 확인한 후 다시 시도해 주세요.'
  } finally {
    isProcessing.value = false
  }
}

onMounted(completeCustomerAuth)
</script>

<template>
  <section class="auth-callback" :aria-busy="isProcessing" aria-live="polite">
    <template v-if="errorMessage">
      <div class="auth-result-icon auth-result-icon--error" aria-hidden="true">!</div>
      <h1>{{ isLoginFlow ? '로그인하지 못했어요.' : '회원가입을 완료하지 못했어요.' }}</h1>
      <p role="alert">{{ errorMessage }}</p>
      <p v-if="errorHelp" class="auth-error-help">{{ errorHelp }}</p>
      <p v-if="errorReference" class="auth-error-reference">오류 정보: {{ errorReference }}</p>
      <a class="auth-return-button" href="/signup">카카오 인증 화면으로 돌아가기</a>
    </template>
    <template v-else>
      <span class="loading-mark"></span>
      <h1>카카오 계정을 확인하고 있습니다.</h1>
      <p>창을 닫거나 새로고침하지 말아 주세요.</p>
    </template>
  </section>
</template>
