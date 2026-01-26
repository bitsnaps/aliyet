<script setup>
definePageMeta({
  layout: 'admin'
})

const toast = useToast()

const { data: settings, pending } = await useFetch('/api/admin/settings')

const items = [{
  label: 'General',
  icon: 'i-lucide-settings',
  slot: 'general'
}, {
  label: 'SEO',
  icon: 'i-lucide-search',
  slot: 'seo'
}, {
  label: 'Notifications',
  icon: 'i-lucide-bell',
  slot: 'notifications'
}]

const form = reactive({
  general: { ...settings.value?.general },
  seo: { ...settings.value?.seo },
  notifications: { ...settings.value?.notifications }
})

const isSaving = ref(false)

const saveSettings = async () => {
  isSaving.value = true
  
  try {
    await $fetch('/api/admin/settings', {
      method: 'PUT',
      body: form
    })
    
    toast.add({
      title: 'Settings saved',
      description: 'Your changes have been saved successfully.',
      color: 'success'
    })
  } catch (error) {
    toast.add({
      title: 'Error',
      description: error.data?.message || 'Failed to save settings.',
      color: 'error'
    })
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold text-charcoal-900 dark:text-white">Settings</h2>
        <p class="text-charcoal-500 text-sm mt-1">Configure global application settings</p>
      </div>
      <UButton 
        icon="i-lucide-save" 
        label="Save Changes" 
        color="primary" 
        size="md"
        :loading="isSaving"
        @click="saveSettings"
      />
    </div>

    <UTabs :items="items" class="w-full">
      <template #general="{ item }">
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold text-charcoal-900 dark:text-white">General Settings</h3>
            <p class="text-sm dark:text-charcoal-300">Basic information about your website.</p>
          </template>
          
          <div class="space-y-4">
            <UFormField label="Site Name" name="siteName">
              <UInput v-model="form.general.siteName" class="w-full" />
            </UFormField>
            
            <UFormField label="Contact Email" name="contactEmail">
              <UInput v-model="form.general.contactEmail" type="email" class="w-full" />
            </UFormField>
            
            <UFormField label="Support Phone" name="supportPhone">
              <UInput v-model="form.general.supportPhone" class="w-full" />
            </UFormField>

            <UFormField label="Address" name="address">
              <UTextarea v-model="form.general.address" class="w-full" autoresize />
            </UFormField>

            <UFormField label="Google Maps Link" name="maps">
              <UInput v-model="form.general.maps" class="w-full" />
            </UFormField>
          </div>
        </UCard>
      </template>

      <template #seo="{ item }">
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold text-charcoal-900 dark:text-white">SEO Configuration</h3>
            <p class="text-sm dark:text-charcoal-300">Manage default search engine optimization settings.</p>
          </template>
          
          <div class="space-y-4">
            <UFormField label="Default Meta Title" name="metaTitle">
              <UInput v-model="form.seo.metaTitle" class="w-full" />
            </UFormField>
            
            <UFormField label="Default Meta Description" name="metaDescription">
              <UTextarea v-model="form.seo.metaDescription" class="w-full" />
            </UFormField>
          </div>
        </UCard>
      </template>

      <template #notifications="{ item }">
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold text-charcoal-900 dark:text-white">Notification Preferences</h3>
            <p class="text-sm dark:text-charcoal-300">Control how and when you receive alerts.</p>
          </template>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="font-medium text-charcoal-900 dark:text-white">Email Notifications</div>
                <div class="text-sm dark:text-charcoal-300">Receive daily summaries via email.</div>
              </div>
              <USwitch v-model="form.notifications.emailNotifications" />
            </div>
            
            <div class="flex items-center justify-between">
              <div>
                <div class="font-medium text-charcoal-900 dark:text-white">New Quote Alerts</div>
                <div class="text-sm dark:text-charcoal-300">Get notified immediately when a new quote is requested.</div>
              </div>
              <USwitch v-model="form.notifications.newQuoteAlerts" />
            </div>
          </div>
        </UCard>
      </template>
    </UTabs>
  </div>
</template>