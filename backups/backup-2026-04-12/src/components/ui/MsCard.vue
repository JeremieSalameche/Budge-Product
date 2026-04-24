<template>
  <div :class="['ms-card', `ms-card--${padding}`, { 'ms-card--hoverable': hoverable }]">
    <div v-if="title || subtitle" class="ms-card__header">
      <div>
        <h3 v-if="title" class="ms-card__title">{{ title }}</h3>
        <p v-if="subtitle" class="ms-card__subtitle">{{ subtitle }}</p>
      </div>
      <slot name="actions" />
    </div>
    <slot />
  </div>
</template>

<script setup>
defineProps({
  title:    { type: String, default: null },
  subtitle: { type: String, default: null },
  padding:  { type: String, default: 'md' }, // sm | md | lg
  hoverable:{ type: Boolean, default: false },
})
</script>

<style scoped>
.ms-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
}
.ms-card--padding-md  { padding: 24px; }
.ms-card--padding-sm  { padding: 16px; }
.ms-card--padding-none { padding: 0; }
/* backward-compat aliases */
.ms-card--sm { padding: 16px; }
.ms-card--md { padding: 16px 20px; }
.ms-card--lg { padding: 32px; }
.ms-card--hoverable { transition: box-shadow var(--transition), transform var(--transition); cursor: pointer; }
.ms-card--hoverable:hover { border-color: var(--zinc-300); box-shadow: var(--shadow-md); transform: translateY(-1px); }
.ms-card__header {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 16px;
}
.ms-card__title {
  font-size: 14px; font-weight: 600; color: var(--foreground);
  margin-bottom: 4px;
}
.ms-card__subtitle {
  font-size: 12px; color: var(--muted-foreground);
  margin-bottom: 16px;
}
</style>
