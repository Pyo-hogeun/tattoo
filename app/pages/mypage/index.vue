<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useSeoMeta({ title: '마이페이지', robots: 'noindex, nofollow' })
const auth = useAuthStore()
</script>
<template><section><h1 class="font-serif text-3xl">마이페이지</h1><div v-if="auth.user" class="mt-8 grid gap-8 rounded-2xl bg-white p-6 shadow-sm md:grid-cols-[auto_1fr]"><AvatarImage :src="auth.user.avatar" :alt="`${auth.user.name} 프로필 사진`" :size="120" /><div><h2 class="text-xl font-semibold">{{ auth.user.name }}</h2><p class="mt-1 text-stone-600">{{ auth.user.email }}</p><div class="mt-6 max-w-md"><h3 class="mb-3 font-semibold">프로필 사진</h3><ProfileImageForm /></div></div></div></section></template>
