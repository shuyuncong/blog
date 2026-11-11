import { getAllPosts, sortMDByDate } from "@/data/post";
import { siteConfig } from "@/site-config";
import rss from "@astrojs/rss";

export const GET = async () => {
	const allPosts = await getAllPosts();
	const posts = sortMDByDate(allPosts);

	const resp = rss({
		customData: `<language>${siteConfig.lang}</language>`,
		description: siteConfig.description,
		items: posts.map((post) => ({
			categories: post.data.tags,
			description: post.data.description,
			link: `posts/${post.id}`,
			pubDate: post.data.publishDate,
			title: post.data.title,
		})),
		site: import.meta.env.SITE,
		// 👇 Please specify the directory for the XSL stylesheet file
		stylesheet: "/rss.xsl",
		title: siteConfig.title,
	});

	return new Response((await resp).body, {
		headers: {
			// 👇 Modify the Content-Type of the HTTP Response
			"Content-Type": "application/xml",
			"x-content-type-options": "nosniff",
		},
	});
};
