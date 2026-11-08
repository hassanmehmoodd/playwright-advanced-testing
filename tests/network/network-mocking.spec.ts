import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { annotate } from '../../support/helpers/annotate';
import { fulfillJson } from '../../support/helpers/network';
import { expect, test } from '../../support/fixtures';

const harPath = join(dirname(fileURLToPath(import.meta.url)), 'fixtures', 'tasks.har');

test.describe('network mocking', () => {
  test.beforeEach(() => {
    annotate('network-mocking');
  });

  test('fulfills the task API with a mock payload', async ({ page }) => {
    await page.route('**/api/tasks', async (route) => {
      await fulfillJson(route, {
        tasks: [{ id: 'M-1', title: 'Mocked intake review', owner: 'QA' }],
      });
    });

    await page.goto('/network');
    await expect(page.getByText('Mocked intake review')).toBeVisible();
    await expect(page.getByText('Confirm carrier pickup window')).toHaveCount(0);
  });

  test('aborts the task API and shows the offline state', async ({ page }) => {
    await page.route('**/api/tasks', (route) => route.abort('failed'));
    await page.goto('/network');
    await expect(page.getByTestId('task-status')).toHaveText('Could not load tasks (network)');
  });

  test('fulfills a 500 response from the mock', async ({ page }) => {
    await page.route('**/api/tasks', async (route) => {
      await fulfillJson(route, { error: 'nope' }, 500);
    });

    await page.goto('/network');
    await expect(page.getByTestId('task-status')).toHaveText('Could not load tasks (500)');
  });

  test('rewrites the live response before it reaches the page', async ({ page }) => {
    await page.route('**/api/tasks', async (route) => {
      const response = await route.fetch();
      const json = await response.json();
      json.tasks.push({ id: 'INJ-1', title: 'Injected by the test', owner: 'QA' });
      await route.fulfill({ response, json });
    });

    await page.goto('/network');
    await expect(page.getByText('Confirm carrier pickup window')).toBeVisible();
    await expect(page.getByText('Injected by the test')).toBeVisible();
  });

  test('replays a committed HAR fixture', async ({ page }) => {
    await page.routeFromHAR(harPath, {
      url: '**/api/tasks',
      notFound: 'fallback',
    });

    await page.goto('/network');
    await expect(page.getByText('Imported from HAR')).toBeVisible();
    await expect(page.getByTestId('task-list')).toHaveAttribute('data-ready', 'true');
  });
});
