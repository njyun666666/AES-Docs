<script setup lang="ts">
import { createMarkdownRenderer } from '../../../markdown/markdown'
import { decryptMessage, encryptMessage } from '../../../shared/aes'
import Button from '../ui/Button.vue'
import InputText from '../ui/InputText.vue'
import Textarea from '../ui/Textarea.vue'
import { useClipboard, watchDebounced } from '@vueuse/core'
import { useData } from 'vitepress'
import { computed, ref, watch } from 'vue'

const { site, page, frontmatter } = useData()
const clipboard = useClipboard()
const docAesKey = ref('1')
const docAesKeyConfirm = ref('1')
const contentFrontmatter = ref('')
const contentMd = ref('')
const contentHtml = ref('')

const isNew = computed(() => page.value.filePath === 'new.md')
const isEditMode = ref(false)

const decryptHandle = async (e: MouseEvent) => {
  if (!comfirmKey()) return
  const encrypt = document.querySelector('#aes>p')?.textContent ?? ''
  const decrypt = await decryptMessage(docAesKey.value.trim(), encrypt)
  contentMd.value = decrypt
  // console.log(encrypt, decrypt)
}

const comfirmKey = () => {
  if (!docAesKey.value || !docAesKeyConfirm.value) {
    alert('Required: Key, Confirm Key')
    return false
  }

  if (docAesKey.value !== docAesKeyConfirm.value) {
    alert('Failed: Confirm Key')
    return false
  }

  return true
}

const editHandle = () => {
  isEditMode.value = !isEditMode.value
}

const pushHandle = async () => {
  if (!comfirmKey()) return

  const encrypt = await encryptMessage(docAesKey.value, contentMd.value)
  // const decrypt = await decryptMessage(docAesKey.value, encrypt)
  let githubUrl = `${site.value.themeConfig.editLink.pattern}`.replace(/\/:path/, '')
  // console.log(encrypt, decrypt)
  const pageContent = composeText(encrypt)

  clipboard.copy(pageContent)

  if (isNew.value) {
    githubUrl =
      githubUrl.replace(/\/edit\//, `\/new\/`) + `?value=${encodeURIComponent(pageContent)}`
  } else {
    githubUrl = githubUrl + `/${page.value.filePath}`
  }

  window.open(githubUrl, '_blank')
}

const composeText = (encrypt: string) => {
  return `---
${contentFrontmatter.value}
---

::: details AES {#aes}
${encrypt}
:::
  `
}

watch(
  page,
  () => {
    console.log(page.value.filePath)
  },
  {
    immediate: true
  }
)

watchDebounced(
  contentMd,
  async (val) => {
    const html = (await createMarkdownRenderer()).render(val)
    contentHtml.value = html
  },
  {
    immediate: true,
    debounce: 1000
  }
)
</script>
<template>
  <div class="doc-aes">
    <div class="doc-aes-input">
      <InputText type="password" v-model="docAesKey" placeholder="Key" />
      <InputText type="password" v-model="docAesKeyConfirm" placeholder="Confirm Key" />
      <Button type="button" @click="decryptHandle">🔓</Button>
    </div>
    <div class="toolbar">
      <Button type="button" class="edit" title="Edit" @click="editHandle">
        <span class="vpi-square-pen"></span>
      </Button>
      <Button type="button" class="push" title="Push" @click="pushHandle">
        <span class="vpi-social-github"></span>
      </Button>
    </div>
    <div class="frontmatter" v-if="isEditMode">
      <Textarea class="textarea" v-model="contentFrontmatter" />
    </div>
    <div class="content">
      <div class="content-md" v-if="isEditMode">
        <Textarea class="textarea" v-model="contentMd" />
      </div>
      <div class="content-html vp-doc" v-html="contentHtml"></div>
    </div>
    <p>
      {{ page }}
    </p>
    <p>
      {{ isNew }}
    </p>
    <p>
      {{ frontmatter }}
    </p>
  </div>
</template>
<style scoped>
.doc-aes {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.doc-aes-input {
  display: flex;
  gap: 0.5rem;
}

.doc-aes-input > input {
  flex-grow: 1;
}

.toolbar {
  display: flex;
  gap: 0.5rem;
}

.toolbar span {
  display: block;
  width: 1.2rem;
  height: 1.2rem;
}

.frontmatter {
  width: 100%;
}

.frontmatter textarea {
  width: 100%;
  height: 6rem;
}

.content {
  display: flex;
  gap: 1rem;
  width: 100%;
}

.content > div {
  width: 100%;
}

.content-md textarea {
  width: 100%;
  min-height: 100%;
  height: 300px;
}
</style>
