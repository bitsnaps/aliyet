<script setup>
import * as v from 'valibot'

const props = defineProps({
  option: {
    type: Object,
    default: null
  },
  configId: {
    type: [String, Number],
    required: true
  }
})

const emit = defineEmits(['saved', 'closed'])

const toast = useToast()
const loading = ref(false)
const isNew = !props.option

const state = ref({
  name: props.option?.name || '',
  price: props.option?.price || 0,
  config_id: props.configId
})

const schema = v.object({
  name: v.pipe(v.string(), v.minLength(1, 'Name is required')),
  price: v.number('Price must be a number'),
})

const save = async () => {
  loading.value = true
  try {
    const method = isNew ? 'POST' : 'PUT'
    const url = isNew ? '/api/admin/config-options' : `/api/admin/config-options/${props.option.id}`

    // Manually cast price to number before sending
    const payload = { 
      ...state.value, 
      price: Number(String(state.value.price).replace(',', '.')) 
    }
    if (isNaN(payload.price)) payload.price = 0

    await $fetch(url, {
      method,
      body: payload,
    })
    
    toast.add({ title: `Option ${isNew ? 'created' : 'updated'} successfully.`, color: 'success' })
    emit('saved')
  } catch (err) {
    const errorMsg = err.data?.statusMessage || 'An unexpected error occurred.'
    toast.add({ title: 'Save Failed', description: errorMsg, color: 'error' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UForm :schema="schema" :state="state" class="space-y-4 p-4" @submit="save">
    <UFormField label="Option Name" name="name" required>
      <UInput v-model="state.name" placeholder="e.g. 12,000 RPM Spindle" class="w-full" />
    </UFormField>

    <UFormField label="Price Adjustment (USD)" name="price" help="Enter a positive or negative value to adjust the base price.">
      <UInput v-model="state.price" type="number" step="0.01" class="w-full">
        <template #leading>$</template>
      </UInput>
    </UFormField>

    <div class="flex justify-end gap-3 mt-6">
      <UButton label="Cancel" color="neutral" variant="soft" @click="$emit('closed')" />
      <UButton type="submit" label="Save" color="primary" :loading="loading" />
    </div>
  </UForm>
</template>