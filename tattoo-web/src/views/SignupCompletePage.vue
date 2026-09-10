<script setup lang="ts">
import { onMounted } from 'vue'
import { customerUser, restoreCustomerSession } from '../services/customerAuth'
import { navigate } from '../router'

onMounted(restoreCustomerSession)
</script>

<template>
  <section class="signup-complete">
    <div class="auth-result-icon" aria-hidden="true">✓</div>
    <p class="auth-kicker">Welcome to Ink Archive</p>
    <h1>회원가입이<br>완료되었습니다.</h1>
    <p v-if="customerUser"><strong>{{ customerUser.nickname }}</strong> 님, 환영합니다.<br>이제 눈썹 무드를 저장하고 직접 공유할 수 있어요.</p>
    <p v-else>가입 정보를 다시 확인할 수 없습니다.<br>홈에서 서비스를 계속 이용해 주세요.</p>
    <button type="button" class="publish-button" @click="navigate('/')">서비스 홈으로 이동</button>
  </section>
</template>
