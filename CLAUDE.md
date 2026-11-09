# CLAUDE.md

本文件为 Claude Code（claude.ai/code）在此仓库中工作提供指导。

## 常用命令

```bash
pnpm install       # 安装依赖
pnpm dev           # 启动本地开发服务器
pnpm check         # Astro 类型和内容校验
pnpm build         # 生产构建，输出到 .vercel/output/static，并自动执行 postbuild
pnpm postbuild     # 生成 Pagefind 搜索索引（build 后自动运行）
pnpm format        # 使用 Prettier 格式化代码
```

提交前：运行 `pnpm check` 和 `pnpm build`。涉及搜索功能的改动由 `pnpm build` 自动重建 `.vercel/output/static/pagefind`。Vercel 适配器不支持 `astro preview`；需要完整本地预览（含 `/api/views`）时运行 `npx vercel dev`。

## 架构概述

这是一个基于 **Astro 7 静态博客**（astro-cactus 主题），使用 Tailwind CSS、MDX 支持和 Pagefind 搜索，通过 Vercel 适配器部署。

**内容层**：博客文章存放在 `src/content/post/`，格式为 Markdown/MDX。Frontmatter 结构定义在 `src/content/config.ts`，必填字段：`title`（最多 60 字符）、`description`（50–160 字符）、`publishDate`、`tags`（自动小写/去重）。可选字段：`coverImage`、`ogImage`、`draft`、`updatedDate`。

**站点配置**：`src/site.config.ts` 导出 `siteConfig`（元数据、语言、排序）、`menuLinks`（导航）、`expressiveCodeOptions`（代码块主题：dracula/github-light）。域名或标题变更在此文件和 `astro.config.ts` 中修改。

**路由**：`src/pages/` 包含基于文件的路由。动态路由包括 `posts/[slug].astro`、标签页面、`og-image/[slug].png.ts`（通过 satori 生成 OG 图片）。

**布局**：`src/layouts/Base.astro` 是根布局；`BlogPost.astro` 包裹单篇文章。

**OG 图片**：构建时通过 satori + sharp 自动生成，模板位于 `src/pages/og-image/[slug].png.ts`。

**搜索**：Pagefind 对构建后的 `.vercel/output/static/` 目录建立索引，`pnpm build` 后自动运行 `pnpm postbuild`。

**阅读量**：`src/pages/api/views.ts` 是 on-demand API 路由，使用 `@upstash/redis` 对 `post:pv:<slug>` 执行 `INCR`；Vercel 集成注入的环境变量带 `BLOG_` 前缀，优先读取 `BLOG_KV_REST_API_URL` / `BLOG_KV_REST_API_TOKEN`，也兼容无前缀的 `KV_REST_API_*` 和 `UPSTASH_REDIS_REST_*`。本地 `pnpm dev` 未配置 Redis 时使用进程内计数器。

## 代码风格

- Prettier：`printWidth=100`，有分号，双引号，`tabWidth=2`，使用 Tab 缩进
- 组件/布局文件：`PascalCase`（如 `ThemeToggle.astro`）
- 文章文件名/slug：`kebab-case`（如 `my-post-title.md`）
- ESLint 覆盖 TypeScript、Astro、无障碍、导入顺序和 key 排序

## 提交规范

遵循仓库现有前缀风格：`feat:`、`fix:`、`doc:`。主题行简洁，每次提交对应一个逻辑变更。
