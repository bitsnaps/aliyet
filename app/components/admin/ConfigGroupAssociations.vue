<script setup>
import { ref, computed } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';

const props = defineProps({
  groupId: {
    type: [String, Number],
    required: true
  }
});

const toast = useToast();
const loading = ref(false);
const saving = ref(false);

const configurations = ref([]);
const optionals = ref([]);
const availableConfigurations = ref([]);
const availableOptionals = ref([]);

const selectedConfig = ref(null);
const selectedOptional = ref(null);

// Fetch Associations
const fetchAssociations = async () => {
  loading.value = true;
  try {
    const { data } = await $fetch(`/api/admin/config-categories/${props.groupId}/associations`);
    if (data) {
      configurations.value = data.configurations || [];
      optionals.value = data.optionals || [];
      
      availableConfigurations.value = data.available.configurations || [];
      availableOptionals.value = data.available.optionals || [];
    }
  } catch (error) {
    toast.add({ title: 'Error', description: 'Failed to fetch associations', color: 'error' });
  } finally {
    loading.value = false;
  }
};

// Initial fetch
fetchAssociations();

// Methods
const addConfiguration = () => {
  if (!selectedConfig.value) return;
  
  const config = availableConfigurations.value.find(c => c.id === selectedConfig.value);
  if (config && !configurations.value.some(c => c.id === config.id)) {
    configurations.value.push({ ...config, sort_order: configurations.value.length });
  }
  selectedConfig.value = null;
};

const removeConfiguration = (index) => {
  configurations.value.splice(index, 1);
};

const addOptional = () => {
  if (!selectedOptional.value) return;
  
  const optional = availableOptionals.value.find(o => o.id === selectedOptional.value);
  if (optional && !optionals.value.some(o => o.id === optional.id)) {
    optionals.value.push({ ...optional, sort_order: optionals.value.length });
  }
  selectedOptional.value = null;
};

const removeOptional = (index) => {
  optionals.value.splice(index, 1);
};

const saveAssociations = async () => {
  saving.value = true;
  try {
    const payload = {
      configurations: configurations.value.map((c, index) => ({ id: c.id, sort_order: index })),
      optionals: optionals.value.map((o, index) => ({ id: o.id, sort_order: index }))
    };

    await $fetch(`/api/admin/config-categories/${props.groupId}/associations`, {
      method: 'PUT',
      body: payload
    });

    toast.add({ title: 'Success', description: 'Associations updated successfully', color: 'success' });
  } catch (error) {
    toast.add({ title: 'Error', description: 'Failed to save associations', color: 'error' });
  } finally {
    saving.value = false;
  }
};

// Computed for select menus (exclude already selected)
const availableConfigOptions = computed(() => {
  return availableConfigurations.value.filter(c => !configurations.value.some(sel => sel.id === c.id));
});

const availableOptionalOptions = computed(() => {
  return availableOptionals.value.filter(o => !optionals.value.some(sel => sel.id === o.id));
});
</script>

<template>
  <div class="space-y-8">
    <div v-if="loading" class="flex justify-center py-8">
      <UIcon name="i-lucide-loader" class="w-8 h-8 animate-spin text-gray-400" />
    </div>

    <template v-else>
      <!-- Configurations Section -->
      <UCard>
        <template #header>
          <div class="flex justify-between items-center">
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white">Main Configurations</h3>
              <p class="text-sm text-gray-500">Manage standard configurations (e.g. Spindle, Control System)</p>
            </div>
          </div>
        </template>

        <div class="space-y-4">
          <div class="flex gap-2">
            <USelectMenu
              v-model="selectedConfig"
              :items="availableConfigOptions"
              value-key="id"
              label-key="name"
              placeholder="Select Configuration to Add"
              class="flex-1"
              searchable
            >
                <template #label>
                    <span v-if="selectedConfig">
                        {{ availableConfigurations.find(c => c.id === selectedConfig)?.name }}
                    </span>
                    <span v-else class="text-gray-400">Select Configuration to Add</span>
                </template>
                <template #option="{ option }">
                    <span>{{ option.name }}</span>
                </template>
            </USelectMenu>
            <UButton icon="i-lucide-plus" color="primary" variant="soft" @click="addConfiguration" :disabled="!selectedConfig" />
          </div>

          <div v-if="configurations.length === 0" class="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
            <p class="text-gray-500">No configurations associated.</p>
          </div>

          <VueDraggable v-model="configurations" handle=".drag-handle" class="space-y-2">
            <div
              v-for="(config, index) in configurations"
              :key="config.id"
              class="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md"
            >
              <div class="drag-handle cursor-move text-gray-400 hover:text-gray-600">
                <UIcon name="i-lucide-grip-vertical" class="w-5 h-5" />
              </div>
              <span class="flex-1 font-medium text-gray-200">{{ config.name }}</span>
              <UButton color="error" variant="ghost" icon="i-lucide-trash" size="sm" @click="removeConfiguration(index)" />
            </div>
          </VueDraggable>
        </div>
      </UCard>

      <!-- Optional Additions Section -->
      <UCard>
        <template #header>
          <div class="flex justify-between items-center">
            <div>
              <h3 class="font-semibold text-gray-900 dark:text-white">Optional Additions</h3>
              <p class="text-sm text-gray-500">Manage optional upgrades (e.g. Chip Conveyor, Extra Axis)</p>
            </div>
          </div>
        </template>

        <div class="space-y-4">
          <div class="flex gap-2">
            <USelectMenu
              v-model="selectedOptional"
              :items="availableOptionalOptions"
              value-key="id"
              label-key="name"
              placeholder="Select Option to Add"
              class="flex-1"
              searchable
            >
                <template #label>
                    <span v-if="selectedOptional">
                        {{ availableOptionals.find(o => o.id === selectedOptional)?.name }}
                    </span>
                    <span v-else class="text-gray-400">Select Option to Add</span>
                </template>
                <template #option="{ option }">
                    <span>{{ option.name }}</span>
                </template>
            </USelectMenu>
            <UButton icon="i-lucide-plus" color="primary" variant="soft" @click="addOptional" :disabled="!selectedOptional" />
          </div>

          <div v-if="optionals.length === 0" class="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
            <p class="text-gray-500">No optional additions associated.</p>
          </div>

          <VueDraggable v-model="optionals" handle=".drag-handle" class="space-y-2">
            <div
              v-for="(opt, index) in optionals"
              :key="opt.id"
              class="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md"
            >
              <div class="drag-handle cursor-move text-gray-400 hover:text-gray-600">
                <UIcon name="i-lucide-grip-vertical" class="w-5 h-5" />
              </div>
              <span class="flex-1 font-medium text-gray-200">{{ opt.name }}</span>
              <UButton color="error" variant="ghost" icon="i-lucide-trash" size="sm" @click="removeOptional(index)" />
            </div>
          </VueDraggable>
        </div>
      </UCard>

      <!-- Actions -->
      <div class="flex justify-end pt-4">
        <UButton
          label="Save Associations"
          color="primary"
          size="lg"
          icon="i-lucide-save"
          :loading="saving"
          @click="saveAssociations"
        />
      </div>
    </template>
  </div>
</template>