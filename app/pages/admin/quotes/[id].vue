<script setup>
definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const isNew = route.params.id === 'new'

const state = ref({

})

const save = async () => {
  // Logic to save
  // console.log(state.value)
  navigateTo('/admin/quotes')
}
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-6 pb-20">
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 text-sm text-charcoal-500 mb-4">
      <NuxtLink to="/admin/quotes" class="hover:text-deep-teal-600">Quotes</NuxtLink>
      <UIcon name="i-lucide-chevron-right" class="w-4 h-4" />
      <span class="text-charcoal-900 font-medium">{{ isNew ? 'New Quote' : 'Edit Quote' }}</span>
    </div>

    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-charcoal-900 dark:text-white">
        {{ isNew ? 'Create New Quote' : 'Edit Quote Details' }}
      </h2>
      <div class="flex gap-3">
        <UButton label="Cancel" color="gray" variant="ghost" to="/admin/quotes" />
        <UButton label="Save Quote" color="primary" icon="i-lucide-save" @click="save" />
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Main Info -->
      <div class="lg:col-span-2 space-y-6">

      </div>

      <!-- Sidebar Settings -->
      <div class="space-y-6">

      </div>
    </div>
  </div>
</template>