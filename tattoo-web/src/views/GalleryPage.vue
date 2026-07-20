<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

interface BrowShapeResponse {
  id?: string | number
  name?: string
  title?: string
  image?: string
  imageUrl?: string
  image_url?: string
  imagePath?: string
  image_path?: string
}

interface BrowShape {
  id: string | number
  name: string
  imagePath: string
}

const imageBaseUrl = (import.meta.env.VITE_IMAGE_BASE_URL ?? 'http://localhost:4000').replace(/\/$/, '')
const BROW_SHAPES_API_URL = `${imageBaseUrl}/api/brow-shapes`
const browShapes = ref<BrowShape[]>([])
const isLoading = ref(true)
const errorMessage = ref('')
const itemCount = computed(() => browShapes.value.length)

function getImageUrl(imagePath: string) {
  if (/^https?:\/\//i.test(imagePath) || imagePath.startsWith('data:')) return imagePath

  const path = imagePath.replace(/^\//, '')
  return `${imageBaseUrl}/${path}`
}

function normalizeResponse(payload: unknown): BrowShape[] {
  const records = Array.isArray(payload)
    ? payload
    : payload && typeof payload === 'object' && Array.isArray((payload as { data?: unknown }).data)
      ? (payload as { data: unknown[] }).data
      : []

  return records.flatMap((record, index) => {
    if (!record || typeof record !== 'object') return []

    const shape = record as BrowShapeResponse
    const imagePath = shape.image ?? shape.imageUrl ?? shape.image_url ?? shape.imagePath ?? shape.image_path
    if (!imagePath) return []

    return [{ id: shape.id ?? index, name: shape.name ?? shape.title ?? `Brow shape ${index + 1}`, imagePath }]
  })
}

async function loadBrowShapes() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await fetch(BROW_SHAPES_API_URL)
    if (!response.ok) throw new Error(`Request failed: ${response.status}`)
    browShapes.value = normalizeResponse(await response.json())
  } catch {
    errorMessage.value = 'Unable to load brow shapes. Please try again.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadBrowShapes)
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

    <div v-if="isLoading" class="gallery-status" role="status">Loading brow shapes…</div>
    <div v-else-if="errorMessage" class="gallery-status" role="alert">
      <p>{{ errorMessage }}</p>
      <button type="button" class="text-button" @click="loadBrowShapes">Try again</button>
    </div>
    <div v-else-if="itemCount" class="gallery-grid">
      <article v-for="(shape, index) in browShapes" :key="shape.id" class="tattoo-card">
        <span class="card-no">{{ String(index + 1).padStart(2, '0') }} / {{ String(itemCount).padStart(2, '0') }}</span>
        <img :src="getImageUrl(shape.imagePath)" :alt="shape.name" class="gallery-image">
        <div class="card-footer"><span>{{ shape.name }}</span></div>
      </article>
    </div>
    <div v-else class="gallery-status">No brow shapes are available yet.</div>

    <footer class="page-footer"><span>Scroll to explore</span><span class="scroll-line"></span><span>Seoul, KR</span></footer>
  </section>
</template>
