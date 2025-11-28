<script setup>
const { navLinks } = useSiteData();
const { isOpen, toggle } = useMobileMenu();
const isScrolled = ref(false);
const route = useRoute()

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
    <!-- Navigation -->
    <header
      v-show="route.path!='/login'"
      class="fixed w-full z-50 transition-all duration-300"
      :class="isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-md py-3' : 'bg-transparent py-5'"
    >
      <div class="container mx-auto px-4 md:px-8 flex items-center justify-between">
        <!-- Logo -->
        <a href="#" class="flex items-center gap-2">
          <div class="text-white p-2 rounded-md">
            <UIcon name="i-lucide-cog" class="w-7 h-7 text-deep-teal-500" />
          </div>
          <span
            class="text-2xl font-extrabold tracking-tight transition-colors"
            :class="isScrolled ? 'text-deep-teal-500' : 'text-white'"
          >
            ALIYET
          </span>
        </a>

        <!-- Desktop Nav -->
        <nav class="hidden md:flex items-center gap-8">
          <a
            v-for="link in navLinks"
            :key="link.name"
            :href="link.href"
            class="text-sm font-medium hover:text-action-teal-500 transition-colors"
            :class="isScrolled ? 'text-charcoal-500' : 'text-slate-200'"
          >
            {{ link.name }}
          </a>
        </nav>

        <div class="hidden md:flex items-center gap-4">
          <!-- Language Switcher -->
          <button
            class="flex items-center gap-1 text-sm font-medium"
            :class="isScrolled ? 'text-charcoal-500' : 'text-slate-200'"
          >
            <UIcon name="i-lucide-globe" class="w-5 h-5" />
            <span>EN</span>
          </button>
          <UButton
            to="#build-price"
            color="action-teal"
            variant="solid"
            :class="(isScrolled ? 'text-charcoal-500' : 'text-slate-200')+' font-bold shadow-lg shadow-action-teal-500/20'"
            size="lg"
          >
            Build & Price
          </UButton>
        </div>

        <!-- Mobile Menu Toggle -->
        <button
          class="md:hidden text-action-teal-500"
          @click="toggle"
        >
          <UIcon v-if="!isOpen" name="i-lucide-menu" class="w-7 h-7" />
          <UIcon v-else name="i-lucide-x" class="w-7 h-7" />
        </button>
      </div>
    </header>
</template>