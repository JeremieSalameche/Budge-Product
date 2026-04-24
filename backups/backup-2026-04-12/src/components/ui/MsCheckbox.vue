<template>
  <label :class="['ms-checkbox', { 'ms-checkbox--disabled': disabled }]">
    <span :class="['ms-checkbox__box', { 'ms-checkbox--checked': isChecked, 'ms-checkbox--indeterminate': indeterminate }]">
      <svg v-if="isChecked && !indeterminate" width="10" height="8" viewBox="0 0 10 8" fill="none">
        <path d="M1 4L3.5 6.5L9 1" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <svg v-if="indeterminate" width="10" height="2" viewBox="0 0 10 2" fill="none">
        <line x1="1" y1="1" x2="9" y2="1" stroke="white" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <input
        type="checkbox"
        :checked="isChecked"
        :indeterminate="indeterminate"
        :disabled="disabled"
        class="ms-checkbox__input"
        @change="toggle"
      />
    </span>
    <span v-if="label" class="ms-checkbox__label">{{ label }}</span>
  </label>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  modelValue:    { default: false },
  label:         { type: String, default: null },
  indeterminate: { type: Boolean, default: false },
  disabled:      { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])
const isChecked = computed(() => Boolean(props.modelValue))
function toggle() { emit('update:modelValue', !props.modelValue) }
</script>

<style scoped>
.ms-checkbox {
  display: inline-flex; align-items: center; gap: var(--space-sm);
  cursor: pointer; user-select: none;
}
.ms-checkbox--disabled { opacity: 0.4; pointer-events: none; }
.ms-checkbox__input { position: absolute; opacity: 0; width: 0; height: 0; }
.ms-checkbox__box {
  width: 16px; height: 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--background);
  display: flex; align-items: center; justify-content: center;
  transition: background var(--transition), border-color var(--transition);
  flex-shrink: 0;
}
.ms-checkbox--checked, .ms-checkbox--indeterminate {
  background: var(--primary) !important;
  border-color: var(--primary) !important;
}
.ms-checkbox__label { font-size: 14px; color: var(--foreground); }
</style>
