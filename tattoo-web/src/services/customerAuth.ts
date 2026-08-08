import { readonly, ref } from 'vue'

export interface CustomerUser {
  id: string
  nickname: string
  role: 'user'
}

export interface CustomerSignupResponse {
  token: string
  user: CustomerUser
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
    const user = JSON.parse(storedUser) as CustomerUser
    if (!user.id || !user.nickname || user.role !== 'user') throw new Error('Invalid customer session')
    customerTokenState.value = token
    customerUserState.value = user
    return user
  } catch {
    clearCustomerSession()
    return null
  }
}

export function saveCustomerSession(data: CustomerSignupResponse) {
  if (!data.token || data.user.role !== 'user') throw new Error('Invalid customer signup response')

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
