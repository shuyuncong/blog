import type { APIRoute } from "astro";

import { Redis } from "@upstash/redis";

export const prerender = false;

const KEY_PREFIX = "post:pv:";
const SLUG_PATTERN = /^[a-z0-9][a-z0-9/_-]{0,199}$/;
const RATE_LIMIT = 30;
const RATE_WINDOW_SECONDS = 60;

const env = import.meta.env as Record<string, string | undefined>;

function firstEnv(...keys: string[]) {
	for (const key of keys) {
		const value = process.env[key] ?? env[key];
		if (value) return value;
	}
	return undefined;
}

const redisUrl = firstEnv("BLOG_KV_REST_API_URL", "KV_REST_API_URL", "UPSTASH_REDIS_REST_URL");
const redisToken = firstEnv(
	"BLOG_KV_REST_API_TOKEN",
	"KV_REST_API_TOKEN",
	"UPSTASH_REDIS_REST_TOKEN",
);
const redis = redisUrl && redisToken ? new Redis({ token: redisToken, url: redisUrl }) : null;

// Development fallback so the counter works without a Redis instance.
const devCounts = new Map<string, number>();

function json(body: unknown, status = 200, headers?: HeadersInit) {
	return new Response(JSON.stringify(body), {
		headers: {
			"Cache-Control": "no-store",
			"Content-Type": "application/json",
			...headers,
		},
		status,
	});
}

function getClientIp(request: Request) {
	const forwarded = request.headers.get("x-forwarded-for");
	const firstForwarded = forwarded?.split(",")[0]?.trim();
	if (firstForwarded) return firstForwarded;
	return request.headers.get("x-real-ip") ?? "unknown";
}

export const POST: APIRoute = async ({ request }) => {
	const body: unknown = await request.json().catch(() => null);
	let slug: unknown = null;

	if (body && typeof body === "object" && "slug" in body) {
		slug = body.slug;
	}

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

		const ip = getClientIp(request);
		const window = Math.floor(Date.now() / (RATE_WINDOW_SECONDS * 1000));
		const rateKey = `${KEY_PREFIX}rate:${ip}:${String(window)}`;
		const rate = await redis.incr(rateKey);

		if (rate === 1) {
			await redis.expire(rateKey, RATE_WINDOW_SECONDS);
		}

		if (rate > RATE_LIMIT) {
			return json({ error: "Too many requests" }, 429, {
				"Retry-After": String(RATE_WINDOW_SECONDS),
			});
		}

		const views = await redis.incr(KEY_PREFIX + slug);
		return json({ views });
	} catch (error) {
		console.error("[views] Failed to increment view count:", error);
		return json({ error: "Counter unavailable" }, 500);
	}
};
