<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'

interface GalleryItem {
  _id: string
  imageUrl: string
  publisherName: string
  publishedAt: string
  title: string
  description: string
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
}

interface GalleryResponse {
  items: GalleryApiItem[]
  total: number
}

const INITIAL_ITEM_COUNT = 10
const LOAD_MORE_COUNT = 8

const imageBaseUrl = (import.meta.env.VITE_IMAGE_BASE_URL ?? import.meta.env.API_BASE_URL ?? '').replace(/\/$/, '')
const GALLERY_API_URL = `${imageBaseUrl}/gallery`
const galleryItems = ref<GalleryItem[]>([])
const visibleCount = ref(INITIAL_ITEM_COUNT)
const isLoading = ref(true)
const isLoadingMore = ref(false)
const errorMessage = ref('')
const selectedItem = ref<GalleryItem | null>(null)
const loadMoreTrigger = useTemplateRef<HTMLElement>('loadMoreTrigger')
let loadMoreObserver: IntersectionObserver | undefined

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
    const response = await fetch(GALLERY_API_URL)
    if (!response.ok) throw new Error(`Request failed: ${response.status}`)

    const payload = await response.json() as GalleryResponse
    galleryItems.value = payload.items.map(item => ({
      _id: `gallery-${item.key}`,
      imageUrl: item.url,
      publisherName: item.publisherName,
      publishedAt: item.publishedAt,
      title: item.title || getGalleryItemName(item.key),
      description: item.description,
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
            <button type="button" class="save-button" :aria-label="`${item.title} 저장`" @click.stop @keydown.stop>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 4.5h11v16L12 17l-5.5 3.5v-16Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
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
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.5a5.5 5.5 0 0 0 0-7.8Z" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 4.5h11v16L12 17l-5.5 3.5v-16Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
            </div>
            <div class="detail-copy">
              <h2 :id="`detail-title-${selectedItem._id}`">{{ selectedItem.title }}</h2>
              <p>{{ selectedItem.description }}</p>
            </div>
          </div>
        </article>
      </div>
    </Teleport>
  </section>
</template>
