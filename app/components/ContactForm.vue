<script setup>
const toast = useToast();
const loading = ref(false);
const { locales, setLocale } = useI18n();

const formData = ref({
  name: '',
  email: '',
  tel: '',
  subject: 'Maintenance',
  company: '',
  jobTitle: '',
  message: ''
})

function validateForm() {
  const errors = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!formData.value.name || formData.value.name.length < 2) {
    errors.push('Name is required and must be at least 2 characters.');
  }
  if (!formData.value.email || !emailRegex.test(formData.value.email)) {
    errors.push('A valid email address is required.');
  }
  if (!formData.value.tel || formData.value.tel.length < 8) {
    errors.push('Telephone is required and must be at least 8 characters.');
  }
  if (!formData.value.subject) {
    errors.push('Please select a subject.');
  }
  if (!formData.value.message || formData.value.message.length < 10) {
    errors.push('Message is required and must be at least 10 characters.');
  }
  
  return errors;
}

async function onSubmit() {
  loading.value = true;
  try {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      const errorMsg = validationErrors.join('\n');
      toast.add({ title: 'Validation Error', description: errorMsg, color: 'error' });
      loading.value = false;
      return;
    }

    await $fetch('/api/contact', {
      method: 'POST',
      body: formData.value
    });

    toast.add({ title: 'Success', description: 'Your message has been sent!', color: 'success' });
    
    // Reset form
    formData.value = {
      name: '',
      email: '',
      tel: '',
      subject: 'Maintenance',
      company: '',
      jobTitle: '',
      message: ''
    };
    
  } catch (error) {
    const msg = error.data?.message || error.message || 'Something went wrong';
    toast.add({ title: 'Error', description: msg, color: 'error' });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
    <div class="p-8 rounded-xl shadow-sm border border-slate-100 bg-deep-teal-500">
        <h3 class="text-2xl font-bold dark:text-white mb-6">Send a Message</h3>

        <form class="space-y-6" @submit.prevent="onSubmit">
        <div class="grid sm:grid-cols-2 gap-6">
            <UFormField label="Full Name" name="name" required size="lg">
            <UInput v-model="formData.name" />
            </UFormField>
            <UFormField label="Email Address" name="email" required size="lg">
            <UInput v-model="formData.email" type="email" />
            </UFormField>
        </div>
        <div class="grid sm:grid-cols-2 gap-6">
            <UFormField label="Telephone" name="tel" required size="lg">
            <UInput v-model="formData.tel" type="tel" />
            </UFormField>
            <UFormField label="Subject" name="subject" required size="lg">
            <USelect v-model="formData.subject" :items="['Maintenance', 'Installation', 'Sales', 'Others']" placeholder="Select a subject" />
            </UFormField>
        </div>
            <div class="grid sm:grid-cols-2 gap-6">
            <UFormField label="Company" name="company">
            <UInput v-model="formData.company" placeholder="(Optional)" size="lg" />
            </UFormField>
            <UFormField label="Job Title" name="job-title">
            <UInput v-model="formData.jobTitle" placeholder="(Optional)" size="lg" />
            </UFormField>
        </div>
        <div class="w-full">
            <UFormField label="Message" name="message" required size="lg">
            <UTextarea v-model="formData.message" :rows="4" class="w-full" />
            </UFormField>
        </div>
        <div class="sm:col-span-2 flex justify-end">
            <UButton
            type="submit"
            class="dark:text-white hover:bg-action-teal-600 bg-action-teal-500 cursor-pointer"
            size="xl"
            :loading="loading"
            :ui="{ rounded: 'rounded-md' }"
            >
            Send Message
            </UButton>                  
        </div>
            

        </form>
    </div>
</template>