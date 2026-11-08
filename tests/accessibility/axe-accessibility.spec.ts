import { annotate } from '../../support/helpers/annotate';
import { expectNoWcagViolations, wcagViolationIds } from '../../support/helpers/accessibility';
import { expect, test } from '../../support/fixtures';

test.describe('accessibility', () => {
  test.beforeEach(() => {
    annotate('accessibility');
  });

  test('overview has no WCAG A or AA violations', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('task-list')).toHaveAttribute('data-ready', 'true');
    await expectNoWcagViolations(page);
  });

  test('case form has no WCAG A or AA violations', async ({ page }) => {
    await page.goto('/form');
    await expect(page.getByRole('heading', { name: 'New case' })).toBeVisible();
    await expectNoWcagViolations(page);
  });

  test('reports the violations planted in the broken fixture', async ({ page }) => {
    await page.goto('/a11y-broken');
    const ids = await wcagViolationIds(page);
    expect(ids).toEqual(
      expect.arrayContaining(['button-name', 'color-contrast', 'image-alt', 'label']),
    );
  });
});
