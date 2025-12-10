<script setup>
definePageMeta({
  layout: 'admin'
})

const { data: categories, pending } = await useFetch('/api/admin/categories')

const columns = [
  { id: 1, key: 'name', label: 'Name', sortable: true },
  { id: 2, key: 'machineCount', label: 'Machine Count', sortable: true },
  { id: 3, key: 'lastUpdated', label: 'Last Updated', sortable: true },
  { id: 4, key: 'actions', label: 'Actions' }
]

const search = ref('')

const filteredRows = computed(() => {
  if (!search.value) return categories.value || []
  return categories.value.filter(c => {
    return c.name.toLowerCase().includes(search.value.toLowerCase())
  })
})

const items = (row) => [
  [{
    label: 'Edit',
    icon: 'i-lucide-edit-2',
    click: () => console.log('Edit', row.id)
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
        <h2 class="text-2xl font-bold text-charcoal-900 dark:text-white">Categories</h2>
        <p class="text-charcoal-500 text-sm mt-1">Manage machine categories for your catalog</p>
      </div>
      <UButton 
        icon="i-lucide-plus" 
        label="Add Category" 
        color="primary" 
        size="md"
      />
    </div>

    <!-- Filters -->
    <UCard :ui="{ body: { padding: 'p-4' } }">
      <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <UInput 
          v-model="search"
          icon="i-lucide-search"
          placeholder="Search categories..."
          class="w-full sm:w-80"
          color="white"
        />
      </div>
    </UCard>

    <!-- Table -->
    <UCard :ui="{ body: { padding: 'p-0' } }">
      <UTable 
        :rows="filteredRows" 
        :columns="columns"
        :loading="pending"
        :ui="{
          thead: 'bg-light-gray-50 border-b border-light-gray-200',
          divide: 'divide-y divide-light-gray-100'
        }"
      >
        <template #name-data="{ row }">
          <div class="font-medium text-deep-teal-600">{{ row.name }}</div>
        </template>
        
        <template #actions-data="{ row }">
          <UDropdownMenu :items="items(row)">
            <UButton color="neutral" variant="ghost" icon="i-lucide-more-horizontal" />
          </UDropdownMenu>
        </template>
      </UTable>
    </UCard>
  </div>
</template>