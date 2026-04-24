<template>
  <div :class="['ms-number', { 'ms-number--disabled': disabled }]">
    <label v-if="label" class="ms-number__label">{{ label }}</label>
    <div class="ms-number__wrap">
      <span v-if="prefix" class="ms-number__affix ms-number__prefix">{{ prefix }}</span>
      <button class="ms-number__btn" @click="decrement" :disabled="disabled || modelValue <= min" type="button">−</button>
      <input
        type="number"
        :value="modelValue"
        :min="min"
        :max="max"
        :step="step"
        :disabled="disabled"
        class="ms-number__input"
        @input="onInput"
        @change="onChange"
      />
      <button class="ms-number__btn" @click="increment" :disabled="disabled || modelValue >= max" type="button">+</button>
      <span v-if="suffix" class="ms-number__affix ms-number__suffix">{{ suffix }}</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  label:    { type: String, default: null },
  modelValue: { type: Number, default: 0 },
  min:      { type: Number, default: 0 },
  max:      { type: Number, default: Infinity },
  step:     { type: Number, default: 1 },
  prefix:   { type: String, default: null },
  suffix:   { type: String, default: null },
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

function clamp(v) { return Math.min(props.max, Math.max(props.min, v)) }
function increment() { emit('update:modelValue', clamp(props.modelValue + props.step)) }
function decrement() { emit('update:modelValue', clamp(props.modelValue - props.step)) }
function onInput(e) { emit('update:modelValue', clamp(parseFloat(e.target.value) || 0)) }
function onChange(e) { emit('update:modelValue', clamp(parseFloat(e.target.value) || 0)) }
</script>

<style scoped>
.ms-number { display: flex; flex-direction: column; gap: var(--space-xs); }
.ms-number__label { font-size: 12px; font-weight: 500; color: var(--muted-foreground); }
.ms-number__wrap {
  display: flex; align-items: center; gap: 0;
  border: 1px solid var(--input);
  border-radius: var(--radius-md);
  background: var(--background);
  overflow: hidden;
  height: 36px;
}
.ms-number__btn {
  padding: 0 10px; height: 36px;
  font-size: 18px; font-weight: 400;
  color: var(--muted-foreground);
  background: var(--secondary);
  border: none; cursor: pointer;
  transition: background var(--transition);
  flex-shrink: 0;
}
.ms-number__btn:hover:not(:disabled) { background: var(--zinc-200); color: var(--foreground); }
.ms-number__btn:disabled { opacity: 0.3; cursor: not-allowed; }
.ms-number__input {
  flex: 1; min-width: 60px;
  padding: 0 6px; text-align: center;
  border: none; outline: none;
  font-size: 14px; font-weight: 500;
  color: var(--foreground);
  background: transparent;
}
.ms-number__input::-webkit-inner-spin-button,
.ms-number__input::-webkit-outer-spin-button { -webkit-appearance: none; }
.ms-number__affix { padding: 0 8px; font-size: 13px; color: var(--muted-foreground); }
.ms-number--disabled { opacity: 0.4; pointer-events: none; }
</style>
