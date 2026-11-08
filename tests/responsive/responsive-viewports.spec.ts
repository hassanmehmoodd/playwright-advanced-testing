import { devices } from '@playwright/test';
import { annotate } from '../../support/helpers/annotate';
import { expect, test } from '../../support/fixtures';

test.describe('responsive layout', () => {
  test.beforeEach(() => {
    annotate('responsive');
  });

  test('places summary cards in a row at desktop width', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Menu' })).toBeHidden();

    const openCases = await page.getByRole('heading', { name: 'Open cases' }).boundingBox();
    const awaiting = await page.getByRole('heading', { name: 'Awaiting review' }).boundingBox();
    expect(openCases).toBeTruthy();
    expect(awaiting).toBeTruthy();
    expect(Math.abs((openCases?.y ?? 0) - (awaiting?.y ?? 0))).toBeLessThan(8);
  });

  test('stacks cards and opens the menu at a phone width', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const menu = page.getByRole('button', { name: 'Menu' });
    await expect(menu).toBeVisible();
    await expect(page.getByRole('link', { name: 'Intake' })).toBeHidden();

    await menu.click();
    await expect(page.getByRole('link', { name: 'Intake' })).toBeVisible();

    const openCases = await page.getByRole('heading', { name: 'Open cases' }).boundingBox();
    const awaiting = await page.getByRole('heading', { name: 'Awaiting review' }).boundingBox();
    expect(openCases).toBeTruthy();
    expect(awaiting).toBeTruthy();
    expect((awaiting?.y ?? 0) > (openCases?.y ?? 0) + 24).toBeTruthy();
  });
});

const iPhone13 = devices['iPhone 13'];

test.describe('device emulation', () => {
  test.use({
    viewport: iPhone13.viewport,
    userAgent: iPhone13.userAgent,
    deviceScaleFactor: iPhone13.deviceScaleFactor,
    isMobile: iPhone13.isMobile,
    hasTouch: iPhone13.hasTouch,
  });

  test.beforeEach(() => {
    annotate('responsive');
  });

  test('uses an iPhone 13 viewport', async ({ page }) => {
    await page.goto('/');
    expect(page.viewportSize()).toEqual(iPhone13.viewport);
    await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible();
  });
});
