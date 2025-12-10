<script setup>
const { user } = useAuth();

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

const stats = [
  { id: 1, label: 'Machines', value: '42', icon: 'i-lucide-monitor-smartphone', color: 'text-action-teal-500', bg: 'bg-action-teal-50' },
  { id: 2, label: 'Quotes', value: '7', icon: 'i-lucide-inbox', color: 'text-amber-500', bg: 'bg-amber-50' },
  { id: 3, label: 'Clients', value: '158', icon: 'i-lucide-users', color: 'text-deep-teal-500', bg: 'bg-deep-teal-50' },
  // { id: 4, label: 'Total Categories', value: '8', icon: 'i-lucide-tags', color: 'text-purple-500', bg: 'bg-purple-50' },
]

// Mock data for recent requests
const recentQuotes = [
  { id: 1, client: 'Global Factories LLC', machine: 'CNC Turning Center X200', date: '2023-10-24', status: 'Pending' },
  { id: 2, client: 'MetalWorks Inc', machine: 'EDM Wire Cut A50', date: '2023-10-23', status: 'Processed' },
  { id: 3, client: 'AutoParts SA', machine: 'Double Column Center', date: '2023-10-22', status: 'New' },
]

const columns = [
  { id: 1, key: 'client', label: 'Client' },
  { id: 2, key: 'machine', label: 'Machine' },
  { id: 3, key: 'date', label: 'Date' },
  { id: 4, key: 'status', label: 'Status' },
  { id: 5, key: 'actions' }
]
</script>

<template>
  <div class="space-y-6">
    <!-- Welcome Section -->
    <div>
      <h2 class="text-2xl font-bold text-charcoal-900 dark:text-white">Welcome back, {{ user?.username || 'Admin' }}</h2>
      <p class="text-charcoal-500 dark:text-charcoal-400 mt-1">Here's what's happening with your products today.</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UCard v-for="stat in stats" :key="stat.label" class="border-l-4 border-l-deep-teal-500">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-charcoal-500 dark:text-charcoal-400">{{ stat.label }}</p>
            <p class="text-3xl font-bold text-charcoal-900 dark:text-white mt-1">{{ stat.value }}</p>
          </div>
          <div :class="[stat.bg, 'p-3 rounded-full']">
            <UIcon :name="stat.icon" :class="[stat.color, 'w-6 h-6']" />
          </div>
        </div>
      </UCard>
    </div>

    <!-- Recent Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Activity Table -->
      <UCard class="lg:col-span-2" title="Recent Quotes">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-charcoal-900 dark:text-white">Recent Quotes</h3>
            <UButton size="xs" variant="ghost" color="primary" label="View All" to="/admin/quotes" />
          </div>
        </template>
        
        <UTable :rows="recentQuotes" :columns="columns">
          <template #status-data="{ row }">
            <UBadge 
              :color="row.status === 'New' ? 'green' : row.status === 'Pending' ? 'orange' : 'gray'" 
              variant="subtle"
              size="xs"
            >
              {{ row.status }}
            </UBadge>
          </template>
          <template #actions-data>
            <UButton icon="i-lucide-arrow-right" variant="ghost" color="neutral" size="xs" />
          </template>
        </UTable>
      </UCard>

      <!-- Quick Actions -->
      <UCard>
        <template #header>
          <h3 class="font-semibold text-charcoal-900 dark:text-white">Quick Actions</h3>
        </template>
        <div class="space-y-3">
          <UButton 
            block 
            icon="i-lucide-plus" 
            label="Add New Machine" 
            color="primary" 
            variant="solid"
            to="/admin/machines/new"
          />
          <!-- <UButton 
            block 
            icon="i-lucide-folder-plus" 
            label="Create Category" 
            color="secondary" 
            variant="solid"
          /> -->
          <UButton 
            block 
            icon="i-lucide-settings" 
            label="System Configuration" 
            color="secondary" 
            variant="ghost"
          />
        </div>
      </UCard>
    </div>
  </div>
</template>