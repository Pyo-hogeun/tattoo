import { readonly, ref } from 'vue'

export interface CustomerUser {
  id: string
  nickname: string
  role: 'user'
}

export interface CustomerAuthResponse {
  token: string
  user: CustomerUser
}

export function isCustomerUser(value: unknown): value is CustomerUser {
  if (!value || typeof value !== 'object') return false
  const user = value as Partial<CustomerUser>
  return typeof user.id === 'string'
    && user.id.length > 0
    && typeof user.nickname === 'string'
    && user.nickname.length > 0
    && user.role === 'user'
}

export function isCustomerAuthResponse(value: unknown): value is CustomerAuthResponse {
  if (!value || typeof value !== 'object') return false
  const response = value as Partial<CustomerAuthResponse>
  return typeof response.token === 'string' && response.token.length > 0 && isCustomerUser(response.user)
}

const CUSTOMER_TOKEN_KEY = 'customer_auth_token'
const CUSTOMER_USER_KEY = 'customer_auth_user'
const customerUserState = ref<CustomerUser | null>(null)
const customerTokenState = ref('')

export function restoreCustomerSession() {
  const token = localStorage.getItem(CUSTOMER_TOKEN_KEY) ?? ''
  const storedUser = localStorage.getItem(CUSTOMER_USER_KEY)

  if (!token || !storedUser) {
    clearCustomerSession()
    return null
  }

  try {
    const user: unknown = JSON.parse(storedUser)
    if (!isCustomerUser(user)) throw new Error('Invalid customer session')
    customerTokenState.value = token
    customerUserState.value = user
    return user
  } catch {
    clearCustomerSession()
    return null
  }
}

export function saveCustomerSession(data: CustomerAuthResponse) {
  if (!isCustomerAuthResponse(data)) throw new Error('Invalid customer auth response')

  localStorage.setItem(CUSTOMER_TOKEN_KEY, data.token)
  localStorage.setItem(CUSTOMER_USER_KEY, JSON.stringify(data.user))
  customerTokenState.value = data.token
  customerUserState.value = data.user
}

export function clearCustomerSession() {
  localStorage.removeItem(CUSTOMER_TOKEN_KEY)
  localStorage.removeItem(CUSTOMER_USER_KEY)
  customerTokenState.value = ''
  customerUserState.value = null
}

export function getCustomerAuthorizationHeaders(): Record<string, string> {
  return customerTokenState.value
    ? { Authorization: `Bearer ${customerTokenState.value}` }
    : {}
}

export const customerUser = readonly(customerUserState)
export const customerToken = readonly(customerTokenState)
