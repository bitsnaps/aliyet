<script setup>
import * as v from 'valibot'

definePageMeta({
  layout: 'admin'
})

const route = useRoute()
const toast = useToast()
const isNew = route.params.id === 'new'

// Form Schema
const schema = v.object({
  name: v.string([v.minLength(1, 'Quote name is required')]),
  notes: v.optional(v.string()),
  user_id: v.optional(v.nullable(v.number([v.integer()]))),
  machine_id: v.optional(v.nullable(v.number([v.integer()])))
})

const state = ref({
  name: '',
  notes: '',
  user_id: null,
  machine_id: null,
})

// Data Fetching
const { data: users } = await useFetch('/api/admin/users', {
    transform: (res) => res.data.map(u => ({ label: u.name || u.username, value: u.id }))
})

const { data: machines } = await useFetch('/api/admin/machines', {
    transform: (res) => res.data.map(m => ({ label: `${m.name} (${m.code})`, value: m.id }))
})

// Fetch Quote if Edit Mode
const { data: quote, pending } = await useFetch(() => isNew ? null : `/api/admin/quotes/${route.params.id}`, {
  immediate: !isNew,
  transform: (res) => res.data
})

// Initialize State
if (!isNew && quote.value) {
  state.value = {
    name: quote.value.name,
    notes: quote.value.notes,
    user_id: quote.value.user_id,
    machine_id: quote.value.machine_id,
  }
}

const save = async () => {
  try {
    const method = isNew ? 'POST' : 'PUT'
    const url = isNew ? '/api/admin/quotes' : `/api/admin/quotes/${route.params.id}`
    
    await $fetch(url, {
      method,
      body: state.value
    })

    toast.add({
      title: 'Success',
      description: `Quote ${isNew ? 'created' : 'updated'} successfully`,
      color: 'success'
    })

    navigateTo('/admin/quotes')
  } catch (error) {
    toast.add({
      title: 'Error',
      description: error.data?.statusMessage || 'An error occurred',
      color: 'error'
    })
  }
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
        <UButton label="Cancel" color="neutral" variant="ghost" to="/admin/quotes" />
        <UButton label="Save Quote" color="primary" icon="i-lucide-save" @click="save" :loading="pending" class="cursor-pointer" />
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Main Info -->
      <div class="lg:col-span-2 space-y-6">
        <UCard>
            <template #header>
                <h3 class="text-lg font-semibold dark:text-white">Quote Information</h3>
            </template>
            
            <UForm :schema="schema" :state="state" class="space-y-4" @submit="save">
                <UFormField label="Quote Name" name="name" required>
                    <UInput v-model="state.name" placeholder="e.g. Quote for ACME Corp" class="w-full" />
                </UFormField>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <UFormField label="Client" name="user_id">
                        <USelectMenu
                            v-model="state.user_id"
                            :items="users || []"
                            value-key="value"
                            label-key="label"
                            placeholder="Select Client"
                            searchable
                            class="w-full"
                        />
                    </UFormField>

                    <UFormField label="Machine" name="machine_id">
                        <USelectMenu
                            v-model="state.machine_id"
                            :items="machines || []"
                            value-key="value"
                            label-key="label"
                            placeholder="Select Machine"
                            searchable
                            class="w-full"
                        />
                    </UFormField>
                </div>

                <UFormField label="Notes" name="notes">
                    <UTextarea v-model="state.notes" placeholder="Internal notes or client requirements..." :rows="4" class="w-full" />
                </UFormField>
            </UForm>
        </UCard>

        <!-- Quote Details (Read-only for now if not new) -->
        <UCard v-if="!isNew && quote">
             <template #header>
                <div class="flex justify-between items-center">
                    <h3 class="text-lg font-semibold dark:text-white">Configuration Details</h3>
                    <span class="text-lg font-bold text-deep-teal-600">
                        Total: ${{ Number(quote.totalPrice).toLocaleString() }}
                    </span>
                </div>
            </template>

            <div class="space-y-6">
                <!-- Base Machine -->
                <div v-if="quote.Machine">
                    <h4 class="text-sm font-medium text-gray-500 uppercase mb-2">Base Machine</h4>
                    <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span class="font-medium">{{ quote.Machine.name }}</span>
                        <span class="font-mono">${{ Number(quote.Machine.base_price).toLocaleString() }}</span>
                    </div>
                </div>

                <!-- Configurations -->
                <div v-if="quote.Configurations && quote.Configurations.length > 0">
                    <h4 class="text-sm font-medium text-gray-500 uppercase mb-2">Selected Configurations</h4>
                    <ul class="space-y-2">
                        <li v-for="config in quote.Configurations" :key="config.id" class="flex justify-between items-center p-2 border-b border-gray-100 last:border-0">
                            <span>{{ config.name }}</span>
                            <span class="font-mono text-sm text-gray-600">+${{ Number(config.price).toLocaleString() }}</span>
                        </li>
                    </ul>
                </div>

                <!-- Optional Additions -->
                <div v-if="quote.OptionalAdditions && quote.OptionalAdditions.length > 0">
                    <h4 class="text-sm font-medium text-gray-500 uppercase mb-2">Optional Additions</h4>
                    <ul class="space-y-2">
                        <li v-for="opt in quote.OptionalAdditions" :key="opt.id" class="flex justify-between items-center p-2 border-b border-gray-100 last:border-0">
                            <span>{{ opt.name }}</span>
                            <span class="font-mono text-sm text-gray-600">+${{ Number(opt.price).toLocaleString() }}</span>
                        </li>
                    </ul>
                </div>
                 <!-- Optional Replacements -->
                <div v-if="quote.OptionalReplacements && quote.OptionalReplacements.length > 0">
                    <h4 class="text-sm font-medium text-gray-500 uppercase mb-2">Replacements</h4>
                    <ul class="space-y-2">
                        <li v-for="rep in quote.OptionalReplacements" :key="rep.id" class="flex justify-between items-center p-2 border-b border-gray-100 last:border-0">
                            <span>{{ rep.name }}</span>
                            <span class="font-mono text-sm text-gray-600">+${{ Number(rep.price).toLocaleString() }}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </UCard>
      </div>

      <!-- Sidebar Settings -->
      <div class="space-y-6">
        <UCard>
             <template #header>
                <h3 class="text-lg font-semibold dark:text-white">Status & Metadata</h3>
            </template>
            <div class="space-y-4">
                <div>
                    <span class="text-sm text-gray-500 block">Created At</span>
                    <span class="font-medium text-deep-teal-500">{{ isNew ? 'Now' : new Date(quote?.createdAt).toLocaleString() }}</span>
                </div>
                 <div v-if="!isNew">
                    <span class="text-sm text-gray-500 block">Last Updated</span>
                    <span class="font-medium text-deep-teal-500">{{ new Date(quote?.updatedAt).toLocaleString() }}</span>
                </div>
            </div>
        </UCard>
      </div>
    </div>
  </div>
</template>