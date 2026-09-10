<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { currentRoute, navigate, routes } from './router'
import { clearCustomerSession, customerToken, customerUser, isCustomerUser, restoreCustomerSession, saveCustomerSession } from './services/customerAuth'
import { CustomerAuthApiError, getCurrentCustomer } from './services/customerAuthApi'

const activeRoute = computed(() => currentRoute.value)

function handleNavigation(event: MouseEvent, path: string) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

  event.preventDefault()
  navigate(path)
}

function handleLogout() {
  clearCustomerSession()
  navigate('/')
}

onMounted(async () => {
  restoreCustomerSession()
  if (!customerToken.value) return
  try {
    const response = await getCurrentCustomer()
    if (!isCustomerUser(response.user)) throw new Error('Invalid customer response')
    saveCustomerSession({ token: customerToken.value, user: response.user })
  } catch (error) {
    if (error instanceof CustomerAuthApiError && (error.status === 401 || error.status === 403)) {
      clearCustomerSession()
    }
  }
})
</script>

<template>
  <main class="app-shell">
    <header class="gnb">
      <a class="brand" href="/" aria-label="Ink Archive home" @click="handleNavigation($event, '/')">
        <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3.5 26.8 16 16 28.5 5.2 16 16 3.5Z" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="m11 16 3.2 3.2L21.5 12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <span>INK<br>ARCHIVE</span>
      </a>

      <nav aria-label="Primary navigation">
        <a
          v-for="route in routes"
          :key="route.name"
          class="nav-item"
          :class="{ active: activeRoute.name === route.name }"
          :href="route.path"
          :aria-current="activeRoute.name === route.name ? 'page' : undefined"
          @click="handleNavigation($event, route.path)"
        >
          <svg v-if="route.name === 'gallery'" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="8.2" cy="8.2" r="1.4" fill="currentColor"/><path d="m5 18 4.3-4.4 3.1 2.7 2.2-2.2L19 18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <svg v-else-if="route.name === 'profile'" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.4" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M5.1 20c.7-3.6 3.3-5.6 6.9-5.6s6.2 2 6.9 5.6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
          <svg v-else-if="route.name === 'upload'" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v5h14v-5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <svg v-else viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M19.1 13.5a7.4 7.4 0 0 0 .1-1.5 7.4 7.4 0 0 0-.1-1.5l2-1.5-2-3.4-2.4 1a7.4 7.4 0 0 0-2.6-1.5L13.8 2h-3.9l-.3 3.1a7.4 7.4 0 0 0-2.6 1.5l-2.4-1-2 3.4 2 1.5A7.4 7.4 0 0 0 4.5 12c0 .5 0 1 .1 1.5l-2 1.5 2 3.4 2.4-1a7.4 7.4 0 0 0 2.6 1.5l.3 3.1h3.9l.3-3.1a7.4 7.4 0 0 0 2.6-1.5l2.4 1 2-3.4-2-1.5Z" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round"/></svg>
          <span>{{ route.label }}</span>
        </a>
      </nav>

      <div class="account-area">
        <button v-if="!customerUser" class="account-button" type="button" @click="navigate('/signup')">
          <span>Login</span>
        </button>
        <template v-else>
          <div class="signed-in-account" :aria-label="`${customerUser.nickname} 일반 회원으로 로그인 중`">
            <span class="account-avatar" aria-hidden="true">{{ customerUser.nickname.slice(0, 1) }}</span>
            <span class="account-copy"><strong>{{ customerUser.nickname }}</strong><small>일반 회원 로그인</small></span>
            <span class="account-online" aria-hidden="true"></span>
          </div>
          <button type="button" class="logout-button" @click="handleLogout">로그아웃</button>
        </template>
      </div>
    </header>

    <component :is="activeRoute.component" />
  </main>
</template>
