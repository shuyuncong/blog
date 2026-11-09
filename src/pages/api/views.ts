import type { APIRoute } from "astro";

import { Redis } from "@upstash/redis";

export const prerender = false;

const KEY_PREFIX = "post:pv:";
const SLUG_PATTERN = /^[a-z0-9][a-z0-9/_-]{0,199}$/;

const env = import.meta.env as Record<string, string | undefined>;

function firstEnv(...keys: string[]) {
	for (const key of keys) {
		const value = process.env[key] ?? env[key];
		if (value) return value;
	}
	return undefined;
}

const redisUrl = firstEnv("KV_REST_API_URL", "UPSTASH_REDIS_REST_URL");
const redisToken = firstEnv("KV_REST_API_TOKEN", "UPSTASH_REDIS_REST_TOKEN");
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

// Development fallback so the counter works without a Redis instance.
const devCounts = new Map<string, number>();

function json(body: unknown, status = 200) {
	return new Response(JSON.stringify(body), {
		headers: {
			"Cache-Control": "no-store",
			"Content-Type": "application/json",
		},
		status,
	});
}

export const POST: APIRoute = async ({ request }) => {
	const body = await request.json().catch(() => null);
	const slug = body && typeof body === "object" && "slug" in body ? body.slug : null;

	if (typeof slug !== "string" || !SLUG_PATTERN.test(slug)) {
		return json({ error: "Invalid slug" }, 400);
	}

	try {
		if (!redis) {
			if (import.meta.env.DEV) {
				const views = (devCounts.get(slug) ?? 0) + 1;
				devCounts.set(slug, views);
				return json({ views });
			}
			return json({ error: "Redis is not configured" }, 503);
		}

		const views = await redis.incr(KEY_PREFIX + slug);
		return json({ views });
	} catch (error) {
		console.error("[views] Failed to increment view count:", error);
		return json({ error: "Counter unavailable" }, 500);
	}
};
