<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { account, apiBaseUrl, loadCurrentAccount, startKakaoLogin } from '../services/auth'
import { navigate } from '../router'

const title = ref('')
const description = ref('')
const imageFile = ref<File | null>(null)
const previewUrl = ref('')
const isCheckingAccount = ref(true)
const isSubmitting = ref(false)
const errorMessage = ref('')
const canSubmit = computed(() => Boolean(imageFile.value && title.value.trim() && description.value.trim()) && !isSubmitting.value)

onMounted(async () => {
  await loadCurrentAccount()
  isCheckingAccount.value = false
})

onBeforeUnmount(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})

function selectImage(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    errorMessage.value = '이미지 파일만 업로드할 수 있어요.'
    input.value = ''
    return
  }
  if (file.size > 10 * 1024 * 1024) {
    errorMessage.value = '이미지는 최대 10MB까지 업로드할 수 있어요.'
    input.value = ''
    return
  }

  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  imageFile.value = file
  previewUrl.value = URL.createObjectURL(file)
  errorMessage.value = ''
}

async function submitPost() {
  if (!account.value) {
    startKakaoLogin('/upload')
    return
  }
  if (!canSubmit.value || !imageFile.value) return

  isSubmitting.value = true
  errorMessage.value = ''
  const formData = new FormData()
  formData.append('image', imageFile.value)
  formData.append('title', title.value.trim())
  formData.append('description', description.value.trim())

  try {
    const response = await fetch(`${apiBaseUrl}/gallery`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    })
    if (response.status === 401) {
      startKakaoLogin('/upload')
      return
    }
    if (!response.ok) throw new Error(`Request failed: ${response.status}`)
    navigate('/')
  } catch {
    errorMessage.value = '게시물을 업로드하지 못했어요. 잠시 후 다시 시도해 주세요.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="upload-page">
    <div v-if="isCheckingAccount" class="upload-gate" role="status"><span class="loading-mark"></span>계정을 확인하고 있어요…</div>
    <div v-else-if="!account" class="upload-gate">
      <p class="auth-kicker">Members only</p>
      <h1>로그인하고<br>당신의 무드를 공유하세요.</h1>
      <p>일반 회원도 카카오 계정으로 가입한 뒤 갤러리에 게시물을 올릴 수 있어요.</p>
      <button type="button" class="kakao-login-button" @click="startKakaoLogin('/upload')">카카오로 시작하기</button>
    </div>
    <form v-else class="upload-form" @submit.prevent="submitPost">
      <header>
        <div>
          <p class="auth-kicker">New post</p>
          <h1>새로운 무드 공유하기</h1>
        </div>
        <span>{{ account.nickname }} 님</span>
      </header>

      <div class="upload-layout">
        <label class="upload-dropzone" :class="{ selected: previewUrl }">
          <img v-if="previewUrl" :src="previewUrl" alt="업로드 이미지 미리보기">
          <span v-else><strong>사진 선택</strong>JPG, PNG, WEBP · 최대 10MB</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" required @change="selectImage">
        </label>
        <div class="upload-fields">
          <label>제목<input v-model="title" maxlength="80" placeholder="눈썹 스타일의 이름을 입력하세요" required></label>
          <label>설명<textarea v-model="description" maxlength="500" rows="7" placeholder="스타일과 시술에 대한 이야기를 들려주세요" required></textarea></label>
          <p v-if="errorMessage" class="upload-error" role="alert">{{ errorMessage }}</p>
          <button type="submit" class="publish-button" :disabled="!canSubmit">{{ isSubmitting ? '게시 중…' : '갤러리에 게시하기' }}</button>
        </div>
      </div>
    </form>
  </section>
</template>
