<script setup>
import * as v from 'valibot';

const toast = useToast()

const steps = [{
  id: 'step1',
  label: 'Choose Machine',
}, {
  id: 'step2',
  label: 'Main Characteristics'
}, {
  id: 'step3',
  label: 'Optional Characteristics'
}, {
  id: 'step4',
  label: 'Your Details'
}]

const currentStep = ref(1)
const selectedMachine = ref(null)
const mainChars = ref({})
const optionalChars = ref({})
const userDetails = ref({
  name: '',
  email: '',
  phone: '',
  company: ''
})

const schema = v.object({
  name: v.pipe(v.string()),
  email: v.pipe(v.string(),v.email('Invalid email')),
});


const machines = ref([])
const loading = ref(true)

const allCharacteristics = {
  '1': { // Example characteristics for machine with id 1
    main: [
      { id: 'main_1_1', name: 'Control System', type: 'select', options: ['Fanuc', 'Siemens', 'Heidenhain'] },
      { id: 'main_1_2', name: 'Spindle Speed', type: 'text' },
    ],
    optional: [
      { id: 'opt_1_1', name: 'Coolant Through Spindle', type: 'checkbox' },
      { id: 'opt_1_2', name: '4th Axis Preparation', type: 'checkbox' },
    ]
  },
  '2': { // Example characteristics for machine with id 2
    main: [
      { id: 'main_2_1', name: 'Table Size', type: 'text' },
      { id: 'main_2_2', name: 'Max Workpiece Weight', type: 'text' },
    ],
    optional: [
      { id: 'opt_2_1', name: 'Automatic Tool Changer', type: 'checkbox' },
    ]
  }
}

// Fetch machines from the API
const { data: machineData } = await useFetch('/api/machines')
if (machineData.value.success) {
  machines.value = machineData.value.data;
  loading.value = false;
}

const currentMachineCharacteristics = computed(() => {
  if (!selectedMachine.value || !allCharacteristics[selectedMachine.value.id]) {
    return { main: [], optional: [] };
  }
  return allCharacteristics[selectedMachine.value.id];
});


function nextStep() {
  if (currentStep.value < steps.length) {
    currentStep.value++
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

async function submitQuote() {
  const quoteData = {
    machine: selectedMachine.value,
    main_characteristics: mainChars.value,
    optional_characteristics: optionalChars.value,
    user_details: userDetails.value
  }

  try {
    await $fetch('/api/quotes', {
      method: 'POST',
      body: quoteData
    })
    toast.add({ title: 'Success!', description: 'Your quote has been submitted successfully.' })
    currentStep.value = 1 // Reset to first step
    selectedMachine.value = null
  } catch (error) {
    toast.add({ title: 'Error!', description: 'Failed to submit quote.', color: 'red' })
    console.error('Error submitting quote:', error)
  }
}
</script>

<template>
  <div class="container mx-auto py-12">
    <h1 class="text-4xl font-bold text-center mb-8">Build & Price Your Machine</h1>

    <div class="max-w-3xl mx-auto">
      <div class="flex justify-between mb-8">
        <div v-for="(step, index) in steps" :key="step.id" class="flex-1 text-center">
          <div :class="['text-sm font-semibold', { 'text-primary': currentStep >= index + 1, 'text-gray-500': currentStep < index + 1 }]">
            {{ step.label }}
          </div>
          <div :class="['mt-2 h-1 rounded-full', { 'bg-primary': currentStep > index + 1, 'bg-gray-300': currentStep <= index + 1 }]"></div>
        </div>
      </div>

      <UCard>
        <div v-if="loading">
          <p>Loading machines...</p>
        </div>
        <div v-else>
          <!-- Step 1: Choose Machine -->
          <div v-if="currentStep === 1">
            <h2 class="text-2xl font-semibold mb-4 dark:text-white">Step 1: Choose Your Machine</h2>
            <div class="grid grid-cols-2 gap-4 dark:text-white">
              <div v-for="machine in machines" :key="machine.id"
                @click="selectedMachine = machine"
                :class="['p-4 border rounded-lg cursor-pointer', { 'border-primary ring-2 ring-primary': selectedMachine && selectedMachine.id === machine.id }]">
                <h3 class="font-bold">{{ machine.name }}</h3>
              </div>
            </div>
          </div>

          <!-- Step 2: Main Characteristics -->
          <div v-if="currentStep === 2" class="space-y-4">
            <h2 class="text-2xl font-semibold mb-4 dark:text-white">Step 2: Main Characteristics for {{ selectedMachine.name }}</h2>
            <div v-for="char in currentMachineCharacteristics.main" :key="char.id">
              <UFormField :label="char.name">
                <UInput v-if="char.type === 'text'" v-model="mainChars[char.id]" />
                <USelect v-if="char.type === 'select'" v-model="mainChars[char.id]" :options="char.options" />
              </UFormField>
            </div>
          </div>

          <!-- Step 3: Optional Characteristics -->
          <div v-if="currentStep === 3" class="space-y-4">
            <h2 class="text-2xl font-semibold mb-4 dark:text-white">Step 3: Optional Characteristics for {{ selectedMachine.name }}</h2>
             <div v-for="char in currentMachineCharacteristics.optional" :key="char.id">
                <UCheckbox v-model="optionalChars[char.id]" :label="char.name" />
            </div>
          </div>

          <!-- Step 4: User Details -->
          <div v-if="currentStep === 4">
            <h2 class="text-2xl font-semibold mb-4 dark:text-white">Step 4: Your Details</h2>
            <UForm :schema="schema" :state="userDetails" @submit="submitQuote" class="space-y-4">
              <UFormField label="Full Name" name="name">
                <UInput v-model="userDetails.name" />
              </UFormField>
              <UFormField label="Email" name="email">
                <UInput v-model="userDetails.email" type="email" />
              </UFormField>
              <UFormField label="Phone" name="phone">
                <UInput v-model="userDetails.phone" />
              </UFormField>
              <UFormField label="Company" name="company">
                <UInput v-model="userDetails.company" />
              </UFormField>
            </UForm>
          </div>
        </div>

        <template #footer>
          <div class="flex justify-between">
            <UButton v-if="currentStep > 1" @click="prevStep" color="neutral">Previous</UButton>
            <div v-else></div>
            <UButton v-if="currentStep < steps.length" @click="nextStep" :disabled="currentStep === 1 && !selectedMachine">Next</UButton>
            <UButton v-if="currentStep === steps.length" @click="submitQuote" color="primary">Submit Quote</UButton>
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>