---
layout: home

hero:
  name: LuckyWallet
  text: 记录每一笔
  tagline: 记录付款人、参与成员与分摊结果，让日常支出始终有迹可循。
  image:
    src: /luckywallet.png
    alt: LuckyWallet 紫色皮革钱包与金色四叶草标志
    width: 512
    height: 512
  actions:
    - theme: brand
      text: 快速启动
      link: /how_to_start
    - theme: alt
      text: 使用手册
      link: /user-guide

features:
  - title: 账单与分摊
    details: 记录付款人和参与成员，自动处理平均分摊与分币尾差。
  - title: 预算与统计
    details: 查看月度预算、支出趋势、分类占比、成员净额和结算建议。
  - title: 完整工程化
    details: 提供 FastAPI 接口、MySQL 数据库、自动化测试和 Docker Compose 部署。
---

<div class="home-intro-grid">
  <div>
    <span class="home-kicker">A SMALL WALLET, A CLEARER HOUSEHOLD</span>
    <h2>从“谁先付了”开始，走到“现在该给谁”。</h2>
    <p>LuckyWallet 把账单、分摊、预算与结算放在同一条清晰的记录里。适合家庭、合租室友、宿舍和固定小团队。</p>
  </div>
  <div class="home-ledger-note">
    <span>记录原则</span>
    <strong>付款人 ≠ 承担人</strong>
    <small>每笔金额都保留来龙去脉</small>
  </div>
</div>

## 项目简介

LuckyWallet 不只记录消费金额，还区分实际付款人与参与消费的人，并通过每笔分摊计算成员应收或应付的净额。

## 从这里开始

| 目标                       | 文档                      |
| -------------------------- | ------------------------- |
| 在本机运行项目             | [快速启动](/how_to_start) |
| 了解页面和业务规则         | [使用手册](/user-guide)   |
| 使用 Docker 或部署到服务器 | [部署手册](/deployment)   |
| 参与开发和运行测试         | [开发指南](/development)  |
| 对接后端接口               | [API 接口文档](/api)      |
| 了解表结构和数据关系       | [数据库说明](/DATABASE)   |

后端启动后，还可通过 Swagger UI `<后端地址>/docs` 在线查看和调试接口。
