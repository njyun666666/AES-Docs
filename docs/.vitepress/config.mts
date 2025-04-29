import { defineConfig } from 'vitepress'
import { generateSidebar } from 'vitepress-sidebar'

const vitepressSidebarOptions = {
  documentRootPath: '/docs',
  collapsed: true,
  useTitleFromFrontmatter: true,
  useFolderTitleFromIndexFile: true,
  sortMenusByFrontmatterOrder: true,
  frontmatterOrderDefaultValue: 999
}

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'AES Docs',
  description: 'AES Docs',
  lang: 'zh-TW',
  head: [['meta', { name: 'robots', content: 'noindex, nofollow' }]],
  themeConfig: {
    editLink: {
      pattern: 'https://github.com/njyun666666/AES-Docs/edit/main/docs/:path'
    },
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'New', link: '/new' }
    ],
    sidebar: generateSidebar(vitepressSidebarOptions),
    socialLinks: [{ icon: 'github', link: 'https://github.com/njyun666666/AES-Docs' }]
  }
})
