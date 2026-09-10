import { computed, readonly, ref } from 'vue'
import { clearCustomerSession } from './customerAuth'
import {
  createInteraction,
  InteractionApiError,
  listInteractions,
  removeInteraction,
} from './interactionsApi'
import type { Interaction, InteractionType } from '../types/interaction'

const items = ref<Interaction[]>([])
const loading = ref(false)
const initialized = ref(false)
const errorMessage = ref('')
const pendingKeys = ref(new Set<string>())

const interactionKey = (targetId: string, type: InteractionType) => `${type}:${targetId}`
const interactionMap = computed(() => new Map(
  items.value.map(item => [interactionKey(item.targetId, item.type), item]),
))

export function findInteraction(targetId: string, type: InteractionType) {
  return interactionMap.value.get(interactionKey(targetId, type))
}

export function isInteractionPending(targetId: string, type: InteractionType) {
  return pendingKeys.value.has(interactionKey(targetId, type))
}

function handleError(error: unknown) {
  if (error instanceof InteractionApiError) {
    if (error.code === 'AUTH_REQUIRED') {
      clearCustomerSession()
      items.value = []
      initialized.value = false
    }
    errorMessage.value = error.message
    return error
  }
  const fallback = new InteractionApiError('UNKNOWN', '요청을 처리하지 못했습니다.')
  errorMessage.value = fallback.message
  return fallback
}

export async function loadGalleryInteractions() {
  if (loading.value) return
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await listInteractions({ targetType: 'gallery' })
    items.value = response.items.filter(item => item.targetType === 'gallery')
    initialized.value = true
  } catch (error) {
    throw handleError(error)
  } finally {
    loading.value = false
  }
}

export async function toggleGalleryInteraction(targetId: string, type: InteractionType) {
  const key = interactionKey(targetId, type)
  if (pendingKeys.value.has(key)) return null
  pendingKeys.value = new Set(pendingKeys.value).add(key)
  errorMessage.value = ''

  try {
    const existing = findInteraction(targetId, type)
    if (existing) {
      let alreadyRemoved = false
      try {
        await removeInteraction(existing.id)
      } catch (error) {
        if (!(error instanceof InteractionApiError && error.code === 'NOT_FOUND')) throw error
        alreadyRemoved = true
      }
      items.value = items.value.filter(item => item.id !== existing.id)
      return { active: false, type, alreadyRemoved }
    }

    const response = await createInteraction({ targetType: 'gallery', targetId, type })
    items.value = [
      ...items.value.filter(item => interactionKey(item.targetId, item.type) !== key),
      response.interaction,
    ]
    return { active: true, type, alreadyRemoved: false }
  } catch (error) {
    throw handleError(error)
  } finally {
    const next = new Set(pendingKeys.value)
    next.delete(key)
    pendingKeys.value = next
  }
}

export const galleryInteractions = {
  items: readonly(items),
  loading: readonly(loading),
  initialized: readonly(initialized),
  errorMessage: readonly(errorMessage),
}
