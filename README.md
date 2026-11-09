# 云端的杂货铺

个人博客，记录生活、技术问题解决过程，以及偶尔偏学术的哲学思考。

线上地址：<https://blog.illsky.com>

## 技术栈

- Astro 7（静态站点生成）
- TypeScript + Content Layer / Content Collections（Zod 校验）
- Tailwind CSS 4 + `@tailwindcss/vite` + `@tailwindcss/typography`
- Expressive Code（代码高亮）
- Satori + Resvg（文章 Open Graph 图片）
- Pagefind（静态搜索）
- Webmention.io（互动）
- Upstash Redis（文章阅读量，Vercel Marketplace）
- Vercel（部署与访问统计）

## 本地开发

需要 Node.js 22.23.4+（推荐 24 LTS）与 pnpm 9+：

```bash
pnpm install
pnpm dev
```

## 常用命令

| 命令          | 说明                                                                      |
| ------------- | ------------------------------------------------------------------------- |
| `pnpm dev`    | 启动开发服务器                                                            |
| `pnpm check`  | Astro 类型与内容检查                                                      |
| `pnpm build`  | 构建到 `.vercel/output/static`，并自动执行 `postbuild` 生成 Pagefind 索引 |
| `pnpm format` | 使用 Prettier 格式化                                                      |

Vercel 适配器不支持 `astro preview`。需要完整本地预览（含 `/api/views`）时，使用 `npx vercel dev`；日常开发用 `pnpm dev` 即可。

## 目录结构

```text
src/
├── assets/                 # 字体与静态图片
├── components/             # 可复用组件
├── content/
│   └── post/               # Markdown 文章
├── content.config.ts       # Content Layer loader 与 frontmatter 校验
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
# 本项目 Vercel KV/Upstash 集成注入的变量（带 BLOG_ 前缀）
BLOG_KV_REST_API_URL=your-upstash-redis-rest-url
BLOG_KV_REST_API_TOKEN=your-upstash-redis-rest-token
# 也支持以下无前缀别名（任选一组）：
# KV_REST_API_URL=
# KV_REST_API_TOKEN=
# UPSTASH_REDIS_REST_URL=
# UPSTASH_REDIS_REST_TOKEN=
```

未配置 token 时，构建会跳过 Webmention 抓取，页面不会展示互动区。

文章阅读量由 `src/pages/api/views.ts` 写入 Redis。Vercel KV 已下线，现有 KV 存储已迁移到 [Upstash Redis](https://vercel.com/marketplace/upstash)：在 Vercel 项目的 Storage 中连接 Redis 后，环境变量会自动注入。本项目集成使用 `BLOG_` 前缀，因此代码优先读取 `BLOG_KV_REST_API_URL` / `BLOG_KV_REST_API_TOKEN`，同时兼容无前缀的 `KV_REST_API_*` 和 `UPSTASH_REDIS_REST_*`。`BLOG_KV_REST_API_READ_ONLY_TOKEN` 是只读 token，不能用于 `INCR`；`BLOG_KV_URL` / `BLOG_REDIS_URL` 是 Redis 协议地址，当前 REST 客户端不使用。

生产环境未配置 Redis 时，`/api/views` 返回 503，阅读量保持 `--`；本地 `pnpm dev` 未配置 Redis 时使用进程内计数器，方便调试。

## 部署

推送到 `main` 后由 Vercel 自动构建。构建命令为 `pnpm build`，`postbuild` 会在 `.vercel/output/static/pagefind/` 生成搜索索引。

## 字体

`assets/fonts/` 下的 Noto Sans SC 子集用于构建期生成中文 OG 图片，遵循 SIL Open Font License 1.1，许可证见同目录 `LICENSE`。该目录不在 Vite 资源图中，因此不会进入客户端产物。
