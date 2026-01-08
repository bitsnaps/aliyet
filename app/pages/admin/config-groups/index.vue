<script setup>
import DataImportModal from '~/components/admin/DataImportModal.vue'
import DataExportModal from '~/components/admin/DataExportModal.vue'

definePageMeta({
  layout: 'admin'
});

const toast = useToast();
const { data, pending, error, refresh } = await useFetch('/api/admin/config-categories', {
  lazy: true,
  server: false,
  transform: (res) => res.data
});

const items = computed(() => data.value || []);

if (error.value) {
  toast.add({ title: 'Error', description: 'Could not fetch configuration groups.', color: 'error' });
}

const columns = [
  { accessorKey: 'name', header: 'Name', enableSorting: true },
  { accessorKey: 'description', header: 'Description', enableSorting: false },
  { accessorKey: 'actions', header: 'Actions' }
];

const isConfirmDeleteOpen = ref(false);
const isImportModalOpen = ref(false);
const isExportModalOpen = ref(false);
const currentGroup = ref(null);

const openDeleteModal = (group) => {
  isConfirmDeleteOpen.value = true;
  currentGroup.value = group;
};

const closeDeleteConfirm = () => {
  isConfirmDeleteOpen.value = false;
  currentGroup.value = null;
};

const deleteItem = async () => {
  if (!currentGroup.value) return;

  try {
    await $fetch(`/api/admin/config-categories/${currentGroup.value.id}`, {
      method: 'DELETE',
    });
    toast.add({ title: 'Success', description: 'Configuration group deleted successfully.', color: 'success' });
    refresh();
  } catch (err) {
    toast.add({ title: 'Error', description: err.data?.statusMessage || 'Failed to delete group.', color: 'error' });
  } finally {
    currentGroup.value = null;
    isConfirmDeleteOpen.value = false;
  }
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold text-charcoal-900 dark:text-white">Configuration Groups</h1>
      <div class="flex gap-2">
        <UButton label="Import" icon="i-lucide-upload" color="neutral" variant="soft"  class="cursor-pointer" @click="isImportModalOpen = true" />
        <UButton label="Export" icon="i-lucide-download" color="neutral" variant="soft" class="cursor-pointer" @click="isExportModalOpen = true" />
        <UButton to="/admin/config-groups/new" label="Add New Group" icon="i-lucide-plus" color="primary" />
      </div>
    </div>

    <UCard :ui="{ body: { padding: 'p-0' } }">
      <UTable :columns="columns" :data="items" :loading="pending">
        <template #description-cell="{ row }">
          <span class="text-charcoal-500 line-clamp-1">{{ row.original.description || 'No description' }}</span>
        </template>

        <template #actions-cell="{ row }">
          <div class="flex gap-2">
            <UButton :to="`/admin/config-groups/${row.original.id}`" icon="i-lucide-edit" size="sm" color="neutral" variant="ghost" class="cursor-pointer" />
            <UButton @click="openDeleteModal(row.original)" icon="i-lucide-trash" size="sm" color="error" variant="ghost" class="cursor-pointer" />
          </div>
        </template>
      </UTable>
    </UCard>

    <!-- Delete Confirmation Modal -->
    <UModal v-model:open="isConfirmDeleteOpen" title="Confirm Deletion">
      <template #body>
        <p>Are you sure you want to delete <UBadge color="neutral" variant="subtle">{{ currentGroup?.name }}</UBadge>?</p>
        <p class="mt-2 text-sm text-charcoal-500 italic">Note: This will remove compatibility links for any associated options.</p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton label="Cancel" color="neutral" variant="soft" @click="closeDeleteConfirm" />
          <UButton label="Delete" color="error" variant="soft" @click="deleteItem" />
        </div>
      </template>
    </UModal>

    <DataImportModal
      v-model:open="isImportModalOpen"
      model="ConfigCategories"
      @success="refresh"
    />

    <DataExportModal
      v-model:open="isExportModalOpen"
      model="ConfigCategories"
    />
  </div>
</template>
