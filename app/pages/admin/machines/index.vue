<script setup>
import DataImportModal from '~/components/admin/DataImportModal.vue'
import DataExportModal from '~/components/admin/DataExportModal.vue'

definePageMeta({
  layout: 'admin'
})


const toast = useToast()

// Modals state
const isDeleteConfirmOpen = ref(false)
const isDeleting = ref(false)
const isImportModalOpen = ref(false)
const isExportModalOpen = ref(false)

const selectedMachine = ref(null)

// Data
const { data: machines, pending, error, refresh } = await useFetch('/api/admin/machines', {
  lazy: true,
  transform: (response) => response.data,
  server: false, // We will fetch on client-side
})

const columns = [
  { accessorKey: 'id', header: 'N°', enableSorting: true },
  { accessorKey: 'code', header: 'Code', enableSorting: true },
  { accessorKey: 'name', header: 'Name', enableSorting: true },
  { accessorKey: 'category', header: 'Category', enableSorting: true },
  { accessorKey: 'price', header: 'Base Price', enableSorting: true },
  { accessorKey: 'available', header: 'Availability', enableSorting: true },
  { accessorKey: 'actions', header: 'Actions', enableSorting: false }
]

const search = ref('')
const selectedStatus = ref([])
const page = ref(1)
const pageCount = 10

const filteredRows = computed(() => {
  if (!machines.value) return []
  
  let filtered = [...machines.value]

  // Search filter
  if (search.value) {
    filtered = filtered.filter(m => {
      return m.name.toLowerCase().includes(search.value.toLowerCase()) ||
             m.code.toLowerCase().includes(search.value.toLowerCase())
    })
  }

  // Status filter
  if (selectedStatus.value.length > 0) {
    const availableFilter = selectedStatus.value.includes('Available')
    const unavailableFilter = selectedStatus.value.includes('Unavailable')

    if (availableFilter && !unavailableFilter) {
      filtered = filtered.filter(m => m.available)
    } else if (!availableFilter && unavailableFilter) {
      filtered = filtered.filter(m => !m.available)
    }
    // if both are selected or none are, no status filter is applied
  }

  return filtered
})

const paginatedRows = computed(() => {
  const start = (page.value - 1) * pageCount
  const end = start + pageCount
  return filteredRows.value.slice(start, end)
})

watch([search, selectedStatus], () => {
  page.value = 1
})

const handleDelete = (row) => {
  selectedMachine.value = row
  isDeleteConfirmOpen.value = true
}

const confirmDelete = async () => {
  isDeleting.value = true

  try {
    await $fetch(`/api/admin/machines/${selectedMachine.value.id}`, {
      method: 'DELETE',
    })
    toast.add({ title: 'Machine Deleted', description: `"${selectedMachine.value.name}" has been removed.`, color: 'success' })
    isDeleteConfirmOpen.value = false
    await refresh() // Re-fetch the machine list
  } catch (err) {
    const errorMsg = err.data?.statusMessage || 'An unknown error occurred.'
    toast.add({ title: 'Deletion Failed', description: errorMsg, color: 'error' })
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-charcoal-900 dark:text-white">Machines</h2>
          <p class="dark:text-charcoal-300 text-sm mt-1">Manage your industrial machine catalog</p>
        </div>
  
        <div class="flex gap-2">
          <UButton label="Import" icon="i-lucide-upload" color="neutral" variant="soft"  class="cursor-pointer" @click="isImportModalOpen = true" />
          <UButton label="Export" icon="i-lucide-download" color="neutral" variant="soft" class="cursor-pointer" @click="isExportModalOpen = true" />
          <UButton
            icon="i-lucide-plus"
            label="Add Machine"
            color="primary"
            size="md"
            to="/admin/machines/new"
          />
        </div>
      </div>
  
      <DataImportModal
        v-model:open="isImportModalOpen"
        model="Machines"
        @success="refresh"
      />
  
      <DataExportModal
        v-model:open="isExportModalOpen"
        model="Machines"
      />
  
      <UModal v-model:open="isDeleteConfirmOpen" :description="`Machine Code: ${selectedMachine?.code}`" title="Confirm Deletion">
        <template #body>
          <p>Are you sure you want to delete the machine <UBadge color="neutral" variant="subtle">{{ selectedMachine?.name }}</UBadge>?</p>
          <p>This action cannot be undone.</p>
        </template>
        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton label="Cancel" color="neutral" variant="soft" @click="isDeleteConfirmOpen = false" class="cursor-pointer" />
            <UButton label="Delete" color="error" variant="soft" @click="confirmDelete" :loading="isDeleting" class="cursor-pointer" />
          </div>
        </template>        
    </UModal>

    <!-- Filters -->
    <UCard :ui="{ body: { padding: 'p-4' } }">
      <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <UInput 
          v-model="search"
          icon="i-lucide-search"
          placeholder="Search by name or code..."
          class="w-full sm:w-80"
          color="neutral"
        />
        <div class="flex gap-2">
           <USelectMenu 
             v-model="selectedStatus" 
             :items="['Available', 'Unavailable']" 
             placeholder="Filter Status"
             multiple
             class="w-48"
           />
        </div>
      </div>
    </UCard>

    <!-- Table -->
    <UCard :ui="{ body: { padding: 'p-0' } }" >
      <UTable
        :data="paginatedRows"
        :columns="columns"
        :loading="pending"
        :loading-state="{ icon: 'i-lucide-loader', label: 'Loading...' }"
        :empty-state="{ icon: 'i-lucide-database-zap', label: 'No machines found.' }"
        class="w-full"
      >
        <template #name-cell="{ row }">
          <NuxtLink :to="`/admin/machines/${row.original.id}`" class="font-medium text-deep-teal-600 hover:underline">
            {{ row.original.name }}
          </NuxtLink>
        </template>
        
        <template #price-cell="{ row }">
          <span class="font-mono text-charcoal-700 dark:text-charcoal-300">${{ Number(row.original.price).toLocaleString() }}</span>
        </template>
        
        <template #available-cell="{ row }">
          <UBadge
            :color="row.original.available ? 'primary' : 'error'"
            variant="soft"
            size="md"
            :ui="{ rounded: 'rounded-full' }"
          >
            {{ row.original.available ? 'Available' : 'Unavailable' }}
          </UBadge>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex flex-row items-center gap-1">
            <UButton @click="handleDelete(row.original)" color="error" variant="outline" icon="i-lucide-trash" size="md" class="cursor-pointer" />
            <UButton :to="`/admin/machines/${row.original.id}`" color="neutral" variant="outline" icon="i-lucide-edit" size="md" class="cursor-pointer" />
          </div>
        </template>
      </UTable>
      
      <div class="flex justify-end p-4 border-t border-light-gray-200">
        <UPagination v-model:page="page" :items-per-page="pageCount" :total="filteredRows.length" :ui="{ wrapper: 'gap-1' }" />
      </div>
    </UCard>

  </div>
</template>