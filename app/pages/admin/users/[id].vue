<script setup>
definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const userId = route.params.id

const { data: user, pending, error } = await useFetch(`/api/admin/users/${userId}`, {
  lazy: true,
  transform: (response) => response.data,
  server: false,
})

</script>

<template>
  <div>
    <div v-if="pending">Loading...</div>
    <div v-else-if="error">Error loading user</div>
    <AdminUserForm v-else v-model="user" />
  </div>
</template>