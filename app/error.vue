<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps({
  error: Object as () => NuxtError,
})

const localePath = useLocalePath()
</script>

<template>
  <div>
    <h2>{{ error?.statusCode }}</h2>
    <br>
    <p>Back to <NuxtLink :to="localePath('/')">Home</NuxtLink></p>
  </div>
</template>
