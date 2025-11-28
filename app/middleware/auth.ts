import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware((to, from) => {
  const { isLoggedIn } = useAuth()

  if (!isLoggedIn() && to.path !== '/login') {
    return navigateTo('/login')
  }
})
