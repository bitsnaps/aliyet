<script setup>
const { t } = useI18n()
const route = useRoute()
const toast = useToast()

const machineId = route.params.id

const { data, error, pending } = await useFetch(`/api/machines/${machineId}`)

const machine = computed(() => (data.value?.success ? data.value.data : null))

watchEffect(() => {
  if (!process.client) return
  if (!error.value) return
  toast.add({
    title: t('machine_details.machine_not_found'),
    description: t('machine_details.fetch_error_desc'),
    color: 'error',
  })
})

useHead({
  title: machine.value ? `${machine.value.name} - ${t('machine_details.page_title_suffix')}` : t('machine_details.page_title_default'),
})

const formatPrice = (value) => {
  if (value == null) return t('machine_details.contact_for_price')
  const num = Number(value)
  if (Number.isNaN(num)) return t('machine_details.contact_for_price')
  return `$${num.toLocaleString()}`
}
</script>

<template>
  <section class="bg-light-gray-200 min-h-screen py-24">
    <div class="container mx-auto px-4 md:px-8">
      <NuxtLink
        to="/catalog"
        class="inline-flex items-center text-sm text-deep-teal-600 hover:text-deep-teal-700 mb-6"
      >
        <UIcon name="i-lucide-arrow-left" class="w-4 h-4 mr-2" />
        {{ $t('machine_details.back_to_catalog') }}
      </NuxtLink>

      <div v-if="pending" class="flex justify-center py-16">
        <UProgress :value="40" class="w-64" />
      </div>

      <div v-else-if="!machine" class="py-16">
        <UEmpty
          icon="i-lucide-database-zap"
          :title="$t('machine_details.machine_not_found')"
          :description="$t('machine_details.not_available_desc')"
        />
      </div>

      <div v-else class="grid lg:grid-cols-[2fr,3fr] gap-8 items-start">
        <div class="space-y-4">
          <UCard>
            <div class="space-y-3">
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-deep-teal-500">
                {{ machine.Category?.name || 'Machine' }}
              </p>
              <h1 class="text-3xl md:text-4xl font-extrabold dark:text-white">
                {{ machine.name }}
              </h1>
              <p class="text-sm text-medium-gray-600">
                {{ $t('machine_details.model_code') }}:
                <span class="font-mono">{{ machine.code }}</span>
              </p>
              <div
                v-if="machine.metadata?.imageUrl"
                class="mt-4 w-full aspect-[4/3] rounded-xl overflow-hidden bg-light-gray-300"
              >
                <img
                  :src="machine.metadata.imageUrl"
                  :alt="machine.name"
                  class="w-full h-full object-cover"
                >
              </div>
              <p v-if="machine.description" class="text-base md:text-lg dark:text-medium-gray-200 mt-4">
                {{ machine.description }}
              </p>
            </div>
          </UCard>

          <UCard v-if="machine.url">
            <div class="flex items-center justify-between gap-4">
              <div>
                <p class="text-sm font-semibold dark:text-charcoal-300">
                  {{ $t('machine_details.manufacturer_info') }}
                </p>
                <p class="text-xs text-medium-gray-700">
                  {{ $t('machine_details.manufacturer_desc') }}
                </p>
              </div>
              <UButton
                :href="machine.url"
                target="_blank"
                variant="outline"
                color="neutral"
                icon="i-lucide-external-link"
                class="cursor-pointer"
              >
                {{ $t('machine_details.visit_page') }}
              </UButton>
            </div>
          </UCard>
        </div>

        <div class="space-y-6">
          <UCard>
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p class="text-sm font-semibold dark:text-charcoal-300">
                  {{ $t('machine_details.starting_price') }}
                </p>
                <p class="text-2xl font-bold text-deep-teal-600">
                  {{ formatPrice(machine.base_price) }}
                </p>
                <p class="text-xs text-medium-gray-700 mt-1">
                  {{ $t('machine_details.price_disclaimer') }}
                </p>
              </div>
              <div class="flex flex-col sm:flex-row gap-3">
                <UButton
                  :to="`/build-and-price?machineId=${machineId}`"
                  color="primary"
                  variant="solid"
                  size="lg"
                  class="cursor-pointer"
                >
                  {{ $t('catalog.build_price') }}
                </UButton>
                <UButton
                  to="/build-and-price"
                  color="neutral"
                  variant="outline"
                  size="lg"
                  class="cursor-pointer"
                >
                  {{ $t('machine_details.quick_quote') }}
                </UButton>
              </div>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold dark:text-charcoal-300">
                  {{ $t('machine_details.tech_specs') }}
                </h2>
                <UBadge
                  :color="machine.available ? 'success' : 'error'"
                  variant="soft"
                  size="sm"
                  :ui="{ rounded: 'rounded-full' }"
                >
                  {{ machine.available ? $t('machine_details.available_quote') : $t('machine_details.unavailable') }}
                </UBadge>
              </div>
            </template>

            <div v-if="machine.Specifications && machine.Specifications.length" class="grid sm:grid-cols-2 gap-4">
              <div
                v-for="(spec, index) in machine.Specifications"
                :key="`${spec.parameter}-${index}`"
                class="rounded-lg border border-light-gray-300 bg-white px-4 py-3"
              >
                <p class="text-xs text-medium-gray-600 uppercase tracking-wide">
                  {{ spec.parameter }}
                </p>
                <p class="text-sm font-semibold text-charcoal-900 mt-1">
                  {{ spec.value }}<span v-if="spec.unit"> {{ spec.unit }}</span>
                </p>
              </div>
            </div>
            <div v-else class="text-sm text-medium-gray-700">
              {{ $t('machine_details.specs_soon') }}
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </section>
</template>
