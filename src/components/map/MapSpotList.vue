<script setup lang="ts">
import { MAP_CATEGORIES, type MapCategory, type MapLocation } from '@/constants/map'
import MapCategoryIcon from '@/components/map/MapCategoryIcon.vue'

defineProps<{
  spots: MapLocation[]
  activeId: string | null
  activeCategory: MapCategory
}>()

const emit = defineEmits<{
  select: [loc: MapLocation]
  filter: [id: MapCategory]
}>()

const pills = MAP_CATEGORIES.filter((c) => c.id !== 'hidden')
</script>

<template>
  <div class="ot-list">
    <div class="ot-pills">
      <button
        v-for="cat in pills"
        :key="cat.id"
        type="button"
        class="ot-pill"
        :class="{ active: activeCategory === cat.id }"
        :aria-pressed="activeCategory === cat.id"
        @click="emit('filter', cat.id)"
      >
        {{ cat.label }}
      </button>
    </div>

    <div class="ot-cards">
      <button
        v-for="(loc, index) in spots"
        :key="loc.id"
        type="button"
        class="ot-card"
        :class="{ selected: activeId === loc.id }"
        @click="emit('select', loc)"
      >
        <div class="ot-card-top">
          <span class="ot-card-num">{{ String(index + 1).padStart(2, '0') }}</span>
          <span class="ot-card-meta">{{ loc.city }}</span>
        </div>
        <div class="ot-card-row">
          <MapCategoryIcon :category="loc.category" />
          <span class="ot-card-name">{{ loc.name }}</span>
        </div>
        <span class="ot-card-sub">
          {{ MAP_CATEGORIES.find((c) => c.id === loc.category)?.label }}
          <template v-if="loc.country"> · {{ loc.country }}</template>
        </span>
      </button>

      <p v-if="!spots.length" class="ot-empty">这个分类下还没有地点</p>
    </div>
  </div>
</template>

<style scoped>
.ot-list {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
}

.ot-pills {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 14px 16px 10px;
  scrollbar-width: none;
}

.ot-pills::-webkit-scrollbar {
  display: none;
}

.ot-pill {
  flex: none;
  height: 28px;
  padding: 0 12px;
  border: 0;
  border-radius: 999px;
  background: #fff;
  color: #6d788f;
  font-size: 12.5px;
  font-weight: 500;
  box-shadow: 0 0 0 1px #dde2ee;
  cursor: pointer;
}

.ot-pill.active {
  background: #28304a;
  color: #fafbfd;
  box-shadow: 0 0 0 1px #28304a;
}

.ot-cards {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  padding: 4px 16px 20px;
}

.ot-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px;
  border: 0;
  border-radius: 10px;
  background: #fff;
  text-align: left;
  box-shadow:
    0 0 0 1px color-mix(in srgb, #000 6%, transparent),
    0 1px 2px -1px color-mix(in srgb, #000 6%, transparent);
  cursor: pointer;
  transition: background-color 150ms ease, box-shadow 150ms ease, transform 150ms ease;
}

.ot-card:hover,
.ot-card.selected {
  background: #f2f4f9;
}

.ot-card:active {
  transform: scale(0.96);
}

.ot-card-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.ot-card-num,
.ot-card-meta {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  color: #6d788f;
  tabular-nums: true;
}

.ot-card-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.ot-card-name {
  min-width: 0;
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.35;
  color: #28304a;
}

.ot-card-sub {
  padding-left: 28px;
  font-size: 12px;
  color: #6d788f;
}

.ot-empty {
  margin: 24px 8px;
  color: #6d788f;
  font-size: 13px;
}
</style>
