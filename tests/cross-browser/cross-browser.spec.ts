import { sauceOrigin, saucePassword, sauceUser } from '../../support/constants';
import { engineFromUserAgent } from '../../support/helpers/browser';
import { annotate } from '../../support/helpers/annotate';
import { expect, test } from '../../support/fixtures';

test.describe('cross-browser coverage', () => {
  test.beforeEach(() => {
    annotate('cross-browser');
  });

  test('runs on the engine named by the project', async ({ page }, testInfo) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Desk overview' })).toBeVisible();

    const userAgent = await page.evaluate(() => navigator.userAgent);
    expect(engineFromUserAgent(userAgent)).toBe(testInfo.project.name);
  });

  test('signs in to Sauce Demo and lists inventory', async ({ page }) => {
    await page.goto(sauceOrigin);
    await page.locator('[data-test="username"]').fill(sauceUser);
    await page.locator('[data-test="password"]').fill(saucePassword);
    await page.locator('[data-test="login-button"]').click();

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.locator('[data-test="inventory-item"]').first()).toBeVisible();
  });
});
