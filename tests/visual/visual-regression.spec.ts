import { annotate } from '../../support/helpers/annotate';
import { expect, test } from '../../support/fixtures';

/**
 * Baselines are Linux snapshots (`*-linux.png`) so they match the Ubuntu CI runner.
 * Dynamic text is masked. Regenerate with `npm run test:update-snapshots` on Ubuntu 24.04,
 * or with the workflow_dispatch input `update_snapshots`.
 */
test.describe('visual regression', () => {
  test.use({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });

  test.beforeEach(() => {
    annotate('visual-regression');
  });

  test('matches the desk overview', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('task-list')).toHaveAttribute('data-ready', 'true');
    await expect(page.getByTestId('report-date')).toHaveText('2026-06-15 15:04 UTC');
    await page.evaluate(() => document.fonts.ready);

    await expect(page.locator('.canvas')).toHaveScreenshot('overview.png', {
      mask: [page.getByTestId('request-id'), page.getByTestId('session-clock')],
      maskColor: '#ff00ff',
    });
  });

  test('matches the overview at a phone width', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.getByTestId('task-list')).toHaveAttribute('data-ready', 'true');
    await page.evaluate(() => document.fonts.ready);

    await expect(page.locator('.canvas')).toHaveScreenshot('overview-phone.png', {
      mask: [page.getByTestId('request-id'), page.getByTestId('session-clock')],
      maskColor: '#ff00ff',
    });
  });

  test('matches the empty case form', async ({ page }) => {
    await page.goto('/form');
    await expect(page.getByRole('heading', { name: 'New case' })).toBeVisible();
    await page.evaluate(() => document.fonts.ready);

    await expect(page.locator('.canvas')).toHaveScreenshot('case-form.png', {
      mask: [page.locator('#appointment')],
      maskColor: '#ff00ff',
    });
  });
});
