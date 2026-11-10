import imageDimensions from "@/data/image-dimensions.json";

interface HastNode {
	children?: HastNode[];
	properties?: Record<string, unknown>;
	tagName?: string;
	type: string;
	value?: string;
}

type ImageSize = [width: number, height: number];

const dimensionsByUrl = imageDimensions as unknown as Record<string, ImageSize>;

function decorateImageTag(tag: string) {
	const srcMatch = tag.match(/\bsrc=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
	const src = srcMatch?.[1] ?? srcMatch?.[2] ?? srcMatch?.[3];
	const dimensions = src ? dimensionsByUrl[src] : undefined;
	const attributes: string[] = [];

	if (dimensions) {
		const [width, height] = dimensions;

		if (!/\bwidth=/i.test(tag)) attributes.push(`width="${String(width)}"`);
		if (!/\bheight=/i.test(tag)) attributes.push(`height="${String(height)}"`);
	}

	if (!/\bloading=/i.test(tag)) attributes.push('loading="lazy"');
	if (!/\bdecoding=/i.test(tag)) attributes.push('decoding="async"');

	if (attributes.length === 0) return tag;

	return tag.replace(/\s*\/?>$/, (closing) => ` ${attributes.join(" ")}${closing}`);
}

/** Add intrinsic dimensions and native lazy-loading hints to Markdown images. */
export function rehypeImageAttrs() {
	return (tree: HastNode) => {
		const visit = (node: HastNode) => {
			if (node.type === "element" && node.tagName === "img") {
				node.properties ??= {};

				const src = node.properties.src;

				if (typeof src === "string") {
					const dimensions = dimensionsByUrl[src];

					if (dimensions) {
						const [width, height] = dimensions;

						if (node.properties.width === undefined) {
							node.properties.width = width;
						}

						if (node.properties.height === undefined) {
							node.properties.height = height;
						}
					}
				}

				if (node.properties.loading === undefined) {
					node.properties.loading = "lazy";
				}

				if (node.properties.decoding === undefined) {
					node.properties.decoding = "async";
				}
			}

			if (node.type === "raw" && typeof node.value === "string") {
				node.value = node.value.replace(/<img\b[^>]*>/gi, decorateImageTag);
			}

			node.children?.forEach(visit);
		};

		visit(tree);
	};
}
