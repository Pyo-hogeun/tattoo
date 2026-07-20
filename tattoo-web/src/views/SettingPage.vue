<script setup lang="ts">
import { ref } from 'vue'

const notifications = ref(true)
</script>

<template>
  <section class="container content-page">
    <p class="eyebrow"><span></span>Preferences</p>
    <h1 class="page-title">SETTINGS.</h1>
    <div class="settings-list">
      <div class="setting-row"><span>Language</span><button class="text-button">English / 한국어</button></div>
      <div class="setting-row"><span>Studio updates</span><button class="toggle" :class="{ on: notifications }" :aria-pressed="notifications" @click="notifications = !notifications"><i></i></button></div>
      <div class="setting-row"><span>Theme</span><button class="text-button">Archive light</button></div>
    </div>
  </section>
</template>
