# 云端的杂货铺

个人博客，记录生活、技术问题解决过程，以及偶尔偏学术的哲学思考。

线上地址：<https://blog.illsky.com>

## 技术栈

- Astro 5（静态站点生成）
- TypeScript + Content Collections（Zod 校验）
- Tailwind CSS + `@tailwindcss/typography`
- Expressive Code（代码高亮）
- Satori + Resvg（文章 Open Graph 图片）
- Pagefind（静态搜索）
- Webmention.io（互动）
- Vercel（部署与访问统计）

## 本地开发

需要 Node.js 20+ 与 pnpm 9+：

```bash
pnpm install
pnpm dev
```

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 启动开发服务器 |
| `pnpm check` | Astro 类型与内容检查 |
| `pnpm build` | 构建到 `dist/`，并自动执行 `postbuild` 生成 Pagefind 索引 |
| `pnpm preview` | 预览构建产物 |
| `pnpm format` | 使用 Prettier 格式化 |

## 目录结构

```text
src/
├── assets/                 # 字体与静态图片
├── components/             # 可复用组件
├── content/
│   ├── config.ts           # 内容集合与 frontmatter 校验
│   └── post/               # Markdown 文章
├── data/post.ts            # 草稿过滤、排序、分组、标签统计
├── layouts/                # Base / BlogPost 布局
├── pages/                  # 首页、文章、标签、RSS、OG 图片
├── styles/global.css       # 主题变量与全局样式
├── site.config.ts          # 站点信息与导航
└── utils/                  # 日期、TOC、阅读时间、Webmention
```

## 添加文章

在 `src/content/post/` 下新建 `.md` 文件，文件名即 slug。frontmatter 示例：

```yaml
---
title: "文章标题"
description: "50-160 字符的摘要，用于 SEO 与列表展示"
publishDate: "2025-01-01"
updatedDate: "2025-01-02" # 可选，不得早于 publishDate
tags: ["博客", "Astro"]
draft: false
---
```

- 日期统一使用 `YYYY-MM-DD`，避免构建时区导致日期漂移。
- `draft: true` 的文章只会在开发环境出现，不会进入生产构建、RSS、sitemap 或 OG 图片。
- 如需自定义分享图，添加 `ogImage: "/social-card.png"`；否则自动生成 `/og-image/<slug>.png`。

## 环境变量

复制 `.example.env` 为 `.env`，按需填写：

```dotenv
WEBMENTION_API_KEY=your-webmention-io-token
```

未配置 token 时，构建会跳过 Webmention 抓取，页面不会展示互动区。

## 部署

推送到 `main` 后由 Vercel 自动构建。构建命令为 `pnpm build`，`postbuild` 会在 `dist/pagefind/` 生成搜索索引。

## 字体

`assets/fonts/` 下的 Noto Sans SC 子集用于构建期生成中文 OG 图片，遵循 SIL Open Font License 1.1，许可证见同目录 `LICENSE`。该目录不在 Vite 资源图中，因此不会进入客户端产物。
