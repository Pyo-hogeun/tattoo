<script setup lang="ts">
withDefaults(defineProps<{ src?: string | null; alt: string; size?: number }>(), { src: null, size: 96 })
</script>
<template>
  <NuxtImg v-if="src" :src="src" :alt="alt" :width="size" :height="size" class="aspect-square rounded-full object-cover" />
  <div v-else class="flex aspect-square items-center justify-center rounded-full bg-stone-200 text-stone-500" :style="{ width: `${size}px`, height: `${size}px` }" role="img" :aria-label="`${alt} 기본 이미지`"><span aria-hidden="true">👤</span></div>
</template>
