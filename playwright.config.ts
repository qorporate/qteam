import { defineConfig } from '@playwright/test';

const basePath = '/qteam';

export default defineConfig({
	testDir: './tests',
	use: {
		baseURL: `http://127.0.0.1:4173${basePath}/`
	},
	webServer: {
		command: `BASE_PATH=${basePath} bun --bun run build && BASE_PATH=${basePath} bun --bun run preview --host 127.0.0.1`,
		port: 4173,
		reuseExistingServer: !process.env.CI
	}
});
