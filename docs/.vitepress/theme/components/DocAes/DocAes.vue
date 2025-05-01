<script setup lang="ts">
import { createMarkdownRenderer } from '../../../markdown/markdown'
import { decryptMessage, encryptMessage } from '../../../shared/aes'
import { FrontmatterModel, LogModel } from '../../../shared/model'
import { uuid } from '../../../shared/uuid'
import Button from '../ui/Button.vue'
import InputText from '../ui/InputText.vue'
import Textarea from '../ui/Textarea.vue'
import { useClipboard, watchDebounced } from '@vueuse/core'
import { useData } from 'vitepress'
import { computed, ref, watch } from 'vue'

const { site, page, frontmatter } = useData()
const clipboard = useClipboard()
const docAesKey = ref('')
const docAesKeyConfirm = ref('')
const frontmatterList = ref<FrontmatterModel[]>([])
const contentMd = ref('')
const contentHtml = ref('')

const isNew = computed(() => page.value.filePath === 'new.md')
const isDecrypt = ref(false)
const isEditMode = ref(false)

const decryptHandle = async (e: Event) => {
  e.preventDefault()

  if (!comfirmKey()) return
  const encrypt = document.querySelector('#aes>p')?.textContent ?? ''
  const decrypt = await decryptMessage(docAesKey.value.trim(), encrypt).catch(() => {})

  if (!decrypt) {
    alert(`Decrypt failed `)
    return
  }

  contentMd.value = decrypt
  frontmatterList.value = await parseFrontmatterList()
  // console.log(encrypt, decrypt)
  isDecrypt.value = true
  return true
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

const editHandle = async () => {
  if (!isDecrypt.value) {
    alert(`Unlock first`)
    return
  }

  isEditMode.value = !isEditMode.value
}

const addHandle = () => {
  frontmatterList.value.push({ id: uuid(), name: '', value: '' })
}

const removeHandle = (id: string) => {
  frontmatterList.value = frontmatterList.value.filter((x) => x.id != id)
}

const pushHandle = async () => {
  if (!comfirmKey()) return
  console.log(docAesKey.value)
  const encrypt = await encryptMessage(docAesKey.value, contentMd.value)
  const fm = await parseFrontmatter()

  if (!encrypt || !fm) return

  const pageContent = composeText(fm, encrypt)
  let githubUrl = `${site.value.themeConfig.editLink.pattern}`.replace(/\/:path/, '')

  clipboard.copy(pageContent)
  callApi(pageContent)

  if (isNew.value) {
    githubUrl =
      githubUrl.replace(/\/edit\//, `\/new\/`) + `?value=${encodeURIComponent(pageContent)}`
  } else {
    githubUrl = githubUrl + `/${page.value.filePath}`
  }

  window.open(githubUrl, '_blank')
}

const parseFrontmatter = async () => {
  let result = ``

  for (const item of frontmatterList.value) {
    if (!item.name && !item.value) continue
    if (!item.name || !item.value) {
      alert('Required: Frontmatter')
      return
    }

    let value = item.value

    if (item.name === 'api' && item.value) {
      value = await encryptMessage(docAesKey.value, value)
    }

    result += `${item.name}: ${value ?? ''}\n`
  }

  return result
}

const parseFrontmatterList = async () => {
  const list = [] as FrontmatterModel[]

  for (const [key, item] of Object.entries(frontmatter.value)) {
    let value = item

    if (key === 'api' && value) {
      value = await decryptMessage(docAesKey.value, value)
    }

    list.push({
      id: uuid(),
      name: key,
      value: value
    })
  }

  return list
}

const composeText = (fm: string, encrypt: string) => {
  return `---
${fm}
---

::: details AES {#aes}
${encrypt}
:::
`
}

const callApi = (text: string) => {
  const api = frontmatterList.value.find((x) => x.name === 'api')?.value
  if (!api) return

  const data: LogModel = {
    filePath: page.value.filePath,
    content: text
  }

  fetch(api, {
    method: 'POST',
    mode: 'no-cors',
    cache: 'no-cache',
    body: JSON.stringify(data),
    headers: {
      'content-type': 'application/json'
    }
  })
    .then(function (response) {
      // console.log(response)
      // console.log(response.status, response.ok)
      if (response.status != 0 && !response.ok) {
        alert(`call api error, ${response.status}`)
      }
      // return response.json();
    })
    .catch(() => {
      alert('catch: call api error')
    })
}

const copyKeyToConfirm = () => {
  docAesKeyConfirm.value = docAesKey.value
  decryptHandle(new Event('submit'))
}

watch(
  page,
  async () => {
    // console.log('isNew', isNew.value)
    // console.log(page.value.filePath)

    isEditMode.value = false
    docAesKey.value = ''
    docAesKeyConfirm.value = ''
    frontmatterList.value = []
    //await parseFrontmatterList()

    contentMd.value = ''
    contentHtml.value = ''

    if (isNew.value) {
      isEditMode.value = true
      frontmatterList.value = [
        {
          id: uuid(),
          name: 'title',
          value: ''
        },
        {
          id: uuid(),
          name: 'api',
          value: ''
        }
      ]
    }
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
    <div class="vp-doc">
      <h1>
        {{ page.title }}
      </h1>
      <!-- <p>
        frontmatterList:
        {{ frontmatterList }}
      </p> -->
    </div>

    <!-- key -->
    <div>
      <form class="doc-aes-form" @submit="decryptHandle">
        <InputText type="text" v-model="docAesKey" placeholder="Key" autocomplete="one-time-code" />
        <Button type="button" title="copy" :class="{ hidden: isNew }" @click="copyKeyToConfirm">
          <span>></span>
        </Button>
        <InputText
          type="text"
          v-model="docAesKeyConfirm"
          placeholder="Confirm Key"
          autocomplete="one-time-code"
        />
        <Button type="submit" title="Unlock" :class="{ invisible: isNew }">
          <span>🔓</span>
        </Button>
      </form>
    </div>

    <!-- toolbar -->
    <div class="toolbar">
      <Button type="button" class="edit" title="Edit" @click="editHandle">
        <span class="vpi-square-pen"></span>
      </Button>
      <Button type="button" class="push" title="Push" @click="pushHandle">
        <span class="vpi-social-github"></span>
      </Button>
    </div>

    <!-- frontmatter -->
    <div class="frontmatter" v-if="isEditMode">
      <div class="frontmatter-header">
        <h2>Frontmatter</h2>
        <div class="grow"></div>
        <Button type="button" title="Add" @click="addHandle"> + </Button>
      </div>
      <div class="frontmatter-item" v-for="item in frontmatterList" :key="item.id">
        <InputText
          type="text"
          class="frontmatter-name"
          v-model="item.name"
          :disabled="['title', 'api'].includes(item.name)"
        />
        <span class="frontmatter-separate">:</span>
        <InputText type="text" class="frontmatter-value" v-model="item.value" />
        <Button
          type="button"
          title="Remove"
          :class="{ invisible: ['title', 'api'].includes(item.name) }"
          @click="removeHandle(item.id)"
        >
          X
        </Button>
      </div>
      <!-- <Textarea class="textarea" v-model="contentFrontmatter" /> -->
    </div>

    <!-- content -->
    <h2 v-if="isEditMode">Content</h2>
    <div class="content">
      <div class="content-md" v-if="isEditMode">
        <Textarea class="textarea" v-model="contentMd" />
      </div>
      <div class="content-html vp-doc" v-html="contentHtml"></div>
    </div>
  </div>
</template>
<style scoped>
.doc-aes {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.doc-aes-form {
  display: flex;
  gap: 0.5rem;
}

.doc-aes-form > input {
  flex-grow: 1;
  color: transparent;
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
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.frontmatter textarea {
  width: 100%;
  height: 6rem;
}

.frontmatter-header {
  display: flex;
}

.frontmatter-item {
  display: flex;
  gap: 0.5rem;
}

.frontmatter-value {
  flex-grow: 1;
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

.grow {
  flex-grow: 1;
}

.invisible {
  visibility: hidden;
}

.hidden {
  display: none;
}
</style>
