<template>
  <div class="mini-donut">
    <svg viewBox="0 0 56 56" width="56" height="56">
      <!-- Track -->
      <circle
        cx="28" cy="28" r="22"
        fill="none"
        :stroke="trackColor"
        stroke-width="6"
      />
      <!-- Arc progression -->
      <circle
        cx="28" cy="28" r="22"
        fill="none"
        :stroke="color"
        stroke-width="6"
        stroke-linecap="round"
        :stroke-dasharray="circonference"
        :stroke-dashoffset="offset"
        transform="rotate(-90 28 28)"
        style="transition: stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1)"
      />
      <!-- % centré -->
      <text
        x="28" y="28"
        text-anchor="middle"
        dominant-baseline="central"
        :fill="color"
        font-size="11"
        font-weight="600"
        font-family="Inter, sans-serif"
      >{{ pct }}%</text>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  valeur: { type: Number, default: 0 },
  total:  { type: Number, default: 1 },
  color:  { type: String, default: '#7C6FCD' },
})

const circonference = computed(() => 2 * Math.PI * 22)

const pct = computed(() =>
  props.total > 0 ? Math.round(Math.max(props.valeur, 0) / props.total * 100) : 0
)

const offset = computed(() => {
  const progress = Math.min(pct.value / 100, 1)
  return circonference.value * (1 - progress)
})

const trackColor = computed(() =>
  props.color === '#7C6FCD' ? '#EDE9FB' : '#E3F2FD'
)
</script>

<style scoped>
.mini-donut { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
</style>
