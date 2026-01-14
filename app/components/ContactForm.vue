<script setup>
const toast = useToast();
const loading = ref(false);
const { t } = useI18n();

const subjects = computed(() => [
  { label: t('contact_form.subjects.maintenance'), value: 'Maintenance' },
  { label: t('contact_form.subjects.installation'), value: 'Installation' },
  { label: t('contact_form.subjects.sales'), value: 'Sales' },
  { label: t('contact_form.subjects.others'), value: 'Others' }
])

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
    errors.push(t('contact_form.validation.name_required'));
  }
  if (!formData.value.email || !emailRegex.test(formData.value.email)) {
    errors.push(t('contact_form.validation.email_required'));
  }
  if (!formData.value.tel || formData.value.tel.length < 8) {
    errors.push(t('contact_form.validation.tel_required'));
  }
  if (!formData.value.subject) {
    errors.push(t('contact_form.validation.subject_required'));
  }
  if (!formData.value.message || formData.value.message.length < 10) {
    errors.push(t('contact_form.validation.message_required'));
  }
  
  return errors;
}

async function onSubmit() {
  loading.value = true;
  try {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      const errorMsg = validationErrors.join('\n');
      toast.add({ title: t('contact_form.validation.error_title'), description: errorMsg, color: 'error' });
      loading.value = false;
      return;
    }

    await $fetch('/api/contact', {
      method: 'POST',
      body: formData.value
    });

    toast.add({ title: t('admin.success'), description: t('contact_form.success'), color: 'success' });
    
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
    const msg = error.data?.message || error.message || t('contact_form.error');
    toast.add({ title: t('admin.error'), description: msg, color: 'error' });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
    <div class="p-8 rounded-xl shadow-sm border border-slate-100 bg-deep-teal-500">
        <h3 class="text-2xl font-bold dark:text-white mb-6 rtl:text-right">{{ $t('contact_form.title') }}</h3>

        <form class="space-y-6" @submit.prevent="onSubmit">
        <div class="grid sm:grid-cols-2 gap-6">
            <UFormField :label="$t('contact_form.full_name')" name="name" required size="lg">
            <UInput v-model="formData.name" />
            </UFormField>
            <UFormField :label="$t('contact_form.email_address')" name="email" required size="lg">
            <UInput v-model="formData.email" type="email" />
            </UFormField>
        </div>
        <div class="grid sm:grid-cols-2 gap-6">
            <UFormField :label="$t('contact_form.telephone')" name="tel" required size="lg">
            <UInput v-model="formData.tel" type="tel" />
            </UFormField>
            <UFormField :label="$t('contact_form.subject')" name="subject" required size="lg">
            <USelect v-model="formData.subject" :items="subjects" value-key="value" :placeholder="$t('contact_form.subject_placeholder')" />
            </UFormField>
        </div>
            <div class="grid sm:grid-cols-2 gap-6">
            <UFormField :label="$t('contact_form.company')" name="company">
            <UInput v-model="formData.company" :placeholder="$t('contact_form.optional')" size="lg" />
            </UFormField>
            <UFormField :label="$t('contact_form.job_title')" name="job-title">
            <UInput v-model="formData.jobTitle" :placeholder="$t('contact_form.optional')" size="lg" />
            </UFormField>
        </div>
        <div class="w-full">
            <UFormField :label="$t('contact_form.message')" name="message" required size="lg">
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
            {{ $t('contact_form.send') }}
            </UButton>
        </div>
            

        </form>
    </div>
</template>