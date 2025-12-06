
<script setup>
import { reactive, ref } from 'vue'

const state = reactive({
  username: process.env.NODE_ENV=='development'?process.env.ADMIN_EMAIL:'',
  password: process.env.NODE_ENV=='development'?process.env.ADMIN_PASSWORD:'',
})

const toast = useToast()
const router = useRouter()
const loading = ref(false)

async function login() {
  loading.value = true
  try {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: state
    });

    const { login: authLogin } = useAuth()
    const tokenCookie = useCookie('token')
    tokenCookie.value = response.token
    authLogin(response.user)

    toast.add({ title: 'Login successful!', color: 'green' })
    router.push('/admin')
  }
  catch (error) {
    toast.add({ title: 'Error', description: error.data?.message || 'An error occurred', color: 'red' })
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex items-center justify-center h-screen">
    <UCard class="w-full max-w-sm">
      <template #header>
        <div class="flex justify-center mb-4">
          <!-- an icon to back to home -->
           <UButton to="/">
            <UIcon name="i-lucide-cog" class="w-12 h-12" />
          </UButton>
        </div>
        <h1 class="text-2xl font-bold text-center text-white">
          Login to your account
        </h1>
      </template>

      <UForm :state="state" class="space-y-4" @submit="login">
        <UFormField label="Username" name="username">
          <UInput v-model="state.username" type="email" required class="w-full" />
        </UFormField>

        <UFormField label="Password" name="password">
          <UInput v-model="state.password" type="password" class="w-full" required />
        </UFormField>

        <UButton type="submit" color="primary" block :loading="loading" size="xl" class="cursor-pointer">
          Login
        </UButton>
      </UForm>
    </UCard>
  </div>
</template>