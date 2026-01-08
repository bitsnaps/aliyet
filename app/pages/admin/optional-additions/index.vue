<script setup>
import DataImportModal from '~/components/admin/DataImportModal.vue'
import DataExportModal from '~/components/admin/DataExportModal.vue'

definePageMeta({
  layout: 'admin'
});

const toast = useToast();
const { data, pending, error, refresh } = await useFetch('/api/admin/optional-additions', {
  lazy: true,
  server: false,
  transform: (res) => res.data
});

const items = computed(() => data.value || []);

if (error.value) {
  toast.add({ title: 'Error', description: 'Could not fetch optional additions.', color: 'error' });
}

const columns = [
  { accessorKey: 'name', header: 'Name', enableSorting: true },
  { accessorKey: 'ConfigCategories', header: 'Category', enableSorting: false },
  { accessorKey: 'price', header: 'Price', enableSorting: true },
  { accessorKey: 'available', header: 'Available', enableSorting: true },
  { accessorKey: 'actions', header: 'Actions' }
];

const isConfirmDeleteOpen = ref(false);
const isImportModalOpen = ref(false);
const isExportModalOpen = ref(false);
const currentOption = ref(null);

const openDeleteModal = (item) => {
  isConfirmDeleteOpen.value = true;
  currentOption.value = item
};

const closeDeleteConfirm = () => {
  isConfirmDeleteOpen.value = false;
  currentOption.value = null;
};

const deleteItem = async () => {
  if (!currentOption.value) return;

  try {
    await $fetch(`/api/admin/optional-additions/${currentOption.value.id}`, {
      method: 'DELETE',
    });
    toast.add({ title: 'Success', description: 'Optional addition deleted successfully.', color: 'success' });
    refresh();
  } catch (err) {
    toast.add({ title: 'Error', description: 'Failed to delete optional addition.', color: 'error' });
  } finally {
    currentOption.value = null;
    isConfirmDeleteOpen.value = false;
  }
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Optional Additions</h1>
      <div class="flex gap-2">
        <UButton label="Import" icon="i-lucide-upload" color="neutral" variant="soft"  class="cursor-pointer" @click="isImportModalOpen = true" />
        <UButton label="Export" icon="i-lucide-download" color="neutral" variant="soft" class="cursor-pointer" @click="isExportModalOpen = true" />
        <UButton to="/admin/optional-additions/new" label="Add New" icon="i-lucide-plus" color="primary" />
      </div>
    </div>

    <UCard :ui="{ body: { padding: 'p-0' } }">
      <UTable :columns="columns" :data="items" :loading="pending">
        <template #ConfigCategories-cell="{ row }">
          <div v-if="row.original.ConfigCategories?.length" class="flex flex-wrap gap-1">
            <UBadge v-for="cat in row.original.ConfigCategories" :key="cat.id" color="neutral" variant="subtle" size="sm">
              {{ cat.name }}
            </UBadge>
          </div>
          <span v-else class="text-charcoal-400 italic text-sm">None</span>
        </template>

        <template #available-cell="{ row }">
          <UBadge :color="row.original.available ? 'primary' : 'error'" variant="soft">
            {{ row.original.available ? 'Yes' : 'No' }}
          </UBadge>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex gap-2">
            <UButton :to="`/admin/optional-additions/${row.original.id}`" icon="i-lucide-edit" size="sm" color="neutral" variant="ghost" class="cursor-pointer" />
            <UButton @click="openDeleteModal(row.original)" icon="i-lucide-trash" size="sm" color="error" variant="ghost" class="cursor-pointer" />
          </div>
        </template>
      </UTable>
    </UCard>

    <DataImportModal
      v-model:open="isImportModalOpen"
      model="OptionalAdditions"
      @success="refresh"
    />

    <DataExportModal
      v-model:open="isExportModalOpen"
      model="OptionalAdditions"
    />

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="isConfirmDeleteOpen" title="Confirm Deletion" description="Are you sure you want to delete this item? This action cannot be undone.">
      <template #body>
        <p>Are you sure you want to delete <UBadge color="neutral" variant="subtle">{{ currentOption?.name }}</UBadge>?</p>
        <p>This action cannot be undone.</p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton label="Cancel" color="neutral" variant="soft" @click="closeDeleteConfirm" />
          <UButton label="Delete" color="error" variant="soft" @click="deleteItem" />
        </div>
      </template>
    </UModal>
  </div>
</template>