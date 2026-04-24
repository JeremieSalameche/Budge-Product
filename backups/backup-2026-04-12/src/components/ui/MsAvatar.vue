<template>
  <div :class="['ms-avatar', `ms-avatar--${size}`]" :style="src ? {} : { background: color || '#18181B' }">
    <img v-if="src" :src="src" :alt="initials" class="ms-avatar__img" />
    <span v-else class="ms-avatar__initials">{{ initials }}</span>
  </div>
</template>

<script setup>
defineProps({
  initials: { type: String, default: '?' },
  src:      { type: String, default: null },
  size:     { type: String, default: 'md' }, // sm | md | lg
  color:    { type: String, default: null },
})
</script>

<style scoped>
.ms-avatar {
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 50%; overflow: hidden; flex-shrink: 0;
}
.ms-avatar--sm  { width: 28px; height: 28px; font-size: 11px; }
.ms-avatar--md  { width: 36px; height: 36px; font-size: 13px; }
.ms-avatar--lg  { width: 48px; height: 48px; font-size: 17px; }
.ms-avatar__img { width: 100%; height: 100%; object-fit: cover; }
.ms-avatar__initials { color: white; font-weight: 700; letter-spacing: 0.5px; }
</style>
