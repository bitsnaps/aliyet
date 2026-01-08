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
const exporting = ref(false)
const schema = ref([])
const selectedFields = ref([])
const limit = ref(0) // 0 for all

const limits = [
  { value: 0, label: 'All records' },
  { value: 10, label: 'First 10 records' },
  { value: 50, label: 'First 50 records' },
  { value: 100, label: 'First 100 records' }
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
    limit.value = 0
    fetchSchema()
  }
})

const toggleAllFields = () => {
  if (selectedFields.value.length === schema.value.length) {
    selectedFields.value = []
  } else {
    selectedFields.value = schema.value.map(f => f.key)
  }
}

const handleExport = async () => {
  if (selectedFields.value.length === 0) {
    toast.add({ title: 'Error', description: 'Please select at least one field to export', color: 'error' })
    return
  }

  exporting.value = true
  try {
    const query = {
      fields: selectedFields.value.join(','),
      limit: limit.value
    }
    
    const blob = await $fetch(`/api/admin/export/${props.model}`, {
      query,
      responseType: 'blob'
    })
    
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${props.model}-${new Date().toISOString().split('T')[0]}.xlsx`)
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
  <UModal v-model:open="open" :title="`Export ${model}`" description="Select columns and rows to export.">
    <template #body>
      <div v-if="loadingSchema" class="flex justify-center py-8">
        <UIcon name="i-lucide-loader" class="animate-spin size-8 text-primary" />
      </div>
      
      <div v-else class="space-y-6">
        
        <!-- Field Selection -->
        <div class="mb-2">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-gray-700 dark:text-gray-200">Fields to Export</span>
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

        <!-- Limit Selection -->
        <UFormField label="Number of Records">
          <URadioGroup v-model="limit" :items="limits" />
        </UFormField>

      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton label="Cancel" color="neutral" variant="soft" @click="open = false" />
        <UButton 
          label="Export" 
          color="primary" 
          :loading="exporting" 
          @click="handleExport" 
          icon="i-lucide-download"
        />
      </div>
    </template>
  </UModal>
</template>