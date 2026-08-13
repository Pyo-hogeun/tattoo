<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'
import { apiBaseUrl } from '../services/auth'
import { clearCustomerSession, getCustomerAuthorizationHeaders, restoreCustomerSession } from '../services/customerAuth'

interface GalleryItem {
  _id: string
  key: string
  imageUrl: string
  publisherName: string
  publishedAt: string
  title: string
  description: string
  liked: boolean
  scrapped: boolean
  likeCount: number
  scrapCount: number
}

interface GalleryApiItem {
  key: string
  url: string
  size: number
  lastModified: string
  etag: string
  publisherName: string
  publishedAt: string
  title: string
  description: string
  liked?: boolean
  scrapped?: boolean
  likeCount?: number
  scrapCount?: number
}

interface GalleryResponse {
  items: GalleryApiItem[]
  total: number
}

interface GalleryInteractionResponse {
  liked: boolean
  scrapped: boolean
  likeCount: number
  scrapCount: number
}

interface GalleryInteractionError {
  message?: unknown
}

const INITIAL_ITEM_COUNT = 10
const LOAD_MORE_COUNT = 8

const imageBaseUrl = (import.meta.env.VITE_IMAGE_BASE_URL || apiBaseUrl).replace(/\/$/, '')
const GALLERY_API_URL = `${apiBaseUrl}/gallery`
const galleryItems = ref<GalleryItem[]>([])
const visibleCount = ref(INITIAL_ITEM_COUNT)
const isLoading = ref(true)
const isLoadingMore = ref(false)
const errorMessage = ref('')
const selectedItem = ref<GalleryItem | null>(null)
const pendingActions = ref(new Set<string>())
const actionMessage = ref('')
const loadMoreTrigger = useTemplateRef<HTMLElement>('loadMoreTrigger')
let loadMoreObserver: IntersectionObserver | undefined
let actionMessageTimer: number | undefined

const visibleItems = computed(() => galleryItems.value.slice(0, visibleCount.value))
const hasMoreItems = computed(() => visibleCount.value < galleryItems.value.length)

function getImageUrl(imageUrl: string) {
  if (/^https?:\/\//i.test(imageUrl) || imageUrl.startsWith('data:')) return imageUrl
  return `${imageBaseUrl}/${imageUrl.replace(/^\//, '')}`
}

function getGalleryItemName(key: string) {
  const filename = key.split('/').pop() ?? key
  return filename.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ')
}

function formatPublishedAt(publishedAt: string) {
  const date = new Date(publishedAt)
  if (Number.isNaN(date.getTime())) return publishedAt

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function openGalleryDetail(item: GalleryItem) {
  selectedItem.value = item
}

function closeGalleryDetail() {
  selectedItem.value = null
}

function setActionMessage(message: string) {
  actionMessage.value = message
  window.clearTimeout(actionMessageTimer)
  actionMessageTimer = window.setTimeout(() => {
    actionMessage.value = ''
  }, 2400)
}

function isActionPending(item: GalleryItem, action: 'like' | 'scrap') {
  return pendingActions.value.has(`${item.key}:${action}`)
}

async function toggleGalleryInteraction(item: GalleryItem, action: 'like' | 'scrap') {
  const pendingKey = `${item.key}:${action}`
  if (pendingActions.value.has(pendingKey)) return

  const active = action === 'like' ? !item.liked : !item.scrapped
  pendingActions.value = new Set(pendingActions.value).add(pendingKey)

  try {
    restoreCustomerSession()
    const authorizationHeaders = getCustomerAuthorizationHeaders()
    if (!authorizationHeaders.Authorization) {
      setActionMessage('로그인 후 저장할 수 있어요.')
      return
    }

    const response = await fetch(`${GALLERY_API_URL}/interactions`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...authorizationHeaders },
      body: JSON.stringify({ key: item.key, action, active }),
    })

    if (!response.ok) {
      let serverMessage = ''
      try {
        const error = await response.json() as GalleryInteractionError
        serverMessage = typeof error.message === 'string' ? error.message.trim() : ''
      } catch {
        // Preserve the status-based fallback for empty or non-JSON responses.
      }

      if (response.status === 401 || serverMessage === '유효하지 않은 계정입니다.') {
        clearCustomerSession()
        setActionMessage(serverMessage || '로그인이 만료되었습니다. 다시 로그인해 주세요.')
        return
      }

      setActionMessage(serverMessage || '요청을 처리하지 못했어요. 다시 시도해 주세요.')
      return
    }

    const result = await response.json() as GalleryInteractionResponse
    item.liked = result.liked
    item.scrapped = result.scrapped
    item.likeCount = result.likeCount
    item.scrapCount = result.scrapCount
    setActionMessage(action === 'like'
      ? (item.liked ? '좋아요에 저장했어요.' : '좋아요를 취소했어요.')
      : (item.scrapped ? '스크랩에 저장했어요.' : '스크랩을 취소했어요.'))
  } catch {
    setActionMessage('서버에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.')
  } finally {
    const nextPendingActions = new Set(pendingActions.value)
    nextPendingActions.delete(pendingKey)
    pendingActions.value = nextPendingActions
  }
}

async function shareGalleryItem(item: GalleryItem) {
  const shareData = {
    title: item.title,
    text: `${item.publisherName} · ${item.description}`,
    url: getImageUrl(item.imageUrl),
  }

  try {
    if (navigator.share) {
      await navigator.share(shareData)
    } else {
      await navigator.clipboard.writeText(shareData.url)
      setActionMessage('사진 링크를 복사했어요.')
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return
    setActionMessage('공유 링크를 만들지 못했어요.')
  }
}

function handleDetailKeydown(event: KeyboardEvent, item: GalleryItem) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    openGalleryDetail(item)
  }
}

function handleWindowKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') closeGalleryDetail()
}

function loadMoreItems() {
  if (!hasMoreItems.value || isLoadingMore.value) return
  isLoadingMore.value = true
  window.setTimeout(() => {
    visibleCount.value = Math.min(visibleCount.value + LOAD_MORE_COUNT, galleryItems.value.length)
    isLoadingMore.value = false
  }, 260)
}

async function setupInfiniteScroll() {
  await nextTick()
  loadMoreObserver?.disconnect()
  if (!loadMoreTrigger.value) return

  loadMoreObserver = new IntersectionObserver(
    entries => {
      if (entries[0]?.isIntersecting) loadMoreItems()
    },
    { rootMargin: '500px 0px' },
  )
  loadMoreObserver.observe(loadMoreTrigger.value)
}

async function loadGalleryImages() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    restoreCustomerSession()
    const response = await fetch(GALLERY_API_URL, {
      credentials: 'include',
      headers: getCustomerAuthorizationHeaders(),
    })
    if (!response.ok) throw new Error(`Request failed: ${response.status}`)

    const payload = await response.json() as GalleryResponse
    galleryItems.value = payload.items.map(item => ({
      _id: `gallery-${item.key}`,
      key: item.key,
      imageUrl: item.url,
      publisherName: item.publisherName,
      publishedAt: item.publishedAt,
      title: item.title || getGalleryItemName(item.key),
      description: item.description,
      liked: item.liked ?? false,
      scrapped: item.scrapped ?? false,
      likeCount: item.likeCount ?? 0,
      scrapCount: item.scrapCount ?? 0,
    }))
    visibleCount.value = INITIAL_ITEM_COUNT
  } catch {
    errorMessage.value = '갤러리를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.'
  } finally {
    isLoading.value = false
    if (!errorMessage.value) await setupInfiniteScroll()
  }
}

watch(selectedItem, item => document.body.classList.toggle('detail-open', Boolean(item)))

onMounted(() => {
  loadGalleryImages()
  window.addEventListener('keydown', handleWindowKeydown)
})
onBeforeUnmount(() => {
  loadMoreObserver?.disconnect()
  window.removeEventListener('keydown', handleWindowKeydown)
  document.body.classList.remove('detail-open')
  window.clearTimeout(actionMessageTimer)
})
</script>

<template>
  <section class="gallery-page">
    <div v-if="isLoading" class="gallery-status" role="status">
      <span class="loading-mark"></span>
      새로운 무드를 불러오는 중…
    </div>
    <div v-else-if="errorMessage" class="gallery-status" role="alert">
      <p>{{ errorMessage }}</p>
      <button type="button" class="text-button" @click="loadGalleryImages">다시 시도</button>
    </div>
    <template v-else-if="visibleItems.length">
      <div class="art-wall">
        <article class="brow-card brow-card--title">
          <div class="gallery-title-overlay">
            <p><span></span> Brow inspiration archive</p>
            <h1>Find your<br><em>brow mood.</em></h1>
            <small>당신의 다음 눈썹을 위한 레퍼런스</small>
          </div>
        </article>
        <article
          v-for="(item, index) in visibleItems"
          :key="item._id"
          class="brow-card"
          :class="`brow-card--${index % 7}`"
          role="button"
          tabindex="0"
          :aria-label="`${item.title} 상세 보기`"
          @click="openGalleryDetail(item)"
          @keydown="handleDetailKeydown($event, item)"
        >
          <img
            :src="getImageUrl(item.imageUrl)"
            :alt="item.title"
            class="brow-image"
            loading="lazy"
            decoding="async"
          >
          <div class="brow-card__shade"></div>
          <div class="brow-card__top">
            <span class="brow-card__index">{{ String(index + 1).padStart(2, '0') }}</span>
            <button
              type="button"
              class="save-button"
              :class="{ active: item.scrapped }"
              :aria-label="item.scrapped ? `${item.title} 스크랩 취소` : `${item.title} 스크랩`"
              :aria-pressed="item.scrapped"
              :disabled="isActionPending(item, 'scrap')"
              @click.stop="toggleGalleryInteraction(item, 'scrap')"
              @keydown.stop
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 4.5h11v16L12 17l-5.5 3.5v-16Z" :fill="item.scrapped ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
            </button>
          </div>
          <div class="brow-card__caption">
            <div class="brow-card__meta">
              <strong>{{ item.publisherName }}</strong>
              <time :datetime="item.publishedAt">{{ formatPublishedAt(item.publishedAt) }}</time>
            </div>
            <h2>{{ item.title }}</h2>
            <p>{{ item.description }}</p>
          </div>
        </article>
      </div>

      <div ref="loadMoreTrigger" class="load-more" aria-live="polite">
        <template v-if="hasMoreItems">
          <span class="loading-mark" :class="{ spinning: isLoadingMore }"></span>
          {{ isLoadingMore ? '더 많은 무드를 불러오는 중…' : '아래로 스크롤해 더 보기' }}
        </template>
        <span v-else>— You’ve reached the end of the wall —</span>
      </div>
    </template>
    <div v-else class="gallery-status">아직 등록된 이미지가 없어요.</div>

    <Teleport to="body">
      <div
        v-if="selectedItem"
        class="gallery-detail-backdrop"
        role="presentation"
        @click.self="closeGalleryDetail"
      >
        <article class="gallery-detail" role="dialog" aria-modal="true" :aria-labelledby="`detail-title-${selectedItem._id}`">
          <header class="gallery-detail__mobile-header">
            <button type="button" class="detail-back-button" aria-label="갤러리로 돌아가기" @click="closeGalleryDetail">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 5-7 7 7 7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <strong>게시물</strong>
          </header>
          <div class="gallery-detail__visual">
            <img :src="getImageUrl(selectedItem.imageUrl)" :alt="selectedItem.title">
          </div>
          <div class="gallery-detail__info">
            <button type="button" class="detail-close-button" aria-label="상세 화면 닫기" @click="closeGalleryDetail">×</button>
            <div class="detail-publisher">
              <span>{{ selectedItem.publisherName.slice(0, 1) }}</span>
              <div>
                <strong>{{ selectedItem.publisherName }}</strong>
                <time :datetime="selectedItem.publishedAt">{{ formatPublishedAt(selectedItem.publishedAt) }}</time>
              </div>
            </div>
            <div class="detail-actions" aria-label="게시물 액션">
              <button
                type="button"
                :class="{ active: selectedItem.liked }"
                :aria-label="selectedItem.liked ? '좋아요 취소' : '좋아요'"
                :aria-pressed="selectedItem.liked"
                :disabled="isActionPending(selectedItem, 'like')"
                @click="toggleGalleryInteraction(selectedItem, 'like')"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.5a5.5 5.5 0 0 0 0-7.8Z" :fill="selectedItem.liked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.5"/></svg>
                <span>{{ selectedItem.likeCount }}</span>
              </button>
              <button type="button" aria-label="게시물 공유" @click="shareGalleryItem(selectedItem)">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 3-7.6 18-3.1-7.3L3 10.6 21 3Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="m10.3 13.7 4.2-4.2" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
              </button>
              <button
                type="button"
                class="detail-scrap-button"
                :class="{ active: selectedItem.scrapped }"
                :aria-label="selectedItem.scrapped ? '스크랩 취소' : '스크랩'"
                :aria-pressed="selectedItem.scrapped"
                :disabled="isActionPending(selectedItem, 'scrap')"
                @click="toggleGalleryInteraction(selectedItem, 'scrap')"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 4.5h11v16L12 17l-5.5 3.5v-16Z" :fill="selectedItem.scrapped ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
                <span>{{ selectedItem.scrapCount }}</span>
              </button>
            </div>
            <div class="detail-copy">
              <h2 :id="`detail-title-${selectedItem._id}`">{{ selectedItem.title }}</h2>
              <p>{{ selectedItem.description }}</p>
            </div>
          </div>
        </article>
      </div>
      <p v-if="actionMessage" class="gallery-action-message" role="status">{{ actionMessage }}</p>
    </Teleport>
  </section>
</template>
