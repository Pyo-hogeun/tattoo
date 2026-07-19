<script setup lang="ts">
const props = withDefaults(defineProps<{ modelValue: File[]; multiple?: boolean; maxFiles?: number; maxSize?: number; disabled?: boolean }>(), { multiple: false, maxFiles: 1, maxSize: 5 * 1024 * 1024, disabled: false })
const emit = defineEmits<{ 'update:modelValue': [files: File[]] }>()
const input = ref<HTMLInputElement | null>(null)
const error = ref<string | null>(null)
const previews = ref<{ file: File; url: string }[]>([])
const { validateFiles } = useImageUpload()

function clearPreviews() { previews.value.forEach(({ url }) => URL.revokeObjectURL(url)); previews.value = [] }
function reset() { clearPreviews(); emit('update:modelValue', []); if (input.value) input.value.value = '' }
async function addFiles(raw: FileList | null) {
  if (!raw || props.disabled) return
  const incoming = Array.from(raw)
  const existing = props.modelValue
  const candidates = props.multiple ? [...existing, ...incoming] : incoming.slice(0, 1)
  if (candidates.length > props.maxFiles) { error.value = `최대 ${props.maxFiles}장까지 선택할 수 있습니다.`; return }
  if (new Set(candidates.map((file) => `${file.name}-${file.size}-${file.lastModified}`)).size !== candidates.length) { error.value = '같은 파일은 한 번만 선택할 수 있습니다.'; return }
  error.value = await validateFiles(incoming, props.maxSize)
  if (error.value) return
  clearPreviews()
  emit('update:modelValue', candidates)
  previews.value = candidates.map((file) => ({ file, url: URL.createObjectURL(file) }))
  if (input.value) input.value.value = ''
}
function onDrop(event: DragEvent) { event.preventDefault(); void addFiles(event.dataTransfer?.files ?? null) }
onBeforeUnmount(clearPreviews)
</script>
<template>
  <div>
    <label class="block text-sm font-medium" for="image-upload">이미지 선택</label>
    <div class="mt-2 rounded-xl border-2 border-dashed border-stone-300 p-6 text-center" :class="{ 'opacity-50': disabled }" @dragover.prevent @drop="onDrop">
      <input id="image-upload" ref="input" class="sr-only" type="file" accept="image/jpeg,image/png,image/webp" :multiple="multiple" capture="environment" :disabled="disabled" @change="addFiles(($event.target as HTMLInputElement).files)" />
      <label for="image-upload" class="cursor-pointer text-sm text-stone-600">사진을 드래그하거나 <span class="font-semibold text-stone-900">파일을 선택</span>하세요.</label>
      <p class="mt-1 text-xs text-stone-500">JPG, PNG, WebP · 최대 {{ Math.floor(maxSize / 1024 / 1024) }}MB</p>
    </div>
    <p v-if="error" class="mt-2 text-sm text-red-700" role="alert">{{ error }}</p>
    <div v-if="previews.length" class="mt-4 grid grid-cols-3 gap-3">
      <div v-for="preview in previews" :key="preview.url" class="relative aspect-square overflow-hidden rounded-lg bg-stone-100"><img :src="preview.url" :alt="`${preview.file.name} 미리보기`" class="h-full w-full object-cover"><button class="absolute right-1 top-1 rounded-full bg-white p-1 shadow" type="button" aria-label="선택한 이미지 삭제" @click="reset"><span aria-hidden="true">×</span></button></div>
    </div>
  </div>
</template>
