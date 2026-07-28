---
layout: home

hero:
  name: LuckyWallet
  text: 共同生活账本
  tagline: 记录谁付款、谁参与，清楚计算每个人应承担的金额。
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

## 项目简介

LuckyWallet 适用于家庭、合租室友、宿舍和固定小团队。它不仅记录消费金额，还区分实际付款人与参与消费的人，并通过每笔分摊计算成员应收或应付的净额。

## 从这里开始

| 目标 | 文档 |
| --- | --- |
| 在本机运行项目 | [快速启动](/how_to_start) |
| 了解页面和业务规则 | [使用手册](/user-guide) |
| 使用 Docker 或部署到服务器 | [部署手册](/deployment) |
| 参与开发和运行测试 | [开发指南](/development) |
| 对接后端接口 | [API 接口文档](/api) |
| 了解表结构和数据关系 | [数据库说明](/DATABASE) |

后端启动后，还可通过 Swagger UI `<后端地址>/docs` 在线查看和调试接口。
