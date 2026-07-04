<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg'
    text?: string
    label?: string
    inline?: boolean
  }>(),
  {
    size: 'md',
    label: '加载中',
    inline: false,
  }
)
</script>

<template>
  <div
    class="loading-spinner"
    :class="[`loading-spinner--${size}`, { 'loading-spinner--inline': inline }]"
    role="status"
    :aria-label="label"
  >
    <div class="loading-spinner-ring" />
    <span v-if="text" class="loading-spinner-text">{{ text }}</span>
  </div>
</template>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.loading-spinner--inline {
  flex-direction: row;
  gap: 8px;
}

.loading-spinner-ring {
  border-radius: 50%;
  border: 3px solid rgba(72, 169, 222, 0.18);
  border-top-color: #48a9de;
  animation: loading-spin 0.75s linear infinite;
}

.loading-spinner--sm .loading-spinner-ring {
  width: 16px;
  height: 16px;
  border-width: 2px;
}

.loading-spinner--md .loading-spinner-ring {
  width: 28px;
  height: 28px;
}

.loading-spinner--lg .loading-spinner-ring {
  width: 40px;
  height: 40px;
  border-width: 4px;
}

.loading-spinner-text {
  font-size: 13px;
  font-weight: 500;
  color: #595959;
}

@keyframes loading-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .loading-spinner-ring {
    animation: none;
    border-top-color: #48a9de;
  }
}
</style>