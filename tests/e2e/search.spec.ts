import { expect, test } from "@playwright/test";

test.describe("search modal", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");

		const openButton = page.locator("button[data-open-modal]");
		await expect(openButton).toBeEnabled();
		await openButton.click();
		await expect(page.locator("dialog[open]")).toBeVisible();
	});

	test("finds a post and clears the query", async ({ page }) => {
		const input = page.locator("#cactus__search .pagefind-ui__search-input");
		const results = page.locator(".pagefind-ui__result");

		await expect(input).toBeVisible();
		await input.fill("Docker");
		await expect(results.first()).toBeVisible();
		await expect(page.locator(".pagefind-ui__result-link").first()).toHaveAttribute(
			"href",
			/\/posts\//,
		);

		await page.locator(".pagefind-ui__search-clear").click();
		await expect(input).toHaveValue("");
		await expect(results).toHaveCount(0);
	});

	test("shows a zero-results message", async ({ page }) => {
		const input = page.locator("#cactus__search .pagefind-ui__search-input");
		const results = page.locator(".pagefind-ui__result");

		await expect(input).toBeVisible();
		await input.fill("qzxqzx-no-such-post-987654");
		await expect(page.locator(".pagefind-ui__message")).toContainText("没有找到");
		await expect(results).toHaveCount(0);
	});
});
