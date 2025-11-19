<script setup>
const mobileMenuOpen = useState('mobileMenuOpen', () => false);
const isScrolled = ref(false);
const navLinks = ref([
    { name: 'About', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Products', href: '#products' },
    { name: 'Contact', href: '#contact' },
]);
</script>

<template>
    <!-- Navigation -->
    <header 
      class="fixed w-full z-50 transition-all duration-300"
      :class="isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-md py-3' : 'bg-transparent py-5'"
    >
      <div class="container mx-auto px-4 md:px-8 flex items-center justify-between">
        <!-- Logo -->
        <a href="#hero" class="flex items-center gap-2">
          <div class="bg-deep-teal text-white p-2 rounded-md">
            <i data-lucide="cog" style="width:28px; height:28px;"></i>
          </div>
          <span 
            class="text-2xl font-extrabold tracking-tight transition-colors"
            :class="isScrolled ? 'text-deep-teal' : 'text-white'"
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
            class="text-sm font-medium hover:text-action-teal transition-colors"
            :class="isScrolled ? 'text-charcoal' : 'text-slate-200'"
          >
            {{ link.name }}
          </a>
        </nav>

        <div class="hidden md:flex items-center gap-4">
          <!-- Language Switcher -->
          <button 
            class="flex items-center gap-1 text-sm font-medium"
            :class="isScrolled ? 'text-charcoal' : 'text-slate-200'"
          >
            <i data-lucide="globe" style="width:18px; height:18px;"></i>
            <span>EN</span>
          </button>
          <a 
            href="#build-price"
            class="bg-action-teal hover:bg-action-teal/90 text-charcoal px-5 py-2.5 rounded-md font-bold text-sm transition-colors shadow-lg shadow-action-teal/20"
          >
            Build & Price
          </a>
        </div>

        <!-- Mobile Menu Toggle -->
        <button 
          class="md:hidden text-action-teal"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <i v-if="!mobileMenuOpen" data-lucide="menu" style="width:28px; height:28px;"></i>
          <i v-else data-lucide="x" style="width:28px; height:28px;"></i>
        </button>
      </div>
    </header>
</template>