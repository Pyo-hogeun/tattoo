<script setup lang="ts">
import { ref } from 'vue'
import { navigate } from '../router'
import { clearCustomerSession, customerUser } from '../services/customerAuth'
import { CustomerAuthApiError, deleteCurrentCustomer } from '../services/customerAuthApi'

const notifications = ref(true)
const isDeleting = ref(false)
const accountMessage = ref('')

async function deleteAccount() {
  if (!window.confirm('일반 사용자 계정을 탈퇴하시겠어요? 저장한 좋아요와 북마크를 복구할 수 없습니다.')) return
  isDeleting.value = true
  accountMessage.value = ''
  try {
    await deleteCurrentCustomer()
    clearCustomerSession()
    navigate('/')
  } catch (error) {
    accountMessage.value = error instanceof CustomerAuthApiError
      ? error.message
      : '회원 탈퇴를 처리하지 못했습니다.'
    if (error instanceof CustomerAuthApiError && error.status === 401) clearCustomerSession()
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <section class="container content-page">
    <p class="eyebrow"><span></span>Preferences</p>
    <h1 class="page-title">SETTINGS.</h1>
    <div class="settings-list">
      <div class="setting-row"><span>Language</span><button class="text-button">English / 한국어</button></div>
      <div class="setting-row"><span>Studio updates</span><button class="toggle" :class="{ on: notifications }" :aria-pressed="notifications" @click="notifications = !notifications"><i></i></button></div>
      <div class="setting-row"><span>Theme</span><button class="text-button">Archive light</button></div>
      <div v-if="customerUser" class="setting-row setting-row--danger">
        <span>일반 사용자 계정</span>
        <button class="text-button" type="button" :disabled="isDeleting" @click="deleteAccount">
          {{ isDeleting ? '탈퇴 처리 중…' : '회원 탈퇴' }}
        </button>
      </div>
    </div>
    <p v-if="accountMessage" class="settings-message" role="alert">{{ accountMessage }}</p>
  </section>
</template>
