import { defineCollection, z } from "astro:content";

function removeDupsAndLowerCase(array: string[]) {
	if (!array.length) return array;
	const lowercaseItems = array.map((str) => str.toLowerCase());
	const distinctItems = new Set(lowercaseItems);
	return Array.from(distinctItems);
}

const dateSchema = z
	.union([z.string(), z.date()])
	.transform((value) => new Date(value))
	.refine((date) => !Number.isNaN(date.getTime()), {
		message: "Date must be a valid ISO date (YYYY-MM-DD)",
	});

const post = defineCollection({
	schema: ({ image }) =>
		z
			.object({
				coverImage: z
					.object({
						alt: z.string(),
						src: image(),
					})
					.optional(),
				description: z.string().min(50).max(160),
				draft: z.boolean().default(false),
				ogImage: z.string().optional(),
				publishDate: dateSchema,
				tags: z.array(z.string()).default([]).transform(removeDupsAndLowerCase),
				title: z.string().max(60),
				updatedDate: dateSchema.optional(),
			})
			.superRefine(({ publishDate, updatedDate }, ctx) => {
				if (updatedDate && updatedDate < publishDate) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: "updatedDate must not be earlier than publishDate",
						path: ["updatedDate"],
					});
				}
			}),
	type: "content",
});

export const collections = { post };
