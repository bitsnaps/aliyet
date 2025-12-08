<script setup>

definePageMeta({
  layout: 'admin'
})


const toast = useToast()

// Data
const { data: machines, pending, error, refresh } = await useFetch('/api/admin/machines', {
  lazy: true,
  transform: (response) => response.data,
  server: false, // We will fetch on client-side
})

const columns = [
  { accessorKey: 'code', header: 'Code', enableSorting: true },
  { accessorKey: 'name', header: 'Name', enableSorting: true },
  { accessorKey: 'category', header: 'Category', enableSorting: true },
  { accessorKey: 'price', header: 'Base Price', enableSorting: true },
  { accessorKey: 'available', header: 'Availability' },
  { accessorKey: 'actions', header: 'Actions' }
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

const items = (row) => [
  [{
    label: 'Edit',
    icon: 'i-lucide-edit-2',
    click: () => navigateTo(`/admin/machines/${row.id}`)
  }],
  [{
    label: 'Delete',
    icon: 'i-lucide-trash-2',
    labelClass: 'text-red-500 dark:text-red-400',
    click: () => handleDelete(row)
  }]
]

const handleDelete = async (row) => {
  if (!confirm(`Are you sure you want to delete "${row.name}"? This cannot be undone.`)) {
    return
  }

  try {
    await $fetch(`/api/admin/machines/${row.id}`, {
      method: 'DELETE',
    })
    toast.add({ title: 'Machine Deleted', description: `"${row.name}" has been removed.`, color: 'green' })
    refresh() // Re-fetch the machine list
  } catch (err) {
    const errorMsg = err.data?.statusMessage || 'An unknown error occurred.'
    toast.add({ title: 'Deletion Failed', description: errorMsg, color: 'red' })
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-charcoal-900 dark:text-white">Machines</h2>
        <p class="text-charcoal-500 text-sm mt-1">Manage your industrial machine catalog</p>
      </div>
      <UButton 
        icon="i-lucide-plus" 
        label="Add Machine" 
        color="primary" 
        size="md"
        to="/admin/machines/new"
      />
    </div>

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
             :options="['Available', 'Unavailable']" 
             placeholder="Filter Status"
             multiple
             class="w-48"
           />
        </div>
      </div>
    </UCard>

    <!-- Table -->
    <UCard :ui="{ body: { padding: 'p-0' } }">
      <UTable 
        :data="filteredRows"
        :columns="columns"
        :loading="pending"
        :loading-state="{ icon: 'i-lucide-loader-2', label: 'Loading...' }"
        :empty-state="{ icon: 'i-lucide-database-zap', label: 'No machines found.' }"
        class="w-full"
      >
        <template #name-data="{ row }">
          <NuxtLink :to="`/admin/machines/${row.id}`" class="font-medium text-deep-teal-600 hover:underline">
            {{ row.name }}
          </NuxtLink>
        </template>
        
        <template #price-data="{ row }">
          <span class="font-mono text-charcoal-700 dark:text-charcoal-300">${{ Number(row.price).toLocaleString() }}</span>
        </template>

        <template #available-data="{ row }">
          <UBadge
            :color="row.available ? 'green' : 'red'"
            variant="soft"
            size="xs"
            :ui="{ rounded: 'rounded-full' }"
          >
            {{ row.available ? 'Available' : 'Unavailable' }}
          </UBadge>
        </template>

        <template #actions-data="{ row }">
          <UDropdownMenu :items="items(row)">
            <UButton color="gray" variant="ghost" icon="i-lucide-more-horizontal" />
          </UDropdownMenu>
        </template>
      </UTable>
      
      <div class="flex justify-end p-4 border-t border-light-gray-200">
        <UPagination v-model="page" :page-count="pageCount" :total="filteredRows.length" :ui="{ wrapper: 'gap-1' }" />
      </div>
    </UCard>

  </div>
</template>