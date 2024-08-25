<script setup lang="ts">
import Button from '../ui/Button.vue'
import InputText from '../ui/InputText.vue'
import { Ref, inject } from 'vue'

const sidebarAesKey = inject('sidebarAesKey') as Ref<string>

const aesHandle = (e: MouseEvent) => {
  //   console.log((sidebarAesKey.value = 'click'))
}
</script>

<template>
  <div class="sidebar-aes">
    <InputText type="password" v-model="sidebarAesKey" />
    <Button type="button" @click="aesHandle">🔓</Button>
  </div>
</template>

<style scoped>
.sidebar-aes {
  display: flex;
  gap: 0.5rem;
}

.sidebar-aes > input {
  flex-grow: 1;
}
</style>
