<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { apiBaseUrl } from '../services/auth'
import { saveCustomerSession } from '../services/customerAuth'
import type { CustomerSignupResponse } from '../services/customerAuth'
import { navigate } from '../router'

const KAKAO_OAUTH_STATE_KEY = 'kakao_oauth_state'
const KAKAO_OAUTH_FLOW_KEY = 'kakao_oauth_flow'
const errorMessage = ref('')
const isProcessing = ref(false)
let hasProcessedCallback = false

function clearOAuthSession() {
  sessionStorage.removeItem(KAKAO_OAUTH_STATE_KEY)
  sessionStorage.removeItem(KAKAO_OAUTH_FLOW_KEY)
  sessionStorage.removeItem('signup_shop')
}

async function readErrorMessage(response: Response, fallback: string) {
  try {
    const body = await response.json() as { message?: string }
    return body.message || fallback
  } catch {
    return fallback
  }
}

async function completeUserSignup() {
  if (isProcessing.value || hasProcessedCallback) return
  hasProcessedCallback = true

  const query = new URLSearchParams(window.location.search)
  const code = query.get('code')
  const state = query.get('state')
  const storedState = sessionStorage.getItem(KAKAO_OAUTH_STATE_KEY)
  const storedFlow = sessionStorage.getItem(KAKAO_OAUTH_FLOW_KEY)

  if (!code || !state || !storedState || state !== storedState || storedFlow !== 'user-signup') {
    errorMessage.value = '인증 요청이 만료되었거나 올바르지 않습니다. 회원가입을 다시 시작해 주세요.'
    clearOAuthSession()
    return
  }

  const clientId = import.meta.env.VITE_KAKAO_CLIENT_ID?.trim()
  const redirectUri = import.meta.env.VITE_KAKAO_REDIRECT_URI?.trim()
  if (!clientId || !redirectUri) {
    errorMessage.value = '카카오 회원가입 환경 설정이 누락되었습니다.'
    clearOAuthSession()
    return
  }

  isProcessing.value = true
  try {
    const response = await fetch(`${apiBaseUrl}/auth/kakao/user/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, redirectUri, clientId }),
    })

    if (!response.ok) {
      const fallback = response.status === 409
        ? '이미 가입한 일반 사용자 카카오 계정입니다.'
        : response.status === 503
          ? '현재 카카오 회원가입을 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.'
          : '카카오 인증 정보를 확인하지 못했습니다. 회원가입을 다시 시도해 주세요.'
      errorMessage.value = await readErrorMessage(response, fallback)
      clearOAuthSession()
      return
    }

    const data = await response.json() as CustomerSignupResponse
    if (response.status !== 201 || data.user?.role !== 'user') {
      errorMessage.value = '일반 사용자 회원가입 응답을 확인할 수 없습니다.'
      clearOAuthSession()
      return
    }

    saveCustomerSession(data)
    clearOAuthSession()
    window.history.replaceState({}, '', '/auth/kakao/callback')
    navigate('/signup/complete')
  } catch {
    errorMessage.value = '서버에 연결할 수 없습니다. 네트워크 상태를 확인한 후 다시 시도해 주세요.'
    clearOAuthSession()
  } finally {
    isProcessing.value = false
  }
}

onMounted(completeUserSignup)
</script>

<template>
  <section class="auth-callback" :aria-busy="isProcessing" aria-live="polite">
    <template v-if="errorMessage">
      <div class="auth-result-icon auth-result-icon--error" aria-hidden="true">!</div>
      <h1>회원가입을 완료하지 못했어요.</h1>
      <p role="alert">{{ errorMessage }}</p>
      <a class="auth-return-button" href="/signup">회원가입 화면으로 돌아가기</a>
    </template>
    <template v-else>
      <span class="loading-mark"></span>
      <h1>카카오 계정을 확인하고 있습니다.</h1>
      <p>창을 닫거나 새로고침하지 말아 주세요.</p>
    </template>
  </section>
</template>
