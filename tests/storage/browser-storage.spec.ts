import { demoBaseUrl } from '../../support/constants';
import { contextWithStorage } from '../../support/helpers/browser';
import { annotate } from '../../support/helpers/annotate';
import { StorageDesk } from '../../support/pages/storage-desk.page';
import { expect, test } from '../../support/fixtures';

test.describe('browser storage', () => {
  test.beforeEach(() => {
    annotate('browser-storage');
  });

  test('keeps local storage, session storage, and a cookie across reload', async ({
    page,
    storageDesk,
  }) => {
    await storageDesk.open();
    await storageDesk.saveLocally('Hassan');
    await storageDesk.saveForThisTab('temp note');
    await storageDesk.setPreference('pref-42');
    await page.reload();

    await expect(storageDesk.localValue()).toHaveText('Hassan');
    await expect(storageDesk.sessionValue()).toHaveText('temp note');
    await expect(storageDesk.cookieValue()).toHaveText('pref-42');
  });

  test('restores local storage and cookies from storageState, not session storage', async ({
    page,
    storageDesk,
  }) => {
    await storageDesk.open();
    await storageDesk.saveLocally('Hassan');
    await storageDesk.saveForThisTab('temp note');
    await storageDesk.setPreference('pref-42');

    const state = await page.context().storageState();
    const restoredContext = await contextWithStorage(page, state);
    try {
      const restored = new StorageDesk(await restoredContext.newPage());
      await restored.open();
      await expect(restored.localValue()).toHaveText('Hassan');
      await expect(restored.cookieValue()).toHaveText('pref-42');
      await expect(restored.sessionValue()).toHaveText('Empty');
    } finally {
      await restoredContext.close();
    }
  });

  test('seeds local storage before the first navigation', async ({ context, storageDesk }) => {
    await context.addInitScript((name) => {
      localStorage.setItem('harbor.displayName', name);
    }, 'Seeded reviewer');

    await storageDesk.open();
    await expect(storageDesk.localValue()).toHaveText('Seeded reviewer');
  });

  test('sends an httpOnly cookie to the server and hides it from document.cookie', async ({
    context,
    page,
    storageDesk,
  }) => {
    await context.addCookies([
      {
        name: 'harbor_session',
        value: 'http-only-token',
        url: demoBaseUrl,
        httpOnly: true,
        sameSite: 'Lax',
      },
    ]);

    await storageDesk.open();
    await expect(storageDesk.serverSession()).toHaveText('http-only-token');
    await expect(storageDesk.cookieValue()).toHaveText('Empty');

    const visibleCookie = await page.evaluate(() => document.cookie);
    expect(visibleCookie).not.toContain('http-only-token');
  });
});
