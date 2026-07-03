<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md'
}>(), {
  variant: 'default',
  size: 'sm'
})
</script>

<template>
  <span
    :class="[
      'inline-flex items-center font-medium rounded-full',
      size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      variant === 'primary' ? 'bg-primary/10 text-primary border border-primary/20' :
      variant === 'secondary' ? 'bg-secondary/10 text-secondary border border-secondary/20' :
      variant === 'success' ? 'bg-success/10 text-success border border-success/20' :
      variant === 'warning' ? 'bg-warning/10 text-warning border border-warning/20' :
      variant === 'danger' ? 'bg-danger/10 text-danger border border-danger/20' :
      'bg-default-100 text-default-600 border border-default-200'
    ]"
  >
    <slot />
  </span>
</template>
