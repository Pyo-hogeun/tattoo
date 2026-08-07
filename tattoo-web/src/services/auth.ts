import { readonly, ref } from 'vue'

export interface Account {
  id: string
  nickname: string
  profileImageUrl?: string
}

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_IMAGE_BASE_URL ?? '').replace(/\/$/, '')
const currentAccount = ref<Account | null>(null)
const isAuthLoading = ref(false)
let hasLoadedAccount = false

export async function loadCurrentAccount(force = false) {
  if (hasLoadedAccount && !force) return currentAccount.value

  isAuthLoading.value = true
  try {
    const response = await fetch(`${apiBaseUrl}/auth/me`, { credentials: 'include' })
    if (response.status === 401) {
      currentAccount.value = null
      return null
    }
    if (!response.ok) throw new Error(`Request failed: ${response.status}`)

    currentAccount.value = await response.json() as Account
    return currentAccount.value
  } catch {
    currentAccount.value = null
    return null
  } finally {
    hasLoadedAccount = true
    isAuthLoading.value = false
  }
}

export function startKakaoLogin(returnPath = '/upload') {
  const returnUrl = new URL('/auth/callback', window.location.origin)
  returnUrl.searchParams.set('returnTo', returnPath)
  window.location.assign(`${apiBaseUrl}/auth/kakao/start?returnUrl=${encodeURIComponent(returnUrl.toString())}`)
}

export async function logout() {
  await fetch(`${apiBaseUrl}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  })
  currentAccount.value = null
  hasLoadedAccount = true
}

export { apiBaseUrl }
export const account = readonly(currentAccount)
export const authLoading = readonly(isAuthLoading)
