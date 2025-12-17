<script setup>
definePageMeta({
  layout: 'admin',
  
})

const toast = useToast()

// Modals state
const isDeleteConfirmOpen = ref(false)
const isDeleting = ref(false)
const isFormModalOpen = ref(false)

const selectedConfig = ref(null)

// Data
const { data: configs, pending, error, refresh } = await useFetch('/api/admin/configs', {
  lazy: true,
  transform: (response) => response.data,
  server: false,
})

const columns = [
  { accessorKey: 'name', header: 'Name', enableSorting: true },
  { accessorKey: 'description', header: 'Description', enableSorting: false },
  { accessorKey: 'actions', header: 'Actions', enableSorting: false }
]

const search = ref('')

const filteredRows = computed(() => {
  if (!configs.value) return []
  
  let filtered = [...configs.value]

  if (search.value) {
    filtered = filtered.filter(c => 
      c.name.toLowerCase().includes(search.value.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.value.toLowerCase()))
    )
  }

  return filtered
})

const openFormModal = (config = null) => {
  selectedConfig.value = config
  isFormModalOpen.value = true
}

const handleDelete = (row) => {
  selectedConfig.value = row
  isDeleteConfirmOpen.value = true
}

const confirmDelete = async () => {
  isDeleting.value = true
  try {
    await $fetch(`/api/admin/configs/${selectedConfig.value.id}`, {
      method: 'DELETE',
    })
    toast.add({ title: 'Configuration Deleted', description: `"${selectedConfig.value.name}" has been removed.`, color: 'success' })
    isDeleteConfirmOpen.value = false
    await refresh()
  } catch (err) {
    const errorMsg = err.data?.statusMessage || 'An unknown error occurred.'
    toast.add({ title: 'Deletion Failed', description: errorMsg, color: 'error' })
  } finally {
    isDeleting.value = false
  }
}

const onFormSaved = async () => {
  isFormModalOpen.value = false
  await refresh()
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-charcoal-900 dark:text-white">Configuration Groups</h2>
        <p class="dark:text-charcoal-300 text-sm mt-1">Manage option groups for the Build & Price tool.</p>
      </div>

      <UButton 
        icon="i-lucide-plus" 
        label="Add Group" 
        color="primary" 
        size="md"
        @click="openFormModal()"
      />
    </div>  

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="isDeleteConfirmOpen" title="Confirm Deletion">
        <template #body>
          <p>Are you sure you want to delete the configuration group <UBadge color="neutral" variant="subtle">{{ selectedConfig?.name }}</UBadge>?</p>
          <p>This action cannot be undone.</p>
        </template>
        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton label="Cancel" color="neutral" variant="soft" @click="isDeleteConfirmOpen = false" />
            <UButton label="Delete" color="error" variant="soft" @click="confirmDelete" :loading="isDeleting" />
          </div>
        </template>        
    </UModal>

    <!-- Create/Edit Form Modal -->
    <!-- <UModal v-model:open="isFormModalOpen" :title="selectedConfig ? 'Edit Group' : 'Create New Group'">
      <AdminConfigForm :config="selectedConfig" @saved="onFormSaved" @closed="isFormModalOpen = false" />
    </UModal> -->

    <!-- Filters -->
    <UCard :ui="{ body: { padding: 'p-4' } }">
      <div class="flex items-center justify-between">
        <UInput 
          v-model="search"
          icon="i-lucide-search"
          placeholder="Search by name or description..."
          class="w-full sm:w-80"
          color="neutral"
        />
      </div>
    </UCard>

    <!-- Table -->
    <UCard :ui="{ body: { padding: 'p-0' } }" >
      <UTable 
        :data="filteredRows"
        :columns="columns"
        :loading="pending"
        :loading-state="{ icon: 'i-lucide-loader', label: 'Loading...' }"
        :empty-state="{ icon: 'i-lucide-database-zap', label: 'No configuration groups found.' }"
        class="w-full"
      >
        <template #name-cell="{ row }">
          <span class="font-medium text-deep-teal-600">{{ row.original.name }}</span>
        </template>
        
        <template #description-cell="{ row }">
          <span class="text-charcoal-700 dark:text-charcoal-300">{{ row.original.description || '-' }}</span>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex flex-row items-center gap-1">
            <UButton @click="handleDelete(row.original)" color="error" variant="outline" icon="i-lucide-trash" size="md" />
            <UButton @click="openFormModal(row.original)" color="neutral" variant="outline" icon="i-lucide-edit" size="md" />
          </div>
        </template>
      </UTable>
    </UCard>

  </div>
</template>