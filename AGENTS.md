# Repository Guidelines（仓库指南）

## 项目结构与模块组织

- `src/pages/`：路由页面目录，包含动态路由（如 `posts/[slug].astro`）与分页/标签页。
- `src/components/`：可复用组件；`src/layouts/`：页面骨架（如 `Base.astro`、`BlogPost.astro`）。
- `src/content/post/`：文章内容（Markdown/MDX），Frontmatter 由 `src/content/config.ts` 做类型校验。
- `src/utils/`：通用工具函数；`src/styles/global.css`：全局样式。
- `public/`：静态资源；`.github/`：CI、PR 模板与自动化配置。

## 构建、测试与开发命令

- `pnpm install`：安装依赖（CI 也使用 pnpm）。
- `pnpm dev` / `pnpm start`：启动本地开发服务器。
- `pnpm check`：执行 Astro 类型与内容检查（`astro check`）。
- `pnpm build`：通过 Vercel 适配器构建到 `.vercel/output/static`，并自动执行 `postbuild`。
- `pnpm postbuild`：为 `.vercel/output/static` 生成 Pagefind 搜索索引。
- `pnpm exec playwright install chromium`：首次运行浏览器测试前安装 Chromium。
- `pnpm test:e2e`：运行搜索弹窗冒烟测试；需先执行 `pnpm build`，测试会启动 `.vercel/output/static` 静态服务。
- `pnpm format`：使用 Prettier 格式化代码与文档。
- 完整本地预览（含 `/api/views`）使用 `npx vercel dev`；Vercel 适配器不支持 `astro preview`。

## 代码风格与命名规范

- 以 Prettier 为准：`printWidth=100`、保留分号、双引号、`tabWidth=2`、使用制表符。
- ESLint 已覆盖 TypeScript、Astro、a11y、正则与排序等规则，提交前应先自检。
- 组件/布局文件使用 `PascalCase`（示例：`ThemeToggle.astro`）。
- 文章文件与 slug 使用 `kebab-case`（示例：`blog-rss-feed-style.md`）。
- 工具函数保持单一职责，优先小模块、低耦合。

## 测试与校验要求

- 已配置 Playwright 搜索弹窗冒烟测试，位于 `tests/e2e/`。
- 提交前至少执行：`pnpm check`、`pnpm lint`、`pnpm build` 与 `pnpm test:e2e`。
- 涉及页面或内容改动时，在 `pnpm dev` 下手动验证关键路径；涉及 API/阅读量时同时验证 `pnpm build` 产出的 `.vercel/output`。
- 涉及搜索功能改动时，执行 `pnpm build` 并运行 `pnpm test:e2e`，验证检索结果、空状态与清除行为。

## 提交与 Pull Request 规范

- 建议沿用仓库历史前缀：`feat:`、`fix:`、`doc:`，主题行简洁明确。
- 一次提交聚焦一个逻辑变更，避免混入无关修改。
- 按 `.github/pull_request_template.md` 填写 PR：变更类型、说明、关联 Issue（`Closes #...`）。
- 涉及 UI 变化请附前后截图；发起评审前确保 CI 通过。

## 安全与配置提示

- 密钥写入 `.env`，参考 `.example.env`（如 `WEBMENTION_API_KEY`），禁止提交真实凭据。
- 站点信息与域名变更需同步更新 `src/site.config.ts` 与 `astro.config.ts`。
