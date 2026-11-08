import type { BrowserContext, Page } from '@playwright/test';
import { demoBaseUrl } from '../constants';

export type StorageState = Awaited<ReturnType<BrowserContext['storageState']>>;

export function engineFromUserAgent(userAgent: string): 'chromium' | 'firefox' | 'webkit' {
  if (userAgent.includes('Firefox/')) return 'firefox';
  if (userAgent.includes('Chrome/') || userAgent.includes('Chromium/')) return 'chromium';
  return 'webkit';
}

export async function contextWithStorage(
  page: Page,
  storageState: StorageState,
): Promise<BrowserContext> {
  const browser = page.context().browser();
  if (!browser) throw new Error('Expected a browser-backed context');
  return browser.newContext({ storageState, baseURL: demoBaseUrl });
}
