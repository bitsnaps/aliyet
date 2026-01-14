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

// Fetch Unique Specifications for the modal
const { data: uniqueSpecs, refresh: refreshUniqueSpecs, pending: uniqueSpecsPending } = useFetch('/api/admin/specifications/unique', {
  transform: (response) => response.data,
  lazy: true,
  server: false,
})

const isSpecModalOpen = ref(false)
const selectedSpecs = ref([])
const searchQuery = ref('')

const filteredSpecs = computed(() => {
  if (!uniqueSpecs.value || !Array.isArray(uniqueSpecs.value)) return []
  const query = (searchQuery.value || '').toLowerCase()

  return uniqueSpecs.value.filter(spec => {
    if (!spec) return false
    const param = spec.parameter ? String(spec.parameter).toLowerCase() : ''
    const unit = spec.unit ? String(spec.unit).toLowerCase() : ''
    return !query || param.includes(query) || unit.includes(query)
  })
})

const openSpecModal = async () => {
  await refreshUniqueSpecs()
  selectedSpecs.value = []
  searchQuery.value = ''
  isSpecModalOpen.value = true
}

const confirmSelectedSpecs = () => {
  selectedSpecs.value.forEach(spec => {
    // Avoid adding duplicates if already in state.value.specs
    const exists = state.value.specs.some(s => s.parameter === spec.parameter && s.unit === spec.unit)
    if (!exists) {
      state.value.specs.push({ parameter: spec.parameter, value: '', unit: spec.unit })
    }
  })
  isSpecModalOpen.value = false
}

const newSpec = ref({ parameter: '', unit: '' })
const creatingSpec = ref(false)

const createAndAddSpec = async () => {
  if (!newSpec.value.parameter) return
  creatingSpec.value = true
  try {
    const res = await $fetch('/api/admin/specifications', {
      method: 'POST',
      body: newSpec.value
    })
    if (res.success) {
      toast.add({ title: 'Specification Created', color: 'success' })
      selectedSpecs.value.push(res.data)
      await refreshUniqueSpecs()
      newSpec.value = { parameter: '', unit: '' }
    }
  } catch (err) {
    toast.add({ title: 'Error creating spec', description: err.data?.statusMessage, color: 'error' })
  } finally {
    creatingSpec.value = false
  }
}

const removeSpec = (index) => {
  state.value.specs.splice(index, 1)
}

const dragIndex = ref(null)

const onDragStart = (index, event) => {
  dragIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.dropEffect = 'move'
  }
}

const onDrop = (index) => {
  if (dragIndex.value === null || dragIndex.value === index) return
  const item = state.value.specs[dragIndex.value]
  state.value.specs.splice(dragIndex.value, 1)
  state.value.specs.splice(index, 0, item)
  dragIndex.value = null
}

const imageUploading = ref(false)
const imageFile = ref([])

import { resizeImage } from '~/utils/image'

const uploadImage = async () => {
  if (isNew) {
    toast.add({ title: 'Save Machine First', description: 'Create the machine before uploading an image.', color: 'warning' })
    imageFile.value = []
    return
  }
  let file = Array.isArray(imageFile.value) ? imageFile.value[0] : imageFile.value
  if (!file) return

  imageUploading.value = true
  
  try {
    // Resize image if needed (Max 1024x1024)
    file = await resizeImage(file, 1024, 1024)

    const fd = new FormData()
    fd.append('image', file)
    
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
              <div class="flex gap-2">
                <UButton size="xs" color="neutral" variant="outline" icon="i-lucide-list-plus" label="Select Existing" @click="openSpecModal" class="cursor-pointer" />
              </div>
            </div>
          </template>

          <div class="space-y-3">
             <div
               v-for="(spec, idx) in state.specs"
               :key="idx"
               class="flex gap-3 items-start transition-all duration-200"
               :class="{ 'opacity-50': dragIndex === idx }"
               draggable="true"
               @dragstart="onDragStart(idx, $event)"
               @dragover.prevent
               @dragenter.prevent
               @drop="onDrop(idx)"
             >
               <div class="pt-1.5 cursor-move text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300">
                 <UIcon name="i-lucide-grip-vertical" class="w-5 h-5" />
               </div>
               <div class="pt-1.5 w-6 text-center text-sm font-medium text-gray-500 dark:text-gray-400 select-none">
                 {{ idx + 1 }}
               </div>
               <div class="flex-1">
                 <UInput v-model="spec.parameter" placeholder="Parameter (e.g. Max RPM)" size="sm" class="w-full" disabled />
               </div>
               <div class="flex-1">
                 <UInput v-model="spec.value" placeholder="Value (e.g. 5000)" size="sm" class="w-full" />
               </div>
               <div class="w-24">
                 <UInput v-model="spec.unit" placeholder="Unit" size="sm" class="w-full" disabled />
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
              </div>
              <div class="mt-2">
                <UFileUpload v-model="imageFile" accept="image/png,image/jpeg" :multiple="false" class="cursor-pointer" />
                <p class="text-xs text-charcoal-300 mt-1">Recommended: 1024x1024px (Auto-resized). Max 2MB.</p>
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

  <!-- Specification Selection Modal -->
  <UModal
    v-model:open="isSpecModalOpen"
    title="Manage Specifications"
    description="Select existing specifications or create new ones"
    :scrollable="true"
    :ui="{ footer: 'flex justify-end gap-2' }"
  >
    <template #body>
      <UTabs :items="[{ label: 'Select Existing', slot: 'select' }, { label: 'Create New', slot: 'create' }]" class="w-full">
        <template #select>
          <div class="space-y-4 pt-4">
            <UInput
              v-model="searchQuery"
              icon="i-lucide-search"
              placeholder="Search specifications..."
              class="w-full"
            >
              <template v-if="searchQuery?.length" #trailing>
                <UButton
                  color="neutral"
                  variant="link"
                  size="sm"
                  icon="i-lucide-circle-x"
                  aria-label="Clear input"
                  @click="searchQuery = ''"
                />
              </template>        
            </UInput>

            <div v-if="uniqueSpecsPending" class="flex justify-center py-4">
              <UIcon name="i-lucide-loader" class="w-8 h-8 animate-spin text-charcoal-400" />
            </div>
            <div v-else-if="!filteredSpecs || filteredSpecs.length === 0" class="text-center py-4 dark:text-charcoal-400">
              {{ searchQuery ? 'No matching specifications found.' : 'No specifications found.' }}
            </div>
            <div v-else class="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md">
              <UTable
                :data="filteredSpecs"
                :columns="[
                  { accessorKey: 'select', header: `# ${selectedSpecs.length ? selectedSpecs.length: ''}` },
                  { accessorKey: 'parameter', header: 'Parameter' },
                  { accessorKey: 'unit', header: 'Unit' }
                ]"
              >
                <template #select-cell="{ row }">
                  <UCheckbox
                    :model-value="selectedSpecs.some(s => s.parameter === row.original.parameter && s.unit === row.original.unit)"
                    @update:model-value="(checked) => {
                      if (checked) {
                        selectedSpecs.push(row.original)
                      } else {
                        selectedSpecs = selectedSpecs.filter(s => !(s.parameter === row.original.parameter && s.unit === row.original.unit))
                      }
                    }"
                  />
                </template>
              </UTable>
            </div>
          </div>
        </template>

        <template #create>
          <div class="space-y-4 pt-4">
             <div class="p-4 border border-gray-200 dark:border-gray-700 rounded-md space-y-3">
               <UFormField label="Parameter Name" required>
                 <UInput v-model="newSpec.parameter" placeholder="e.g. Max Spindle Speed" class="w-full" />
               </UFormField>
               <UFormField label="Unit" help="Optional">
                 <UInput v-model="newSpec.unit" placeholder="e.g. RPM" class="w-full" />
               </UFormField>
               <div class="flex justify-end pt-2">
                 <UButton 
                   label="Create & Select" 
                   icon="i-lucide-plus" 
                   :loading="creatingSpec" 
                   @click="createAndAddSpec" 
                   :disabled="!newSpec.parameter"
                 />
               </div>
             </div>
             <div class="text-xs text-gray-500">
               <p>Once created, the specification will be automatically selected.</p>
             </div>
          </div>
        </template>
      </UTabs>
    </template>

    <template #footer>
      <UButton label="Cancel" color="neutral" variant="outline" @click="isSpecModalOpen = false" class="cursor-pointer" />
      <UButton label="Add Selected" color="primary" @click="confirmSelectedSpecs" :disabled="selectedSpecs.length === 0" class="cursor-pointer" />
    </template>
  </UModal>
</template>
