<script setup lang="ts">
import { z } from 'zod'
definePageMeta({ middleware: 'guest' })
useSeoMeta({ title: '로그인', robots: 'noindex, nofollow' })
const schema = z.object({ email: z.email('올바른 이메일을 입력해 주세요.'), password: z.string().min(1, '비밀번호를 입력해 주세요.') })
const form = reactive({ email: '', password: '' })
const error = ref('')
const pending = ref(false)
const { login } = useAuth()
async function submit() { const result = schema.safeParse(form); if (!result.success) { error.value = result.error.issues[0]?.message ?? '입력값을 확인해 주세요.'; return }; pending.value = true; error.value = ''; try { await login(result.data); await navigateTo('/mypage') } catch { error.value = '로그인에 실패했습니다. 이메일과 비밀번호를 확인해 주세요.' } finally { pending.value = false } }
</script>
<template><section class="mx-auto max-w-md"><h1 class="font-serif text-3xl">로그인</h1><form class="mt-8 space-y-5 rounded-2xl bg-white p-6 shadow-sm" @submit.prevent="submit"><div><label for="email" class="label">이메일</label><input id="email" v-model="form.email" class="input" type="email" autocomplete="email" required></div><div><label for="password" class="label">비밀번호</label><input id="password" v-model="form.password" class="input" type="password" autocomplete="current-password" required></div><p v-if="error" class="text-sm text-red-700" role="alert">{{ error }}</p><button class="btn-primary w-full" :disabled="pending">{{ pending ? '로그인 중…' : '로그인' }}</button></form><p class="mt-5 text-center text-sm">처음이신가요? <NuxtLink class="underline" to="/signup">회원가입</NuxtLink></p></section></template>
