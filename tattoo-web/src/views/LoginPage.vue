<script setup lang="ts">
import { startKakaoLogin } from '../services/auth'
</script>

<template>
  <section class="auth-page">
    <div class="auth-visual" aria-hidden="true">
      <span>INK ARCHIVE</span>
      <strong>YOUR BROW,<br>YOUR STORY.</strong>
    </div>
    <div class="auth-panel">
      <p class="auth-kicker">Join the archive</p>
      <h1>나만의 눈썹 무드를<br>기록해 보세요.</h1>
      <p class="auth-description">카카오 계정 하나로 간편하게 가입하고, 마음에 드는 디자인을 저장하거나 직접 게시할 수 있어요.</p>
      <button type="button" class="kakao-login-button" @click="startKakaoLogin('/upload')">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3C6.5 3 2 6.5 2 10.8c0 2.8 1.9 5.2 4.8 6.6L5.6 22l5.1-3c.4 0 .9.1 1.3.1 5.5 0 10-3.5 10-8.2C22 6.5 17.5 3 12 3Z" fill="currentColor"/></svg>
        카카오로 시작하기
      </button>
      <p class="auth-terms">계속하면 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다. 최초 로그인 시 일반 회원 계정이 자동 생성됩니다.</p>
    </div>
  </section>
</template>
