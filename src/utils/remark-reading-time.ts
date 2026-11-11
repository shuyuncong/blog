import { toString } from "mdast-util-to-string";
import getReadingTime from "reading-time";

interface AstroMarkdownData {
	astro?: {
		frontmatter?: {
			minutesRead?: string;
		};
	};
}

export function remarkReadingTime() {
	return function (tree: Parameters<typeof toString>[0], { data }: { data: AstroMarkdownData }) {
		const textOnPage = toString(tree);
		const readingTime = getReadingTime(textOnPage);
		const minutes = Math.max(1, Math.ceil(readingTime.minutes));
		const frontmatter = data.astro?.frontmatter;

		if (frontmatter) {
			frontmatter.minutesRead = `约 ${String(minutes)} 分钟`;
		}
	};
}
