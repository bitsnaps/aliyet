<script setup>
const props = defineProps({
  type: {
    type: String,
    default: 'addition', // 'addition' or 'replacement'
    validator: (value) => ['addition', 'replacement'].includes(value)
  }
});

const state = defineModel({ required: true });

// Fetch items for the dropdown based on type
const endpoint = computed(() => props.type === 'replacement' ? '/api/admin/configs' : '/api/admin/config-categories');

const { data: items, pending: itemsPending } = useFetch(endpoint, {
  transform: (response) => response.data?.map(i => ({ label: i.name, value: i.id })) || [],
  lazy: true,
  server: false,
  watch: [endpoint]
});

const label = computed(() => props.type === 'replacement' ? 'Compatible Standard Configuration' : 'Configuration Group');
const help = computed(() => props.type === 'replacement' ? 'Determines which standard configuration this option can replace' : 'Determines which machine configurations this option is compatible with');
const placeholder = computed(() => props.type === 'replacement' ? 'Select Configuration' : 'Select Config Group');
const modelKey = computed(() => props.type === 'replacement' ? 'configurationId' : 'configCategoryId');

</script>

<template>
  <div class="space-y-6">
    <UCard>
      <div class="space-y-4">
        <UFormField label="Name" name="name" required>
          <UInput v-model="state.name" placeholder="e.g. High Speed Spindle" class="w-full" />
        </UFormField>

        <UFormField label="Price (USD)" name="price">
          <UInput v-model="state.price" type="number" placeholder="0.00" class="w-full">
            <template #leading>$</template>
          </UInput>
        </UFormField>

        <UFormField label="Description" name="description">
          <UTextarea v-model="state.description" :rows="4" placeholder="Detailed description of the option..." class="w-full" />
        </UFormField>

        <UFormField :label="label" :name="modelKey" :help="help">
          <USelectMenu
            v-model="state[modelKey]"
            :items="items"
            value-key="value"
            icon="i-lucide-search"
            :placeholder="placeholder"
            :loading="itemsPending"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Status" name="available">
          <div class="flex items-center">
            <USwitch v-model="state.available" />
            <span class="ml-3 text-sm">{{ state.available ? 'Available' : 'Hidden' }}</span>
          </div>
        </UFormField>
      </div>
    </UCard>
  </div>
</template>