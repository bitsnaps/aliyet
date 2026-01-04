<script setup>
const { services, machineTypes, clients, contacts } = useSiteData();
const selectedMachineForQuote = ref('turning');
const { locales, setLocale } = useI18n();

</script>
<template>
    <main>
      <!-- Hero Section -->
      <section id="hero" class="relative min-h-[90vh] flex items-center pt-20">
        <!-- Background Image Placeholder -->
        <div class="absolute inset-0 bg-charcoal-500">
           <div class="absolute inset-0 bg-[url('/images/background.jpg')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
           <div class="absolute inset-0 bg-gradient-to-r from-charcoal-500 via-deep-teal-500/70 to-transparent"></div>
        </div>

        <div class="container mx-auto px-4 md:px-8 relative z-10">
          <div class="grid md:grid-cols-2 gap-8 items-center">
            <div class="max-w-3xl animate-fade-in-right">
              <h1 class="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight font-heading">
                <!-- Keep Your Factory <span class="text-action-teal-500">Running</span> -->
                 {{ $t('slogan') }}
              </h1>
              <p class="mt-6 text-xl text-slate-300 max-w-xl leading-relaxed">
                {{ $t('hero.description') }}
              </p>
              <div class="mt-10 mb-2 flex flex-col sm:flex-row gap-4">
                <UButton
                  to="#services"
                  size="xl"
                  color="deep-teal"
                  variant="solid"
                  class="font-bold text-white text-lg px-8 py-4 hover:text-slate-900 hover:bg-slate-100 border-2"
                  :ui="{ rounded: 'rounded-md' }"
                >
                  {{ $t('hero.explore_services') }} <UIcon name="i-lucide-arrow-right" class="w-5 h-5 ml-2" />
                </UButton>
                <UButton
                  to="#build-price"
                  size="xl"
                  color="white"
                  variant="outline"
                  class="font-bold text-lg px-8 py-4 text-white hover:text-slate-900 hover:bg-slate-100 border-2"
                  :ui="{ rounded: 'rounded-md' }"
                >
                  {{ $t('hero.get_quote') }}
                </UButton>
              </div>
            </div>
            <div class="hidden md:block">
                <img src="/images/machine01.png" alt="Industrial Machine" class="rounded-lg shadow-2xl mix-blend-multiply" width="80%">
            </div>
          </div>
        </div>
      </section>

      <!-- Trust Signals -->
      <div class="bg-white py-8 border-b border-slate-200">
        <div class="container mx-auto px-4 md:px-8">
          <p class="text-center text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">{{ $t('trust.title') }}</p>
          <div class="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            <!-- Logo Placeholders -->
            <div v-for="client in clients" :key="client.name" class="h-32 w-32 bg-white rounded-md flex items-center justify-center">
              <img :src="client.logo" :alt="client.name" class="max-h-full max-w-full object-contain">
            </div>
          </div>
        </div>
      </div>

      <!-- About Us Section -->
      <section id="about" class="py-20 md:py-32 bg-white">
        <div class="container mx-auto px-4 md:px-8 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h4 class="text-deep-teal-500 font-bold uppercase tracking-wider mb-4">{{ $t('about.subtitle') }}</h4>
            <h2 class="text-4xl font-bold text-slate-900 mb-6 leading-tight">{{ $t('about.title') }}</h2>
            <p class="text-lg text-slate-600 mb-6 leading-relaxed">
              {{ $t('about.description') }}
            </p>
            <ul class="space-y-3">
              <li class="flex items-center gap-3 text-slate-700 font-medium">
                <UIcon name="i-lucide-check-circle-2" class="w-5 h-5 text-action-teal-500" />
                {{ $t('about.features.certified') }}
              </li>
              <li class="flex items-center gap-3 text-slate-700 font-medium">
                <UIcon name="i-lucide-check-circle-2" class="w-5 h-5 text-action-teal-500" />
                {{ $t('about.features.rapid') }}
              </li>
              <li class="flex items-center gap-3 text-slate-700 font-medium">
                <UIcon name="i-lucide-check-circle-2" class="w-5 h-5 text-action-teal-500" />
                {{ $t('about.features.transparent') }}
              </li>
            </ul>
          </div>
          <div class="relative h-96 bg-slate-200 rounded-2xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=2730&auto=format&fit=crop"
              alt="Industrial technicians working"
              class="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      <!-- Services Section -->
      <section id="services" class="py-20 md:py-32 bg-slate-50">
        <div class="container mx-auto px-4 md:px-8">
          <!-- Section Heading Inline -->
          <div class="mb-12 text-center text-slate-900">
            <h2 class="text-3xl md:text-4xl font-bold tracking-tight">
              {{ $t('services.title') }}
            </h2>
            <p class="mt-4 text-lg max-w-2xl mx-auto text-slate-600">
              {{ $t('services.description') }}
            </p>
            <div class="mt-4 mx-auto h-1 w-24 rounded bg-deep-teal-500"></div>
          </div>

          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <!-- Service Cards Loop -->
            <div
              v-for="(service, idx) in services"
              :key="idx"
              class="bg-white p-6 rounded-xl shadow-md border border-slate-100 hover:shadow-xl transition-shadow duration-300 flex flex-col h-full"
            >
              <div class="h-12 w-12 bg-action-teal-500/20 text-deep-teal-500 rounded-lg flex items-center justify-center mb-6">
                 <UIcon :name="service.icon" class="w-6 h-6" />
              </div>
              <h3 class="text-xl font-bold text-slate-900 mb-3">{{ service.title }}</h3>
              <p class="text-slate-600 flex-grow">{{ service.description }}</p>
              <a href="#contact" class="mt-6 text-deep-teal-500 font-semibold flex items-center group">
                {{ $t('services.inquire_now') }}
                <UIcon name="i-lucide-arrow-right" class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            <!-- CTA Card -->
            <div class="bg-deep-teal-500 p-6 rounded-xl shadow-md flex flex-col justify-center items-center text-center text-white">
              <h3 class="text-2xl font-bold mb-4">{{ $t('services.cta_title') }}</h3>
              <p class="text-light-gray-200 mb-8">{{ $t('services.cta_description') }}</p>
              <UButton
                to="#contact"
                color="action-teal"
                variant="solid"
                class="font-bold text-white w-full justify-center py-3 border border-action-teal-500 hover:bg-action-teal-500/90"
                size="lg"
              >
                {{ $t('services.contact_us') }}
              </UButton>
            </div>
          </div>
        </div>
      </section>

      <!-- Products Catalog Teaser -->
      <section id="products" class="py-20 md:py-32 bg-white">
        <div class="container mx-auto px-4 md:px-8">
          <div class="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{{ $t('products.title') }}</h2>
              <p class="text-lg text-slate-600 max-w-2xl">{{ $t('products.description') }}</p>
            </div>
            <UButton
              to="/catalog"
              variant="ghost"
              color="deep-teal"
              class="hidden md:flex items-center font-bold text-deep-teal-500 hover:text-action-teal-500 transition-colors mt-4 md:mt-0"
            >
              {{ $t('products.view_catalog') }} <UIcon name="i-lucide-arrow-right" class="w-5 h-5 ml-2" />
            </UButton>
          </div>

          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Machine Cards -->
            <div
              v-for="(machine, idx) in [
                { key: 'turning_centers', label: $t('products.machine_types.turning_centers') },
                { key: 'machining_centers', label: $t('products.machine_types.machining_centers') },
                { key: 'edm_machines', label: $t('products.machine_types.edm_machines') }
              ]"
              :key="idx"
              class="group relative overflow-hidden rounded-2xl bg-charcoal-500 aspect-[4/3]"
            >
              <div class="absolute inset-0 bg-slate-800 flex items-center justify-center text-slate-600">
                 <UIcon name="i-lucide-factory" class="w-12 h-12 opacity-20" />
              </div>
              <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-80 md:opacity-60 group-hover:opacity-90 transition-opacity duration-300"></div>
              
              <div class="absolute bottom-0 left-0 p-6 w-full">
                <h3 class="text-white text-2xl font-bold mb-2">{{ machine.label }}</h3>
                <div class="h-0 overflow-hidden group-hover:h-auto group-hover:mt-4 transition-all duration-300">
                  <UButton
                    to="/catalog"
                    color="action-teal"
                    variant="solid"
                    class="font-bold light:text-charcoal-500 text-action-teal-500"
                    size="sm"
                  >
                    {{ $t('products.configure_price') }} <UIcon name="i-lucide-arrow-right" class="w-4 h-4 ml-2" />
                  </UButton>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-8">
            <UButton
              to="/catalog"
              variant="outline"
              color="deep-teal"
              class="flex items-center justify-center font-bold w-full py-3"
            >
              {{ $t('products.view_catalog') }} <UIcon name="i-lucide-arrow-right" class="w-5 h-5 ml-2" />
            </UButton>
          </div>
        </div>
      </section>

      <!-- Build & Price Feature Section -->
      <section id="build-price" class="py-20 bg-charcoal-500 text-white relative overflow-hidden">
        <!-- Abstract industrial background shapes -->
        <div class="absolute top-0 right-0 -mt-24 -mr-24 text-deep-teal-500/20">
          <UIcon name="i-lucide-cog" class="w-[400px] h-[400px]" />
        </div>
        
        <div class="container mx-auto px-4 md:px-8 relative z-10">
          <div class="grid lg:grid-cols-5 gap-12 items-center">
            <div class="lg:col-span-2">
              <span class="inline-block py-1 px-3 rounded-full bg-action-teal-500/20 text-action-teal-500 text-sm font-bold mb-6">
                {{ $t('build_price.badge') }}
              </span>
              <h2 class="text-4xl md:text-5xl font-bold mb-6 leading-tight">{{ $t('build_price.title') }}</h2>
              <p class="text-lg text-light-gray-200 mb-8">
                {{ $t('build_price.description') }}
              </p>
              <ul class="space-y-4 text-light-gray-200 mb-8">
                <li class="flex items-center gap-3"><div class="bg-charcoal-500 p-1 rounded-full text-action-teal-500 font-bold w-6 h-6 flex items-center justify-center text-xs">1</div> {{ $t('build_price.steps.step1') }}</li>
                <li class="flex items-center gap-3"><div class="bg-charcoal-500 p-1 rounded-full text-action-teal-500 font-bold w-6 h-6 flex items-center justify-center text-xs">2</div> {{ $t('build_price.steps.step2') }}</li>
                <li class="flex items-center gap-3"><div class="bg-charcoal-500 p-1 rounded-full text-action-teal-500 font-bold w-6 h-6 flex items-center justify-center text-xs">3</div> {{ $t('build_price.steps.step3') }}</li>
              </ul>
            </div>

            <!-- Interactive Widget Entry Point -->
            <div class="lg:col-span-3 bg-white text-slate-900 rounded-2xl p-6 md:p-8 shadow-2xl">
              <h3 class="text-2xl font-bold mb-6">{{ $t('build_price.widget.title') }}</h3>
              
              <div class="space-y-6">
                <div>
                  <label class="block text-sm font-bold text-slate-700 mb-2">{{ $t('build_price.widget.step1_label') }}</label>
                  <div class="grid sm:grid-cols-3 gap-3">
                    <button
                      v-for="type in machineTypes"
                      :key="type.id"
                      @click="selectedMachineForQuote = type.id"
                      class="py-4 px-3 rounded-lg border-2 font-medium text-sm transition-all cursor-pointer"
                      :class="selectedMachineForQuote === type.id
                        ? 'border-deep-teal-500 bg-light-gray-200 text-deep-teal-500'
                        : 'border-medium-gray-900 hover:border-medium-gray-500/70 text-medium-gray-900 bg:text-teal-600'"
                    >
                      {{ type.label }}
                    </button>
                  </div>
                </div>

                <div class="p-4 bg-slate-50 rounded-lg border border-slate-200 flex gap-4 items-start">
                  <div class="bg-action-teal-500/20 p-2 rounded-full text-deep-teal-500 mt-1">
                    <UIcon name="i-lucide-settings" class="w-5 h-5" />
                  </div>
                  <div>
                    <h4 class="font-bold text-slate-900">{{ $t('build_price.widget.ready_title') }}</h4>
                    <p class="text-sm text-slate-600">{{ $t('build_price.widget.ready_description') }}</p>
                  </div>
                </div>

                <UButton
                  to="/build-and-price"
                  :disabled="!selectedMachineForQuote"
                  color="action-teal"
                  variant="solid"
                  class="font-bold text-charcoal-500 text-lg w-full justify-center py-4 border-2 border-charcoal-500 cursor-pointer"
                  size="xl"
                >
                  {{ $t('build_price.widget.continue') }} <UIcon name="i-lucide-arrow-right" class="w-5 h-5 ml-2" />
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Contact Section -->
      <section id="contact" class="py-20 md:py-32 bg-slate-50">
        <UCard class="container mx-auto px-4 md:px-8">
          <div class="mb-12 text-center text-slate-900">
            <h2 class="text-3xl md:text-4xl font-bold tracking-tight dark:text-white">{{ $t('contact.title') }}</h2>
            <p class="mt-4 text-lg max-w-2xl mx-auto text-slate-600">
              {{ $t('contact.description') }}
            </p>
            <div class="mt-4 mx-auto h-1 w-24 rounded bg-deep-teal-500"></div>
          </div>

          <div class="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <!-- Contact Info -->
            <div class="space-y-8">
              <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start gap-4">
                <div class="bg-action-teal-500/20 p-3 rounded-lg text-deep-teal-500">
                  <UIcon name="i-lucide-phone" class="w-6 h-6" />
                </div>
                <div>
                  <h4 class="font-bold text-lg text-slate-900">{{ $t('contact.call_us') }}</h4>
                  <p class="text-slate-600">{{ $t('contact.call_us_description') }}</p>
      <a :href="`tel:${contacts.tel.replaceAll(' ','').replaceAll('(0)','')}`" class="text-deep-teal-500 font-semibold mt-1 block hover:underline">{{ contacts.tel }}</a>
                </div>
              </div>
              <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start gap-4">
                <div class="bg-action-teal-500/20 p-3 rounded-lg text-deep-teal-500">
                  <UIcon name="i-lucide-mail" class="w-6 h-6" />
                </div>
                <div>
                  <h4 class="font-bold text-lg text-slate-900">{{ $t('contact.email_us') }}</h4>
                  <p class="text-slate-600">{{ $t('contact.email_us_description') }}</p>
                  <a :href="`mailto:${contacts.email}`" class="text-deep-teal-500 font-semibold mt-1 block hover:underline">{{ contacts.email }}</a>
                </div>
              </div>
              <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-start gap-4">
                <div class="bg-action-teal-500/20 p-3 rounded-lg text-deep-teal-500">
                  <UIcon name="i-lucide-map-pin" class="w-6 h-6" />
                </div>
                <div>
                  <h4 class="font-bold text-lg text-slate-900">{{ $t('contact.visit_us') }}</h4>
                  <p class="text-slate-600">{{ contacts.address }}</p>
                  <a :href="contacts.maps" class="text-deep-teal-500 font-semibold mt-1 block hover:underline">{{ $t('contact.get_directions') }}</a>
                </div>
              </div>
            </div>
            
            <!-- Contact Form -->
            <ContactForm />
          </div>
        </UCard>
      </section>
    </main>
</template>
