<template>
  <span :class="['ms-badge', `ms-badge--${variant}`, `ms-badge--${size}`]">
    {{ label }}
  </span>
</template>

<script setup>
defineProps({
  label:   { type: String, required: true },
  variant: { type: String, default: 'default' }, // default | success | danger | warning | info
  size:    { type: String, default: 'md' },       // sm | md
})
</script>

<style scoped>
.ms-badge {
  display: inline-flex; align-items: center;
  padding: 2px 10px;
  border-radius: var(--radius-full);
  font-size: 11px; font-weight: 500; line-height: 1.5;
  white-space: nowrap;
}
.ms-badge--sm { font-size: 10px; padding: 1px 8px; }
.ms-badge--md { font-size: 11px; padding: 2px 10px; }

.ms-badge--default     { background: var(--primary); color: var(--primary-foreground); }
.ms-badge--secondary   { background: var(--secondary); color: var(--secondary-foreground); }
.ms-badge--destructive { background: var(--destructive); color: var(--destructive-foreground); }
.ms-badge--outline     { background: transparent; border: 1px solid var(--border); color: var(--foreground); }
.ms-badge--success     { background: var(--color-success-subtle); color: var(--color-success-text); }
.ms-badge--warning     { background: var(--color-warning-subtle); color: var(--color-warning-text); }
.ms-badge--danger      { background: var(--color-danger-subtle); color: var(--color-danger-text); }
.ms-badge--info        { background: var(--muted); color: var(--muted-foreground); }
</style>
