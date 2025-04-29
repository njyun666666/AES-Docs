<script setup lang="ts">
import { ButtonHTMLAttributes } from 'vue'

interface ButtonProps extends /* @vue-ignore */ ButtonHTMLAttributes {}

const props = defineProps<ButtonProps>()
</script>

<template>
  <button>
    <slot />
  </button>
</template>

<style scoped>
button {
  color: var(--vp-button-brand-text);
  background-color: var(--vp-button-brand-bg);
  border-color: var(--vp-button-brand-border);
  border-radius: 0.25rem;
  padding: 0.25rem 0.5rem;
}

button:hover {
  color: var(--vp-button-brand-hover-text);
  background-color: var(--vp-button-brand-hover-bg);
  border-color: var(--vp-button-brand-hover-border);
}

button:active {
  color: var(--vp-button-brand-active-text);
  background-color: var(--vp-button-brand-active-bg);
  border-color: var(--vp-button-brand-active-border);
}
</style>
