<script setup lang="ts">
const route = useRoute()

useHead({
  meta: [{ property: 'og:title', content: `Aliyaat - ${route.meta.title}` }],
})

</script>
<template>
  <div class="antialiased">
    <AppHeader />
    <MobileOverlay />
    <slot />
    <AppFooter />
  </div>
</template>
