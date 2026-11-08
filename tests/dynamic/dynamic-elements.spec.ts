import { internetOrigin, practiceOrigin } from '../../support/constants';
import { annotate } from '../../support/helpers/annotate';
import { silenceThirdParties } from '../../support/helpers/network';
import { expect, test } from '../../support/fixtures';

test.describe('dynamic elements', () => {
  test.beforeEach(() => {
    annotate('dynamic-elements');
  });

  test('waits for activity rendered after a delayed response', async ({ page }) => {
    await page.goto('/dynamic');
    await page.getByRole('button', { name: 'Load activity' }).click();
    await expect(page.getByTestId('activity-status')).toHaveText('Loading activity…');
    await page.getByTestId('activity-panel').waitFor({ state: 'visible' });
    await expect(page.getByTestId('activity-title')).toHaveText('Dock inspection');
  });

  test('clicks a control inside an open shadow root', async ({ page }) => {
    await page.goto('/dynamic');
    await page.getByRole('button', { name: 'Acknowledge case' }).click();
    await expect(page.getByRole('button', { name: 'Acknowledged' })).toBeVisible();
    await expect(page.getByText('Nested shadow folder')).toBeVisible();
  });

  test('fills a field inside an iframe', async ({ page }) => {
    await page.goto('/dynamic');
    const frame = page.frameLocator('#notes-frame');
    await frame.getByLabel('Internal note').fill('Nested frame note');
    await frame.getByRole('button', { name: 'Apply note' }).click();
    await expect(frame.locator('#echo')).toHaveText('Nested frame note');
  });

  test('keeps a locator pointed at a node that was replaced', async ({ page }) => {
    await page.goto('/dynamic');
    const row = page.locator('#queue-item');
    await expect(row).toHaveText('Generation 1');
    await page.getByRole('button', { name: 'Replace row' }).click();
    await expect(row).toHaveText('Generation 2');
  });

  test('waits for Hello World on The Internet dynamic loading example', async ({ page }) => {
    test.setTimeout(45_000);
    await page.goto(`${internetOrigin}/dynamic_loading/2`);
    await page.getByRole('button', { name: 'Start' }).click();
    await expect(page.locator('#finish h4')).toHaveText('Hello World!', { timeout: 20_000 });
  });

  test('reads slotted text inside The Internet shadow DOM', async ({ page }) => {
    await page.goto(`${internetOrigin}/shadowdom`);
    await expect(page.getByText("Let's have some different text!").first()).toBeVisible();
    await expect(page.getByText('In a list!')).toBeVisible();
  });

  test('adds and removes an element on Expand Testing', async ({ page }) => {
    await silenceThirdParties(page);
    await page.goto(`${practiceOrigin}/add-remove-elements`);
    await page.getByRole('button', { name: 'Add Element' }).click();

    const added = page.locator('#elements button');
    await expect(added).toHaveCount(1);
    await added.click();
    await expect(added).toHaveCount(0);
  });
});
