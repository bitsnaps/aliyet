<script setup>
const { navLinks } = useSiteData();
const { isOpen, close } = useMobileMenu();
</script>
<template>
    <!-- Mobile Menu Overlay -->
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-40 bg-charcoal-500/95 pt-24 px-6 md:hidden"
      >
        <nav class="flex flex-col gap-6 text-center">
          <a
            v-for="link in navLinks"
            :key="link.name"
            :href="link.href"
            @click="close"
            class="text-2xl text-white font-semibold hover:text-action-teal-500"
          >
            {{ link.name }}
          </a>
          <hr class="border-slate-700 my-4" />
          <button class="text-white flex items-center justify-center gap-2 text-xl">
            <UIcon name="i-lucide-globe" class="w-5 h-5" /> EN / FR / AR
          </button>
          <UButton
            to="#build-price"
            @click="close"
            color="action-teal"
            variant="solid"
            class="font-bold text-charcoal-500 text-xl mt-4 justify-center py-3"
            size="xl"
            block
          >
            Build & Price Quote
          </UButton>
        </nav>
      </div>
    </Transition>
</template>