
<script setup>
import { reactive, ref } from 'vue'

const state = reactive({
  email: '',
  password: ''
})

const toast = useToast()
const router = useRouter()
const loading = ref(false)

async function login() {
  loading.value = true
  try {
    const response = await $fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(state)
    })

    const { login: authLogin } = useAuth()
    authLogin(response.body.user) // Assuming the API returns a user object

    toast.add({ title: 'Login successful!', color: 'green' })
    router.push('/dashboard')
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
        <UFormField label="Email" name="email">
          <UInput v-model="state.email" type="email" required class="w-full" />
        </UFormField>

        <UFormField label="Password" name="password">
          <UInput v-model="state.password" type="password" class="w-full" required />
        </UFormField>

        <UButton type="submit" color="primary" block :loading="loading" size="xl">
          Login
        </UButton>
      </UForm>
    </UCard>
  </div>
</template>