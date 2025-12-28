export const useSiteData = () => {
  const { t } = useI18n();

  const navLinks = computed(() => [
    { name: t('nav.about'), href: '/#about' },
    { name: t('nav.services'), href: '/#services' },
    { name: t('nav.products'), href: '/#products' },
    { name: t('nav.catalog'), href: '/catalog' },
    { name: t('nav.contact'), href: '/#contact' },
  ]);

  const services = computed(() => [
    { title: t('services.list.corrective.title'), description: t('services.list.corrective.description'), icon: 'i-lucide-wrench' },
    { title: t('services.list.preventive.title'), description: t('services.list.preventive.description'), icon: 'i-lucide-shield-check' },
    { title: t('services.list.procurement.title'), description: t('services.list.procurement.description'), icon: 'i-lucide-shopping-cart' },
    { title: t('services.list.consultation.title'), description: t('services.list.consultation.description'), icon: 'i-lucide-brain-circuit' },
    { title: t('services.list.training.title'), description: t('services.list.training.description'), icon: 'i-lucide-users' },
  ]);

  const machineTypes = computed(() => [
    { id: 'turning', label: t('products.machine_types.turning') },
    { id: 'machining', label: t('products.machine_types.machining') },
    { id: 'edm', label: t('products.machine_types.edm') },
  ]);

  const clients = ref([
    { name: 'amm', logo: '/images/clients/amm.png' },
    { name: 'condor', logo: '/images/clients/condor.png' },
    { name: 'snap', logo: '/images/clients/snap.png' },
    { name: 'technonum', logo: '/images/clients/technonum.png' },
    { name: 'gralcome', logo: '/images/clients/gralcome.png' },
    { name: 'euromoteur', logo: '/images/clients/euromoteur.png' },
  ]);

  const contacts = ref({
    email: 'contact@aliyaat.com',
    tel: '+213 (0) 554 982 123',
    address: 'Coop. El Amel Lot 77, Ain Naadja, Algiers, Algeria',
    maps: 'https://maps.app.goo.gl/hT4EHyToxyobWgqr5'
  });

  return {
    navLinks,
    services,
    machineTypes,
    clients,
    contacts
  };
};
