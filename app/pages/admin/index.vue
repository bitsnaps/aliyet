<script setup>
const { user } = useAuth();

definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

// Fetch dashboard data asynchronously
const { data: dashboard, status, error } = useFetch('/api/admin/dashboard');

const stats = computed(() => [
  { id: 1, label: 'Machines', value: dashboard.value?.stats?.machines || '0', icon: 'i-lucide-monitor-smartphone', color: 'text-action-teal-500', bg: 'bg-action-teal-50' },
  { id: 2, label: 'Quotes', value: dashboard.value?.stats?.quotes || '0', icon: 'i-lucide-inbox', color: 'text-amber-500', bg: 'bg-amber-50' },
  { id: 3, label: 'Clients', value: dashboard.value?.stats?.customers || '0', icon: 'i-lucide-users', color: 'text-deep-teal-500', bg: 'bg-deep-teal-50' },
])

const recentQuotes = computed(() => dashboard.value?.recentQuotes || [])

const columns = [
  { accessorKey: 'client', header: 'Client', enableSorting: true },
  { accessorKey: 'machine', header: 'Machine', enableSorting: true },
  { accessorKey: 'date', header: 'Date', enableSorting: true },
  { accessorKey: 'status', header: 'Status', enableSorting: true },
  { accessorKey: 'actions', header: 'Actions', enableSorting: false }
]

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}
</script>

<template>
  <div class="space-y-6">
    <!-- Welcome Section -->
    <div>
      <h2 class="text-2xl font-bold text-charcoal-900 dark:text-white">Welcome back, {{ user?.username || 'Admin' }}</h2>
      <p class="text-charcoal-500 dark:text-charcoal-300 mt-1">Here's what's happening with your products today.</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UCard v-for="stat in stats" :key="stat.label" class="border-l-4 border-l-deep-teal-500">
        <div class="flex items-center justify-between">
          <div v-if="status === 'pending'" class="space-y-2">
            <USkeleton class="h-4 w-20" />
            <USkeleton class="h-8 w-12" />
          </div>
          <div v-else>
            <p class="text-sm font-medium text-charcoal-500 dark:text-charcoal-300">{{ stat.label }}</p>
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
      <UCard class="lg:col-span-2">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-charcoal-900 dark:text-white">Recent Quotes</h3>
            <UButton size="xs" variant="ghost" color="primary" label="View All" to="/admin/quotes" />
          </div>
        </template>
        
        <UTable 
          :data="recentQuotes" 
          :columns="columns" 
          :loading="status === 'pending'"
        >
          <template #date-cell="{ row }">
            {{ formatDate(row.original.date) }}
          </template>
          <template #status-cell="{ row }">
            <UBadge 
              :color="row.status === 'New' ? 'success' : row.status === 'Pending' ? 'warning' : 'neutral'" 
              variant="subtle"
              size="xs"
            >
              {{ row.original.status }}
            </UBadge>
          </template>
          <template #actions-cell="{ row }">
            <UButton 
              icon="i-lucide-eye" 
              variant="ghost" 
              color="neutral" 
              size="xs" 
              :to="`/admin/quotes/${row.original.id}`"
            />
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
          <UButton 
            block 
            icon="i-lucide-users" 
            label="Manage Users" 
            color="secondary" 
            variant="solid"
            to="/admin/users"
          />
          <UButton 
            block 
            icon="i-lucide-settings" 
            label="System Configuration" 
            color="neutral" 
            variant="ghost"
            to="/admin/settings"
          />
        </div>
      </UCard>
    </div>
  </div>
</template>