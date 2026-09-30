import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser', fullyParallel: false, workers: 1, timeout: 45000,
  use: { baseURL: 'http://localhost:4173', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: { command: 'node --import tsx tests/browser-server.ts', url: 'http://localhost:4173/api/health', reuseExistingServer: false, timeout: 60000 },
});
