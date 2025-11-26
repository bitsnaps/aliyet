<script setup>
// import '~/assets/main.css'

const mobileMenuOpen = useState('mobileMenuOpen', () => false);

</script>

<template>
  <div class="min-h-screen bg-light-gray-200 font-sans text-charcoal-500 overflow-x-hidden">
    <UApp>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UApp>

    <GoToTop />
  </div>
</template>

<style>
/* @import url('~/assets/main.css'); */
</style>
