import getReadingTime from "reading-time";
import { toString } from "mdast-util-to-string";

export function remarkReadingTime() {
	// @ts-expect-error:next-line
	return function (tree, { data }) {
		const textOnPage = toString(tree);
		const readingTime = getReadingTime(textOnPage);
		const minutes = Math.max(1, Math.ceil(readingTime.minutes));
		data.astro.frontmatter.minutesRead = `约 ${minutes} 分钟`;
	};
}
