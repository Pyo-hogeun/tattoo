import { shallowRef } from 'vue'
import type { Component } from 'vue'
import GalleryPage from '../views/GalleryPage.vue'
import ProfilePage from '../views/ProfilePage.vue'
import SettingPage from '../views/SettingPage.vue'

export type RouteName = 'gallery' | 'profile' | 'setting'

type Route = {
  name: RouteName
  label: string
  path: string
  component: Component
}

export const routes: Route[] = [
  { name: 'gallery', label: 'Gallery', path: '/', component: GalleryPage },
  { name: 'profile', label: 'Profile', path: '/profile', component: ProfilePage },
  { name: 'setting', label: 'Setting', path: '/setting', component: SettingPage },
]

function resolveRoute(pathname: string): Route {
  return routes.find((route) => route.path === pathname) ?? routes[0]
}

export const currentRoute = shallowRef<Route>(resolveRoute(window.location.pathname))

export function navigate(path: string) {
  const route = resolveRoute(path)
  const targetPath = route.path

  if (window.location.pathname !== targetPath) {
    window.history.pushState({}, '', targetPath)
  }

  currentRoute.value = route
}

window.addEventListener('popstate', () => {
  currentRoute.value = resolveRoute(window.location.pathname)
})
