<script setup lang="ts">
import { TextareaHTMLAttributes, defineEmits, defineProps } from 'vue'

interface InputTextProps extends /* @vue-ignore */ TextareaHTMLAttributes {
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
  <textarea :value="modelValue" @input="onInput"></textarea>
</template>

<style scoped>
Textarea {
  width: auto;
  min-width: 0;
  background-color: var(--vp-input-bg-color);
  border-width: 1px;
  border-style: solid;
  border-color: var(--vp-input-border-color);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

Textarea:focus {
  border-width: 1px;
  border-style: solid;
  border-color: var(--vp-c-brand-1);
}
</style>
