<script setup>
// import { object, string, ref as yupRef } from 'yup'
import * as v from 'valibot';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const toast = useToast()
const router = useRouter()
const isEditing = computed(() => !!props.modelValue.id)
const isSaving = ref(false)

const state = reactive({ ...props.modelValue })

const roles = ['ADMIN', 'SALES', 'CUSTOMER']

const schema = v.object({
  name: v.string([v.required('Full name is required')]),
  username: v.string([v.required('Username is required')]),
  email: v.string([v.required('Email is required'), v.email('Invalid email format')]),
  password: v.optional(v.string([v.minLength(8, 'Password must be at least 8 characters long')])),
  confirmPassword: v.optional(v.string()),
  role: v.string([v.required('Role is required')]),
}, [
  v.forward(
    (data) => {
      if (!isEditing.value && !data.password) {
        return {
          type: 'custom',
          path: ['password'],
          message: 'Password is required for new users',
        };
      }
      return null;
    },
    ['password']
  ),
  v.forward(
    (data) => {
      if (data.password !== data.confirmPassword) {
        return {
          type: 'custom',
          path: ['confirmPassword'],
          message: 'Passwords must match',
        };
      }
      return null;
    },
    ['confirmPassword']
  ),
])

watch(() => props.modelValue, (newValue) => {
  Object.assign(state, newValue)
}, { deep: true, immediate: true })

const handleFormSubmit = async () => {
  isSaving.value = true
  const method = isEditing.value ? 'PUT' : 'POST'
  const url = isEditing.value ? `/api/admin/users/${props.modelValue.id}` : '/api/admin/users'

  // Exclude confirmPassword from the payload
  const { confirmPassword, ...payload } = state

  try {
    const response = await $fetch(url, {
      method,
      body: payload
    })

    if (response.success) {
      toast.add({
        title: isEditing.value ? 'User Updated' : 'User Created',
        color: 'success'
      })
      router.push('/admin/users')
    } else {
      toast.add({ title: 'Error saving user', description: response.message, color: 'error' })
    }
  } catch (err) {
    const errorMsg = err.data?.statusMessage || 'An unknown error occurred.'
    toast.add({ title: 'Operation Failed', description: errorMsg, color: 'error' })
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <UForm :state="state" :schema="schema" @submit="handleFormSubmit">
    <UCard>
      <template #header>
        <h2 class="text-xl font-bold dark:text-white">{{ isEditing ? 'Edit User' : 'Add New User' }}</h2>
      </template>

      <div class="space-y-4">
        <UFormField label="Full Name" name="name" required>
          <UInput v-model="state.name" class="w-full" />
        </UFormField>

        <UFormField label="Username" name="username" required>
          <UInput v-model="state.username" class="w-full" />
        </UFormField>

        <UFormField label="Email" name="email" required>
          <UInput v-model="state.email" type="email" class="w-full" />
        </UFormField>

        <UFormField :label="isEditing ? 'New Password (optional)' : 'Password'" name="password" required>
          <UInput v-model="state.password" type="password" class="w-full" />
        </UFormField>

        <UFormField label="Confirm Password" name="confirmPassword">
          <UInput v-model="state.confirmPassword" type="password" class="w-full" />
        </UFormField>

        <UFormField label="Role" name="role" required>
          <USelectMenu v-model="state.role" :items="roles" class="w-full" />
        </UFormField>
        
        <UFormField label="Status" name="active">
          <USwitch v-model="state.active" />
        </UFormField>
      </div>

      <template #footer>
        <div class="flex justify-end gap-3">
          <UButton label="Cancel" color="neutral" variant="soft" @click="router.back()" />
          <UButton type="submit" :label="isEditing ? 'Save Changes' : 'Create User'" color="primary" :loading="isSaving" />
        </div>
      </template>
    </UCard>
  </UForm>
</template>