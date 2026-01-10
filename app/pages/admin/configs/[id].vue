<script setup>
import DataImportModal from '~/components/admin/DataImportModal.vue'
import DataExportModal from '~/components/admin/DataExportModal.vue'

definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const configId = route.params.id
const toast = useToast()

// --- Data Fetching ---
const { data: config, pending: configPending } = useFetch(`/api/admin/configs/${configId}`, {
  lazy: true,
  server: false,
  transform: (res) => res.data
})

const { data: options, pending: optionsPending, refresh: refreshOptions } = useFetch(`/api/admin/config-options?configId=${configId}`, {
  lazy: true,
  server: false,
  transform: (res) => res.data
})

// --- State ---
const loading = ref(false)
const isFormModalOpen = ref(false)
const isDeleteConfirmOpen = ref(false)
const isImportModalOpen = ref(false)
const isExportModalOpen = ref(false)
const selectedOption = ref(null)

const columns = [
  { accessorKey: 'name', header: 'Option Name' },
  { accessorKey: 'price', header: 'Price Adjustment' },
  { accessorKey: 'actions', header: 'Actions', class: 'w-24' }
]

// --- Methods ---
const openFormModal = (option = null) => {
  selectedOption.value = option
  isFormModalOpen.value = true
}

const openDeleteModal = (option) => {
  selectedOption.value = option
  isDeleteConfirmOpen.value = true
}

const onFormSaved = () => {
  isFormModalOpen.value = false
  refreshOptions()
}

const confirmDelete = async () => {
  loading.value = true
  try {
    await $fetch(`/api/admin/config-options/${selectedOption.value.id}`, { method: 'DELETE' })
    toast.add({ title: 'Option Deleted', color: 'success' })
    isDeleteConfirmOpen.value = false
    refreshOptions()
  } catch (err) {
    toast.add({ title: 'Deletion Failed', description: err.data?.statusMessage, color: 'error' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div v-if="configPending" class="flex justify-center items-center h-64">
      <UIcon name="i-lucide-loader" class="w-12 h-12 animate-spin" />
    </div>
    
    <template v-else-if="config">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 text-sm text-charcoal-500 mb-2">
            <NuxtLink to="/admin/configs" class="hover:text-deep-teal-600">Configurations</NuxtLink>
            <UIcon name="i-lucide-chevron-right" class="w-4 h-4" />
            <span class="text-charcoal-900 font-medium">{{ config.name }}</span>
          </div>
          <h2 class="text-2xl font-bold text-charcoal-900 dark:text-white">Manage Options</h2>
          <p class="dark:text-charcoal-300 text-sm mt-1">{{ config.description }}</p>
          <div class="mt-2">
            <UBadge :color="config.type === 'select' ? 'primary' : 'neutral'" variant="subtle">Type: {{ config.type }}</UBadge>
          </div>
        </div>

        <div v-if="config.type === 'select'" class="flex gap-2">
          <UButton label="Import" icon="i-lucide-upload" color="neutral" variant="soft"  class="cursor-pointer" @click="isImportModalOpen = true" />
          <UButton label="Export" icon="i-lucide-download" color="neutral" variant="soft" class="cursor-pointer" @click="isExportModalOpen = true" />
          <UButton
            icon="i-lucide-plus"
            label="Add Option"
            color="primary"
            size="md"
            @click="openFormModal()"
          />
        </div>
      </div>

      <!-- Options Table (Only for Select type) -->
      <UCard v-if="config.type === 'select'" :ui="{ body: { padding: 'p-0' } }">
        <UTable
          :data="options"
          :columns="columns"
          :loading="optionsPending"
          :empty-state="{ icon: 'i-lucide-database-zap', label: 'No options added yet.' }"
        >
          <template #price-cell="{ row }">
            <span class="font-mono" :class="[row.original.price >= 0 ? 'text-green-500' : 'text-red-500']">
              {{ Number(row.original.price).toLocaleString('en-US', { style: 'currency', currency: 'USD' }) }}
            </span>
          </template>

          <template #actions-cell="{ row }">
            <div class="flex items-center gap-2">
              <UButton icon="i-lucide-edit" size="sm" color="neutral" variant="outline" @click="openFormModal(row.original)" />
              <UButton icon="i-lucide-trash" size="sm" color="error" variant="outline" @click="openDeleteModal(row.original)" />
            </div>
          </template>
        </UTable>
      </UCard>
      
      <div v-else class="text-center py-12 border border-dashed border-gray-300 rounded-lg">
        <UIcon name="i-lucide-info" class="w-12 h-12 text-gray-400 mx-auto mb-2" />
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">No Options Required</h3>
        <p class="text-gray-500 mt-1">This configuration is set to "<strong>{{ config.type }}</strong>", so it doesn't need predefined options.</p>
      </div>
    </template>
    
    <div v-else class="text-center py-12">
      <h3 class="text-xl font-semibold">Configuration Not Found</h3>
      <p class="text-charcoal-400 mt-2">The requested configuration could not be loaded.</p>
      <UButton to="/admin/configs" label="Back to Groups" variant="soft" class="mt-4" />
    </div>

    <!-- Modals -->
    <DataImportModal
        v-model:open="isImportModalOpen"
        model="ConfigOptions"
        :parent-id="configId"
        parent-field="config_id"
        @success="refreshOptions"
    />

    <DataExportModal
        v-model:open="isExportModalOpen"
        model="ConfigOptions"
        :parent-id="configId"
        parent-field="config_id"
    />

    <UModal v-model:open="isFormModalOpen" :title="selectedOption ? 'Edit Option' : 'Add New Option'" :description="`Configuration Option ID: ${configId}`">
      <template #body>
        <AdminConfigOptionForm :option="selectedOption" :config-id="configId" @saved="onFormSaved" @closed="isFormModalOpen = false" />
      </template>
    </UModal>

    <UModal v-model:open="isDeleteConfirmOpen" title="Confirm Deletion">
      <template #body>
        <p>Are you sure you want to delete the option <UBadge color="neutral" variant="subtle">{{ selectedOption?.name }}</UBadge>? This is irreversible.</p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton label="Cancel" color="neutral" variant="soft" @click="isDeleteConfirmOpen = false" />
          <UButton label="Delete" color="error" variant="soft" :loading="loading" @click="confirmDelete" />
        </div>
      </template>
    </UModal>
  </div>
</template>