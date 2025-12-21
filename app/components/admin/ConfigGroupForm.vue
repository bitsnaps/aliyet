<script setup>
const state = defineModel({ required: true });
</script>

<template>
  <div class="space-y-6">
    <UCard>
      <div class="space-y-4">
        <UFormField label="Group Name" name="name" required help="The name of the configuration group (e.g. Spindles, Cooling Systems)">
          <UInput v-model="state.name" placeholder="e.g. Spindle Options" class="w-full" />
        </UFormField>

        <UFormField label="Description" name="description">
          <UTextarea v-model="state.description" :rows="4" placeholder="Briefly describe what this group contains..." class="w-full" />
        </UFormField>
      </div>
    </UCard>
  </div>
</template>
