<script setup>
import DataImportModal from '~/components/admin/DataImportModal.vue'
import DataExportModal from '~/components/admin/DataExportModal.vue'

definePageMeta({
  layout: 'admin'
})

const toast = useToast()

// Modals state
const isFormModalOpen = ref(false)
const isImportModalOpen = ref(false)
const isExportModalOpen = ref(false)
const isDeleteConfirmOpen = ref(false)
const isEditing = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)

const selectedSpec = ref(null)
const defaultSpec = {
  parameter: '',
  unit: '',
}
const state = ref({ ...defaultSpec })

// Data
const { data: specifications, pending, refresh } = await useFetch('/api/admin/specifications', {
  lazy: true,
  transform: (response) => response.data,
  server: false,
})

const columns = [
  { accessorKey: 'id', header: 'ID', enableSorting: true },
  { accessorKey: 'parameter', header: 'Parameter', enableSorting: true },
  { accessorKey: 'unit', header: 'Unit', enableSorting: true },
  { accessorKey: 'actions', header: 'Actions' }
]

const search = ref('')
const page = ref(1)
const pageCount = 10

const filteredRows = computed(() => {
  if (!specifications.value) return []
  
  let filtered = [...specifications.value]
  // Search filter
  if (search.value) {
    filtered = filtered.filter(s => {
      const searchLower = search.value.toLowerCase()
      return (
        s.parameter.toLowerCase().includes(searchLower) ||
        (s.unit && s.unit.toLowerCase().includes(searchLower))
      )
    })
  }

  return filtered
})

const paginatedRows = computed(() => {
  const start = (page.value - 1) * pageCount
  const end = start + pageCount
  return filteredRows.value.slice(start, end)
})

watch(search, () => {
  page.value = 1
})

const openFormModal = (spec = null) => {
  if (spec) {
    isEditing.value = true
    selectedSpec.value = spec
    state.value = {
        ...spec
    }
  } else {
    isEditing.value = false
    selectedSpec.value = null
    state.value = { ...defaultSpec }
  }
  isFormModalOpen.value = true
}

const handleFormSubmit = async () => {
  isSaving.value = true

  const method = isEditing.value ? 'PUT' : 'POST'
  
  const url = isEditing.value ? `/api/admin/specifications/${selectedSpec.value.id}` : '/api/admin/specifications';  
  try {
    const response = await $fetch(url, {
      method,
      body: state.value
    });
    if (response && (response.success)){
      toast.add({
        title: isEditing.value ? (response?.statusMessage || 'Specification Updated') : (response?.statusMessage || 'Specification Added'),
        color: 'success'
      });
      isFormModalOpen.value = false;
    } else {
      toast.add({ title: 'Error when saving Specification' || response?.statusMessage, color: 'error' });
    }
    await refresh();
  } catch (err) {
    const errorMsg = err.data?.statusMessage || 'An unknown error occurred.'
    toast.add({ title: 'Operation Failed', description: errorMsg, color: 'error' })
  } finally {
    isSaving.value = false
  }
}

const handleDelete = (row) => {
  selectedSpec.value = row
  isDeleteConfirmOpen.value = true
}

const confirmDelete = async () => {
  isDeleting.value = true

  try {
    await $fetch(`/api/admin/specifications/${selectedSpec.value.id}`, {
      method: 'DELETE',
    })
    toast.add({ title: 'Specification Deleted', description: `Specification has been removed.`, color: 'success' })
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
        <h2 class="text-2xl font-bold text-charcoal-900 dark:text-white">Specifications</h2>
        <p class="dark:text-charcoal-300 text-sm mt-1">Manage technical specifications for all machines</p>
      </div>
      <div class="flex gap-2">
        <UButton
          icon="i-lucide-upload"
          label="Import"
          color="neutral"
          variant="outline"
          size="md"
          class="cursor-pointer" @click="isImportModalOpen = true"
        />
        <UButton
          icon="i-lucide-download"
          label="Export"
          color="neutral"
          variant="outline"
          size="md"
          class="cursor-pointer" @click="isExportModalOpen = true"
        />
        <UButton
          icon="i-lucide-plus"
          label="Add Specification"
          color="primary"
          size="md"
          class="cursor-pointer"
          @click="openFormModal()"
        />
      </div>
    </div>

    <!-- Modals -->
    <DataImportModal
      v-model:open="isImportModalOpen"
      model="Specifications"
      @success="refresh"
    />

    <DataExportModal
      v-model:open="isExportModalOpen"
      model="Specifications"
    />

    <UModal v-model:open="isFormModalOpen" description="Specification" :title="`${isEditing ? 'Edit' : 'Add'} Specification`">
      <template #body>
        <UForm :state="state" @submit="handleFormSubmit">
          <UFormField label="Parameter" name="parameter" required>
            <UInput v-model="state.parameter" required class="w-full" placeholder="e.g. Max Spindle Speed" />
          </UFormField>

          <UFormField label="Unit" name="unit" class="mt-2">
            <UInput v-model="state.unit" class="w-full" placeholder="e.g. RPM" />
          </UFormField>
          
          <div class="flex justify-end gap-3 mt-6">
            <UButton label="Cancel" color="neutral" variant="soft" @click="isFormModalOpen = false" />
            <UButton type="submit" :label="isEditing ? 'Save' : 'Add'" color="primary" :loading="isSaving" />
          </div>
        </UForm>
      </template>
    </UModal>

    <UModal v-model:open="isDeleteConfirmOpen" description="Delete a Specification" title="Confirm Deletion">
        <template #body>
          <p>Are you sure you want to delete this specification?</p>
          <p class="mt-1 font-medium">{{ selectedSpec?.parameter }} {{ selectedSpec?.unit ? '(' + selectedSpec?.unit + ')' : '' }}</p>
          <p class="mt-1 text-sm text-gray-500">This action cannot be undone.</p>
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
          placeholder="Search specifications..."
          class="w-full sm:w-80"
          color="neutral"
        />
      </div>
    </UCard>

    <!-- Table -->
    <UCard :ui="{ body: { padding: 'p-0' } }">
      <UTable
        :data="paginatedRows"
        :columns="columns"
        :loading="pending"
        :loading-state="{ icon: 'i-lucide-loader', label: 'Loading...' }"
        :empty-state="{ icon: 'i-lucide-database-zap', label: 'No specifications found.' }"
        class="w-full"
      >
        <template #id-cell="{ row }">
          <span @click="openFormModal(row.original)">{{ row.original.id }}</span>
        </template>

        <template #parameter-cell="{ row }">
          <div class="font-medium">{{ row.original.parameter }}</div>
        </template>

        <template #unit-cell="{ row }">
          <UBadge color="neutral" variant="subtle" size="xs" v-if="row.original.unit">{{ row.original.unit }}</UBadge>
        </template>
        
        <template #actions-cell="{ row }">
          <div class="flex items-center gap-2">
            <UButton @click="openFormModal(row.original)" color="neutral" variant="outline" icon="i-lucide-edit" size="sm" />
            <UButton @click="handleDelete(row.original)" color="error" variant="outline" icon="i-lucide-trash" size="sm" />
          </div>
        </template>
      </UTable>

      <div class="flex justify-end p-4 border-t border-light-gray-200">
        <UPagination v-model:page="page" :items-per-page="pageCount" :total="filteredRows.length" :ui="{ wrapper: 'gap-1' }" />
      </div>
    </UCard>
  </div>
</template>