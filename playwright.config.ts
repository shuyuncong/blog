import { defineConfig, devices } from "@playwright/test";

const port = "4321";
const chromiumExecutable = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;

export default defineConfig({
	expect: {
		timeout: 10_000,
	},
	forbidOnly: !!process.env.CI,
	fullyParallel: true,
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
	reporter: "list",
	retries: process.env.CI ? 2 : 0,
	testDir: "./tests/e2e",
	use: {
		baseURL: `http://127.0.0.1:${port}`,
		launchOptions: chromiumExecutable ? { executablePath: chromiumExecutable } : {},
		trace: "on-first-retry",
	},
	webServer: {
		command: `node_modules/.bin/serve -l ${port} .vercel/output/static`,
		reuseExistingServer: !process.env.CI,
		timeout: 30_000,
		url: `http://127.0.0.1:${port}/`,
	},
});
