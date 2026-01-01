<script setup>
const { t } = useI18n()
const toast = useToast()

// Data Fetching
const { data: machinesFetch, error: machinesError } = await useFetch('/api/machines')
const machines = computed(() => machinesFetch.value?.data || [])
const loading = ref(true)

if (machinesFetch.value) {
    loading.value = false
}

// Categories Extraction
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

// State
const selectedCategoryId = ref(null)
const isConfiguratorOpen = ref(false)
const configuratorMachine = ref(null)

// Initialize selected category
watchEffect(() => {
    if (!selectedCategoryId.value && categories.value.length > 0) {
        selectedCategoryId.value = categories.value[0].id
    }
})

// Filtering
const filteredMachines = computed(() => {
    if (!selectedCategoryId.value) return []
    return machines.value.filter(m => String(m.category_id) === String(selectedCategoryId.value))
})

// Formatting
const formatPrice = (value) => {
  if (value == null) return t('catalog.contact_for_price')
  const num = Number(value)
  if (Number.isNaN(num)) return t('catalog.contact_for_price')
  return `$${num.toLocaleString()}`
}

function openConfigurator(machine) {
    configuratorMachine.value = machine
    isConfiguratorOpen.value = true
}

// Mobile sidebar toggle
const isSidebarOpen = ref(false)
</script>

<template>
  <div class="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50 dark:bg-gray-900 relative">
    
    <!-- Sidebar (Desktop) -->
    <aside class="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto shrink-0 mt-18">
        <div class="p-4 border-b border-gray-100 dark:border-gray-700">
            <h2 class="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm">Categories</h2>
        </div>
        <nav class="flex-1 p-2 space-y-1">
            <button 
                v-for="category in categories" 
                :key="category.id"
                @click="selectedCategoryId = category.id"
                :class="[
                    'w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-colors cursor-pointer',
                    selectedCategoryId === category.id 
                        ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                ]"
            >
                {{ category.name }}
            </button>
        </nav>
    </aside>

    <!-- Mobile Category Select Button -->
    <div class="md:hidden fixed bottom-4 right-4 z-40">
        <UButton icon="i-heroicons-list-bullet" color="primary" size="xl" :ui="{ rounded: 'rounded-full' }" @click="isSidebarOpen = true" />
    </div>

    <!-- Mobile Sidebar Overlay (Custom implementation instead of USlideover) -->
    <div v-if="isSidebarOpen" class="fixed inset-0 z-50 flex md:hidden">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="isSidebarOpen = false"></div>
        
        <!-- Sidebar Content -->
        <div class="relative w-4/5 max-w-xs bg-white dark:bg-gray-800 h-full shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out">
            <div class="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
                <h2 class="font-bold text-xl dark:text-white">Categories</h2>
                <UButton icon="i-heroicons-x-mark" color="gray" variant="ghost" @click="isSidebarOpen = false" />
            </div>
             <nav class="flex-1 overflow-y-auto p-2 space-y-1">
                <button 
                    v-for="category in categories" 
                    :key="category.id"
                    @click="selectedCategoryId = category.id; isSidebarOpen = false"
                    :class="[
                        'w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-colors',
                        selectedCategoryId === category.id 
                            ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' 
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    ]"
                >
                    {{ category.name }}
                </button>
            </nav>
        </div>
    </div>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col overflow-hidden relative mt-18">
        <!-- Header -->
        <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between shadow-sm z-10 shrink-0">
             <div>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                    {{ categories.find(c => c.id === selectedCategoryId)?.name || $t('build_price.page_title') }}
                </h1>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                     {{ categories.find(c => c.id === selectedCategoryId)?.description || 'Select a machine to configure' }}
                </p>
            </div>
            <div class="hidden md:block w-1/3">
                 <!-- Native Input with Tailwind instead of UInput -->
                 <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UIcon name="i-heroicons-magnifying-glass" class="h-5 w-5 text-gray-400" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        class="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                 </div>
            </div>
        </header>

        <!-- Machines List -->
        <div class="flex-1 overflow-y-auto p-4 md:p-8 space-y-4">
             <div v-if="loading" class="flex justify-center py-20">
                <UIcon name="i-heroicons-arrow-path" class="animate-spin w-8 h-8 text-primary-500" />
            </div>
            
            <div v-else-if="filteredMachines.length === 0" class="text-center py-20">
                <p class="text-gray-500">No machines found in this category.</p>
            </div>

            <div v-for="machine in filteredMachines" :key="machine.id" class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                <div class="flex flex-col lg:flex-row items-center p-6 gap-6">
                    <!-- Image & Name -->
                    <div class="flex flex-col items-center w-full lg:w-1/4 shrink-0">
                         <div class="w-full aspect-[4/3] bg-gray-50 dark:bg-gray-900 rounded-md overflow-hidden flex items-center justify-center mb-3">
                            <img 
                                v-if="machine.metadata?.imageUrl" 
                                :src="machine.metadata.imageUrl" 
                                :alt="machine.name" 
                                class="w-full h-full object-contain p-2"
                            />
                            <UIcon v-else name="i-lucide-factory" class="w-16 h-16 text-gray-300" />
                        </div>
                        <h3 class="text-xl font-bold text-primary-600 dark:text-primary-400">{{ machine.name }}</h3>
                        <p class="text-xs text-gray-400">{{ machine.code }}</p>
                    </div>

                    <!-- Features -->
                    <div class="flex-1 w-full border-t lg:border-t-0 lg:border-l lg:border-r border-gray-100 dark:border-gray-700 py-4 lg:px-6">
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                            <div v-for="(spec, idx) in (machine.Specifications || []).slice(0, 4)" :key="idx" class="flex flex-col items-center justify-center p-2">
                                <span class="text-lg font-bold text-gray-800 dark:text-gray-100">
                                    {{ spec.value }} <span class="text-xs font-normal text-gray-500">{{ spec.unit }}</span>
                                </span>
                                <span class="text-xs text-gray-500 uppercase mt-1">{{ spec.parameter }}</span>
                            </div>
                             <div v-if="(!machine.Specifications || machine.Specifications.length === 0)" class="col-span-4 text-gray-400 text-sm italic">
                                Specs coming soon
                            </div>
                        </div>
                    </div>

                    <!-- Price & Action -->
                    <div class="flex flex-col items-center justify-center w-full lg:w-1/5 gap-4 shrink-0">
                        <div class="text-center">
                            <p class="text-xs text-gray-500 uppercase">{{ $t('catalog.starting_price') }}</p>
                            <p class="text-xl font-bold text-gray-900 dark:text-white">{{ formatPrice(machine.base_price) }}</p>
                        </div>
                        <UButton 
                            color="primary" 
                            variant="solid" 
                            size="lg" 
                            class="w-full justify-center font-bold"
                            @click="openConfigurator(machine)"
                        >
                            BUILD
                        </UButton>
                    </div>
                </div>
            </div>
            
            <!-- Bottom spacing -->
            <div class="h-20 md:h-0"></div>
        </div>
    </main>

    <!-- Configurator Modal -->
    <MachineConfigurator 
        v-model="isConfiguratorOpen" 
        :machine="configuratorMachine"
        @close="configuratorMachine = null"
    />
  </div>
</template>

<style scoped>
/* Custom Scrollbar for sidebar */
aside::-webkit-scrollbar {
  width: 4px;
}
aside::-webkit-scrollbar-track {
  background: transparent;
}
aside::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 20px;
}
.dark aside::-webkit-scrollbar-thumb {
  background-color: #374151;
}
</style>
