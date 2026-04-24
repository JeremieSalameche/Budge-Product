<template>
  <div class="ms-slider">
    <div v-if="label || showValue" class="ms-slider__header">
      <span v-if="label" class="ms-slider__label">{{ label }}</span>
      <span v-if="showValue" class="ms-slider__value">{{ modelValue }}{{ suffix }}</span>
    </div>
    <div class="ms-slider__track-wrap">
      <input
        type="range"
        :min="min" :max="max" :step="step"
        :value="modelValue"
        class="ms-slider__input"
        @input="$emit('update:modelValue', Number($event.target.value))"
        :style="{ '--pct': pct + '%' }"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  modelValue: { type: Number, default: 0 },
  min:        { type: Number, default: 0 },
  max:        { type: Number, default: 100 },
  step:       { type: Number, default: 1 },
  label:      { type: String, default: null },
  showValue:  { type: Boolean, default: true },
  suffix:     { type: String, default: '' },
})
defineEmits(['update:modelValue'])
const pct = computed(() => ((props.modelValue - props.min) / (props.max - props.min)) * 100)
</script>

<style scoped>
.ms-slider { display: flex; flex-direction: column; gap: var(--space-sm); }
.ms-slider__header { display: flex; justify-content: space-between; align-items: center; }
.ms-slider__label { font-size: 13px; font-weight: 500; color: var(--muted-foreground); }
.ms-slider__value { font-size: 13px; font-weight: 600; color: var(--foreground); }
.ms-slider__input {
  -webkit-appearance: none;
  width: 100%; height: 4px;
  border-radius: var(--radius-full);
  outline: none; cursor: pointer;
  background: linear-gradient(to right, var(--primary) 0%, var(--primary) var(--pct), var(--secondary) var(--pct), var(--secondary) 100%);
  border: none;
}
.ms-slider__input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px; height: 18px;
  border-radius: 50%;
  background: var(--primary);
  box-shadow: 0 2px 6px rgba(0,0,0,0.20);
  border: 2.5px solid white;
  transition: box-shadow var(--transition);
}
.ms-slider__input::-webkit-slider-thumb:hover {
  box-shadow: 0 0 0 4px rgba(24,24,27,0.15);
}
</style>
