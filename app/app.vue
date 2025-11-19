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
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <GoToTop />
  </div>
</template>

<style>
/* @import url('~/assets/main.css'); */
</style>