import { readFile, stat } from 'node:fs/promises';
import { internetOrigin, practiceOrigin } from '../../support/constants';
import { annotate } from '../../support/helpers/annotate';
import { silenceThirdParties } from '../../support/helpers/network';
import { expect, test } from '../../support/fixtures';

const samplePath = 'test-data/sample-upload.txt';

test.describe('file upload and download', () => {
  test.beforeEach(() => {
    annotate('file-transfer');
  });

  test('uploads a fixture file to Harbor Desk', async ({ page }) => {
    const bytes = (await stat(samplePath)).size;
    await page.goto('/upload');
    await page.getByLabel('Choose a file').setInputFiles(samplePath);
    await page.getByRole('button', { name: 'Upload file' }).click();

    await expect(page.getByTestId('upload-result')).toHaveText('sample-upload.txt');
    await expect(page.getByTestId('upload-bytes')).toHaveText(String(bytes));
  });

  test('downloads the Harbor Desk release notes', async ({ page }) => {
    await page.goto('/upload');
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('link', { name: 'Download release notes' }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe('release-notes.txt');
    const savedPath = await download.path();
    expect(savedPath).toBeTruthy();
    const body = await readFile(savedPath as string, 'utf8');
    expect(body).toContain('Harbor Desk release notes');
  });

  test('uploads a file on The Internet', async ({ page }) => {
    await page.goto(`${internetOrigin}/upload`);
    await page.locator('#file-upload').setInputFiles(samplePath);
    await page.locator('#file-submit').click();

    await expect(page.locator('#uploaded-files')).toHaveText('sample-upload.txt');
  });

  test('downloads a stable file from Expand Testing', async ({ page }) => {
    await silenceThirdParties(page);
    await page.goto(`${practiceOrigin}/download`);
    const downloadPromise = page.waitForEvent('download');
    await page.locator('a[href$="some-file.txt"]').click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe('some-file.txt');
    const savedPath = await download.path();
    expect(savedPath).toBeTruthy();
    const body = await readFile(savedPath as string);
    expect(body.length).toBeGreaterThan(0);
  });
});
