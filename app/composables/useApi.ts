import type { FetchOptions } from 'ofetch'

interface ApiErrorData { message?: string }

export function useApi() {
  const config = useRuntimeConfig()
  const api = $fetch.create({
    baseURL: config.public.apiBaseUrl,
    credentials: 'include',
    headers: { Accept: 'application/json' },
    onResponseError({ response }) {
      const data = response._data as ApiErrorData | undefined
      const message = data?.message || '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.'
      throw createError({ statusCode: response.status, statusMessage: message, fatal: false })
    }
  })

  return <T>(path: string, options?: FetchOptions<'json'>) => api<T>(path, options)
}
