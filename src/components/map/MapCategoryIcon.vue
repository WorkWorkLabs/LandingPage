<script setup lang="ts">
import type { MapCategory } from '@/constants/map'

const props = defineProps<{
  category: MapCategory
}>()

const ICONS: Record<string, { path: string; bg: string; fg: string }> = {
  work: {
    path: 'M2 9a3 3 0 0 1 0 6v3a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3a3 3 0 0 1 0-6V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z M13 5v2 M13 11v2 M13 17v2',
    bg: 'color-mix(in srgb, #3f6fc9 10%, transparent)',
    fg: '#2b4d93',
  },
  cafe: {
    path: 'M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2 M7 2v20 M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7',
    bg: 'color-mix(in srgb, #d97706 16%, transparent)',
    fg: '#b45309',
  },
  stay: {
    path: 'M2 4v16 M2 8h18a2 2 0 0 1 2 2v10 M2 17h20 M6 8v9',
    bg: 'color-mix(in srgb, #3f6fc9 8%, transparent)',
    fg: '#305bb0',
  },
  food: {
    path: 'M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2 M7 2v20 M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7',
    bg: 'color-mix(in srgb, #d97706 16%, transparent)',
    fg: '#b45309',
  },
  community: {
    path: 'M5 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z M19 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z M7 19h8a4 4 0 0 0 0-8H9a4 4 0 0 1 0-8h8',
    bg: '#e9ecf4',
    fg: '#545f78',
  },
  event: {
    path: 'M2 9a3 3 0 0 1 0 6v3a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3a3 3 0 0 1 0-6V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z M13 5v2 M13 11v2 M13 17v2',
    bg: 'color-mix(in srgb, #3f6fc9 10%, transparent)',
    fg: '#2b4d93',
  },
  life: {
    path: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z M3 6h18 M16 10a4 4 0 0 1-8 0',
    bg: 'color-mix(in srgb, #16a34a 12%, transparent)',
    fg: '#15803d',
  },
  outdoor: {
    path: 'M12 2 7 9h2l-3 5h3l-2 4h10l-2-4h3l-3-5h2Z M12 18v4',
    bg: 'color-mix(in srgb, #16a34a 12%, transparent)',
    fg: '#15803d',
  },
  fitness: {
    path: 'M5 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z M19 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z M7 19h8a4 4 0 0 0 0-8H9a4 4 0 0 1 0-8h8',
    bg: 'color-mix(in srgb, #d97706 16%, transparent)',
    fg: '#b45309',
  },
  fun: {
    path: 'M2 9a3 3 0 0 1 0 6v3a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3a3 3 0 0 1 0-6V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z M13 5v2 M13 11v2 M13 17v2',
    bg: 'color-mix(in srgb, #3f6fc9 10%, transparent)',
    fg: '#2b4d93',
  },
  hidden: {
    path: 'M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z',
    bg: '#e9ecf4',
    fg: '#6d788f',
  },
  all: {
    path: 'M3 21h18 M5 21v-8 M9 21v-8 M15 21v-8 M19 21v-8 M3 10l9-6 9 6Z',
    bg: '#e9ecf4',
    fg: '#545f78',
  },
}

const meta = ICONS[props.category] ?? ICONS.all
</script>

<template>
  <span class="ot-cat-icon" :style="{ background: meta.bg, color: meta.fg }">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path :d="meta.path" />
    </svg>
  </span>
</template>

<style scoped>
.ot-cat-icon {
  display: flex;
  flex: none;
  width: 22px;
  height: 22px;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.ot-cat-icon svg {
  width: 13px;
  height: 13px;
}
</style>
