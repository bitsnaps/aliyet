<script setup>
definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const isNew = route.params.id === 'new'

const state = ref({
  name: '',
  code: '',
  categoryId: null,
  configCategoryId: null,
  basePrice: 0,
  available: true,
  description: '',
  url: '',
  specs: [{ parameter: '', value: '', unit: '' }]
})

const categories = [
  { label: 'Turning Center', value: 1 },
  { label: 'Machining Center', value: 2 },
  { label: 'EDM', value: 3 }
]

const configCategories = [
  { label: 'Standard Lathe Config', value: 1 },
  { label: 'Advanced 5-Axis Config', value: 2 }
]

const addSpec = () => {
  state.value.specs.push({ parameter: '', value: '', unit: '' })
}

const removeSpec = (index) => {
  state.value.specs.splice(index, 1)
}

const save = async () => {
  // Logic to save
  console.log(state.value)
  navigateTo('/admin/machines')
}
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-6 pb-20">
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 text-sm text-charcoal-500 mb-4">
      <NuxtLink to="/admin/machines" class="hover:text-deep-teal-600">Machines</NuxtLink>
      <UIcon name="i-lucide-chevron-right" class="w-4 h-4" />
      <span class="text-charcoal-900 font-medium">{{ isNew ? 'New Machine' : 'Edit Machine' }}</span>
    </div>

    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-charcoal-900 dark:text-white">
        {{ isNew ? 'Create New Machine' : 'Edit Machine Details' }}
      </h2>
      <div class="flex gap-3">
        <UButton label="Cancel" color="gray" variant="ghost" to="/admin/machines" />
        <UButton label="Save Machine" color="primary" icon="i-lucide-save" @click="save" />
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Main Info -->
      <div class="lg:col-span-2 space-y-6">
        <UCard title="General Information">
          <div class="space-y-4">
            <UFormField label="Machine Name" name="name" required help="The display name of the machine">
              <UInput v-model="state.name" placeholder="e.g. High Speed Turning Center" />
            </UFormField>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UFormField label="Model Code" name="code" required>
                <UInput v-model="state.code" placeholder="e.g. TC-500-X" />
              </UFormField>

              <UFormField label="Base Price (USD)" name="basePrice">
                <UInput v-model="state.basePrice" type="number" placeholder="0.00">
                  <template #leading>$</template>
                </UInput>
              </UFormField>
            </div>

            <UFormField label="Description" name="description">
              <UTextarea v-model="state.description" :rows="4" placeholder="Detailed description of the machine capabilities..." />
            </UFormField>

            <UFormField label="External URL" name="url">
              <UInput v-model="state.url" icon="i-lucide-link" placeholder="https://..." />
            </UFormField>
          </div>
        </UCard>

        <!-- Technical Specs Dynamic List -->
        <UCard title="Technical Specifications">
          <template #header>
            <div class="flex justify-between items-center">
              <h3 class="font-semibold">Specifications</h3>
              <UButton size="xs" color="gray" variant="soft" icon="i-lucide-plus" label="Add Spec" @click="addSpec" />
            </div>
          </template>

          <div class="space-y-3">
             <div v-for="(spec, idx) in state.specs" :key="idx" class="flex gap-3 items-start">
               <div class="flex-1">
                 <UInput v-model="spec.parameter" placeholder="Parameter (e.g. Max RPM)" size="sm" />
               </div>
               <div class="flex-1">
                 <UInput v-model="spec.value" placeholder="Value (e.g. 5000)" size="sm" />
               </div>
               <div class="w-24">
                 <UInput v-model="spec.unit" placeholder="Unit" size="sm" />
               </div>
               <UButton color="red" variant="ghost" icon="i-lucide-x" size="sm" @click="removeSpec(idx)" />
             </div>
             <div v-if="state.specs.length === 0" class="text-center py-4 text-charcoal-400 text-sm">
               No specifications added.
             </div>
          </div>
        </UCard>
      </div>

      <!-- Sidebar Settings -->
      <div class="space-y-6">
        <UCard title="Classification">
          <div class="space-y-4">
            <UFormField label="Status" name="available">
              <USwitch v-model="state.available" />
              <span class="ml-2 text-sm text-charcoal-600">{{ state.available ? 'Available for Quote' : 'Hidden/Unavailable' }}</span>
            </UFormField>

            <UFormField label="Category" name="category" required>
              <USelectMenu v-model="state.categoryId" :options="categories" value-attribute="value" placeholder="Select Category" />
            </UFormField>

            <UFormField label="Configuration Group" name="configCategory" help="Determines which options appear in the Build & Price tool">
              <USelectMenu v-model="state.configCategoryId" :options="configCategories" value-attribute="value" placeholder="Select Config Group" />
            </UFormField>
          </div>
        </UCard>

        <UCard title="Media">
          <div class="border-2 border-dashed border-light-gray-300 rounded-lg p-6 text-center hover:bg-light-gray-50 transition-colors cursor-pointer">
            <UIcon name="i-lucide-image-plus" class="w-8 h-8 text-charcoal-400 mx-auto mb-2" />
            <p class="text-sm text-charcoal-600 font-medium">Click to upload main image</p>
            <p class="text-xs text-charcoal-400 mt-1">PNG, JPG up to 2MB</p>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>