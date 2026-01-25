export const useSiteData = () => {
  const { t } = useI18n();
  const localePath = useLocalePath();

  const navLinks = computed(() => [
    { name: t('nav.about'), href: localePath('/') + '#about' },
    { name: t('nav.services'), href: localePath('/') + '#services' },
    { name: t('nav.products'), href: localePath('/') + '#products' },
    { name: t('nav.catalog'), href: localePath('catalog') },
    { name: t('nav.contact'), href: localePath('/') + '#contact' },
  ]);

  const services = computed(() => [
    { title: t('services.list.corrective.title'), description: t('services.list.corrective.description'), icon: 'i-lucide-wrench' },
    { title: t('services.list.preventive.title'), description: t('services.list.preventive.description'), icon: 'i-lucide-shield-check' },
    { title: t('services.list.procurement.title'), description: t('services.list.procurement.description'), icon: 'i-lucide-shopping-cart' },
    { title: t('services.list.consultation.title'), description: t('services.list.consultation.description'), icon: 'i-lucide-brain-circuit' },
    { title: t('services.list.training.title'), description: t('services.list.training.description'), icon: 'i-lucide-users' },
  ]);

  const machineTypes = computed(() => [
    { id: 'turning_centers', label: t('products.machine_types.turning_centers') },
    { id: 'machining_centers', label: t('products.machine_types.machining_centers') },
    { id: 'edm_machines', label: t('products.machine_types.edm_machines') },
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
    tel: '+213 (0) 696 914 084',
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
