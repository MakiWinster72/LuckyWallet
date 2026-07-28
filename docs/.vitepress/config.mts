import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: 'LuckyWallet Wiki',
  description: 'LuckyWallet 项目部署、开发与使用文档',
  cleanUrls: true,
  themeConfig: {
    logo: '/luckywallet.png',
    siteTitle: 'LuckyWallet Wiki',
    nav: [
      { text: '首页', link: '/' },
      { text: '使用手册', link: '/user-guide' },
      { text: '开发指南', link: '/development' },
      { text: 'GitHub', link: 'https://github.com/MakiWinster72/LuckyWallet' }
    ],
    sidebar: [
      {
        text: '开始使用',
        items: [
          { text: '项目介绍', link: '/' },
          { text: '启动指南', link: '/how_to_start' },
          { text: '使用手册', link: '/user-guide' },
          { text: '部署手册', link: '/deployment' }
        ]
      },
      {
        text: '接口与开发',
        items: [
          { text: 'API 接口文档', link: '/api' },
          { text: '数据库说明', link: '/DATABASE' },
          { text: '开发指南', link: '/development' },
          { text: '提交和分支规范', link: '/提交和分支命名规范' }
        ]
      },
      {
        text: '部署与设计',
        items: [
          { text: '部署手册', link: '/deployment' },
          { text: '颜色设计', link: '/color%20design' }
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
