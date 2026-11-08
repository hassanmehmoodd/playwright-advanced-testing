import { internetOrigin, practiceOrigin } from '../../support/constants';
import { annotate } from '../../support/helpers/annotate';
import { silenceThirdParties } from '../../support/helpers/network';
import { expect, test } from '../../support/fixtures';

test.describe('error handling', () => {
  test.beforeEach(() => {
    annotate('error-handling');
  });

  test('accepts an alert', async ({ page }) => {
    await page.goto('/errors');
    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('alert');
      expect(dialog.message()).toBe('Harbor Desk saved the draft.');
      await dialog.accept();
    });

    await page.getByRole('button', { name: 'Show alert' }).click();
    await expect(page.getByTestId('dialog-result')).toHaveText('Alert accepted');
  });

  test('dismisses a confirm', async ({ page }) => {
    await page.goto('/errors');
    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      await dialog.dismiss();
    });

    await page.getByRole('button', { name: 'Show confirm' }).click();
    await expect(page.getByTestId('dialog-result')).toHaveText('Confirm dismissed');
  });

  test('accepts a prompt with text', async ({ page }) => {
    await page.goto('/errors');
    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('prompt');
      await dialog.accept('Dock 4');
    });

    await page.getByRole('button', { name: 'Show prompt' }).click();
    await expect(page.getByTestId('dialog-result')).toHaveText('Prompt: Dock 4');
  });

  test('captures a console error', async ({ page }) => {
    const messages: string[] = [];
    page.on('console', (message) => messages.push(`${message.type()}:${message.text()}`));

    await page.goto('/errors');
    await page.getByRole('button', { name: 'Log a console error' }).click();
    await expect.poll(() => messages).toContain('error:Harbor desk failed to sync');
  });

  test('captures an uncaught exception', async ({ page }) => {
    const messages: string[] = [];
    page.on('pageerror', (error) => messages.push(error.message));

    await page.goto('/errors');
    await page.getByRole('button', { name: 'Throw an exception' }).click();
    await expect.poll(() => messages).toContain('Intake worker crashed');
  });

  test('renders the local 404 page', async ({ page }) => {
    const response = await page.goto('/missing-case');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  });

  test('shows the status from a real 500 response', async ({ page }) => {
    await page.goto('/errors');
    await page.getByRole('button', { name: 'Load a failing request' }).click();
    await expect(page.getByTestId('request-result')).toHaveText('Request failed (500)');
  });

  test('shows a network failure when the request is aborted', async ({ page }) => {
    await page.route('**/api/status/500', (route) => route.abort('failed'));
    await page.goto('/errors');
    await page.getByRole('button', { name: 'Load a failing request' }).click();
    await expect(page.getByTestId('request-result')).toHaveText('Request failed (network)');
  });

  test('accepts the JavaScript alert on The Internet', async ({ page }) => {
    await page.goto(`${internetOrigin}/javascript_alerts`);
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Click for JS Alert' }).click();
    await expect(page.locator('#result')).toHaveText('You successfully clicked an alert');
  });

  test('observes the page error on Expand Testing', async ({ page }) => {
    const messages: string[] = [];
    page.on('pageerror', (error) => messages.push(error.message));
    await silenceThirdParties(page);
    await page.goto(`${practiceOrigin}/javascript-error`);
    await expect.poll(() => messages.join('\n')).toMatch(/xyz|propertyThatDoesNotExist/);
  });

  test('opens the 500 status page on The Internet', async ({ page }) => {
    await page.goto(`${internetOrigin}/status_codes`);
    await page.getByRole('link', { name: '500', exact: true }).click();
    await expect(page.getByText('This page returned a 500 status code.')).toBeVisible();
  });
});
