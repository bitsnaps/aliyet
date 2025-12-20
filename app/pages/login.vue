
<script setup>
import { reactive, ref } from 'vue'
const { login: authLogin, user } = useAuth();

definePageMeta({
  middleware: 'guest'
})

const state = reactive({
  username: import.meta.env.DEV?'admin@aliyaat.com':'',
  password: import.meta.env.DEV?'master':'',
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
    if (!response || response.statusCode !== 200 || !response.user) {
      toast.add({ title: 'Error', description: response?.message || 'Access denied', color: 'warning' })
    } else {      
      // const { login: authLogin } = useAuth()
      authLogin(response.user);      
      toast.add({ title: 'Login successful!', color: 'success' });
      router.push('/admin')
    }
  } catch (error) {
    toast.add({ title: 'Error', description: error.data?.message || 'An error occurred', color: 'error' })
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

      <UForm :state="state" class="space-y-4" @submit="login" v-if="!user?.username">
        <UFormField label="Username" name="username">
          <UInput v-model="state.username" type="email" required class="w-full" />
        </UFormField>

        <UFormField label="Password" name="password">
          <UInput v-model="state.password" type="password" class="w-full" required />
        </UFormField>

        <UButton type="submit" variant="solid" color="primary" block :loading="loading" size="xl" class="cursor-pointer">
          Login
        </UButton>
      </UForm>
        <UAlert title="Authentication Successful" color="primary" variant="solid" v-else>
          Redirecting...
        </UAlert>
    </UCard>
  </div>
</template>