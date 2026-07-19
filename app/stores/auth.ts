import type { AuthResponse, LoginRequest, User } from '~/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const initialized = ref(false)
  const isLoggedIn = computed(() => user.value !== null)

  async function restore() {
    if (initialized.value) return
    try { user.value = (await useApi()<AuthResponse>('/auth/me')).user }
    catch { user.value = null }
    finally { initialized.value = true }
  }
  async function login(payload: LoginRequest) {
    user.value = (await useApi()<AuthResponse>('/auth/login', { method: 'POST', body: payload })).user
  }
  async function logout() {
    try { await useApi()('/auth/logout', { method: 'POST' }) }
    finally { user.value = null }
  }
  return { user, initialized, isLoggedIn, restore, login, logout }
})
