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
const selectedUser = ref(null)

// Data
const { data: users, pending, refresh } = await useFetch('/api/admin/users', {
  lazy: true,
  transform: (response) => response.data,
  server: false,
})


const columns = [
  { accessorKey: 'id', header: 'ID', enableSorting: true },
  { accessorKey: 'username', header: 'Username', enableSorting: true },
  { accessorKey: 'name', header: 'Full Name', enableSorting: true },
  { accessorKey: 'email', header: 'Email', enableSorting: true },
  { accessorKey: 'role', header: 'Role', enableSorting: true },
  { accessorKey: 'active', header: 'Status', enableSorting: true },
  { accessorKey: 'actions', header: 'Actions' }
]

const search = ref('')
const page = ref(1)
const pageCount = 10

const filteredRows = computed(() => {
  if (!users.value) return []
  
  let filtered = [...users.value]
  // Search filter
  if (search.value) {
    filtered = filtered.filter(u => {
      return Object.values(u).some(val => 
        String(val).toLowerCase().includes(search.value.toLowerCase())
      )
    })
  }

  return filtered
})

const handleDelete = (row) => {
  selectedUser.value = row
  isDeleteConfirmOpen.value = true
}

const confirmDelete = async () => {
  isDeleting.value = true
  try {
    await $fetch(`/api/admin/users/${selectedUser.value.id}`, {
      method: 'DELETE',
    })
    toast.add({ title: 'User Deleted', description: `"${selectedUser.value.name}" has been removed.`, color: 'success' })
    isDeleteConfirmOpen.value = false
    await refresh()
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
        <h2 class="text-2xl font-bold text-charcoal-900 dark:text-white">Users</h2>
          <p class="dark:text-charcoal-300 text-sm mt-1">Manage system users and their roles.</p>
        </div>
        <div class="flex gap-2">
          <UButton label="Import" icon="i-lucide-upload" color="neutral" variant="soft"  class="cursor-pointer" @click="isImportModalOpen = true" />
          <UButton label="Export" icon="i-lucide-download" color="neutral" variant="soft" class="cursor-pointer" @click="isExportModalOpen = true" />
          <UButton
            icon="i-lucide-plus"
            label="Add User"
            color="primary"
            size="md"
            to="/admin/users/new"
          />
        </div>
      </div>
  
      <!-- Modals -->
      <DataImportModal
        v-model:open="isImportModalOpen"
        model="Users"
        @success="refresh"
      />
  
      <DataExportModal
        v-model:open="isExportModalOpen"
        model="Users"
      />
  
      <UModal v-model:open="isDeleteConfirmOpen" :description="`Username: ${selectedUser?.username}`" title="Confirm Deletion">
      <template #body>
        <p>Are you sure you want to delete the user <UBadge color="neutral" variant="subtle">{{ selectedUser?.name }}</UBadge>?</p>
        <p class="mt-1">This action cannot be undone.</p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton label="Cancel" color="neutral" variant="soft" @click="isDeleteConfirmOpen = false" />
          <UButton label="Delete" color="error" variant="soft" @click="confirmDelete" :loading="isDeleting" />
        </div>
      </template>
    </UModal>

    <!-- Filters -->
    <UCard :ui="{ body: { padding: 'p-4' } }">
      <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <UInput
          v-model="search"
          icon="i-lucide-search"
          placeholder="Search users..."
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
        :empty-state="{ icon: 'i-lucide-database-zap', label: 'No users found.' }"
        class="w-full"
      >
        <template #name-cell="{ row }">
          <NuxtLink :to="`/admin/users/${row.original.id}`" class="font-medium text-deep-teal-600 hover:underline">
            {{ row.original.name }}
          </NuxtLink>
        </template>

        <template #active-cell="{ row }">
          <UBadge
            :color="row.original.active ? 'primary' : 'error'"
            variant="soft"
            size="md"
            :ui="{ rounded: 'rounded-full' }"
          >
            {{ row.original.active ? 'Active' : 'Inactive' }}
          </UBadge>
        </template>
        
        <template #actions-cell="{ row }">
          <div class="flex items-center gap-2">
            <UButton :to="`/admin/users/${row.original.id}`" color="neutral" variant="outline" icon="i-lucide-edit" size="sm" />
            <UButton @click="handleDelete(row.original)" color="error" variant="outline" icon="i-lucide-trash" size="sm" />
          </div>
        </template>
      </UTable>

      <div class="flex justify-end p-4 border-t border-light-gray-200">
        <UPagination v-model="page" :page-count="pageCount" :total="filteredRows.length" :ui="{ wrapper: 'gap-1' }" />
      </div>
    </UCard>
  </div>
</template>