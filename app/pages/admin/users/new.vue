<script setup>
definePageMeta({
  layout: 'admin',
})

const user = ref({
  username: '',
  name: '',
  email: '',
  password: '',
  role: 'CUSTOMER',
  active: true,
})
</script>

<template>
  <div>
    <AdminUserForm v-model="user" />
  </div>
</template>