<script setup>
definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const isNew = route.params.id === 'new'

const loading = ref(false)
const toast = useToast()
const state = ref({
  name: '',
  code: '',
  categoryId: null,
  configCategoryId: null,
  basePrice: 0,
  available: true,
  description: '',
  url: '',
  specs: [{ parameter: '', value: '', unit: '' }]
})

if (!isNew) {
  loading.value = true
  try {
    const { data: machineData, error } = await useFetch(`/api/admin/machines/${route.params.id}`, {
      lazy: false, // We need to wait for this data
    })
    if (error.value) {
      toast.add({ title: 'Error fetching machine', description: error.value.data.statusMessage, color: 'error' })
      navigateTo('/admin/machines')
    } else {
      state.value = machineData.value.data
      // Ensure specs is an array even if empty
      if (!state.value.specs) {
        state.value.specs = [{ parameter: '', value: '', unit: '' }]
      }
    }
  } finally {
    loading.value = false
  }
}

// Fetch Categories for the dropdown
const { data: categories, pending: categoriesPending } = useFetch('/api/admin/categories', {
  transform: (response) => response.data.map(c => ({ label: c.name, value: c.id })),
  lazy: true,
  server: false,
})

// Fetch ConfigCategories for the dropdown
const { data: configCategories, pending: configCategoriesPending } = useFetch('/api/admin/config-categories', {
  transform: (response) => response.data.map(c => ({ label: c.name, value: c.id })),
  lazy: true,
  server: false,
})

const addSpec = () => {
  state.value.specs.push({ parameter: '', value: '', unit: '' })
}

const removeSpec = (index) => {
  state.value.specs.splice(index, 1)
}

const imageUploading = ref(false)
const imageFile = ref([])

const uploadImage = async () => {
  if (isNew) {
    toast.add({ title: 'Save Machine First', description: 'Create the machine before uploading an image.', color: 'warning' })
    imageFile.value = []
    return
  }
  const file = Array.isArray(imageFile.value) ? imageFile.value[0] : imageFile.value
  if (!file) return
  const fd = new FormData()
  fd.append('image', file)
  imageUploading.value = true
  try {
    const res = await $fetch(`/api/admin/machines/${route.params.id}/image`, {
      method: 'POST',
      body: fd
    })
    if (res?.success && res?.data?.imageUrl) {
      state.value.imageUrl = res.data.imageUrl
      toast.add({ title: 'Image Uploaded', description: 'Main image saved successfully.', color: 'success' })
    } else {
      toast.add({ title: 'Upload Failed', description: 'Unable to save image.', color: 'error' })
    }
  } catch (err) {
    const msg = err.data?.statusMessage || 'Upload error'
    toast.add({ title: 'Upload Failed', description: msg, color: 'error' })
  } finally {
    imageUploading.value = false
    imageFile.value = []
  }
}

watch(imageFile, () => {
  if (imageFile.value && (Array.isArray(imageFile.value) ? imageFile.value.length > 0 : true)) {
    uploadImage()
  }
})

const save = async () => {
  loading.value = true
  try {
    const method = isNew ? 'POST' : 'PUT'
    const url = isNew ? '/api/admin/machines' : `/api/admin/machines/${route.params.id}`

    const response = await $fetch(url, {
      method,
      body: state.value,
    })

    if (response.success) {
      toast.add({ title: `Machine ${isNew ? 'created' : 'updated'}`, description: `The machine details have been saved.`, color: 'success' })
      navigateTo('/admin/machines')
    } else {
      // This path may not be hit if errors are thrown, but as a fallback.
      toast.add({ title: 'Save Failed', description: 'An unknown error occurred.', color: 'error' })
    }
  } catch (err) {
    const errorMsg = err.data?.statusMessage || 'An unexpected error occurred. Please check the console.'
    toast.add({ title: 'Save Failed', description: errorMsg, color: 'error' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div v-if="loading" class="flex justify-center items-center h-64">
      <UIcon name="i-lucide-loader" class="w-12 h-12 animate-spin" />
    </div>
    <template v-else>
      <!-- Breadcrumb -->
      <div class="flex items-center gap-2 text-sm text-charcoal-500 mb-4">
        <NuxtLink to="/admin/machines" class="hover:text-deep-teal-600">Machines</NuxtLink>
      <UIcon name="i-lucide-chevron-right" class="w-4 h-4" />
      <span class="text-charcoal-900 font-medium">{{ isNew ? 'New Machine' : 'Edit Machine' }}</span>
    </div>

    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-charcoal-900 dark:text-white">
        {{ isNew ? 'Create New Machine' : 'Edit Machine Details' }}
      </h2>
      <div class="flex gap-3">
        <UButton label="Cancel" color="neutral" variant="subtle" to="/admin/machines" />
        <UButton label="Save Machine" color="primary" icon="i-lucide-save" @click="save" :loading="loading" class="cursor-pointer" />
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Main Info -->
      <div class="lg:col-span-2 space-y-6">
        <UCard title="General Information">
          <div class="space-y-4">
            <UFormField label="Machine Name" name="name" required help="The display name of the machine">
              <UInput v-model="state.name" placeholder="e.g. High Speed Turning Center" class="w-full" />
            </UFormField>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormField label="Model Code" name="code" required>
                <UInput v-model="state.code" placeholder="e.g. TC-500-X" />
              </UFormField>

              <UFormField label="Base Price (USD)" name="basePrice">
                <UInput v-model="state.basePrice" type="number" placeholder="0.00">
                  <template #leading>$</template>
                </UInput>
              </UFormField>
            </div>

            <UFormField label="Description" name="description">
              <UTextarea v-model="state.description" :rows="4" placeholder="Detailed description of the machine capabilities..." class="w-full" />
            </UFormField>

            <UFormField label="External URL" name="url">
              <UInput v-model="state.url" icon="i-lucide-link" placeholder="https://..." class="w-full" />
            </UFormField>
          </div>
        </UCard>

        <!-- Technical Specs Dynamic List -->
        <UCard title="Technical Specifications">
          <template #header>
            <div class="flex justify-between items-center">
              <h3 class="font-semibold dark:text-charcoal-300">Specifications</h3>
              <UButton size="xs" color="neutral" variant="soft" icon="i-lucide-plus" label="Add Spec" @click="addSpec" class="cursor-pointer" />
            </div>
          </template>

          <div class="space-y-3">
             <div v-for="(spec, idx) in state.specs" :key="idx" class="flex gap-3 items-start">
               <div class="flex-1">
                 <UInput v-model="spec.parameter" placeholder="Parameter (e.g. Max RPM)" size="sm" class="w-full" />
               </div>
               <div class="flex-1">
                 <UInput v-model="spec.value" placeholder="Value (e.g. 5000)" size="sm" class="w-full" />
               </div>
               <div class="w-24">
                 <UInput v-model="spec.unit" placeholder="Unit" size="sm" class="w-full" />
               </div>
               <UButton color="error" variant="subtle" icon="i-lucide-x" size="sm" @click="removeSpec(idx)" class="cursor-pointer" />
             </div>
             <div v-if="state.specs.length === 0" class="text-center py-4 dark:text-charcoal-300 text-sm">
               No specifications added.
             </div>
          </div>
        </UCard>
      </div>

      <!-- Sidebar Settings -->
      <div class="space-y-6">
        <UCard title="Classification">
          <div class="space-y-4">
            <UFormField label="Status" name="available">
              <USwitch v-model="state.available" />
              <span class="ml-2 text-sm text-charcoal-300">{{ state.available ? 'Available for Quote' : 'Hidden/Unavailable' }}</span>
            </UFormField>

            <UFormField label="Category" name="category" required>
              <USelectMenu
                v-model="state.categoryId"
                :items="categories"
                value-key="value"
                icon="i-lucide-search"
                placeholder="Select Category"
                :loading="categoriesPending"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Configuration Group" name="configCategory" help="Determines which options appear in the Build & Price tool">
              <USelectMenu
                v-model="state.configCategoryId"
                :items="configCategories"
                value-key="value"
                icon="i-lucide-search"
                placeholder="Select Config Group"
                :loading="configCategoriesPending"
                class="w-full"
              />
            </UFormField>
          </div>
        </UCard>

        <UCard title="Media">
          <div class="space-y-3">
            <div v-if="isNew" class="border-2 border-dashed border-light-gray-300 rounded-lg p-6 text-center">
              <p class="text-sm dark:text-charcoal-300 font-medium">Save the machine to upload an image</p>
            </div>
            <div v-else>
              <div v-if="state.imageUrl" class="space-y-2">
                <img :src="state.imageUrl" alt="Main Image" class="rounded-md w-full object-cover max-h-64" />
                <p class="text-xs text-charcoal-300">Replace image</p>
              </div>
              <div v-else class="border-2 border-dashed border-light-gray-300 rounded-lg p-6 text-center">
                <UIcon name="i-lucide-image-plus" class="w-8 h-8 text-charcoal-300 mx-auto mb-2" />
                <p class="text-sm text-charcoal-600 dark:text-charcoal-300 font-medium">Click to upload main image</p>
                <p class="text-xs text-charcoal-300 mt-1">PNG, JPG up to 2MB</p>
              </div>
              <div class="mt-2">
                <UFileUpload v-model="imageFile" accept="image/png,image/jpeg" :multiple="false" class="cursor-pointer" />
              </div>
              <div v-if="imageUploading" class="flex items-center gap-2 text-xs text-charcoal-300 mt-1">
                <UIcon name="i-lucide-loader" class="w-4 h-4 animate-spin" />
                Uploading...
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </div>
    </template>
  </div>
</template>
