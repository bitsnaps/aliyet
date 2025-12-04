<script setup>
const links = [
  {
    label: 'Dashboard',
    icon: 'i-lucide-layout-dashboard',
    to: '/admin'
  },
  {
    label: 'Machines',
    icon: 'i-lucide-cog',
    to: '/admin/machines'
  },
  {
    label: 'Categories',
    icon: 'i-lucide-folder-tree',
    to: '/admin/categories'
  },
  {
    label: 'Quote Requests',
    icon: 'i-lucide-file-text',
    to: '/admin/quotes'
  },
  {
    label: 'Users',
    icon: 'i-lucide-users',
    to: '/admin/users'
  },
  {
    label: 'Settings',
    icon: 'i-lucide-settings',
    to: '/admin/settings'
  }
]

// perform the logout action according to Nuxt v4
const handleLogout = async () => {
  await useAuth().logout();
  navigateTo('/login')
}
</script>

<template>
  <div class="flex h-screen bg-light-gray-50 dark:bg-charcoal-950 font-sans">
    <!-- Sidebar -->
    <aside class="w-64 flex-shrink-0 bg-deep-teal-900 text-white flex flex-col border-r border-deep-teal-800">
      <div class="p-6 flex items-center gap-3">
        <div class="w-8 h-8 rounded bg-action-teal-500 flex items-center justify-center">
          <UIcon name="i-lucide-wrench" class="text-white w-5 h-5" />
        </div>
        <NuxtLink to="/admin" class="text-white">
          <span class="font-bold text-xl tracking-tight">Admin</span>
        </NuxtLink>
      </div>

      <div class="flex-1 px-4 py-4 overflow-y-auto">
        <UNavigationMenu 
          :links="links" 
          :ui="{
            wrapper: 'space-y-1',
            base: 'group flex items-center gap-3 px-3 py-2.5 rounded-md font-medium text-sm transition-colors',
            padding: '',
            width: '',
            ring: '',
            active: 'text-white bg-deep-teal-800 shadow-sm',
            inactive: 'text-deep-teal-200 hover:text-white hover:bg-deep-teal-800/50',
            icon: {
              base: 'flex-shrink-0 w-5 h-5',
              active: 'text-action-teal-400',
              inactive: 'text-deep-teal-400 group-hover:text-action-teal-400'
            }
          }"
        />
      </div>

      <div class="p-4 border-t border-deep-teal-800">
        <div class="flex items-center gap-3 px-3 py-2">
          <UAvatar icon="i-lucide-user" alt="Admin" size="sm" />
          <div class="text-sm">
            <p class="font-medium text-white">Admin User</p>
            <p class="text-deep-teal-300 text-xs">admin@aliyaat.com</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Header -->
      <header class="bg-white dark:bg-charcoal-900 border-b border-light-gray-200 dark:border-charcoal-800 h-16 flex items-center justify-between px-6 shadow-sm">
        <NuxtLink to="/admin" class="text-white">
          <h1 class="text-lg font-semibold text-charcoal-900 dark:text-white">
            <slot name="title">Dashboard</slot>
          </h1>
        </NuxtLink>
        
        <div class="flex items-center gap-4">
          <UButton 
            color="neutral" 
            variant="ghost" 
            icon="i-lucide-bell" 
            class="text-charcoal-500 hover:text-deep-teal-600"
          />
          <UButton 
            to="/"
            target="_blank"
            variant="soft" 
            label="View Site"
            icon="i-lucide-external-link"
            size="sm"
          />
          <UButton
            icon="i-lucide-log-out"
            color="neutral"
            variant="outline"
            label="Logout"
            size="sm"
            @click="handleLogout"
          />
        </div>
      </header>

      <!-- Page Content -->
      <div class="flex-1 overflow-y-auto p-6 md:p-8">
        <slot />
      </div>
    </main>
  </div>
</template>