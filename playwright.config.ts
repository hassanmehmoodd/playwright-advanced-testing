import { defineConfig } from '@playwright/test';
import { demoBaseUrl } from './support/constants';

const demoPort = new URL(demoBaseUrl).port || '4173';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
      // Absorbs subpixel font hinting between Ubuntu hosts. Layout shifts still fail.
      maxDiffPixelRatio: 0.01,
    },
  },
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never', outputFolder: 'playwright-report' }], ['list']]
    : [['html', { open: 'never', outputFolder: 'playwright-report' }], ['list']],
  use: {
    baseURL: demoBaseUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
    actionTimeout: 15_000,
    navigationTimeout: 20_000,
    locale: 'en-US',
    timezoneId: 'UTC',
  },
  webServer: {
    command: 'node server/demo-server.mjs',
    url: `${demoBaseUrl}/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 15_000,
    env: {
      ...process.env,
      PORT: demoPort,
      HOST: '127.0.0.1',
    },
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 1,
      },
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox', viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 },
    },
    {
      name: 'webkit',
      use: { browserName: 'webkit', viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 },
    },
  ],
});
