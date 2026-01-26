<script setup>
import * as v from 'valibot'

const props = defineProps({
  config: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['saved', 'closed'])

const toast = useToast()
const loading = ref(false)
const isNew = !props.config

const state = ref({
  name: props.config?.name || '',
  description: props.config?.description || '',
  type: props.config?.type || 'select',
  price: props.config?.price || 0
})

const schema = v.object({
  name: v.pipe(v.string(), v.minLength(1, 'Name is required')),
})

const save = async () => {
  loading.value = true
  try {
    const method = isNew ? 'POST' : 'PUT'
    const url = isNew ? '/api/admin/configs' : `/api/admin/configs/${props.config.id}`

    await $fetch(url, {
      method,
      body: state.value,
    })
    
    toast.add({ title: `Group ${isNew ? 'created' : 'updated'} successfully.`, color: 'success' })
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
  <UForm :schema="schema" :state="state" class="space-y-2" @submit="save">
    <UFormField label="Group Name" name="name" required>
      <UInput v-model="state.name" placeholder="e.g. CNC Spindle Options" class="w-full" />
    </UFormField>

    <UFormField label="Description" name="description" help="A brief explanation of what this group is for.">
      <UTextarea v-model="state.description" class="w-full" />
    </UFormField>

    <UFormField label="Input Type" name="type" required help="How the user selects this option.">
      <USelectMenu
        v-model="state.type"
        :items="[{ label: 'Dropdown Selection', value: 'select' }, { label: 'Text Input', value: 'text' }, { label: 'Checkbox', value: 'checkbox' }]"
        value-key="value"
        placeholder="Select Input Type"
        class="w-full"
      />
    </UFormField>

    <UFormField label="Base Price" name="price" help="Base price for this configuration group (if any).">
      <UInput v-model="state.price" type="number" step="0.01" class="w-full" />
    </UFormField>

    <div class="flex justify-end gap-3 mt-6">
      <UButton label="Cancel" color="neutral" variant="soft" @click="$emit('closed')" />
      <UButton type="submit" label="Save" color="primary" :loading="loading" />
    </div>
  </UForm>
</template>