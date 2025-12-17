<script setup>
import { object, string, number } from 'valibot'

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

const schema = object({
  name: string('Name is required'),
  price: number('Price must be a number')
})

const save = async () => {
  loading.value = true
  try {
    const method = isNew ? 'POST' : 'PUT'
    const url = isNew ? '/api/admin/config-options' : `/api/admin/config-options/${props.option.id}`

    await $fetch(url, {
      method,
      body: state.value,
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
      <UInput v-model="state.name" placeholder="e.g. 12,000 RPM Spindle" />
    </UFormField>

    <UFormField label="Price Adjustment (USD)" name="price" help="Enter a positive or negative value to adjust the base price.">
      <UInput v-model="state.price" type="number" step="0.01">
        <template #leading>$</template>
      </UInput>
    </UFormField>

    <div class="flex justify-end gap-3 mt-6">
      <UButton label="Cancel" color="neutral" variant="soft" @click="$emit('closed')" />
      <UButton type="submit" label="Save" color="primary" :loading="loading" />
    </div>
  </UForm>
</template>