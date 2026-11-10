import fs from "node:fs";
import path from "node:path";
import * as prettier from "prettier";
import sharp from "sharp";

const root = process.cwd();
const contentDir = path.join(root, "src", "content", "post");
const cachePath = path.join(root, "src", "data", "image-dimensions.json");
const force = process.argv.includes("--force");
const concurrency = 6;

function walk(dir) {
	return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) return walk(fullPath);
		return /\.mdx?$/.test(entry.name) ? [fullPath] : [];
	});
}

function collectImageUrls() {
	const urls = new Set();

	for (const file of walk(contentDir)) {
		const source = fs.readFileSync(file, "utf8");

		for (const match of source.matchAll(/!\[[^\]]*\]\(\s*<?([^\s)>]+)/g)) {
			if (/^https?:\/\//.test(match[1])) urls.add(match[1]);
		}

		for (const match of source.matchAll(/<img\s[^>]*?src=["']([^"']+)/gi)) {
			if (/^https?:\/\//.test(match[1])) urls.add(match[1]);
		}
	}

	return [...urls].sort();
}

function fetchUrls(url) {
	const parsed = new URL(url);

	// jsDelivr's primary host is intermittently blocked from some networks.
	if (parsed.hostname === "cdn.jsdelivr.net") {
		const mirrors = ["gcore.jsdelivr.net", "testingcf.jsdelivr.net"];

		return [
			...mirrors.map((hostname) => {
				const mirror = new URL(parsed.href);

				mirror.hostname = hostname;

				return mirror.href;
			}),
			url,
		];
	}

	return [url];
}

async function getDimensions(url) {
	let lastError;

	for (const candidate of fetchUrls(url)) {
		try {
			const response = await fetch(candidate, {
				headers: { "User-Agent": "blog-image-dimensions/1.0" },
				redirect: "follow",
				signal: AbortSignal.timeout(30_000),
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}

			const buffer = Buffer.from(await response.arrayBuffer());
			const metadata = await sharp(buffer, { animated: false }).metadata();

			if (!metadata.width || !metadata.height) {
				throw new Error("image has no intrinsic dimensions");
			}

			// Match the dimensions the browser displays after EXIF orientation.
			if (metadata.orientation && metadata.orientation >= 5) {
				return [metadata.height, metadata.width];
			}

			return [metadata.width, metadata.height];
		} catch (error) {
			lastError = error;
		}
	}

	throw lastError ?? new Error("unable to fetch image");
}

function readCache() {
	if (!fs.existsSync(cachePath)) return {};

	return JSON.parse(fs.readFileSync(cachePath, "utf8"));
}

async function main() {
	const urls = collectImageUrls();
	const cache = readCache();
	const pending = force ? urls : urls.filter((url) => !cache[url]);

	console.log(`${urls.length} images, ${pending.length} to fetch`);

	let cursor = 0;
	const failures = [];

	async function worker() {
		while (cursor < pending.length) {
			const url = pending[cursor++];
			try {
				const dimensions = await getDimensions(url);
				cache[url] = dimensions;
				console.log(`${dimensions[0]}x${dimensions[1]} ${url}`);
			} catch (error) {
				failures.push([url, error instanceof Error ? error.message : String(error)]);
			}
		}
	}

	await Promise.all(Array.from({ length: Math.min(concurrency, pending.length) }, worker));

	const sorted = Object.fromEntries(Object.entries(cache).sort(([a], [b]) => a.localeCompare(b)));
	const prettierConfig = (await prettier.resolveConfig(cachePath)) ?? {};

	fs.mkdirSync(path.dirname(cachePath), { recursive: true });
	fs.writeFileSync(
		cachePath,
		await prettier.format(JSON.stringify(sorted), { ...prettierConfig, parser: "json" }),
	);

	if (failures.length > 0) {
		console.error(`\n${failures.length} image(s) failed:`);
		for (const [url, message] of failures) console.error(`- ${url}: ${message}`);
		process.exitCode = 1;
	}
}

await main();
