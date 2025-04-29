<script setup lang="ts">
import { InputHTMLAttributes, defineEmits, defineProps } from 'vue'

interface InputTextProps extends /* @vue-ignore */ InputHTMLAttributes {
  modelValue?: string | number
}

const props = defineProps<InputTextProps>()

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const onInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <input :value="modelValue" @input="onInput" />
</template>

<style scoped>
input {
  width: auto;
  min-width: 0;
  background-color: var(--vp-input-bg-color);
  border-width: 1px;
  border-style: solid;
  border-color: var(--vp-input-border-color);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

input:focus {
  border-width: 1px;
  border-style: solid;
  border-color: var(--vp-c-brand-1);
}

input[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
