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
		customData: `<language>${siteConfig.lang}</language>`,
		items: posts.map((post) => ({
			title: post.data.title,
			description: post.data.description,
			pubDate: post.data.publishDate,
			link: `posts/${post.id}`,
			categories: post.data.tags,
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
