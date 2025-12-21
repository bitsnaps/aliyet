<script setup>
definePageMeta({
  layout: 'admin'
});

const route = useRoute();
const toast = useToast();
const isNew = route.params.id === 'new';
const loading = ref(false);

const state = ref({
  name: '',
  description: '',
  price: 0.00,
  available: true,
  configurationId: null
});

if (!isNew) {
  loading.value = true;
  const { data, error } = await useFetch(`/api/admin/optional-replacements/${route.params.id}`, {
    lazy: false,
    server: false,
  });
  
  loading.value = false;

  if (error.value) {
    toast.add({ title: 'Error', description: 'Could not fetch optional replacement.', color: 'error' });
    navigateTo('/admin/optional-replacements');
  } else {
    state.value = data.value.data;
  }
}

const save = async () => {
  loading.value = true;
  try {
    const url = isNew ? '/api/admin/optional-replacements' : `/api/admin/optional-replacements/${route.params.id}`;
    const method = isNew ? 'POST' : 'PUT';
    
    const response = await $fetch(url, {
      method,
      body: state.value
    });
    
    if (response.success) {
      toast.add({ 
        title: 'Success', 
        description: `Optional replacement ${isNew ? 'created' : 'updated'} successfully.`, 
        color: 'success' 
      });
      navigateTo('/admin/optional-replacements');
    }
  } catch (err) {
    toast.add({ 
      title: 'Error', 
      description: err.data?.statusMessage || 'An error occurred while saving.', 
      color: 'error' 
    });
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-2 text-sm text-charcoal-500">
          <NuxtLink to="/admin/optional-replacements" class="hover:text-primary">Optional Replacements</NuxtLink>
          <UIcon name="i-lucide-chevron-right" class="w-4 h-4" />
          <span class="text-charcoal-900 font-medium">{{ isNew ? 'New Replacement' : 'Edit Replacement' }}</span>
        </div>
        <h1 class="text-2xl font-bold text-charcoal-900 dark:text-white">{{ isNew ? 'Create New Optional Replacement' : 'Edit Optional Replacement' }}</h1>
      </div>
      <div class="flex gap-3">
        <UButton label="Cancel" color="neutral" variant="subtle" to="/admin/optional-replacements" />
        <UButton label="Save" color="primary" icon="i-lucide-save" @click="save" :loading="loading" class="cursor-pointer" />
      </div>
    </div>
    
    <AdminOptionalForm v-model="state" type="replacement" />
  </div>
</template>