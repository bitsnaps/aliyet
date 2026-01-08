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
const selectedQuote = ref(null)

// Data
const { data: quotes, pending, error, refresh } = await useFetch('/api/admin/quotes', {
  lazy: true,
  transform: (response) => response.data,
  server: false,
})

const columns = [
  { accessorKey: 'id', header: 'ID', enableSorting: true },
  { accessorKey: 'name', header: 'Quote Name', enableSorting: true },
  { accessorKey: 'client', header: 'Client', enableSorting: true },
  { accessorKey: 'machine', header: 'Machine', enableSorting: true },
  { accessorKey: 'createdAt', header: 'Date', enableSorting: true },
  { accessorKey: 'actions', header: 'Actions', enableSorting: false }
]

const search = ref('')
const page = ref(1)
const pageCount = 10

const filteredRows = computed(() => {
  if (!quotes.value) return []
  
  let filtered = [...quotes.value]

  // Search filter
  if (search.value) {
    const lowerSearch = search.value.toLowerCase()
    filtered = filtered.filter(q => {
      return (q.name && q.name.toLowerCase().includes(lowerSearch)) ||
             (q.user && q.user.name && q.user.name.toLowerCase().includes(lowerSearch)) ||
             (q.machine && q.machine.name && q.machine.name.toLowerCase().includes(lowerSearch)) ||
             q.id.toString().includes(lowerSearch)
    })
  }

  return filtered
})

const handleDelete = (row) => {
  selectedQuote.value = row
  isDeleteConfirmOpen.value = true
}

const confirmDelete = async () => {
  isDeleting.value = true

  try {
    await $fetch(`/api/admin/quotes/${selectedQuote.value.id}`, {
      method: 'DELETE',
    })
    toast.add({ title: 'Quote Deleted', description: `Quote "${selectedQuote.value.name}" has been removed.`, color: 'success' })
    isDeleteConfirmOpen.value = false
    await refresh()
  } catch (err) {
    const errorMsg = err.data?.statusMessage || 'An unknown error occurred.'
    toast.add({ title: 'Deletion Failed', description: errorMsg, color: 'error' })
  } finally {
    isDeleting.value = false
  }
}

const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-charcoal-900 dark:text-white">Quotes</h2>
          <p class="text-charcoal-500 text-sm mt-1">Manage your clients quotes</p>
        </div>
        <div class="flex gap-2">
          <UButton label="Import" icon="i-lucide-upload" color="neutral" variant="soft"  class="cursor-pointer" @click="isImportModalOpen = true" />
          <UButton label="Export" icon="i-lucide-download" color="neutral" variant="soft" class="cursor-pointer" @click="isExportModalOpen = true" />
          <UButton
            icon="i-lucide-plus"
            label="Add Quote"
            color="primary"
            size="md"
            to="/admin/quotes/new"
          />
        </div>
      </div>
  
      <DataImportModal
        v-model:open="isImportModalOpen"
        model="ClientConfigSets"
        @success="refresh"
      />
  
      <DataExportModal
        v-model:open="isExportModalOpen"
        model="ClientConfigSets"
      />
  
      <UModal v-model:open="isDeleteConfirmOpen" :description="`Quote ID: ${selectedQuote?.id}`" title="Confirm Deletion">
        <template #body>
          <p>Are you sure you want to delete the quote <UBadge color="neutral" variant="subtle">{{ selectedQuote?.name }}</UBadge>?</p>
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
          placeholder="Search by quote, client or machine..."
          class="w-full sm:w-80"
          color="neutral"
        />
      </div>
    </UCard>

    <!-- Table -->
    <UCard :ui="{ body: { padding: 'p-0' } }">
      <UTable 
        :data="filteredRows"
        :columns="columns"
        :loading="pending"
        :loading-state="{ icon: 'i-lucide-loader', label: 'Loading...' }"
        :empty-state="{ icon: 'i-lucide-database-zap', label: 'No quotes found.' }"
        class="w-full"
      >
        <template #name-cell="{ row }">
          <NuxtLink :to="`/admin/quotes/${row.original.id}`" class="font-medium text-deep-teal-600 hover:underline">
            {{ row.original.name || `Quote #${row.original.id}` }}
          </NuxtLink>
        </template>

        <template #client-cell="{ row }">
            <span v-if="row.original.user">{{ row.original.user.name }}</span>
            <span v-else class="text-gray-400 italic">Guest / Unknown</span>
        </template>

        <template #machine-cell="{ row }">
            <span v-if="row.original.machine">{{ row.original.machine.name }}</span>
            <span v-else class="text-gray-400 italic">N/A</span>
        </template>

        <template #createdAt-cell="{ row }">
            <span>{{ formatDate(row.original.createdAt) }}</span>
        </template>
        
        <template #actions-cell="{ row }">
          <div class="flex flex-row items-center gap-1">
            <UButton @click="handleDelete(row.original)" color="error" variant="outline" icon="i-lucide-trash" size="md" class="cursor-pointer" />
            <UButton :to="`/admin/quotes/${row.original.id}`" color="neutral" variant="outline" icon="i-lucide-edit" size="md" class="cursor-pointer" />
          </div>
        </template>
      </UTable>
      
      <!-- Pagination -->
      <div class="flex justify-end p-4 border-t border-light-gray-200">
        <UPagination v-model="page" :page-count="pageCount" :total="filteredRows.length" :ui="{ wrapper: 'gap-1' }" />
      </div>
    </UCard>
  </div>
</template>