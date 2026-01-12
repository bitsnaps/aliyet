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
const isExporting = ref(false)

const selectedCategory = ref(null)
const defaultCategory = {
  name: '',
  description: '',
  metadata: {}
}
const state = ref({ ...defaultCategory })
const metadataString = ref('{}')
const metadataError = ref('')

// Data
const { data: categories, pending, refresh } = await useFetch('/api/admin/categories', {
  lazy: true,
  transform: (response) => response.data,
  server: false,
})

const columns = [
  { accessorKey: 'id', header: 'ID', enableSorting: true },
  { accessorKey: 'name', header: 'Name', enableSorting: true },
  { accessorKey: 'description', header: 'Description', enableSorting: true },
  // { accessorKey: 'metadata', header: 'Metadata', enableSorting: false },
  { accessorKey: 'actions', header: 'Actions' }
]

const search = ref('')
const page = ref(1)
const pageCount = 10

const filteredRows = computed(() => {
  if (!categories.value) return []
  
  let filtered = [...categories.value]
  // Search filter
  if (search.value) {
    filtered = filtered.filter(c => {
      return c.name.toLowerCase().includes(search.value.toLowerCase())
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

const openFormModal = (category = null) => {
  if (category) {
    isEditing.value = true
    selectedCategory.value = category
    state.value = {
        ...category,
        metadata: category.metadata || {}
    }
    metadataString.value = JSON.stringify(state.value.metadata, null, 2)
  } else {
    isEditing.value = false
    selectedCategory.value = null
    state.value = { ...defaultCategory }
    metadataString.value = '{\n  "machine_type": ""\n}'
  }
  metadataError.value = ''
  isFormModalOpen.value = true
}

const handleFormSubmit = async () => {
  // Validate JSON
  try {
    state.value.metadata = JSON.parse(metadataString.value)
  } catch (e) {
    metadataError.value = 'Invalid JSON format: ' + e.message
    return
  }

  isSaving.value = true

  const method = isEditing.value ? 'PUT' : 'POST'
  
  const url = isEditing.value ? `/api/admin/categories/${selectedCategory.value.id}` : '/api/admin/categories';  
  try {
    const response = await $fetch(url, {
      method,
      body: state.value
    });
    if (response && (response.statusCode == 200 || response.statusCode == 201)){
      toast.add({
        title: isEditing.value ? (response?.statusMessage || 'Category Updated') : (response?.statusMessage || 'Category Added'),
        color: 'success'
      });
      isFormModalOpen.value = false;
    } else {
      toast.add({ title: 'Error when saving Category' || response?.statusMessage, color: 'error' });
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
  selectedCategory.value = row
  isDeleteConfirmOpen.value = true
}

const confirmDelete = async () => {
  isDeleting.value = true

  try {
    await $fetch(`/api/admin/categories/${selectedCategory.value.id}`, {
      method: 'DELETE',
    })
    toast.add({ title: 'Category Deleted', description: `"${selectedCategory.value.name}" has been removed.`, color: 'success' })
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
        <h2 class="text-2xl font-bold text-charcoal-900 dark:text-white">Categories</h2>
        <p class="dark:text-charcoal-300 text-sm mt-1">Manage machine categories for your catalog</p>
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
          label="Add Category"
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
      model="Categories"
      @success="refresh"
    />

    <DataExportModal
      v-model:open="isExportModalOpen"
      model="Categories"
    />

    <UModal v-model:open="isFormModalOpen" description="Category" :title="`${isEditing ? 'Edit' : 'Add'} Category`">
      <template #body>
        <UForm :state="state" @submit="handleFormSubmit">
          <UFormField label="Name" name="name">
            <UInput v-model="state.name" required class="w-full" />
          </UFormField>

          <UFormField label="Description" name="description" class="mt-2">
            <UInput v-model="state.description" class="w-full" />
          </UFormField>

          <div class="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <UFormField label="Metadata (JSON)" name="metadata" :error="metadataError">
              <UTextarea
                v-model="metadataString"
                :rows="6"
                placeholder="{}"
                class="font-mono text-sm w-full"
                autoresize
              />
            </UFormField>

            <div class="mt-2 text-xs text-gray-500">
              <p>Common keys: <code class="bg-gray-100 dark:bg-gray-800 px-1 rounded">machine_type</code> (values: turning_centers, machining_centers, edm_machines)</p>
            </div>
          </div>
          
          <div class="flex justify-end gap-3 mt-6">
            <UButton label="Cancel" color="neutral" variant="soft" @click="isFormModalOpen = false" />
            <UButton type="submit" :label="isEditing ? 'Save' : 'Add'" color="primary" :loading="isSaving" />
          </div>
        </UForm>
      </template>
    </UModal>

    <UModal v-model:open="isDeleteConfirmOpen" description="Delete a Category" title="Confirm Deletion">
        <template #body>
          <p>Are you sure you want to delete the category <UBadge color="neutral" variant="subtle">{{ selectedCategory?.name }}</UBadge>?</p>
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
          placeholder="Search categories..."
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
        :empty-state="{ icon: 'i-lucide-database-zap', label: 'No categories found.' }"
        class="w-full"
      >
        <template #id-cell="{ row }">
          <span @click="openFormModal(row.original)">{{ row.original.id }}</span>
        </template>

        <template #name-cell="{ row }">
          <div class="font-medium">{{ row.original.name }}</div>
        </template>

        <template #description-cell="{ row }">
          <span>{{ row.original.description?.length > 50? row.original.description.slice(0, 50)+'...': row.original.description }}</span>
        </template>

        <!-- <template #metadata-cell="{ row }">
          <span>{{ row.original.metadata || ''}}</span>
        </template> -->
        
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