<script setup>
definePageMeta({
  layout: 'admin'
})

const { data: users, pending } = await useFetch('/api/admin/users')

const columns = [
  { id: 1, key: 'name', label: 'User', sortable: true },
  { id: 2, key: 'role', label: 'Role', sortable: true },
  { id: 3, key: 'status', label: 'Status', sortable: true },
  { id: 4, key: 'lastLogin', label: 'Last Login', sortable: true },
  { id: 5, key: 'actions', label: 'Actions' }
]

const search = ref('')

const filteredRows = computed(() => {
  if (!search.value) return users.value || []
  return users.value.filter(u => {
    return u.name.toLowerCase().includes(search.value.toLowerCase()) ||
           u.email.toLowerCase().includes(search.value.toLowerCase())
  })
})

const items = (row) => [
  [{
    label: 'Edit',
    icon: 'i-lucide-edit-2',
    click: () => console.log('Edit', row.id)
  }, {
    label: 'Reset Password',
    icon: 'i-lucide-key',
    click: () => console.log('Reset Password', row.id)
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
        <h2 class="text-2xl font-bold text-charcoal-900 dark:text-white">Users</h2>
        <p class="text-charcoal-500 text-sm mt-1">Manage system users and access roles</p>
      </div>
      <UButton 
        icon="i-lucide-plus" 
        label="Add User" 
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
          placeholder="Search users..."
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
          <div class="flex items-center gap-3">
            <UAvatar :alt="row.name" size="sm" />
            <div>
              <div class="font-medium text-charcoal-900 dark:text-white">{{ row.name }}</div>
              <div class="text-xs text-charcoal-500">{{ row.email }}</div>
            </div>
          </div>
        </template>

        <template #role-data="{ row }">
          <UBadge color="neutral" variant="subtle" size="xs">{{ row.role }}</UBadge>
        </template>

        <template #status-data="{ row }">
          <UBadge 
            :color="row.status === 'Active' ? 'green' : 'red'" 
            variant="soft" 
            size="xs"
            :ui="{ rounded: 'rounded-full' }"
          >
            {{ row.status }}
          </UBadge>
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