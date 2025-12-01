<script setup>
definePageMeta({
  layout: 'admin'
})

// Mock Data
const quotes = ref([

])

const columns = [

]

const search = ref('')
const selectedStatus = ref([])

const filteredRows = computed(() => {
  if (!search.value) return quotes.value
  return quotes.value.filter(m => {
    return m.name.toLowerCase().includes(search.value.toLowerCase()) || 
           m.code.toLowerCase().includes(search.value.toLowerCase())
  })
})

const items = (row) => [
  [{
    label: 'Edit',
    icon: 'i-lucide-edit-2',
    click: () => navigateTo(`/admin/quotes/${row.id}`)
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
        <h2 class="text-2xl font-bold text-charcoal-900 dark:text-white">Quotes</h2>
        <p class="text-charcoal-500 text-sm mt-1">Manage your clients quotes</p>
      </div>
      <UButton 
        icon="i-lucide-plus" 
        label="Add Quote" 
        color="primary" 
        size="md"
        to="/admin/quotes/new"
      />
    </div>

    <!-- Filters -->
    <UCard :ui="{ body: { padding: 'p-4' } }">
      <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
       
      </div>
    </UCard>

    <!-- Table -->
    <UCard :ui="{ body: { padding: 'p-0' } }">
      
      
      <!-- Pagination -->
      <div class="flex justify-end p-4 border-t border-light-gray-200">
      </div>
    </UCard>
  </div>
</template>