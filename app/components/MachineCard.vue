<script setup>
const props = defineProps({
  machine: {
    type: Object,
    required: true
  }
})

const { t } = useI18n()

const formatPrice = (value) => {
  if (value == null) return t('catalog.contact_for_price')
  const num = Number(value)
  if (Number.isNaN(num)) return t('catalog.contact_for_price')
  return `$${num.toLocaleString()}`
}

const keySpecs = computed(() => {
  const specs = Array.isArray(props.machine.Specifications) ? props.machine.Specifications : []
  return specs.slice(0, 4).map(s => `${s.parameter}: ${s.value}${s.unit ? ' ' + s.unit : ''}`)
})

// const shortDescription = computed(() => {
//     const desc = props.machine.description || ''
//     return desc.length > 140 ? desc.slice(0, 140) + '…' : desc
// })

const imageUrl = computed(() => props.machine.metadata?.imageUrl || null)
</script>

<template>
  <UCard :ui="{ body: { padding: 'p-4 md:p-6' } }">
    <div class="flex flex-col lg:flex-row lg:items-center gap-6">
      <div class="flex items-start gap-4 flex-1">
        <!-- Image -->
        <div class="w-20 h-20 rounded-xl overflow-hidden bg-light-gray-300 flex-shrink-0">
            <img v-if="imageUrl" :src="imageUrl" :alt="machine.name" class="w-full h-full object-cover">
            <div v-else class="w-full h-full flex items-center justify-center text-medium-gray-600">
                <UIcon name="i-lucide-factory" class="w-8 h-8 opacity-40" />
            </div>
        </div>

        <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
                <p class="text-lg font-semibold dark:text-charcoal-300 truncate">
                    {{ machine.name }}
                </p>
                <span class="font-mono text-xs text-medium-gray-700">
                    {{ machine.code }}
                </span>
            </div>

            <!-- <p v-if="shortDescription" class="text-sm text-medium-gray-700 mt-2">
                {{ shortDescription }}
            </p> -->

            <div v-if="keySpecs.length" class="mt-3 flex flex-wrap gap-2">
                <UBadge v-for="spec in keySpecs" :key="spec" color="neutral" variant="subtle" size="sm">
                    {{ spec }}
                </UBadge>
            </div>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row lg:flex-col lg:items-end gap-3 lg:min-w-56">
        <div class="text-left lg:text-right">
            <p class="text-xs font-semibold uppercase tracking-wide text-medium-gray-600">
                {{ $t('catalog.starting_price') }}
            </p>
            <p class="text-xl font-bold text-deep-teal-600">
                {{ formatPrice(machine.base_price) }}
            </p>
        </div>

        <div class="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <slot name="actions" :machine="machine">
                <!-- Default actions or empty -->
            </slot>
        </div>
      </div>
    </div>
  </UCard>
</template>