// https://github.com/vuejs/vitepress/blob/main/src/node/markdown/markdown.ts
import { type ContainerOptions, containerPlugin } from './plugins/containers.ts'
import { gitHubAlertsPlugin } from './plugins/githubAlerts.ts'
import { highlight } from './plugins/highlight.ts'
import { highlightLinePlugin } from './plugins/highlightLines.ts'
import { type Options as ImageOptions, imagePlugin } from './plugins/image.ts'
import { lineNumberPlugin } from './plugins/lineNumbers.ts'
// import { linkPlugin } from './plugins/link.ts'
import { preWrapperPlugin } from './plugins/preWrapper.ts'
import { restoreEntities } from './plugins/restoreEntities.ts'
// import { snippetPlugin } from './plugins/snippet.ts'
import { type ComponentPluginOptions, componentPlugin } from '@mdit-vue/plugin-component'
// import { type FrontmatterPluginOptions, frontmatterPlugin } from '@mdit-vue/plugin-frontmatter'
import { type HeadersPluginOptions, headersPlugin } from '@mdit-vue/plugin-headers'
import { type SfcPluginOptions, sfcPlugin } from '@mdit-vue/plugin-sfc'
import { titlePlugin } from '@mdit-vue/plugin-title'
import { type TocPluginOptions, tocPlugin } from '@mdit-vue/plugin-toc'
import { slugify } from '@mdit-vue/shared'
// import type { Options } from 'markdown-it'
import MarkdownIt from 'markdown-it'
// import anchorPlugin from 'markdown-it-anchor'
import attrsPlugin from 'markdown-it-attrs'
import { full as emojiPlugin } from 'markdown-it-emoji'
import type { Logger } from 'vite'
import { MarkdownOptions, MarkdownRenderer } from 'vitepress'

// export type { Header } from '../shared'

export const createMarkdownRenderer = async (
  srcDir?: string,
  options: MarkdownOptions = {},
  base = '/',
  logger: Pick<Logger, 'warn'> = console
): Promise<MarkdownRenderer> => {
  const theme = options.theme ?? { light: 'github-light', dark: 'github-dark' }
  const codeCopyButtonTitle = options.codeCopyButtonTitle || 'Copy Code'
  const hasSingleTheme = typeof theme === 'string' || 'name' in theme

  const md = MarkdownIt({
    html: true,
    linkify: true,
    highlight: options.highlight || (await highlight(theme, options, logger)),
    ...options
  })

  md.linkify.set({ fuzzyLink: false })
  md.use(restoreEntities)

  if (options.preConfig) {
    options.preConfig(md)
  }

  // custom plugins
  md.use(componentPlugin, { ...options.component })
    .use(highlightLinePlugin)
    .use(preWrapperPlugin, { codeCopyButtonTitle, hasSingleTheme })
    //   .use(snippetPlugin, srcDir)
    .use(containerPlugin, { hasSingleTheme }, options.container)
    .use(imagePlugin, options.image)
    // .use(linkPlugin, { target: '_blank', rel: 'noreferrer', ...options.externalLinks }, base)
    .use(lineNumberPlugin, options.lineNumbers)

  md.renderer.rules.table_open = function (tokens, idx, options, env, self) {
    return '<table tabindex="0">\n'
  }

  if (options.gfmAlerts !== false) {
    md.use(gitHubAlertsPlugin)
  }

  // third party plugins
  if (!options.attrs?.disable) {
    md.use(attrsPlugin, options.attrs)
  }
  md.use(emojiPlugin, { ...options.emoji })

  // mdit-vue plugins
  //   md.use(anchorPlugin, {
  //     slugify,
  //     permalink: anchorPlugin.permalink.linkInsideHeader({
  //       symbol: '&ZeroWidthSpace;',
  //       renderAttrs: (slug, state) => {
  //         // Find `heading_open` with the id identical to slug
  //         const idx = state.tokens.findIndex((token) => {
  //           const attrs = token.attrs
  //           const id = attrs?.find((attr) => attr[0] === 'id')
  //           return id && slug === id[1]
  //         })
  //         // Get the actual heading content
  //         const title = state.tokens[idx + 1].content
  //         return {
  //           'aria-label': `Permalink to "${title}"`
  //         }
  //       }
  //     }),
  //     ...options.anchor
  //   } as anchorPlugin.AnchorOptions).use(frontmatterPlugin, {
  //     ...options.frontmatter
  //   } as FrontmatterPluginOptions)

  if (options.headers) {
    md.use(headersPlugin, {
      level: [2, 3, 4, 5, 6],
      slugify,
      ...(typeof options.headers === 'boolean' ? undefined : options.headers)
    } as HeadersPluginOptions)
  }

  md.use(sfcPlugin, {
    ...options.sfc
  } as SfcPluginOptions)
    .use(titlePlugin)
    .use(tocPlugin, {
      ...options.toc
    } as TocPluginOptions)

  if (options.math) {
    try {
      const mathPlugin = await import('markdown-it-mathjax3')
      md.use(mathPlugin.default ?? mathPlugin, {
        ...(typeof options.math === 'boolean' ? {} : options.math)
      })
      const orig = md.renderer.rules.math_block!
      md.renderer.rules.math_block = (tokens, idx, options, env, self) => {
        return orig(tokens, idx, options, env, self).replace(
          /^<mjx-container /,
          '<mjx-container tabindex="0" '
        )
      }
    } catch (error) {
      throw new Error('You need to install `markdown-it-mathjax3` to use math support.')
    }
  }

  // apply user config
  if (options.config) {
    options.config(md)
  }

  return md
}
