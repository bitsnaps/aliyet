<script setup>
const { navLinks } = useSiteData();
const { isOpen, toggle } = useMobileMenu();
const isScrolled = ref(false);
const route = useRoute();

const isSolidHeader = computed(() => isScrolled.value || route.path !== '/')

const { locale, locales, setLocale } = useI18n();
// const switchLocalePath = useSwitchLocalePath()

const items = computed(() => locales.value.map(l => ([{
  label: l.name,
  // to: switchLocalePath(l.code),
  type: 'checkbox',
  checked: locale.value === l.code,
  class: 'font-medium cursor-pointer',
  onSelect: (e) => {
    setLocale(l.code);
    if (locale.value === l.code) {
      e.preventDefault();
    }
  }
}])));

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
      v-show="!route.path.startsWith('/admin')"
      class="fixed w-full z-50 transition-all duration-300"
      :class="isSolidHeader ? 'bg-white/95 backdrop-blur-sm shadow-md py-3' : 'bg-transparent py-5'"
    >
      <div class="container mx-auto px-4 md:px-8 flex items-center justify-between">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2 cursor-pointer">
          <div class="text-white p-2 rounded-md">
            <UIcon name="i-lucide-cog" class="w-7 h-7 text-deep-teal-500" />
          </div>
          <span
            class="text-2xl font-extrabold tracking-tight transition-colors"
            :class="isSolidHeader ? 'text-deep-teal-500' : 'text-white'"
          >
            Aliyaat
          </span>
        </NuxtLink>

        <!-- Desktop Nav -->
        <nav class="hidden md:flex items-center gap-8">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.name"
            :to="link.href"
            class="text-sm font-medium hover:text-action-teal-500 transition-colors"
            :class="isSolidHeader ? 'text-charcoal-500' : 'text-slate-200'"
          >
            {{ link.name }}
          </NuxtLink>
        </nav>

        <div class="hidden md:flex items-center gap-4">
          <!-- Language Switcher -->
          <UDropdownMenu :items="items">
          <UButton
            color="white"
            variant="ghost"
            :class="(isSolidHeader ? 'text-charcoal-500' : 'text-slate-200')"
            class="font-medium cursor-pointer"
          >
              <UIcon name="i-lucide-globe" class="w-5 h-5" />
              <span>{{ locales.find(l => l.code === locale).name }}</span>
            </UButton>
          </UDropdownMenu>
          <UButton
            to="/build-and-price"
            color="action-teal"
            variant="solid"
            :class="(isSolidHeader ? 'text-charcoal-500' : 'text-slate-200')+' font-bold shadow-lg shadow-action-teal-500/20'"
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
