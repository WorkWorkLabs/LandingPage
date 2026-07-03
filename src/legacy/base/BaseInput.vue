<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: string
  type?: string
  label?: string
  placeholder?: string
  error?: string
  disabled?: boolean
  required?: boolean
}>(), {
  type: 'text',
  disabled: false,
  required: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputClasses = computed(() => {
  const base = 'w-full px-4 py-3 bg-background border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all'

  return [
    base,
    props.error ? 'border-danger' : 'border-default-200',
    props.disabled ? 'opacity-50 cursor-not-allowed' : ''
  ].filter(Boolean).join(' ')
})
</script>

<template>
  <div>
    <label v-if="label" class="block text-sm font-medium text-default-700 mb-2">
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="inputClasses"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <p v-if="error" class="mt-1.5 text-sm text-danger">
      {{ error }}
    </p>
  </div>
</template>
