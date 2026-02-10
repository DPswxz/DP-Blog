import { TransformContext } from "vitepress"
import type { AkariThemeConfig } from "./theme/types.js"

const themeConfig: AkariThemeConfig = {
  debugInfo: true,
  nav: [
    { text: '首页', link: '/index.html' },
    { text: '五十音', link: '/gojuon.html' },
    { text: '罗马音', link: '/romaji.html' },
    { text: '语法', link: '/grammar.html' },
    { text: '助词', link: '/particles.html' },
    { text: '动词语气', link: '/verbs.html' },
  ],
  hideFromHomeLayouts: ['home'],
  defaultColorsSet: ['#ac2b21', '#8e2fa8', '#285f9f', '#2e6c29', '#675f1a', '#2b6672'],
  baseThemeColor: '#ffffff',
  siteNotice: [
    '欢迎来到日语学习网站',
    '这里有五十音、语法、助词的详细讲解',],
  trackers: {
    google: { // Google Analytics, optional
      use: false,
      id: ''
    },
    matomo: { // Matomo, optional
      use: false,
      siteID: 0,
      trackerUrl: ""
    }
  },
  docSearch: { // DocSearch by Algolia, optional
    appId: '',
    indexName: '',
    apiKey: '',
    insights: true,
    placeholder: 'Search',
  },
  footer: {
    aboutMe: "这是一个专注于日语学习的个人网站，旨在提供清晰易懂的日语基础知识，包括五十音图、基础语法、助词用法以及动词变形等内容。希望能帮助到每一位日语初学者。",
    socials: [
      { text: 'GitHub', link: 'https://github.com' },
    ],
    links: [
      { text: 'VitePress', link: 'https://vitepress.dev' },
    ],
    copyRight: '©2024 日语学习',
  },
  use_blur_background: false,
}

const defineConfig = { // Docs: https://vitepress.dev/reference/site-config
  
  lang: 'zh-CN', // Language, set to 'zh-CN' if you want to use Chinese
  title: "日语学习笔记",
  subtitle: "从零开始学日语",
  description: "日语学习，五十音，语法，助词，动词语气",
  cleanUrls: false,
  themeConfig: {
    ...themeConfig
  },
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag: string) => tag.startsWith('mdui-')
      }
    },
  },
  vite: {
    resolve: { // If you don't like something, just replace it :)
      // alias: [
      //   {
      //     find: /^.*\/NotFound\.vue$/,
      //     replacement: './custom/NotFound.vue'
      //   },
      //   {
      //     find: /^.*\/Footer\.vue$/,
      //     replacement: './custom/Footer.vue'
      //   }
      // ]
    }
  },


  head: [
    [
      'link',
      { 'rel': 'preconnect', 'href': 'https://fonts.googleapis.com' }
    ],
    [
      'link',
      { 'rel': 'preconnect', 'href': 'https://fonts.gstatic.com', 'crossorigin': '' }
    ],
    [
      'link',
      { href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400..600&display=swap', rel: 'stylesheet' }
    ],
    // [
    //   'link',
    //   { href: 'https://fonts.googleapis.com/icon?family=Material+Icons+Outlined', rel: 'stylesheet' }
    // ],
    // [
    //   'link',
    //   { href: 'https://fonts.googleapis.com/icon?family=Material+Icons', rel: 'stylesheet' }
    // ],
  ],
  ignoreDeadLinks: false,
  appearance: false,
  lastUpdated: true,
  async transformHead(context: TransformContext) {
    context.head.push(['meta', { 'name': 'complied-time', 'content': new Date().toISOString() }])
  }
}

export default defineConfig
