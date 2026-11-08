import type { Page, Route } from '@playwright/test';

export async function fulfillJson(route: Route, body: unknown, status = 200): Promise<void> {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

/** Drop ad and analytics calls that make practice sites noisy. */
export async function silenceThirdParties(page: Page): Promise<void> {
  await page.route(
    /(?:googlesyndication|doubleclick\.net|google-analytics|googletagmanager|googleadservices|adservice|facebook\.net|hotjar|buymeacoffee|pagead2)/,
    (route) => route.abort(),
  );
}
