import type { UploadedImage } from '~/types/image'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function useImageUpload() {
  const isUploading = ref(false)
  const uploadError = ref<string | null>(null)

  const validateFiles = async (files: File[], maxSize = 5 * 1024 * 1024): Promise<string | null> => {
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) return 'JPG, PNG, WebP 파일만 선택할 수 있습니다.'
      if (file.size > maxSize) return `파일 크기는 ${Math.floor(maxSize / 1024 / 1024)}MB 이하여야 합니다.`
      try { await createImageBitmap(file).then((image) => image.close()) }
      catch { return '이미지를 읽을 수 없습니다. 다른 파일을 선택해 주세요.' }
    }
    return null
  }

  const upload = async (path: string, fieldName: string, files: File[]): Promise<UploadedImage[]> => {
    if (isUploading.value) return []
    uploadError.value = null
    isUploading.value = true
    try {
      const formData = new FormData()
      files.forEach((file) => formData.append(fieldName, file))
      const response = await useApi()<UploadedImage | UploadedImage[]>(path, { method: 'POST', body: formData })
      return Array.isArray(response) ? response : [response]
    } catch {
      uploadError.value = '이미지 업로드에 실패했습니다. 다시 시도해 주세요.'
      return []
    } finally { isUploading.value = false }
  }

  return { isUploading, uploadError, validateFiles, upload }
}
