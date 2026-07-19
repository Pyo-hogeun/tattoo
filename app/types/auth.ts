export interface User {
  id: string
  email: string
  name: string
  avatar?: string | null
}

export interface AuthResponse { user: User }
export interface LoginRequest { email: string; password: string }
