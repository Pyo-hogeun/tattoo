import type { LoginRequest } from '~/types/auth'

export function useAuth() {
  const auth = useAuthStore()
  const login = async (payload: LoginRequest) => auth.login(payload)
  const logout = async () => auth.logout()
  return { auth, login, logout }
}
