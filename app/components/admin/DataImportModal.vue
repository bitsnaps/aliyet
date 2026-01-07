<script setup>
const props = defineProps({
  model: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['success'])
const open = defineModel('open', { type: Boolean, default: false })
const toast = useToast()

// State
const loadingSchema = ref(false)
const importing = ref(false)
const schema = ref([])
const selectedFields = ref([])
const file = ref(null)
const mode = ref('SKIP')

const modes = [
  { value: 'SKIP', label: 'Skip duplicates (default)' },
  { value: 'UPDATE', label: 'Update duplicates' },
  { value: 'ERROR', label: 'Abort on duplicate' }
]

// Fetch Schema
const fetchSchema = async () => {
  loadingSchema.value = true
  try {
    const data = await $fetch(`/api/admin/models/${props.model}/schema`)
    schema.value = data
    // Select all by default
    selectedFields.value = data.map(f => f.key)
  } catch (err) {
    toast.add({ title: 'Error', description: 'Failed to load model schema', color: 'error' })
    open.value = false
  } finally {
    loadingSchema.value = false
  }
}

// Watchers
watch(open, (newVal) => {
  if (newVal) {
    // Reset state
    file.value = null
    mode.value = 'SKIP'
    fetchSchema()
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

const toggleAllFields = () => {
  if (selectedFields.value.length === schema.value.length) {
    selectedFields.value = []
  } else {
    selectedFields.value = schema.value.map(f => f.key)
  }
}

const handleImport = async () => {
  if (!file.value) {
    toast.add({ title: 'Error', description: 'Please select a file', color: 'error' })
    return
  }

  if (selectedFields.value.length === 0) {
    toast.add({ title: 'Error', description: 'Please select at least one field to import', color: 'error' })
    return
  }

  importing.value = true
  const formData = new FormData()
  formData.append('file', file.value)
  formData.append('options', JSON.stringify({
    mode: mode.value,
    selectedFields: selectedFields.value
  }))

  try {
    const response = await $fetch(`/api/admin/import/${props.model}`, {
      method: 'POST',
      body: formData
    })

    if (response.success) {
      toast.add({ 
        title: 'Import Successful', 
        description: response.message, 
        color: response.errors && response.errors.length > 0 ? 'warning' : 'success' 
      })
      emit('success')
      open.value = false
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
  <UModal v-model:open="open" :title="`Import ${model}`" description="Upload an Excel file to import data.">
    <template #body>
      <div v-if="loadingSchema" class="flex justify-center py-8">
        <UIcon name="i-lucide-loader" class="animate-spin size-8 text-primary" />
      </div>
      
      <div v-else class="space-y-6">
        
        <!-- File Upload -->
        <UFormField label="Excel File" help="Supported formats: .xlsx, .xls">
           <UInput type="file" accept=".xlsx, .xls" @change="handleFileChange" class="w-full" />
        </UFormField>

        <!-- Field Mapping -->
        <div class="mb-2">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-200">Fields to Import</span>
            <UButton 
              size="xs" 
              variant="ghost" 
              color="primary" 
              :label="selectedFields.length === schema.length ? 'Deselect All' : 'Select All'" 
              @click="toggleAllFields"
              class="cursor-pointer"
            />
          </div>
          
          <div class="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-md">
            <div v-for="field in schema" :key="field.key" class="flex items-center gap-2">
              <UCheckbox
                :model-value="selectedFields.includes(field.key)"
                @update:model-value="(checked) => {
                  if (checked) {
                    selectedFields.push(field.key)
                  } else {
                    selectedFields = selectedFields.filter(k => k !== field.key)
                  }
                }"
                :label="field.label"
              />
              <span class="text-xs text-gray-500">({{ field.type }})</span>
            </div>
          </div>
        </div>

        <!-- Duplicate Handling -->
        <UFormField label="Duplicate Handling">
          <URadioGroup v-model="mode" :items="modes" />
        </UFormField>

      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton label="Cancel" color="neutral" variant="soft" @click="open = false" />
        <UButton 
          label="Import" 
          color="primary" 
          :loading="importing" 
          @click="handleImport" 
          icon="i-lucide-upload"
        />
      </div>
    </template>
  </UModal>
</template>