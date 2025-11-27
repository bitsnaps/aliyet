<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isScrolled = ref(false)

const handleScroll = () => {
  isScrolled.value = document.documentElement.scrollTop > 50
}

onMounted(() => {
  document.addEventListener('scroll', handleScroll)
  handleScroll()
})

onUnmounted(() => {
  document.removeEventListener('scroll', handleScroll)
})

const scrollToTop = () => {
  document.documentElement.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>
<template>
    <!-- Go to Top Button -->
    <transition name="fade">
      <button
        v-if="isScrolled"
        @click="scrollToTop"
        class="fixed bottom-8 right-8 bg-deep-teal-400 hover:bg-deep-teal-500 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-50 cursor-pointer"
        aria-label="Go to top"
      >
        <Icon name="lucide:chevron-up" class="h-6 w-8" />
      </button>
    </transition>    
</template>
