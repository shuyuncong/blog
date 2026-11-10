interface HastNode {
	children?: HastNode[];
	properties?: Record<string, unknown>;
	tagName?: string;
	type: string;
}

/** Add native lazy-loading hints to Markdown images. */
export function rehypeImageAttrs() {
	return (tree: HastNode) => {
		const visit = (node: HastNode) => {
			if (node.type === "element" && node.tagName === "img") {
				node.properties ??= {};

				if (node.properties.loading === undefined) {
					node.properties.loading = "lazy";
				}

				if (node.properties.decoding === undefined) {
					node.properties.decoding = "async";
				}
			}

			node.children?.forEach(visit);
		};

		visit(tree);
	};
}
