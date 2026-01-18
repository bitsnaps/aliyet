<script setup>
const emit = defineEmits(['success'])
const open = defineModel('open', { type: Boolean, default: false })
const toast = useToast()

// State
const loadingModels = ref(false)
const exporting = ref(false)
const availableModels = ref([])
const selectedModels = ref([])
const limit = ref(0) // 0 for all

const limits = [
  { value: 0, label: 'All records' },
  { value: 10, label: 'First 10 records' },
  { value: 50, label: 'First 50 records' },
  { value: 100, label: 'First 100 records' }
]

// Fetch Models
const fetchModels = async () => {
  loadingModels.value = true
  try {
    const data = await $fetch('/api/admin/models')
    availableModels.value = data
    // Select all by default
    selectedModels.value = [...data]
  } catch (err) {
    toast.add({ title: 'Error', description: 'Failed to load models', color: 'error' })
    open.value = false
  } finally {
    loadingModels.value = false
  }
}

// Watchers
watch(open, (newVal) => {
  if (newVal) {
    // Reset state
    limit.value = 0
    fetchModels()
  }
})

const toggleAllModels = () => {
  if (selectedModels.value.length === availableModels.value.length) {
    selectedModels.value = []
  } else {
    selectedModels.value = [...availableModels.value]
  }
}

const handleExport = async () => {
  if (selectedModels.value.length === 0) {
    toast.add({ title: 'Error', description: 'Please select at least one table to export', color: 'error' })
    return
  }

  exporting.value = true
  try {
    const query = {
      tables: selectedModels.value.join(','),
      limit: limit.value
    }
    
    const blob = await $fetch('/api/admin/bulk/export', {
      query,
      responseType: 'blob'
    })
    
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `bulk-export-${new Date().toISOString().split('T')[0]}.xlsx`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    toast.add({ title: 'Export Successful', color: 'success' })
    emit('success')
    open.value = false
  } catch (err) {
    const msg = err.data?.statusMessage || err.message || 'An error occurred during export'
    toast.add({ title: 'Export Failed', description: msg, color: 'error' })
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <UModal fullscreen v-model:open="open" title="Bulk Export" description="Select tables to export to a multi-sheet Excel file.">
    <template #body>
      <div v-if="loadingModels" class="flex justify-center py-8">
        <UIcon name="i-lucide-loader" class="animate-spin size-8 text-primary" />
      </div>
      
      <div v-else class="space-y-6">
        
        <!-- Table Selection -->
        <div class="mb-2">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-200">Tables to Export</span>
            <UButton 
              size="xs" 
              variant="ghost" 
              color="primary" 
              :label="selectedModels.length === availableModels.length ? 'Deselect All' : 'Select All'" 
              @click="toggleAllModels"
              class="cursor-pointer"
            />
          </div>
          
          <div class="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-md">
            <div v-for="model in availableModels" :key="model" class="flex items-center gap-2">
              <UCheckbox
                :model-value="selectedModels.includes(model)"
                @update:model-value="(checked) => {
                  if (checked) {
                    selectedModels.push(model)
                  } else {
                    selectedModels = selectedModels.filter(m => m !== model)
                  }
                }"
                :label="model"
              />
            </div>
          </div>
        </div>

        <!-- Limit Selection -->
        <UFormField label="Number of Records per Table">
          <URadioGroup v-model="limit" :items="limits" />
        </UFormField>

      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton label="Cancel" color="neutral" variant="soft" @click="open = false" />
        <UButton 
          label="Export All" 
          color="primary" 
          :loading="exporting" 
          @click="handleExport" 
          icon="i-lucide-download"
        />
      </div>
    </template>
  </UModal>
</template>
