<template>
  <div class="ms-progress">
    <div v-if="showLabel" class="ms-progress__header">
      <slot name="label" />
      <span class="ms-progress__pct">{{ Math.round(value) }}%</span>
    </div>
    <div :class="['ms-progress__track', `ms-progress__track--${size}`]">
      <div
        :class="['ms-progress__fill', `ms-progress__fill--${computedVariant}`]"
        :style="{ width: Math.min(100, value) + '%' }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  value:     { type: Number, default: 0 },
  variant:   { type: String, default: 'default' }, // default | success | danger
  showLabel: { type: Boolean, default: false },
  size:      { type: String, default: 'md' },
})
const computedVariant = computed(() => {
  if (props.variant !== 'default') return props.variant
  if (props.value >= 100) return 'danger'
  if (props.value >= 85) return 'warning'
  return 'default'
})
</script>

<style scoped>
.ms-progress { display: flex; flex-direction: column; gap: var(--space-xs); }
.ms-progress__header { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--muted-foreground); }
.ms-progress__pct { font-weight: 600; }
.ms-progress__track {
  height: 6px;
  width: 100%;
  background: var(--secondary);
  border-radius: var(--radius-full);
  overflow: hidden;
}
.ms-progress__track--sm { height: 4px; }
.ms-progress__track--md { height: 6px; }
.ms-progress__fill { height: 100%; border-radius: var(--radius-full); transition: width 300ms ease; }
.ms-progress__fill--default { background: var(--primary); }
.ms-progress__fill--success { background: var(--color-success); }
.ms-progress__fill--danger  { background: var(--destructive); }
.ms-progress__fill--warning { background: var(--color-warning); }
</style>
