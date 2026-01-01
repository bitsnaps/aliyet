<script setup>
const { t } = useI18n()

useHead({
  title: `${t('catalog.title')} - Aliyaat`,
  meta: [
    { name: 'description', content: t('catalog.meta_description') },
    { property: 'og:title', content: `Aliyaat - ${t('catalog.title')}` },
  ],
})

const machines = ref([])
const selectedCategoryId = ref('all')
const search = ref('')
const loading = ref(true)
const errorMessage = ref('')

const { data: machinesFetch, error: machinesError } = await useFetch('/api/machines')

if (machinesError.value) {
  errorMessage.value = t('catalog.fetch_error_desc')
} else if (machinesFetch.value?.success) {
  machines.value = machinesFetch.value.data
}

loading.value = false

const categories = computed(() => {
  const map = new Map()
  for (const machine of machines.value || []) {
    const id = machine?.category_id
    const name = machine?.Category?.name
    if (id == null || !name) continue
    const key = String(id)
    if (!map.has(key)) {
      map.set(key, { id: key, name, description: machine?.Category?.description || '' })
    }
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
})

const categoryItems = computed(() => {
  const base = [{ label: t('catalog.all_categories'), value: 'all' }]
  const rest = categories.value.map(c => ({ label: c.name, value: String(c.id) }))
  return [...base, ...rest]
})

const filteredMachines = computed(() => {
  if (!machines.value) return []
  const trimmed = search.value.trim().toLowerCase()
  let result = [...machines.value]
  if (selectedCategoryId.value !== 'all') {
    result = result.filter(m => String(m.category_id) === String(selectedCategoryId.value))
  }
  if (trimmed) {
    result = result.filter(m => {
      const name = (m.name || '').toLowerCase()
      const code = (m.code || '').toLowerCase()
      const category = (m.Category?.name || '').toLowerCase()
      return name.includes(trimmed) || code.includes(trimmed) || category.includes(trimmed)
    })
  }
  return result
})

const machineRows = computed(() => {
  return filteredMachines.value.map(m => {
    const specs = Array.isArray(m.Specifications) ? m.Specifications : []
    const keySpecs = specs.slice(0, 4).map(s => `${s.parameter}: ${s.value}${s.unit ? ' ' + s.unit : ''}`)
    return {
      id: m.id,
      code: m.code,
      name: m.name,
      category: m.Category?.name || m.category_name || 'N/A',
      categoryDescription: m.Category?.description || '',
      basePrice: m.base_price,
      available: m.available,
      imageUrl: m.metadata?.imageUrl || null,
      shortDescription: m.description ? m.description.slice(0, 140) + (m.description.length > 140 ? '…' : '') : '',
      keySpecs,
    }
  })
})

const selectedCategory = computed(() => {
  if (selectedCategoryId.value === 'all') return null
  return categories.value.find(c => String(c.id) === String(selectedCategoryId.value)) || null
})

const activeTitle = computed(() => {
  if (!selectedCategory.value) return t('catalog.all_machines')
  return selectedCategory.value.name
})

const activeDescription = computed(() => {
  if (!selectedCategory.value) {
    return t('catalog.description')
  }
  return selectedCategory.value.description || t('catalog.description')
})

const formatPrice = (value) => {
  if (value == null) return t('catalog.contact_for_price')
  const num = Number(value)
  if (Number.isNaN(num)) return t('catalog.contact_for_price')
  return `$${num.toLocaleString()}`
}
</script>

<template>
  <section class="bg-light-gray-200 min-h-screen py-24">
    <div class="container mx-auto px-4 md:px-8">
      <div class="mb-10">
        <p class="uppercase text-xs font-semibold tracking-[0.2em] text-deep-teal-500 mb-3">
          {{ $t('catalog.badge') }}
        </p>
        <h1 class="text-3xl md:text-4xl lg:text-5xl font-extrabold text-charcoal-900 mb-4">
          {{ $t('catalog.heading') }}
        </h1>
        <p class="text-base md:text-lg text-medium-gray-700 max-w-3xl">
          {{ $t('catalog.description') }}
        </p>
      </div>

      <UCard class="mb-8" :ui="{ body: { padding: 'p-4 md:p-6' } }">
        <div class="flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-lg bg-deep-teal-500/10 flex items-center justify-center text-deep-teal-600">
              <UIcon name="i-lucide-factory" class="w-5 h-5" />
            </div>
            <div>
              <p class="text-sm font-semibold dark:text-charcoal-300">
                {{ $t('catalog.filter_title') }}
              </p>
              <p class="text-xs text-medium-gray-600">
                {{ $t('catalog.filter_description') }}
              </p>
            </div>
          </div>
          <div class="w-full md:w-72">
            <USelectMenu
              v-model="selectedCategoryId"
              :items="categoryItems"
              value-key="value"
              :placeholder="$t('catalog.all_categories')"
              class="w-full"
            />
          </div>
          <div class="w-full md:w-72">
            <UInput
              v-model="search"
              icon="i-lucide-search"
              :placeholder="$t('catalog.search_placeholder')"
              class="w-full"
              color="neutral"
            />
          </div>
        </div>
      </UCard>

      <div v-if="loading" class="flex justify-center py-16">
        <UProgress :value="30" class="w-64" />
      </div>

      <div v-else-if="errorMessage" class="py-10">
        <UAlert
          color="error"
          variant="subtle"
          :title="$t('catalog.fetch_error_title')"
          :description="errorMessage"
        />
      </div>

      <div v-else>
        <div v-if="machineRows.length === 0" class="py-10">
          <UEmpty
            icon="i-lucide-database-zap"
            :title="$t('catalog.no_machines')"
            :description="$t('catalog.no_machines_desc')"
          />
        </div>

        <div v-else class="grid lg:grid-cols-[2fr,4fr] gap-6">
          <!-- <aside class="space-y-4">
            <UCard>
              <h2 class="text-lg font-semibold dark:text-charcoal-300 mb-3">
                Categories
              </h2>
              <div class="space-y-1">
                <UButton
                  :color="selectedCategoryId === 'all' ? 'primary' : 'neutral'"
                  :variant="selectedCategoryId === 'all' ? 'soft' : 'ghost'"
                  class="w-full justify-start cursor-pointer"
                  @click="selectedCategoryId = 'all'"
                >
                  All Categories
                </UButton>
                <UButton
                  v-for="cat in categories"
                  :key="cat.id"
                  :color="String(selectedCategoryId) === String(cat.id) ? 'primary' : 'neutral'"
                  :variant="String(selectedCategoryId) === String(cat.id) ? 'soft' : 'ghost'"
                  class="w-full justify-start cursor-pointer"
                  @click="selectedCategoryId = String(cat.id)"
                >
                  {{ cat.name }}
                </UButton>
              </div>
            </UCard>
            <UCard>
              <h3 class="text-sm font-semibold dark:text-charcoal-300 mb-2">
                Ready to configure?
              </h3>
              <p class="text-xs text-medium-gray-700 mb-4">
                Choose a machine then continue to Build &amp; Price to customize it.
              </p>
              <UButton to="/build-and-price" color="primary" variant="solid" block class="cursor-pointer">
                Go to Build &amp; Price
              </UButton>
            </UCard>
          </aside> -->

          <div class="space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <h2 class="text-2xl font-bold text-charcoal-900">
                  {{ activeTitle }}
                </h2>
                <p class="text-sm text-medium-gray-700 mt-1">
                  {{ activeDescription }}
                </p>
              </div>
              <UBadge color="neutral" variant="subtle" size="sm" :ui="{ rounded: 'rounded-full' }">
                {{ $t('catalog.models_count', { count: machineRows.length }) }}
              </UBadge>
            </div>

            <div class="space-y-4">
              <UCard
                v-for="machine in machineRows"
                :key="machine.id"
                :ui="{ body: { padding: 'p-4 md:p-6' } }"
              >
                <div class="flex flex-col lg:flex-row lg:items-center gap-6">
                  <div class="flex items-start gap-4 flex-1">
                    <div class="w-20 h-20 rounded-xl overflow-hidden bg-light-gray-300 flex-shrink-0">
                      <img
                        v-if="machine.imageUrl"
                        :src="machine.imageUrl"
                        :alt="machine.name"
                        class="w-full h-full object-cover"
                      >
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

                      <p v-if="machine.shortDescription" class="text-sm text-medium-gray-700 mt-2">
                        {{ machine.shortDescription }}
                      </p>

                      <div v-if="machine.keySpecs.length" class="mt-3 flex flex-wrap gap-2">
                        <UBadge
                          v-for="spec in machine.keySpecs"
                          :key="spec"
                          color="neutral"
                          variant="subtle"
                          size="sm"
                        >
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
                        {{ formatPrice(machine.basePrice) }}
                      </p>
                    </div>

                    <div class="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                      <UButton
                        :to="`/machines/${machine.id}`"
                        color="neutral"
                        variant="outline"
                        size="sm"
                        class="cursor-pointer w-full sm:w-auto"
                      >
                        {{ $t('catalog.read_more') }}
                      </UButton>
                      <UButton
                        :to="`/build-and-price?machineId=${machine.id}`"
                        color="primary"
                        variant="solid"
                        size="sm"
                        class="cursor-pointer w-full sm:w-auto"
                      >
                        {{ $t('catalog.build_price') }}
                      </UButton>
                    </div>
                  </div>
                </div>
              </UCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
