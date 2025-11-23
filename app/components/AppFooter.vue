<script setup>
const { contacts } = useSiteData();
</script>
<template>
    <!-- Footer -->
    <footer class="bg-charcoal-500 text-slate-400">
      <div class="container mx-auto px-4 md:px-8 py-16">
        <div class="grid md:grid-cols-4 lg:grid-cols-5 gap-12">
          <div class="lg:col-span-2">
            <a href="#hero" class="flex items-center gap-2 mb-4">
              <div class="bg-deep-teal-500 text-white p-2 rounded-md">
                <UIcon name="i-lucide-cog" class="w-7 h-7" />
              </div>
              <span class="text-2xl font-extrabold tracking-tight text-white">ALIYET</span>
            </a>
            <p class="text-slate-400 max-w-sm">
              Your partner in industrial maintenance and machine procurement, ensuring your operations run smoothly and efficiently.
            </p>
            <p class="text-slate-400 max-w-sm mt-4">
              <strong>Email:</strong> <a :href="`mailto:${contacts.email}`" class="hover:underline">{{ contacts.email }}</a>
            </p>
            <p class="text-slate-400 max-w-sm mt-4">
				<strong>Tel:</strong> <a :href="`tel:${contacts.tel.replaceAll(' ','').replaceAll('(0)','')}`" class="hover:underline">{{ contacts.tel }}</a>
			</p>
          </div>

          <div>
            <h4 class="font-bold text-white mb-4">Company</h4>
            <ul class="space-y-3">
              <li><a href="#about" class="hover:text-white">About Us</a></li>
              <li><a href="#services" class="hover:text-white">Services</a></li>
              <li><a href="#products" class="hover:text-white">Products</a></li>
            </ul>
          </div>

          <div>
            <h4 class="font-bold text-white mb-4">Support</h4>
            <ul class="space-y-3">
              <li><a href="#contact" class="hover:text-white">Contact Us</a></li>
              <li><a href="#" class="hover:text-white">FAQ</a></li>
              <li><a href="#" class="hover:text-white">Terms of Service</a></li>
            </ul>
          </div>

          <div>
            <h4 class="font-bold text-white mb-4">Follow Us</h4>
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
          <p>&copy; {{ new Date().getFullYear() }} Aliyaat. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
</template>