import { existsSync, readFileSync } from 'node:fs';

function loadEnvFile(): void {
  if (!existsSync('.env')) return;

  for (const line of readFileSync('.env', 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile();

/** Harbor Desk, started by Playwright's webServer. */
export const demoBaseUrl = process.env.DEMO_BASE_URL ?? 'http://127.0.0.1:4173';

export const practiceOrigin = 'https://practice.expandtesting.com';
export const internetOrigin = 'https://the-internet.herokuapp.com';
export const sauceOrigin = 'https://www.saucedemo.com';

/**
 * Public demo credentials published on saucedemo.com.
 * They are practice data, not secrets.
 */
export const sauceUser = process.env.SAUCE_USERNAME ?? 'standard_user';
export const saucePassword = process.env.SAUCE_PASSWORD ?? 'secret_sauce';

export const fixedReportDate = '2026-06-15 15:04 UTC';
export const fixedClock = new Date('2026-06-15T12:00:00Z');
