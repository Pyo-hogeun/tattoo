<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { loadCurrentAccount, startKakaoLogin } from '../services/auth'
import { navigate } from '../router'

const errorMessage = ref('')

onMounted(async () => {
  const account = await loadCurrentAccount(true)
  if (!account) {
    errorMessage.value = '카카오 로그인을 완료하지 못했어요.'
    return
  }

  const returnTo = new URLSearchParams(window.location.search).get('returnTo')
  navigate(returnTo?.startsWith('/') ? returnTo : '/upload')
})
</script>

<template>
  <section class="auth-callback" aria-live="polite">
    <template v-if="errorMessage">
      <h1>로그인에 실패했어요.</h1>
      <p>{{ errorMessage }}</p>
      <button type="button" class="kakao-login-button" @click="startKakaoLogin('/upload')">다시 시도</button>
    </template>
    <template v-else>
      <span class="loading-mark"></span>
      <p>카카오 계정을 연결하고 있어요…</p>
    </template>
  </section>
</template>
