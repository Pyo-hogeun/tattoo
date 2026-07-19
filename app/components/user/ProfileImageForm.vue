<script setup lang="ts">
import type { UploadedImage } from '~/types/image'
const auth = useAuthStore()
const files = ref<File[]>([])
const { isUploading, uploadError, upload } = useImageUpload()
async function submit() {
  if (!files.value[0]) return
  const images = await upload('/users/me/avatar', 'image', [files.value[0]])
  const image: UploadedImage | undefined = images[0]
  if (image && auth.user) auth.user.avatar = image.url
}
</script>
<template>
  <form class="space-y-4" @submit.prevent="submit">
    <ImageUploader v-model="files" :disabled="isUploading" />
    <p v-if="uploadError" class="text-sm text-red-700" role="alert">{{ uploadError }}</p>
    <button class="btn-primary" type="submit" :disabled="!files.length || isUploading">{{ isUploading ? '업로드 중…' : '프로필 사진 저장' }}</button>
    <p class="text-xs text-stone-500">업로드된 파일은 인증된 API를 거쳐 처리됩니다.</p>
  </form>
</template>
