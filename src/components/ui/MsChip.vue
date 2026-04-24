<template>
  <span :class="['ms-chip', { 'ms-chip--selected': selected }]">
    <span v-if="icon" class="ms-chip__icon">{{ icon }}</span>
    <span class="ms-chip__label">{{ label }}</span>
    <button v-if="removable" class="ms-chip__remove" @click.stop="$emit('remove')" type="button">
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>
  </span>
</template>

<script setup>
defineProps({
  label:    { type: String, required: true },
  removable:{ type: Boolean, default: false },
  selected: { type: Boolean, default: false },
  icon:     { type: String, default: null },
})
defineEmits(['remove'])
</script>

<style scoped>
.ms-chip {
  display: inline-flex; align-items: center; gap: var(--space-xs);
  padding: 4px 12px;
  border-radius: var(--radius-full);
  background: var(--secondary);
  font-size: 12px; font-weight: 500;
  color: var(--secondary-foreground);
  border: 1px solid var(--border);
  transition: background var(--transition), border-color var(--transition);
}
.ms-chip--selected {
  background: var(--primary);
  border-color: var(--primary);
  color: var(--primary-foreground);
}
.ms-chip__remove {
  display: flex; align-items: center;
  padding: 1px; margin-left: 2px;
  color: var(--muted-foreground);
  border-radius: 50%; background: transparent;
  cursor: pointer; border: none;
  transition: color var(--transition);
}
.ms-chip__remove:hover { color: var(--foreground); }
</style>
