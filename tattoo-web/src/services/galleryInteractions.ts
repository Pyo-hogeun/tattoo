export type GalleryInteractionAction = 'like' | 'scrap'

export interface GalleryInteractionState {
  liked: boolean
  scrapped: boolean
  likeCount: number
  scrapCount: number
}

export class InteractionsUnavailableError extends Error {
  constructor() {
    super('좋아요와 스크랩 기능은 현재 준비 중입니다.')
    this.name = 'InteractionsUnavailableError'
  }
}

const MOCK_STORAGE_KEY = 'customer_interactions_mock'
const interactionsMockEnabled = import.meta.env.DEV
  && import.meta.env.VITE_ENABLE_INTERACTIONS_MOCK === 'true'

function readMockState(): Record<string, { liked: boolean; scrapped: boolean }> {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(MOCK_STORAGE_KEY) ?? '{}')
    return value && typeof value === 'object'
      ? value as Record<string, { liked: boolean; scrapped: boolean }>
      : {}
  } catch {
    return {}
  }
}

export function isInteractionsMockEnabled() {
  return interactionsMockEnabled
}

export async function updateGalleryInteraction(
  key: string,
  action: GalleryInteractionAction,
  active: boolean,
  current: GalleryInteractionState,
): Promise<GalleryInteractionState> {
  if (!interactionsMockEnabled) throw new InteractionsUnavailableError()

  const stored = readMockState()
  const previous = stored[key] ?? { liked: current.liked, scrapped: current.scrapped }
  const next = { ...previous, [action === 'like' ? 'liked' : 'scrapped']: active }
  stored[key] = next
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(stored))

  return {
    ...next,
    likeCount: Math.max(0, current.likeCount + (action === 'like' ? (active ? 1 : -1) : 0)),
    scrapCount: Math.max(0, current.scrapCount + (action === 'scrap' ? (active ? 1 : -1) : 0)),
  }
}
