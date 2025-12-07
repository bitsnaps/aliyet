<script setup>
definePageMeta({
  layout: 'admin'
})

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

const saveSettings = async () => {
  // TODO: Implement save logic
  console.log('Saving settings:', form)
  const toast = useToast()
  toast.add({ title: 'Settings saved', description: 'Your changes have been saved successfully.' })
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
        @click="saveSettings"
      />
    </div>

    <UTabs :items="items" class="w-full">
      <template #general="{ item }">
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold text-charcoal-900 dark:text-white">General Settings</h3>
            <p class="text-sm text-charcoal-500">Basic information about your website.</p>
          </template>
          
          <div class="space-y-4">
            <UFormField label="Site Name" name="siteName">
              <UInput v-model="form.general.siteName" />
            </UFormField>
            
            <UFormField label="Contact Email" name="contactEmail">
              <UInput v-model="form.general.contactEmail" type="email" />
            </UFormField>
            
            <UFormField label="Support Phone" name="supportPhone">
              <UInput v-model="form.general.supportPhone" />
            </UFormField>
          </div>
        </UCard>
      </template>

      <template #seo="{ item }">
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold text-charcoal-900 dark:text-white">SEO Configuration</h3>
            <p class="text-sm text-charcoal-500">Manage default search engine optimization settings.</p>
          </template>
          
          <div class="space-y-4">
            <UFormField label="Default Meta Title" name="metaTitle">
              <UInput v-model="form.seo.metaTitle" />
            </UFormField>
            
            <UFormField label="Default Meta Description" name="metaDescription">
              <UTextarea v-model="form.seo.metaDescription" />
            </UFormField>
          </div>
        </UCard>
      </template>

      <template #notifications="{ item }">
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold text-charcoal-900 dark:text-white">Notification Preferences</h3>
            <p class="text-sm text-charcoal-500">Control how and when you receive alerts.</p>
          </template>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="font-medium text-charcoal-900 dark:text-white">Email Notifications</div>
                <div class="text-sm text-charcoal-500">Receive daily summaries via email.</div>
              </div>
              <USwitch v-model="form.notifications.emailNotifications" />
            </div>
            
            <div class="flex items-center justify-between">
              <div>
                <div class="font-medium text-charcoal-900 dark:text-white">New Quote Alerts</div>
                <div class="text-sm text-charcoal-500">Get notified immediately when a new quote is requested.</div>
              </div>
              <USwitch v-model="form.notifications.newQuoteAlerts" />
            </div>
          </div>
        </UCard>
      </template>
    </UTabs>
  </div>
</template>