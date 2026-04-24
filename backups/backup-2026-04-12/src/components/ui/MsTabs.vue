<template>
  <div class="ms-tabs">
    <div class="ms-tabs__bar" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['ms-tabs__tab', { 'ms-tabs__tab--active': modelValue === tab.id }]"
        role="tab"
        :aria-selected="modelValue === tab.id"
        @click="$emit('update:modelValue', tab.id)"
        type="button"
      >
        <span v-if="tab.icon" class="ms-tabs__icon">{{ tab.icon }}</span>
        {{ tab.label }}
      </button>
    </div>
    <div class="ms-tabs__content">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  tabs:       { type: Array, required: true },
  modelValue: { type: String, required: true },
})
defineEmits(['update:modelValue'])
</script>

<style scoped>
.ms-tabs__bar {
  display: flex; gap: 0;
  border-bottom: 1px solid var(--border);
  margin-bottom: var(--space-xl);
}
.ms-tabs__tab {
  display: inline-flex; align-items: center; gap: var(--space-sm);
  padding: 10px 18px;
  font-size: 14px; font-weight: 500;
  color: var(--muted-foreground);
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  cursor: pointer; background: none; border-left: none; border-right: none; border-top: none;
  transition: color var(--transition), border-color var(--transition);
}
.ms-tabs__tab:hover { color: var(--foreground); }
.ms-tabs__tab--active { color: var(--foreground); border-bottom-color: var(--primary); font-weight: 600; }
.ms-tabs__content { }
</style>
