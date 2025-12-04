
<script setup>

const state = reactive({
  username: '',
  password: '',
  alter: false
})

const toast = useToast()
const loadingCheck = ref(false)
const loadingInit = ref(false)
const loadingSeed = ref(false)

async function seedDb() {
  loadingSeed.value = true
  try {
    const response = await $fetch('/api/admin/seed', {
      method: 'POST',
      body: state
    });
    if (response.body?.result){
      toast.add({ title: response.body?.message, color: 'green' })
    } else {
      toast.add({ title: response.body?.message, color: 'yellow' })
    }
  }
  catch (error) {
    toast.add({ title: 'Error', description: error.data?.message || 'An error occurred', color: 'red' })
  }
  finally {
    loadingSeed.value = false
  }

}

async function checkDb() {
  loadingCheck.value = true
  try {
    const response = await $fetch('/api/admin/check', {
      method: 'POST',
      body: state
    })
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
      body: state
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
        <h1 class="text-2xl font-bold text-center text-white">Setup</h1>
      </template>

      <UForm :state="state" class="space-y-4" @submit="initDb">
        <UFormField label="Username" name="username">
          <UInput v-model="state.username" type="text" required class="w-full" />
        </UFormField>

        <UFormField label="Password" name="password">
          <UInput v-model="state.password" type="password" class="w-full" />
        </UFormField>

        <UCheckbox v-model="state.alter" label="Alter Database" class="w-full cursor-pointer" />

        <div class="flex gap-2">
          <UButton type="submit" :disabled="state.username === ''" color="warning" block :loading="loadingInit" class="cursor-pointer">Initialize</UButton>
          <UButton type="button" :disabled="state.username === ''" @click="checkDb" color="primary" block :loading="loadingCheck" class="cursor-pointer">Check</UButton>
          <UButton type="button" :disabled="state.username === ''" @click="seedDb" color="secondary" block :loading="loadingSeed" class="cursor-pointer">Seed</UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>