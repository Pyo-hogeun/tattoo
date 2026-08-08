<script setup lang="ts">
import { ref } from 'vue'

const KAKAO_OAUTH_STATE_KEY = 'kakao_oauth_state'
const KAKAO_OAUTH_FLOW_KEY = 'kakao_oauth_flow'
const isPrivacyAgreed = ref(false)
const errorMessage = ref('')
const isStarting = ref(false)

function startUserSignup() {
  errorMessage.value = ''
  if (!isPrivacyAgreed.value) {
    errorMessage.value = '개인정보 이용 필수 동의가 필요합니다.'
    return
  }

  const clientId = import.meta.env.VITE_KAKAO_CLIENT_ID?.trim()
  const redirectUri = import.meta.env.VITE_KAKAO_REDIRECT_URI?.trim()
  if (!clientId || !redirectUri) {
    errorMessage.value = '카카오 회원가입 환경 설정이 누락되었습니다.'
    return
  }

  isStarting.value = true
  const state = crypto.randomUUID()
  sessionStorage.setItem(KAKAO_OAUTH_STATE_KEY, state)
  sessionStorage.setItem(KAKAO_OAUTH_FLOW_KEY, 'user-signup')
  sessionStorage.removeItem('signup_shop')

  const query = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    state,
  })
  window.location.assign(`https://kauth.kakao.com/oauth/authorize?${query}`)
}
</script>

<template>
  <section class="auth-page auth-page--signup" :aria-busy="isStarting">
    <div class="auth-visual" aria-hidden="true">
      <span>INK ARCHIVE · CUSTOMER</span>
      <strong>YOUR BROW,<br>YOUR STORY.</strong>
    </div>
    <div class="auth-panel">
      <p class="auth-kicker">Customer membership</p>
      <h1>일반 사용자<br>회원가입</h1>
      <p class="auth-description">카카오 계정으로 일반 사용자 계정을 만듭니다. 매장 파트너 및 백오피스 계정과는 별도로 생성되며 매장 정보는 입력하지 않습니다.</p>
      <label class="privacy-agreement">
        <input v-model="isPrivacyAgreed" type="checkbox" :disabled="isStarting">
        <span><strong>[필수]</strong> 회원가입 및 서비스 제공을 위한 개인정보 이용에 동의합니다.</span>
      </label>
      <p v-if="errorMessage" class="auth-error" role="alert">{{ errorMessage }}</p>
      <button type="button" class="kakao-login-button" :disabled="isStarting" @click="startUserSignup">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3C6.5 3 2 6.5 2 10.8c0 2.8 1.9 5.2 4.8 6.6L5.6 22l5.1-3c.4 0 .9.1 1.3.1 5.5 0 10-3.5 10-8.2C22 6.5 17.5 3 12 3Z" fill="currentColor"/></svg>
        {{ isStarting ? '카카오로 이동 중…' : '카카오로 회원가입' }}
      </button>
      <p class="auth-terms">이 화면에서는 일반 사용자 계정만 생성합니다. 매장 파트너 회원가입은 제공하지 않습니다.</p>
    </div>
  </section>
</template>
