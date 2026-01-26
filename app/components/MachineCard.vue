<script setup>
const props = defineProps({
  machine: {
    type: Object,
    required: true
  }
})

const { t, locale } = useI18n()

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

const shortDescription = computed(() => {
    const desc = getLocalizedContent(props.machine.description, locale.value)
    if (!desc) return ''
    return desc.length > 140 ? desc.slice(0, 140) + '…' : desc
})

const imageUrl = computed(() => props.machine.metadata?.imageUrl || null)
</script>

<template>
  <UCard :ui="{ body: { padding: 'p-4 md:p-6' } }">
    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Left: Image & Basic Info -->
      <div class="flex items-start gap-4 lg:w-[35%]">
        <div class="w-20 h-20 rounded-xl overflow-hidden bg-white flex-shrink-0 border border-gray-100 dark:border-gray-800">
            <img v-if="imageUrl" :src="imageUrl" :alt="machine.name" class="w-full h-full object-contain p-1">
            <div v-else class="w-full h-full flex items-center justify-center text-medium-gray-600 bg-light-gray-300">
                <UIcon name="i-lucide-factory" class="w-8 h-8 opacity-40" />
            </div>
        </div>

        <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1">
                <p class="text-lg font-bold text-charcoal-900 dark:text-charcoal-100 leading-tight">
                    {{ machine.name }}
                </p>
                <span class="px-1.5 py-0.5 rounded bg-light-gray-200 dark:bg-medium-gray-800 text-xs font-mono text-medium-gray-600 dark:text-medium-gray-400">
                    {{ machine.code }}
                </span>
            </div>

            <p v-if="shortDescription" class="text-sm text-medium-gray-600 dark:text-medium-gray-400 leading-relaxed">
                {{ shortDescription }}
            </p>
        </div>
      </div>

      <!-- Middle: Specs -->
      <div class="flex-1 lg:px-6 lg:border-l lg:border-r border-gray-200 dark:border-gray-800 flex items-center">
        <div v-if="keySpecs.length" class="flex flex-wrap gap-2 w-full">
            <UBadge 
                v-for="spec in keySpecs" 
                :key="spec" 
                color="neutral" 
                variant="subtle" 
                size="md"
                class="whitespace-normal h-auto py-1 text-left"
            >
                {{ spec }}
            </UBadge>
        </div>
      </div>

      <!-- Right: Price & Actions -->
      <div class="flex flex-col sm:flex-row lg:flex-col lg:items-end justify-center gap-4 lg:w-[20%] lg:min-w-48">
        <div v-if="Number(machine.base_price) > 0" class="text-left lg:text-right w-full">
            <p class="text-xs font-semibold uppercase tracking-wide text-medium-gray-500 mb-0.5">
                {{ $t('catalog.starting_price') }}
            </p>
            <p class="text-xl font-bold text-deep-teal-600 dark:text-deep-teal-400">
                {{ formatPrice(machine.base_price) }}
            </p>
        </div>

        <div class="w-full">
            <slot name="actions" :machine="machine">
                <!-- Default actions or empty -->
            </slot>
        </div>
      </div>
    </div>
  </UCard>
</template>