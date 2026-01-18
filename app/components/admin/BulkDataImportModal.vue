<script setup>
const emit = defineEmits(['success'])
const open = defineModel('open', { type: Boolean, default: false })
const toast = useToast()

// State
const loadingModels = ref(false)
const importing = ref(false)
const availableModels = ref([])
const selectedModels = ref([])
const file = ref(null)
const mode = ref('SKIP')
const importResult = ref(null)

const modes = [
  { value: 'SKIP', label: 'Skip duplicates (default)' },
  { value: 'UPDATE', label: 'Update duplicates' },
  { value: 'ERROR', label: 'Abort on duplicate' }
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
    file.value = null
    mode.value = 'SKIP'
    importResult.value = null
    fetchModels()
  }
})

const handleFileChange = (e) => {
  const files = e.target.files
  if (files && files.length > 0) {
    file.value = files[0]
  } else {
    file.value = null
  }
}

const toggleAllModels = () => {
  if (selectedModels.value.length === availableModels.value.length) {
    selectedModels.value = []
  } else {
    selectedModels.value = [...availableModels.value]
  }
}

const handleImport = async () => {
  if (!file.value) {
    toast.add({ title: 'Error', description: 'Please select a file', color: 'error' })
    return
  }

  if (selectedModels.value.length === 0) {
    toast.add({ title: 'Error', description: 'Please select at least one table to import', color: 'error' })
    return
  }

  importing.value = true
  importResult.value = null
  
  const formData = new FormData()
  formData.append('file', file.value)
  formData.append('options', JSON.stringify({
    mode: mode.value,
    tables: selectedModels.value
  }))

  try {
    const response = await $fetch('/api/admin/bulk/import', {
      method: 'POST',
      body: formData
    })

    if (response.success) {
      importResult.value = response.summary
      toast.add({ 
        title: 'Import Processed', 
        description: 'See summary for details',
        color: 'success' 
      })
      emit('success')
      // Don't close modal automatically so user can see summary
    } else {
       toast.add({ title: 'Import Failed', description: response.message || 'Unknown error', color: 'error' })
    }
  } catch (err) {
    const msg = err.data?.statusMessage || err.message || 'An error occurred during import'
    toast.add({ title: 'Import Failed', description: msg, color: 'error' })
  } finally {
    importing.value = false
  }
}
</script>

<template>
  <UModal fullscreen v-model:open="open" title="Bulk Import" description="Upload a multi-sheet Excel file to import data into multiple tables.">
    <template #body>
      <div v-if="loadingModels" class="flex justify-center py-8">
        <UIcon name="i-lucide-loader" class="animate-spin size-8 text-primary" />
      </div>
      
      <div v-else class="space-y-6">
        
        <div v-if="!importResult">
            <!-- File Upload -->
            <UFormField label="Excel File" help="Supported formats: .xlsx, .xls">
               <UInput type="file" accept=".xlsx, .xls" @change="handleFileChange" class="w-full" />
            </UFormField>

            <!-- Table Selection -->
            <div class="mb-2">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-200">Tables to Import</span>
                <UButton 
                  size="xs" 
                  variant="ghost" 
                  color="primary" 
                  :label="selectedModels.length === availableModels.length ? 'Deselect All' : 'Select All'" 
                  @click="toggleAllModels"
                  class="cursor-pointer"
                />
              </div>
              
              <div class="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-md">
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
              <p class="text-xs text-gray-500 mt-1">Sheet names must match table names exactly.</p>
            </div>

            <!-- Duplicate Handling -->
            <UFormField label="Duplicate Handling">
              <URadioGroup v-model="mode" :items="modes" />
            </UFormField>
        </div>

        <!-- Summary Result -->
        <div v-else class="space-y-4">
            <div class="flex items-center gap-4">
                <div class="flex flex-col">
                    <span class="text-sm text-gray-500">Total Success</span>
                    <span class="text-2xl font-bold text-green-600">{{ importResult.totalSuccess }}</span>
                </div>
                <div class="flex flex-col">
                    <span class="text-sm text-gray-500">Total Errors</span>
                    <span class="text-2xl font-bold text-red-600">{{ importResult.totalErrors }}</span>
                </div>
            </div>

            <div class="border rounded-md divide-y dark:border-gray-700">
                <div v-for="detail in importResult.details" :key="detail.table" class="p-3 text-sm">
                    <div class="flex justify-between items-center font-medium">
                        <span>{{ detail.table }}</span>
                        <div class="flex gap-2">
                            <span v-if="detail.success > 0" class="text-green-600">{{ detail.success }} imported</span>
                            <span v-if="detail.errors.length > 0" class="text-red-600">{{ detail.errors.length }} errors</span>
                            <span v-if="detail.success === 0 && detail.errors.length === 0" class="text-gray-400">Skipped/Empty</span>
                        </div>
                    </div>
                    <div v-if="detail.errors.length > 0" class="mt-2 pl-2 border-l-2 border-red-200 text-xs text-red-600 space-y-1">
                        <div v-for="(err, i) in detail.errors.slice(0, 5)" :key="i">
                            {{ err.row ? `Row ${err.row}: ` : '' }}{{ err.message }}
                        </div>
                        <div v-if="detail.errors.length > 5">...and {{ detail.errors.length - 5 }} more</div>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton v-if="!importResult" label="Cancel" color="neutral" variant="soft" @click="open = false" />
        <UButton v-else label="Close" color="primary" @click="open = false" />
        
        <UButton 
          v-if="!importResult"
          label="Import All" 
          color="primary" 
          :loading="importing" 
          @click="handleImport" 
          icon="i-lucide-upload"
        />
      </div>
    </template>
  </UModal>
</template>
