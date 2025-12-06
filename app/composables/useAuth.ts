import { computed } from 'vue'

export const useAuth = () => {
  const user = useState('user', () => null)
  const token = useCookie('token')
  const { fetchUser } = useUser()

  const isLoggedIn = computed(() => !!user.value)

  const login = (userData: any) => {
    user.value = userData
  }

  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    token.value = null
  }

  const initAuth = async () => {
    if (token.value) {
      user.value = (await fetchUser()) || null
    }
  }

  return {
    user,
    isLoggedIn,
    login,
    logout,
    initAuth
  }
}