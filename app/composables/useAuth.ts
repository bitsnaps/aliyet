import { ref } from 'vue'

export const useAuth = () => {
  const user = useState('user', () => null)

  const isLoggedIn = () => {
    return !!user.value
  }

  const login = (userData: any) => {
    user.value = userData
  }

  const logout = () => {
    user.value = null
  }

  return {
    user,
    isLoggedIn,
    login,
    logout
  }
}