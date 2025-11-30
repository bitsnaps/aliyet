<script setup>
definePageMeta({
  layout: 'admin'
})

// Mock Data
const machines = ref([
  { id: 1, code: 'TC-200', name: 'Turning Center 200', category: 'Turning Center', price: 45000, available: true },
  { id: 2, code: 'MC-5X', name: '5-Axis Machining Center', category: 'Machining Center', price: 125000, available: true },
  { id: 3, code: 'EDM-W', name: 'Wire EDM Pro', category: 'EDM Machine', price: 68000, available: false },
  { id: 4, code: 'HYD-P', name: 'Hydraulic Press 50T', category: 'Press', price: 32000, available: true },
])

const columns = [
  { key: 'code', label: 'Code', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'category', label: 'Category' },
  { key: 'price', label: 'Base Price', sortable: true },
  { key: 'available', label: 'Availability' },
  { key: 'actions', label: 'Actions' }
]

const search = ref('')
const selectedStatus = ref([])

const filteredRows = computed(() => {
  if (!search.value) return machines.value
  return machines.value.filter(m => {
    return m.name.toLowerCase().includes(search.value.toLowerCase()) || 
           m.code.toLowerCase().includes(search.value.toLowerCase())
  })
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
    class: 'text-red-600',
    click: () => console.log('Delete', row.id)
  }]
]
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
          color="white"
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
        :rows="filteredRows" 
        :columns="columns"
        :ui="{
          thead: 'bg-light-gray-50 border-b border-light-gray-200',
          divide: 'divide-y divide-light-gray-100'
        }"
      >
        <template #name-data="{ row }">
          <div class="font-medium text-deep-teal-600">{{ row.name }}</div>
        </template>
        
        <template #price-data="{ row }">
          <span class="font-mono text-charcoal-700">${{ row.price.toLocaleString() }}</span>
        </template>

        <template #available-data="{ row }">
          <UBadge 
            :color="row.available ? 'green' : 'red'" 
            variant="soft" 
            size="xs"
            :ui="{ rounded: 'rounded-full' }"
          >
            {{ row.available ? 'Available' : 'Out of Stock' }}
          </UBadge>
        </template>

        <template #actions-data="{ row }">
          <UDropdown :items="items(row)">
            <UButton color="gray" variant="ghost" icon="i-lucide-more-horizontal" />
          </UDropdown>
        </template>
      </UTable>
      
      <!-- Pagination -->
      <div class="flex justify-end p-4 border-t border-light-gray-200">
        <UPagination :model-value="1" :total="50" :ui="{ wrapper: 'gap-1' }" />
      </div>
    </UCard>
  </div>
</template>