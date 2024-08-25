<script setup lang="ts">
import { createMarkdownRenderer } from '../../../markdown/markdown'
import Button from '../ui/Button.vue'
import InputText from '../ui/InputText.vue'
import Textarea from '../ui/Textarea.vue'
import { watchDebounced } from '@vueuse/core'
import MarkdownIt from 'markdown-it'
import { useData } from 'vitepress'
import { computed, ref, watch } from 'vue'

const { page, frontmatter } = useData()
const docAesKey = ref('')
const contentMd = ref(`
# h1 Heading 8-)
## h2 Heading
### h3 Heading

::: info
This is an info box.
:::

::: details test {#test}
This is a details block.
:::

## Code

Inline \`code\`


## Tables

| Option | Description |
| ------ | ----------- |
| data   | path to data files to supply the data that will be passed into templates. |
| engine | engine to be used for processing templates. Handlebars is the default. |
| ext    | extension to be used for dest files. |

`)
const contentHtml = ref('')

const isNew = computed(() => page.value.filePath === 'new.md')

const aesHandle = (e: MouseEvent) => {
  const a = document.querySelector('#aes>p')?.textContent
  console.log(a)
}

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
      <InputText type="password" v-model="docAesKey" />
      <Button type="button" @click="aesHandle">🔓</Button>
    </div>
    <div class="content">
      <div class="content-md">
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

.content {
  display: flex;
  gap: 1rem;
  width: 100%;
}

.content > div {
  width: 100%;
}

.content-md .textarea {
  width: 100%;
  min-height: 100%;
  height: 300px;
}
</style>
