<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

interface GalleryItem {
  _id: string
  name: string
  imageUrl: string
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface GalleryResponse {
  items: GalleryItem[]
  total: number
}

const imageBaseUrl = (import.meta.env.VITE_IMAGE_BASE_URL ?? 'http://localhost:4000').replace(/\/$/, '')
const BROW_SHAPES_API_URL = `${imageBaseUrl}/api/brow-shapes`
const GALLERY_API_URL = `${imageBaseUrl}/api/gallery`
const galleryItems = ref<GalleryItem[]>([])
const isLoading = ref(true)
const errorMessage = ref('')
const itemCount = computed(() => galleryItems.value.length)

function getImageUrl(imageUrl: string) {
  if (/^https?:\/\//i.test(imageUrl) || imageUrl.startsWith('data:')) return imageUrl

  const path = imageUrl.replace(/^\//, '')
  return `${imageBaseUrl}/${path}`
}

async function loadGalleryImages() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const responses = await Promise.all([
      fetch(BROW_SHAPES_API_URL),
      fetch(GALLERY_API_URL),
    ])

    const failedResponse = responses.find(response => !response.ok)
    if (failedResponse) throw new Error(`Request failed: ${failedResponse.status}`)

    const payloads = await Promise.all(
      responses.map(response => response.json() as Promise<GalleryResponse>),
    )
    galleryItems.value = payloads.flatMap(payload => payload.items)
  } catch {
    errorMessage.value = 'Unable to load gallery images. Please try again.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadGalleryImages)
</script>

<template>
  <section class="container">
    <div class="eyebrow"><span></span>Curated collection / 2024—25</div>
    <div class="title-row">
      <div>
        <p class="kicker">Selected work</p>
        <h1>DRAWN TO<br><em>THE</em> SKIN.</h1>
      </div>
      <p class="intro">A personal record of lines, symbols, and stories. Small works made to live with you.</p>
    </div>

    <div v-if="isLoading" class="gallery-status" role="status">Loading gallery images…</div>
    <div v-else-if="errorMessage" class="gallery-status" role="alert">
      <p>{{ errorMessage }}</p>
      <button type="button" class="text-button" @click="loadGalleryImages">Try again</button>
    </div>
    <div v-else-if="itemCount" class="gallery-grid">
      <article v-for="(item, index) in galleryItems" :key="item._id" class="tattoo-card">
        <span class="card-no">{{ String(index + 1).padStart(2, '0') }} / {{ String(itemCount).padStart(2, '0') }}</span>
        <img :src="getImageUrl(item.imageUrl)" :alt="item.name" class="gallery-image">
        <div class="card-footer"><span>{{ item.name }}</span></div>
      </article>
    </div>
    <div v-else class="gallery-status">No gallery images are available yet.</div>

    <footer class="page-footer"><span>Scroll to explore</span><span class="scroll-line"></span><span>Seoul, KR</span></footer>
  </section>
</template>
