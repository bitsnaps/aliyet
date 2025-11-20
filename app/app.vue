<script setup>
// import '~/assets/main.css'

const contacts = useState('contacts', () => {
    return {
      email: 'contact@aliyaat.net',
      tel: '+213 (0) 555 123 456',
      address: 'Coop. El Amel Lot 77, Ain Naadja, Algiers, Algeria',
      maps: 'https://maps.app.goo.gl/hT4EHyToxyobWgqr5'
  }
});

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