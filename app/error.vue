<script setup>
const props = defineProps({
  error: Object
})

const handleError = () => clearError({ redirect: '/' })
const { contacts } = useSiteData()
</script>

<template>
  <NuxtLayout name="default">
    <UContainer class="py-24 flex flex-col items-center text-center min-h-[60vh] justify-center">
        <!-- Error Code -->
        <h1 class="text-8xl md:text-9xl font-bold text-primary-500 mb-6">{{ error?.statusCode || 'Error' }}</h1>
        
        <!-- Message -->
        <h2 class="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            {{ error?.statusCode === 404 ? 'Page Not Found' : 'Something went wrong' }}
        </h2>
        <p class="text-lg text-gray-600 dark:text-gray-300 mb-10 max-w-lg">
            {{ error?.message || 'We apologize for the inconvenience. The page you are looking for might have been removed or is temporarily unavailable.' }}
        </p>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-4 mb-16">
            <UButton size="xl" @click="handleError" icon="i-lucide-home">
                Go Back Home
            </UButton>
            <UButton size="xl" variant="soft" color="gray" to="#contact" icon="i-lucide-life-buoy">
                Contact Support
            </UButton>
        </div>

        <!-- Contact Info -->
        <div class="grid md:grid-cols-2 gap-6 w-full max-w-2xl">
            <UCard :ui="{ body: { padding: 'p-4 sm:p-6' } }">
                <div class="flex items-center gap-4">
                    <div class="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-full text-primary-600">
                        <UIcon name="i-lucide-phone" class="w-6 h-6" />
                    </div>
                    <div class="text-left">
                        <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">Call us directly</p>
                        <a :href="`tel:${contacts.tel}`" class="text-lg font-bold hover:text-primary-500 transition-colors block break-all">
                            {{ contacts.tel }}
                        </a>
                    </div>
                </div>
            </UCard>

            <UCard :ui="{ body: { padding: 'p-4 sm:p-6' } }">
                <div class="flex items-center gap-4">
                    <div class="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-full text-primary-600">
                        <UIcon name="i-lucide-mail" class="w-6 h-6" />
                    </div>
                    <div class="text-left">
                        <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">Send us an email</p>
                        <a :href="`mailto:${contacts.email}`" class="text-lg font-bold hover:text-primary-500 transition-colors block break-all">
                            {{ contacts.email }}
                        </a>
                    </div>
                </div>
            </UCard>
        </div>
    </UContainer>
  </NuxtLayout>
</template>
