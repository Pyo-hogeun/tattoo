<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { isCustomerAuthResponse, saveCustomerSession } from '../services/customerAuth'
import { CustomerAuthApiError, exchangeKakaoCustomerCode } from '../services/customerAuthApi'
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
  const redirectUri = import.meta.env.VITE_KAKAO_USER_REDIRECT_URI?.trim()
  if (!clientId || !redirectUri) {
    errorMessage.value = isLoginFlow.value
      ? '카카오 로그인 환경 설정이 누락되었습니다.'
      : '카카오 회원가입 환경 설정이 누락되었습니다.'
    clearKakaoSignupSession()
    return
  }

  // Claim the one-time callback before the request so a remount or refresh cannot
  // exchange the same Kakao authorization code a second time.
  clearKakaoSignupSession()
  isProcessing.value = true
  try {
    const result = await exchangeKakaoCustomerCode(callback.flow, { code: callback.code, redirectUri, clientId })
    const expectedStatus = isLoginFlow.value ? 200 : 201
    if (result.status !== expectedStatus || !isCustomerAuthResponse(result.data)) {
      errorMessage.value = isLoginFlow.value
        ? '일반 사용자 로그인 응답을 확인할 수 없습니다.'
        : '일반 사용자 회원가입 응답을 확인할 수 없습니다.'
      return
    }

    saveCustomerSession(result.data)
    window.history.replaceState({}, '', '/auth/kakao/callback')
    navigate(isLoginFlow.value ? '/' : '/signup/complete')
  } catch (error) {
    errorMessage.value = error instanceof CustomerAuthApiError
      ? error.message
      : '서버에 연결할 수 없습니다. 네트워크 상태를 확인한 후 다시 시도해 주세요.'
    if (error instanceof CustomerAuthApiError) {
      errorReference.value = error.status ? `HTTP ${error.status}` : ''
      if (error.status === 409 && !isLoginFlow.value) {
        errorHelp.value = '이미 가입한 일반 사용자라면 기존 회원 카카오 로그인을 이용해 주세요.'
      }
    }
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
