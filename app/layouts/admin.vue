<script setup>

const { user } = useAuth();

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
    label: 'Specifications',
    icon: 'i-lucide-list',
    to: '/admin/specifications'
  },
  {
    label: 'Categories',
    icon: 'i-lucide-folder-tree',
    to: '/admin/categories'
  },
  {
    label: 'Config Groups',
    icon: 'i-lucide-library',
    to: '/admin/config-groups'
  },
  {
    label: 'Configurations',
    icon: 'i-lucide-wrench',
    to: '/admin/configs'
  },
  {
    label: 'Quote Requests',
    icon: 'i-lucide-file-text',
    to: '/admin/quotes'
  },
  {
    label: 'Optional Additions',
    icon: 'i-lucide-plus-circle',
    to: '/admin/optional-additions'
  },
  {
    label: 'Optional Replacements',
    icon: 'i-lucide-replace',
    to: '/admin/optional-replacements'
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

// Sidebar state
const { isMobile } = useResponsive();
const isSidebarOpen = ref(!isMobile.value);

watch(isMobile, (newVal) => {
  isSidebarOpen.value = !newVal;
});

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

// perform the logout action according to Nuxt v4
const handleLogout = async () => {
  await useAuth().logout();
  navigateTo('/login')
}
</script>

<template>
  <div class="flex h-screen bg-light-gray-50 dark:bg-charcoal-950 font-sans">
    <!-- Sidebar -->
    <aside
      class="flex-shrink-0 bg-deep-teal-900 text-white flex flex-col border-r border-deep-teal-800 transition-all duration-300 ease-in-out"
      :class="isSidebarOpen ? 'w-64' : 'w-0'"
    >
      <div :class="isSidebarOpen ?'p-6 flex items-center gap-3 overflow-hidden':'hidden'">
        <div class="w-8 h-8 rounded bg-action-teal-500 hover:bg-action-teal-600 flex items-center justify-center flex-shrink-0 cursor-pointer">
          <UIcon name="i-lucide-home" class="text-white w-5 h-5" />
        </div>
        <NuxtLink to="/" class="text-white whitespace-nowrap">
          <span class="font-bold text-xl tracking-tight">Home</span>
        </NuxtLink>
      </div>

      <div
        class="flex-1 overflow-y-auto transition-all duration-300"
        :class="isSidebarOpen ? 'px-4 py-4' : 'p-0'"
      >
        <UNavigationMenu
          v-if="isSidebarOpen"
          :items="links"
          orientation="vertical"
        />
      </div>

      <div :class="isSidebarOpen ?'p-4 border-t border-deep-teal-800 overflow-hidden':'hidden'">
        <div class="flex items-center gap-3 px-3 py-2 whitespace-nowrap">
          <UAvatar icon="i-lucide-user" alt="User" size="sm" />
          <div class="text-sm">
            <p class="font-medium text-white">{{ user?.username?.includes('@')?user?.username.split('@')[0]:user?.username }}</p>
            <p class="text-deep-teal-300 text-xs">{{ user?.email }}</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Header -->
      <header class="bg-white dark:bg-charcoal-900 border-b border-light-gray-200 dark:border-charcoal-800 h-16 flex items-center justify-between px-6 shadow-sm flex-shrink-0">
        <div class="flex items-center gap-4">
          <UButton
            color="neutral"
            variant="ghost"
            :icon="isSidebarOpen ? 'i-lucide-panel-left-close' : 'i-lucide-panel-left-open'"
            class="!hidden lg:!flex cursor-pointer"
            @click="toggleSidebar"
          />
           <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-menu"
            class="lg:!hidden"
            @click="toggleSidebar"
          />
          <h1 class="text-lg font-semibold text-charcoal-900 dark:text-white">
            <NuxtLink to="/admin">
              <slot name="title">Dashboard</slot>
            </NuxtLink>
          </h1>
        </div>
        
        <div class="flex items-center gap-4">
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-bell"
            class="cursor-pointer"
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
            class="cursor-pointer"
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