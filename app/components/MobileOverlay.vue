<script setup>
const mobileMenuOpen = useState('mobileMenuOpen', () => false);
</script>
<template>
    <!-- Mobile Menu Overlay -->
    <Transition name="fade">
      <div 
        v-if="mobileMenuOpen"
        class="fixed inset-0 z-40 bg-charcoal/95 pt-24 px-6 md:hidden"
      >
        <nav class="flex flex-col gap-6 text-center">
          <a 
            v-for="link in navLinks" 
            :key="link.name" 
            :href="link.href" 
            @click="closeMobileMenu"
            class="text-2xl text-white font-semibold hover:text-action-teal"
          >
            {{ link.name }}
          </a>
          <hr class="border-slate-700 my-4" />
          <button class="text-white flex items-center justify-center gap-2 text-xl">
            <i data-lucide="globe" style="width:20px; height:20px;"></i> EN / FR / AR
          </button>
          <a 
            href="#build-price" 
            @click="closeMobileMenu"
            class="bg-action-teal text-charcoal py-3 rounded-md font-bold text-xl mt-4"
          >
            Build & Price Quote
          </a>
        </nav>
      </div>
    </Transition>    
</template>