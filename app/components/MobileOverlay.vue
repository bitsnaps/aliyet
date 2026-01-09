<script setup>
const { navLinks } = useSiteData();
const { isOpen, close } = useMobileMenu();

const { locale, locales, setLocale } = useI18n();
const localePath = useLocalePath();

const items = computed(() => locales.value.map(l => ([{
  label: l.name,
  type: 'checkbox',
  checked: locale.value === l.code,
  class: 'font-medium cursor-pointer',
  onSelect: () => {
    setLocale(l.code);
    close();
  }
}])));
</script>
<template>
    <!-- Mobile Menu Overlay -->
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-40 bg-charcoal-500/95 pt-24 px-6 md:hidden"
      >
        <nav class="flex flex-col gap-6 text-center">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.name"
            :to="link.href"
            @click="close"
            class="text-2xl text-white font-semibold hover:text-action-teal-500"
          >
            {{ link.name }}
          </NuxtLink>
          <hr class="border-slate-700 my-4" />
          <div class="flex items-center justify-center gap-4">
            <UButton
              v-for="l in locales"
              :key="l.code"
              color="white"
              variant="ghost"
              class="font-medium cursor-pointer text-white text-xl"
              :class="{ 'text-action-teal-500': locale === l.code }"
              @click="setLocale(l.code)"
            >
              {{ l.name }}
            </UButton>
          </div>
          <UButton
            :to="localePath('/build-and-price')"
            @click="close"
            color="action-teal"
            variant="solid"
            class="font-bold text-charcoal-500 text-xl mt-4 justify-center py-3"
            size="xl"
            block
          >
            Build & Price Quote
          </UButton>
        </nav>
      </div>
    </Transition>
</template>
