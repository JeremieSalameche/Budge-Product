<template>
  <div :class="['ms-input', { 'ms-input--error': error, 'ms-input--disabled': disabled }]">
    <label v-if="label" class="ms-input__label">{{ label }}</label>
    <div class="ms-input__wrap">
      <input
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :value="modelValue"
        class="ms-input__field"
        @input="$emit('update:modelValue', $event.target.value)"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
      />
    </div>
    <p v-if="error" class="ms-input__error">{{ error }}</p>
    <p v-else-if="helper" class="ms-input__helper">{{ helper }}</p>
  </div>
</template>

<script setup>
defineProps({
  label:       { type: String, default: null },
  placeholder: { type: String, default: '' },
  modelValue:  { default: '' },
  error:       { type: String, default: null },
  helper:      { type: String, default: null },
  disabled:    { type: Boolean, default: false },
  type:        { type: String, default: 'text' },
})
defineEmits(['update:modelValue', 'blur', 'focus'])
</script>

<style scoped>
.ms-input { display: flex; flex-direction: column; gap: var(--space-xs); }
.ms-input__label { font-size: 12px; font-weight: 500; color: var(--muted-foreground); }
.ms-input__wrap { position: relative; }
.ms-input__field {
  height: 36px;
  padding: 0 12px;
  border: 1px solid var(--input);
  border-radius: var(--radius-md);
  font-size: 14px;
  background: var(--background);
  color: var(--foreground);
  outline: none;
  width: 100%;
  font-family: inherit;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}
.ms-input__field::placeholder { color: var(--muted-foreground); }
.ms-input__field:focus {
  border-color: var(--ring);
  box-shadow: 0 0 0 2px rgba(24,24,27,0.12);
}
.ms-input__field:disabled { opacity: 0.5; cursor: not-allowed; }
.ms-input--error .ms-input__field { border-color: var(--destructive); }
.ms-input--disabled { opacity: 0.4; pointer-events: none; }
.ms-input__error { font-size: 12px; color: var(--color-danger); }
.ms-input__helper { font-size: 12px; color: var(--muted-foreground); }
</style>
