<script setup>
const { t } = useI18n()
const route = useRoute()
const localePath = useLocalePath()

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
      map.set(key, {
        id: key,
        name,
        description: machine?.Category?.description || '',
        machine_type: machine?.Category?.metadata?.machine_type
      })
    }
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
})

// Initialize filters from query params
const typeFilter = computed(() => route.query.type)

// Filter categories based on type
const filteredCategories = computed(() => {
  if (!typeFilter.value) return categories.value
  return categories.value.filter(c => c.machine_type === typeFilter.value)
})

const categoryItems = computed(() => {
  const base = [{ label: t('catalog.all_categories'), value: 'all' }]
  const rest = filteredCategories.value.map(c => ({ label: c.name, value: String(c.id) }))
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

const selectedCategory = computed(() => {
  if (selectedCategoryId.value === 'all') return null
  return categories.value.find(c => String(c.id) === String(selectedCategoryId.value)) || null
})

// Auto-select category if type is present and only one category matches, or if only filtering by type
watchEffect(() => {
    if (typeFilter.value && filteredCategories.value.length === 1 && selectedCategoryId.value === 'all') {
        selectedCategoryId.value = filteredCategories.value[0].id
    }
})

// Computed property for the actual list of machines to show
const displayMachines = computed(() => {
    let result = filteredMachines.value
    
    // If a type filter is active, further filter machines to ensure they belong to allowed categories
    if (typeFilter.value) {
        result = result.filter(m => {
             const cat = categories.value.find(c => String(c.id) === String(m.category_id))
             return cat && cat.machine_type === typeFilter.value
        })
    }
    return result
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
        <div v-if="displayMachines.length === 0" class="py-10">
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
                {{ $t('catalog.models_count', { count: displayMachines.length }) }}
              </UBadge>
            </div>

            <div class="space-y-4">
              <MachineCard
                v-for="machine in displayMachines"
                :key="machine.id"
                :machine="machine"
              >
                <template #actions="{ machine }">
                  <UButton
                    :to="localePath({ name: 'machines-id', params: { id: machine.id } })"
                    color="neutral"
                    variant="outline"
                    size="sm"
                    class="cursor-pointer w-full sm:w-auto"
                  >
                    {{ $t('catalog.read_more') }}
                  </UButton>
                  <UButton
                    :to="{ path: localePath('build-and-price'), query: { machineId: machine.id } }"
                    color="primary"
                    variant="solid"
                    size="sm"
                    class="cursor-pointer w-full sm:w-auto"
                  >
                    {{ $t('catalog.build_price') }}
                  </UButton>
                </template>
              </MachineCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
