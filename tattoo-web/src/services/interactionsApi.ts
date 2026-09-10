import { apiBaseUrl } from './auth'
import { customerToken } from './customerAuth'
import type {
  InteractionCreateInput,
  InteractionCreateResponse,
  InteractionErrorCode,
  InteractionListQuery,
  InteractionListResponse,
} from '../types/interaction'

interface ApiErrorBody {
  message?: unknown
}

export class InteractionApiError extends Error {
  public readonly code: InteractionErrorCode
  public readonly status?: number

  constructor(
    code: InteractionErrorCode,
    message: string,
    status?: number,
  ) {
    super(message)
    this.code = code
    this.status = status
    this.name = 'InteractionApiError'
  }
}

function authHeaders() {
  if (!customerToken.value) {
    throw new InteractionApiError('AUTH_REQUIRED', '일반 사용자 로그인이 필요합니다.')
  }
  return { Authorization: `Bearer ${customerToken.value}` }
}

function errorCodeForStatus(status: number): InteractionErrorCode {
  if (status === 400) return 'INVALID_INPUT'
  if (status === 401) return 'AUTH_REQUIRED'
  if (status === 403) return 'WRONG_TOKEN_TYPE'
  if (status === 404) return 'NOT_FOUND'
  if (status >= 500) return 'SERVER'
  return 'UNKNOWN'
}

async function toApiError(response: Response) {
  let message = ''
  try {
    const body = await response.json() as ApiErrorBody
    message = typeof body.message === 'string' ? body.message.trim() : ''
  } catch {
    // Empty and non-JSON error responses use the status-specific fallback below.
  }

  const code = errorCodeForStatus(response.status)
  const fallback: Record<InteractionErrorCode, string> = {
    AUTH_REQUIRED: '일반 사용자 로그인이 필요합니다.',
    WRONG_TOKEN_TYPE: '일반 사용자 계정으로 로그인해 주세요.',
    INVALID_INPUT: '좋아요 또는 북마크 요청 값을 확인해 주세요.',
    NOT_FOUND: '이미 삭제되었거나 상호작용 정보를 찾을 수 없습니다.',
    NETWORK: '서버에 연결할 수 없습니다. 네트워크 상태를 확인해 주세요.',
    SERVER: '상호작용을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.',
    UNKNOWN: '요청을 처리하지 못했습니다.',
  }
  return new InteractionApiError(code, message || fallback[code], response.status)
}

async function request<T>(path: string, init: RequestInit = {}) {
  let response: Response
  try {
    const headers = new Headers(init.headers)
    for (const [name, value] of Object.entries(authHeaders())) headers.set(name, value)
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers,
    })
  } catch {
    throw new InteractionApiError('NETWORK', '서버에 연결할 수 없습니다. 네트워크 상태를 확인해 주세요.')
  }
  if (!response.ok) throw await toApiError(response)
  if (response.status === 204) return undefined as T
  return await response.json() as T
}

export function listInteractions(query: InteractionListQuery = {}) {
  const params = new URLSearchParams()
  if (query.type) params.set('type', query.type)
  if (query.targetType) params.set('targetType', query.targetType)
  if (query.targetId?.trim()) params.set('targetId', query.targetId.trim())
  const encodedQuery = params.toString()
  const suffix = encodedQuery ? `?${encodedQuery}` : ''
  return request<InteractionListResponse>(`/interactions${suffix}`)
}

export function createInteraction(input: InteractionCreateInput) {
  return request<InteractionCreateResponse>('/interactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export function removeInteraction(interactionId: string) {
  if (!interactionId.trim()) {
    throw new InteractionApiError('NOT_FOUND', '상호작용 정보를 찾을 수 없습니다.')
  }
  return request<void>(`/interactions/${encodeURIComponent(interactionId)}`, { method: 'DELETE' })
}
