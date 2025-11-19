<script setup>
const isScrolled = ref(false);
    const handleScroll = () => {
      isScrolled.value = window.scrollY > 50;
    };
    
    const closeMobileMenu = () => {
      mobileMenuOpen.value = false;
    };
    
    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
</script>
<template>
    <!-- Go to Top Button -->
    <transition name="fade">
      <button
        v-if="isScrolled"
        @click="scrollToTop"
        class="fixed bottom-8 right-8 bg-deep-teal/80 hover:bg-deep-teal text-white p-3 rounded-full shadow-lg transition-all duration-300 z-50"
        aria-label="Go to top"
      >
        <i data-lucide="chevron-up" style="width:24px; height:24px;"></i>
      </button>
    </transition>    
</template>