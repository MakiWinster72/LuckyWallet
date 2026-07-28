import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/wiki/',
  lang: 'zh-CN',
  title: 'LuckyWallet Wiki',
  description: 'LuckyWallet 项目部署、开发与使用文档',
  cleanUrls: true,
  themeConfig: {
    logo: '/luckywallet.png',
    siteTitle: 'LuckyWallet Wiki',
    nav: [
      { text: '首页', link: '/' },
      { text: '使用手册', link: '/guides/user-guide' },
      { text: '开发指南', link: '/development/guide' },
      { text: 'GitHub', link: 'https://github.com/MakiWinster72/LuckyWallet' }
    ],
    sidebar: [
      {
        text: '开始使用',
        items: [
          { text: '项目介绍', link: '/' },
          { text: '启动指南', link: '/guides/how_to_start' },
          { text: '使用手册', link: '/guides/user-guide' },
          { text: '部署手册', link: '/guides/deployment' }
        ]
      },
      {
        text: '接口与开发',
        items: [
          { text: 'API 接口文档', link: '/reference/api' },
          { text: '数据库说明', link: '/reference/DATABASE' },
          { text: '开发指南', link: '/development/guide' },
          { text: '提交和分支规范', link: '/collaboration/commit-conventions' }
        ]
      },
      {
        text: '实现细节',
        items: [
          { text: '项目实现细节', link: '/development/implementation' }
        ]
      },
      {
        text: '部署与设计',
        items: [
          { text: '部署手册', link: '/guides/deployment' }
        ]
      }
    ],
    outline: 'deep',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/MakiWinster72/LuckyWallet' }
    ],
    search: {
      provider: 'local'
    },
    footer: {
      message: 'LuckyWallet 项目文档',
      copyright: 'Copyright © 2026 LuckyWallet'
    }
  }
})
