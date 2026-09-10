<script setup lang="ts">
import { ref } from 'vue'
import {
  createKakaoCustomerAuthUrl,
  KAKAO_USER_LOGIN_FLOW,
  KAKAO_USER_SIGNUP_FLOW,
} from '../services/kakaoCustomerSignup'

const isPrivacyAgreed = ref(false)
const errorMessage = ref('')
const isStarting = ref(false)

function getKakaoConfig() {
  const clientId = import.meta.env.VITE_KAKAO_CLIENT_ID?.trim()
  const redirectUri = import.meta.env.VITE_KAKAO_USER_REDIRECT_URI?.trim()
  return clientId && redirectUri ? { clientId, redirectUri } : null
}

function startUserSignup() {
  errorMessage.value = ''
  if (!isPrivacyAgreed.value) {
    errorMessage.value = '개인정보 이용 필수 동의가 필요합니다.'
    return
  }

  const config = getKakaoConfig()
  if (!config) {
    errorMessage.value = '카카오 회원가입 환경 설정이 누락되었습니다.'
    return
  }

  isStarting.value = true
  window.location.assign(createKakaoCustomerAuthUrl(config.clientId, config.redirectUri, KAKAO_USER_SIGNUP_FLOW))
}

function startUserLogin() {
  errorMessage.value = ''
  const config = getKakaoConfig()
  if (!config) {
    errorMessage.value = '카카오 로그인 환경 설정이 누락되었습니다.'
    return
  }
  isStarting.value = true
  window.location.assign(createKakaoCustomerAuthUrl(config.clientId, config.redirectUri, KAKAO_USER_LOGIN_FLOW))
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
      <div class="customer-auth-actions">
        <button type="button" class="kakao-login-button" :disabled="isStarting" @click="startUserSignup">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3C6.5 3 2 6.5 2 10.8c0 2.8 1.9 5.2 4.8 6.6L5.6 22l5.1-3c.4 0 .9.1 1.3.1 5.5 0 10-3.5 10-8.2C22 6.5 17.5 3 12 3Z" fill="currentColor"/></svg>
          {{ isStarting ? '카카오로 이동 중…' : '카카오로 회원가입' }}
        </button>
        <button type="button" class="kakao-login-button kakao-login-button--existing" :disabled="isStarting" @click="startUserLogin">
          {{ isStarting ? '카카오로 이동 중…' : '기존 회원 카카오 로그인' }}
        </button>
      </div>
      <p class="auth-terms">일반 사용자 전용 화면입니다. 매장 파트너 및 백오피스 인증은 제공하지 않습니다.</p>
    </div>
  </section>
</template>
