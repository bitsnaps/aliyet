export const useSiteData = () => {
  const navLinks = ref([
    { name: 'About', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Products', href: '#products' },
    { name: 'Contact', href: '#contact' },
  ]);

  const services = ref([
    { title: 'Corrective Maintenance', description: 'Rapid, on-site emergency repairs to minimize operational downtime and restore functionality.', icon: 'i-lucide-wrench' },
    { title: 'Preventive Maintenance', description: 'Scheduled inspections and servicing to prevent failures and extend the lifespan of your machinery.', icon: 'i-lucide-shield-check' },
    { title: 'Procurement Support', description: 'Expert assistance in sourcing, vetting, and acquiring the ideal machinery for your specific needs.', icon: 'i-lucide-shopping-cart' },
    { title: 'Technical Consultation', description: 'Strategic advice on optimizing your production line, improving efficiency, and long-term planning.', icon: 'i-lucide-brain-circuit' },
    { title: 'Operator Training', description: 'Comprehensive training programs to ensure your team can operate new machinery safely and effectively.', icon: 'i-lucide-users' },
  ]);

  const machineTypes = ref([
    { id: 'turning', label: 'Turning Center' },
    { id: 'machining', label: 'Machining Center' },
    { id: 'edm', label: 'EDM Machine' },
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