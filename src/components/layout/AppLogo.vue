<script setup lang="ts">
defineProps<{
  compact?: boolean
}>()
</script>

<template>
  <a
    href="/"
    class="group inline-flex items-center gap-3 text-[#1A1A1A]"
    :class="compact ? 'justify-center' : 'w-[160px]'"
    aria-label="WorkWork 首页"
  >
    <span
      class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#48A9DE]/10 ring-1 ring-[#48A9DE]/15 transition-transform duration-300 group-hover:scale-105"
    >
      <img
        src="/images/logo&favicon.svg"
        alt="WorkWork Logo"
        class="h-8 w-8 object-contain"
      />
    </span>
    <img
      v-if="!compact"
      src="/images/brandname.svg"
      alt="WorkWork"
      class="h-7 w-auto max-w-[108px] object-contain"
    />
  </a>
</template>
