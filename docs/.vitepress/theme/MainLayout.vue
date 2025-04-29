<script setup lang="ts">
import DocAes from './components/DocAes/DocAes.vue'
import SidebarAes from './components/SidebarAes/SidebarAes.vue'
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { provide, ref } from 'vue'

const { Layout } = DefaultTheme
const sidebarAesKey = ref('')
const { page, frontmatter } = useData()

provide('sidebarAesKey', sidebarAesKey)
</script>

<template>
  <Layout>
    <!-- <template #sidebar-nav-before>
      <ClientOnly>
        <div class="SidebarAes">
          <SidebarAes />
        </div>
      </ClientOnly>
    </template> -->
    <template #doc-before>
      <ClientOnly>
        <div>
          <DocAes :key="page.value?.filePath" />
        </div>
      </ClientOnly>
    </template>
  </Layout>
</template>
<style scoped>
.SidebarAes {
  padding-top: 1rem;
  padding-bottom: 1rem;
}
</style>
