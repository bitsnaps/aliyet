<script setup>
const { contacts } = useSiteData();
</script>
<template>
    <!-- Footer -->
    <footer class="bg-charcoal-500 text-slate-400">
      <div class="container mx-auto px-4 md:px-8 py-16">
        <div class="grid md:grid-cols-4 lg:grid-cols-5 gap-12">
          <div class="lg:col-span-2">
            <a href="/" class="flex items-center gap-2 mb-4">
              <div class="text-white p-2 rounded-md">
                 <img src="/logo.svg" class="w-12 h-12" />
              </div>
              <span class="text-2xl font-extrabold tracking-tight text-white">Aliyaat</span>
            </a>
            <p class="text-slate-400 max-w-sm">
              {{ $t('footer.description') }}
            </p>
            <p class="text-slate-400 max-w-sm mt-4">
              <strong>Email:</strong> <a :href="`mailto:${contacts.email}`" class="hover:underline">{{ contacts.email }}</a>
            </p>
            <p class="text-slate-400 max-w-sm mt-4">
    <strong>Tel:</strong> <a :href="`tel:${contacts.tel.replaceAll(' ','').replaceAll('(0)','')}`" class="hover:underline">{{ contacts.tel }}</a>
   </p>
          </div>

          <div>
            <h4 class="font-bold text-white mb-4">{{ $t('footer.company') }}</h4>
            <ul class="space-y-3">
              <li><a href="/#about" class="hover:text-white">{{ $t('nav.about') }}</a></li>
              <li><a href="/#services" class="hover:text-white">{{ $t('nav.services') }}</a></li>
              <li><a href="/#products" class="hover:text-white">{{ $t('nav.products') }}</a></li>
              <li><a href="/catalog" class="hover:text-white">{{ $t('nav.catalog') }}</a></li>
            </ul>
          </div>

          <div>
            <h4 class="font-bold text-white mb-4">{{ $t('footer.support') }}</h4>
            <ul class="space-y-3">
              <li><a href="/#contact" class="hover:text-white">{{ $t('nav.contact') }}</a></li>
              <li><a href="#" class="hover:text-white">{{ $t('footer.faq') }}</a></li>
              <li><a href="#" class="hover:text-white">{{ $t('footer.terms') }}</a></li>
            </ul>
          </div>

          <div>
            <h4 class="font-bold text-white mb-4">{{ $t('footer.follow_us') }}</h4>
            <div class="flex gap-2">
              <a href="#" class="bg-slate-800 hover:bg-slate-700 p-2 rounded-md flex items-center justify-center"><UIcon name="i-lucide-twitter" class="w-5 h-5" /></a>
              <a href="#" class="bg-slate-800 hover:bg-slate-700 p-2 rounded-md flex items-center justify-center"><UIcon name="i-lucide-linkedin" class="w-5 h-5" /></a>
              <a href="#" class="bg-slate-800 hover:bg-slate-700 p-2 rounded-md flex items-center justify-center"><UIcon name="i-lucide-facebook" class="w-5 h-5" /></a>
              <a href="#" class="bg-slate-800 hover:bg-slate-700 p-2 rounded-md flex items-center justify-center"><UIcon name="i-lucide-instagram" class="w-5 h-5" /></a>
              <a href="#" class="bg-slate-800 hover:bg-slate-700 p-2 rounded-md flex items-center justify-center"><UIcon name="i-lucide-music-2" class="w-5 h-5" /></a>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-charcoal-500 py-4">
        <div class="container mx-auto px-4 md:px-8 text-center text-sm">
          <p>&copy; {{ new Date().getFullYear() }} Aliyaat. {{ $t('footer.rights') }}</p>
        </div>
      </div>
    </footer>
</template>
