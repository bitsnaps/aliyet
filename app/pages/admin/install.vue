
<script setup>
import { reactive, ref } from 'vue'

const state = reactive({
  username: '',
  password: '',
  alter: false
})

const toast = useToast()
const message = ref('')
const router = useRouter()
const loadingCheck = ref(false)
const loadingInit = ref(false)

async function checkDb() {
  loadingCheck.value = true
  try {
    const response = await $fetch('/api/admin/check')
    toast.add({ title: response.body?.message, color: 'green' })
  }
  catch (error) {
    toast.add({ title: 'Error', description: error.data?.message || 'An error occurred', color: 'red' })
  }
  finally {
    loadingCheck.value = false
  }
}

async function initDb() {
  loadingInit.value = true
  try {
    const response = await $fetch('/api/admin/install', {
      method: 'POST',
      body: JSON.stringify(state)
    })
    toast.add({ title: response.body?.message, color: 'green' })
  }
  catch (error) {
    toast.add({ title: 'Error', description: error.data?.message || 'An error occurred', color: 'red' })
  }
  finally {
    loadingInit.value = false
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
        <h1 class="text-2xl font-bold text-center text-white">Installation</h1>
      </template>

      <UForm :state="state" class="space-y-4">
        <UFormField label="Username" name="username">
          <UInput v-model="state.username" type="email" required class="w-full" />
        </UFormField>

        <UFormField label="Password" name="password">
          <UInput v-model="state.password" type="password" class="w-full" required />
        </UFormField>

        <UCheckbox v-model="state.alter" label="Alter DB" />

        <UButton type="button" @click="initDb" color="primary" block :loading="loadingInit" class="cursor-pointer">Initilize DB</UButton>
        <UButton type="button" @click="checkDb" color="secondary" block :loading="loadingCheck" class="cursor-pointer">Check</UButton>
      </UForm>
    </UCard>
  </div>
</template>