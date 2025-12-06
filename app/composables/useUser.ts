import { ref } from 'vue'

export const useUser = () => {
  const fetchUser = async () => {
    const token = useCookie('token')
    if (!token.value) return null

    try {
      const { user } = await $fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })
      return user
    } catch (error) {
      return null
    }
  }

  return { fetchUser }
}