<script setup lang="ts">
withDefaults(defineProps<{
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}>(), {
  hover: true,
  padding: 'md'
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()
</script>

<template>
  <div
    :class="[
      'bg-content1 rounded-2xl border border-default-200 transition-all duration-300',
      hover ? 'hover:shadow-lg hover:-translate-y-1' : '',
      padding === 'none' ? '' : padding === 'sm' ? 'p-4' : padding === 'md' ? 'p-6' : 'p-8'
    ]"
    @click="emit('click', $event)"
  >
    <slot />
  </div>
</template>
