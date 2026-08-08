import { shallowRef } from 'vue'
import type { Component } from 'vue'
import GalleryPage from '../views/GalleryPage.vue'
import ProfilePage from '../views/ProfilePage.vue'
import SettingPage from '../views/SettingPage.vue'
import AuthCallbackPage from '../views/AuthCallbackPage.vue'
import UploadPage from '../views/UploadPage.vue'
import SignupPage from '../views/SignupPage.vue'
import SignupCompletePage from '../views/SignupCompletePage.vue'

export type RouteName = 'gallery' | 'profile' | 'setting' | 'signup' | 'signup-complete' | 'auth-callback' | 'upload'

type Route = {
  name: RouteName
  label: string
  path: string
  component: Component
}

export const routes: Route[] = [
  { name: 'gallery', label: 'Gallery', path: '/', component: GalleryPage },
  { name: 'profile', label: 'Profile', path: '/profile', component: ProfilePage },
  { name: 'upload', label: 'Upload', path: '/upload', component: UploadPage },
  { name: 'setting', label: 'Setting', path: '/setting', component: SettingPage },
]

const systemRoutes: Route[] = [
  { name: 'signup', label: 'Signup', path: '/signup', component: SignupPage },
  { name: 'signup-complete', label: 'Signup complete', path: '/signup/complete', component: SignupCompletePage },
  { name: 'auth-callback', label: 'Auth callback', path: '/auth/callback', component: AuthCallbackPage },
]

function resolveRoute(pathname: string): Route {
  return [...routes, ...systemRoutes].find((route) => route.path === pathname) ?? routes[0]
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
