<script setup>
import * as v from 'valibot';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  machine: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:modelValue', 'close']);

const { t } = useI18n();
const toast = useToast();

const currentStep = ref(1);
const loading = ref(false);

const mainChars = ref({});
const optionalChars = ref({});
const userDetails = ref({
  name: '',
  email: '',
  phone: '',
  company: ''
});

const schema = v.object({
  name: v.pipe(v.string(), v.minLength(2, 'Name must be at least 2 characters')),
  email: v.pipe(v.string(), v.email('Invalid email')),
  phone: v.pipe(v.string(), v.minLength(8, 'Phone must be at least 8 characters')),
  company: v.optional(v.string())
});

// Hardcoded characteristics for demo/prototype
const allCharacteristics = {
  'default': {
    main: [
      { id: 'main_def_1', name: 'Control System', type: 'select', options: ['Fanuc', 'Siemens', 'Heidenhain'] },
      { id: 'main_def_2', name: 'Spindle Speed', type: 'select', options: ['8,000 RPM', '10,000 RPM', '12,000 RPM', '15,000 RPM'] },
    ],
    optional: [
      { id: 'opt_def_1', name: 'Coolant Through Spindle', type: 'checkbox' },
      { id: 'opt_def_2', name: '4th Axis Preparation', type: 'checkbox' },
      { id: 'opt_def_3', name: 'Chip Conveyor', type: 'checkbox' },
      { id: 'opt_def_4', name: 'Automatic Tool Changer (High Cap)', type: 'checkbox' },
    ]
  },
  '1': { 
    main: [
      { id: 'main_1_1', name: 'Control System', type: 'select', options: ['Fanuc', 'Siemens', 'Heidenhain'] },
      { id: 'main_1_2', name: 'Spindle Speed', type: 'text' },
    ],
    optional: [
      { id: 'opt_1_1', name: 'Coolant Through Spindle', type: 'checkbox' },
      { id: 'opt_1_2', name: '4th Axis Preparation', type: 'checkbox' },
    ]
  },
  '2': { 
    main: [
      { id: 'main_2_1', name: 'Table Size', type: 'text' },
      { id: 'main_2_2', name: 'Max Workpiece Weight', type: 'text' },
    ],
    optional: [
      { id: 'opt_2_1', name: 'Automatic Tool Changer', type: 'checkbox' },
    ]
  }
};

const currentMachineCharacteristics = computed(() => {
  if (!props.machine) return { main: [], optional: [] };
  return allCharacteristics[props.machine.id] || allCharacteristics['default'];
});

const steps = computed(() => [
  { id: 1, label: t('build_price.steps_labels.step2'), icon: 'i-lucide-settings' }, // "Main Characteristics"
  { id: 2, label: t('build_price.steps_labels.step3'), icon: 'i-lucide-plus-circle' }, // "Optional Characteristics"
  { id: 3, label: t('build_price.steps_labels.step4'), icon: 'i-lucide-user' }  // "Your Details"
]);

// Reset state when modal opens or machine changes
watch(() => props.modelValue, (val) => {
  if (val) {
    currentStep.value = 1;
  }
});

watch(() => props.machine, () => {
  mainChars.value = {};
  optionalChars.value = {};
  currentStep.value = 1;
});

function close() {
  emit('update:modelValue', false);
  emit('close');
}

function nextStep() {
  if (currentStep.value < steps.value.length) {
    currentStep.value++;
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
}

async function submitQuote() {
  loading.value = true;
  const quoteData = {
    machine: {
      id: props.machine.id,
      name: props.machine.name
    },
    main_characteristics: mainChars.value,
    optional_characteristics: optionalChars.value,
    user_details: userDetails.value
  };

  try {
    // Validate user details
    const result = v.safeParse(schema, userDetails.value);
    if (!result.success) {
      const issues = result.issues.map(i => i.message).join('\n');
      toast.add({ title: t('contact_form.validation.error_title'), description: issues, color: 'error' });
      loading.value = false;
      return;
    }

    const response = await $fetch('/api/quotes', {
      method: 'POST',
      body: quoteData
    });

    if (response.success) {
        toast.add({ title: t('build_price.success_title'), description: t('build_price.success_desc'), color: 'success' });
        close();
        // Reset form
        userDetails.value = { name: '', email: '', phone: '', company: '' };
        mainChars.value = {};
        optionalChars.value = {};
    } else {
        throw new Error(response.message || 'Unknown error');
    }

  } catch (error) {
    const msg = error.data?.message || error.message || t('build_price.error_desc');
    toast.add({ title: t('build_price.error_title'), description: msg, color: 'error' });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 flex justify-end">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="close"></div>

    <!-- Slideover Panel (Custom Implementation) -->
    <div class="relative w-full max-w-md bg-white dark:bg-gray-900 h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out border-l border-gray-200 dark:border-gray-800">
      
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 sticky top-0 z-10">
        <div>
           <h3 class="text-lg font-bold text-gray-900 dark:text-white">
            {{ $t('build_price.title') }}
          </h3>
          <p class="text-sm text-primary-600 dark:text-primary-400 font-medium">{{ machine?.name }}</p>
        </div>
        <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-mr-2" @click="close" />
      </div>

      <!-- Steps Progress -->
      <div class="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
        <div class="flex items-center justify-between relative">
           <div class="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 dark:bg-gray-700 -z-0"></div>
           <div 
            v-for="(step, index) in steps" 
            :key="step.id" 
            class="relative z-10 flex flex-col items-center"
           >
              <div 
                :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors duration-300',
                  currentStep >= step.id ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                ]"
              >
                <UIcon :name="step.icon" class="w-4 h-4" />
              </div>
           </div>
        </div>
        <div class="text-center mt-2">
            <span class="text-sm font-semibold text-gray-900 dark:text-white">
                {{ steps[currentStep - 1].label }}
            </span>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        
            <!-- Step 1: Main Characteristics -->
            <div v-if="currentStep === 1" class="space-y-6">
                <div v-if="currentMachineCharacteristics.main.length === 0" class="text-center text-gray-500 py-10">
                    <UIcon name="i-lucide-check-circle" class="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No main configuration options needed. <br>You can proceed to the next step.</p>
                </div>
                <div v-for="char in currentMachineCharacteristics.main" :key="char.id">
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{{ char.name }}</label>
                        <input 
                            v-if="char.type === 'text'" 
                            type="text"
                            v-model="mainChars[char.id]" 
                            :placeholder="`Enter ${char.name}`" 
                            class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                        />
                        <select 
                            v-if="char.type === 'select'" 
                            v-model="mainChars[char.id]" 
                            class="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2 px-3"
                        >
                            <option value="" disabled selected>Select {{ char.name }}</option>
                            <option v-for="opt in char.options" :key="opt" :value="opt">{{ opt }}</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Step 2: Optional Characteristics -->
            <div v-if="currentStep === 2" class="space-y-4">
                 <div v-if="currentMachineCharacteristics.optional.length === 0" class="text-center text-gray-500 py-10">
                     <UIcon name="i-lucide-check-circle" class="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No optional features available.</p>
                </div>
                <div v-for="char in currentMachineCharacteristics.optional" :key="char.id" 
                  class="flex items-center gap-3 p-4 border rounded-xl dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all cursor-pointer"
                  @click="optionalChars[char.id] = !optionalChars[char.id]"
                >
                    <input 
                        type="checkbox" 
                        v-model="optionalChars[char.id]" 
                        class="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 pointer-events-none" 
                    />
                    <span class="font-medium text-gray-700 dark:text-gray-200">{{ char.name }}</span>
                </div>
            </div>

            <!-- Step 3: User Details -->
            <div v-if="currentStep === 3" class="space-y-5">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{{ $t('contact_form.full_name') }} <span class="text-red-500">*</span></label>
                    <div class="relative rounded-md shadow-sm">
                        <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <UIcon name="i-heroicons-user" class="h-5 w-5 text-gray-400" />
                        </div>
                        <input 
                            type="text" 
                            v-model="userDetails.name" 
                            class="block w-full rounded-md border-gray-300 dark:border-gray-600 pl-10 focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2"
                        />
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{{ $t('contact_form.email_address') }} <span class="text-red-500">*</span></label>
                    <div class="relative rounded-md shadow-sm">
                        <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <UIcon name="i-heroicons-envelope" class="h-5 w-5 text-gray-400" />
                        </div>
                        <input 
                            type="email" 
                            v-model="userDetails.email" 
                            class="block w-full rounded-md border-gray-300 dark:border-gray-600 pl-10 focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2"
                        />
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{{ $t('contact_form.telephone') }} <span class="text-red-500">*</span></label>
                    <div class="relative rounded-md shadow-sm">
                        <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <UIcon name="i-heroicons-phone" class="h-5 w-5 text-gray-400" />
                        </div>
                        <input 
                            type="tel" 
                            v-model="userDetails.phone" 
                            class="block w-full rounded-md border-gray-300 dark:border-gray-600 pl-10 focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2"
                        />
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{{ $t('contact_form.company') }}</label>
                    <div class="relative rounded-md shadow-sm">
                        <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <UIcon name="i-heroicons-building-office" class="h-5 w-5 text-gray-400" />
                        </div>
                        <input 
                            type="text" 
                            v-model="userDetails.company" 
                            class="block w-full rounded-md border-gray-300 dark:border-gray-600 pl-10 focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white py-2"
                        />
                    </div>
                </div>
                 
                 <div class="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-100 dark:border-primary-800">
                    <div class="flex gap-3">
                        <UIcon name="i-lucide-info" class="w-5 h-5 text-primary-600 dark:text-primary-400 shrink-0 mt-0.5" />
                        <p class="text-sm text-primary-800 dark:text-primary-200">
                            By submitting this quote request, you agree to be contacted by our sales team regarding this configuration.
                        </p>
                    </div>
                 </div>
            </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 sticky bottom-0 z-10">
        <div class="flex justify-between items-center gap-4">
            <UButton 
                v-if="currentStep > 1" 
                @click="prevStep" 
                color="white" 
                variant="solid"
                class="flex-1 justify-center"
            >
                {{ $t('build_price.prev') }}
            </UButton>
            <div v-else class="flex-1"></div>

            <UButton 
                v-if="currentStep < steps.length" 
                @click="nextStep" 
                color="primary" 
                variant="solid"
                class="flex-1 justify-center"
            >
                {{ $t('build_price.next') }}
                <template #trailing>
                    <UIcon name="i-heroicons-arrow-right-20-solid" />
                </template>
            </UButton>
            
            <UButton 
                v-if="currentStep === steps.length" 
                @click="submitQuote" 
                :loading="loading" 
                color="primary" 
                variant="solid" 
                class="flex-1 justify-center"
            >
                {{ $t('build_price.submit') }}
            </UButton>
        </div>
      </div>
    </div>
  </div>
</template>
