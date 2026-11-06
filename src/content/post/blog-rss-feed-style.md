---
title: "在Astro项目中集成RSS.Beauty样式优化指南"
description: "本教程介绍如何在Astro项目中优化RSS订阅源样式，使用RSS.Beauty工具生成XSL文件，并通过修改rss.xml.js文件集成美化样式，提升RSS阅读体验。"
publishDate: "2025-03-20"
tags: ["博客", "blog", "Beauty", "订阅源"]
---




众所周知网站中的 RSS 订阅源链接对应的是 XML 格式内容，一般情况下直接访问订阅源链接就直接展示对应的 XML 结构内容。

当然，我们可以对这个页面的样式进行优化。这篇教程展示了在 Astro 构建的项目中如何改进 RSS 的订阅源样式。

## 准备

我们借助 [RSS.Beauty](https://rss.beauty/) 这个工具来帮助我们优化样式

> RSS.Beauty 是一个基于 XSLT 技术的 RSS 美化工具, 可以将普通的 RSS/Atom 订阅源转换成美观的阅读界面。

我们选择 File 选项后可以下载到一个 XSL 文件，这个文件就是用来实现美化的样式文件，可以把它类比成 CSS。

![RSS.Beauty official site screenshot](https://igaozp.me/images/enhance-astro-project-rss-feed-style/01.png)

## 在 Astro 中集成

首先将下载的 XSL 文件放入到 Astro 项目中的 `public` 目录中

修改 Astro 项目的 rss.xml.js 文件

1. 在 `RSSOptions` 配置中增加 `stylesheet` 配置，该配置可以指定我们的美化样式文件
2. 修改响应参数，需要将 **HTTP Response** 的 **Content-Type** 调整为 `application/xml`，否则自定义样式可能不会生效

完整的 rss.xml.js 代码参考：

```jsx
import rss from "@astrojs/rss";
import { siteConfig } from "@/site-config";
import { getAllPosts, sortMDByDate} from "@/data/post";

export const GET = async () => {
	const allPosts = await getAllPosts();
	const posts = sortMDByDate(allPosts);

	const resp = rss({
		title: siteConfig.title,
		description: siteConfig.description,
		site: import.meta.env.SITE,
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.publishDate,
			link: `posts/${post.slug}`,
		})),
		// 👇 Please specify the directory for the XSL stylesheet file
		stylesheet: "/rss.xsl",
	});

	return new Response((await resp).body, {
		headers: {
		  // 👇 Modify the Content-Type of the HTTP Response
		  "Content-Type": "application/xml",
		  "x-content-type-options": "nosniff",
		},
	  });
};

```

修改完后访问 RSS 订阅源链接，不出意外的话样式就生效了。也可以访问 [云端的杂货铺](https://blog.illsky.com/rss.xml) 参考一下生效后的样式。

![image-20250107224930767](https://cdn.illsky.com/img/2025/01/202501072249870.png)

## 附录

+   RSS.Beauty 项目官网 [https://rss.beauty/](https://rss.beauty/)
+   RSS.Beauty 项目 GitHub [https://github.com/ccbikai/RSS.Beauty](https://github.com/ccbikai/RSS.Beauty)


