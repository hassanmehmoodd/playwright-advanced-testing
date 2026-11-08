import type { Page } from '@playwright/test';
import { annotate } from '../../support/helpers/annotate';
import { expect, test } from '../../support/fixtures';

type InstantExpectation = {
  locale: string;
  timeZone: string;
  greeting: string;
  day: string;
  hour: string;
};

async function expectInstant(page: Page, expected: InstantExpectation): Promise<void> {
  await page.goto('/locale');
  await expect(page.locator('html')).toHaveAttribute('lang', expected.locale);
  await expect(page.getByTestId('greeting')).toHaveText(expected.greeting);
  await expect(page.getByTestId('locale')).toHaveText(expected.locale);
  await expect(page.getByTestId('timezone')).toHaveText(expected.timeZone);

  const appointment = page.getByTestId('appointment');
  await expect(appointment).toHaveAttribute('data-year', '2026');
  await expect(appointment).toHaveAttribute('data-month', '06');
  await expect(appointment).toHaveAttribute('data-day', expected.day);
  await expect(appointment).toHaveAttribute('data-hour', expected.hour);
  await expect(appointment).toHaveAttribute('data-minute', '00');

  const amount = page.getByTestId('amount');
  await expect(amount).toHaveAttribute('data-currency', 'USD');
  await expect(amount).toHaveAttribute('data-integer', '1234');
  await expect(amount).toHaveAttribute('data-fraction', '50');
}

test.describe('localization in New York', () => {
  test.use({ locale: 'en-US', timezoneId: 'America/New_York' });

  test('formats the fixture instant in English', async ({ page }) => {
    annotate('localization');
    await expectInstant(page, {
      locale: 'en-US',
      timeZone: 'America/New_York',
      greeting: 'Hello',
      day: '15',
      hour: '11',
    });
  });
});

test.describe('localization in Paris', () => {
  test.use({ locale: 'fr-FR', timezoneId: 'Europe/Paris' });

  test('formats the fixture instant in French', async ({ page }) => {
    annotate('localization');
    await expectInstant(page, {
      locale: 'fr-FR',
      timeZone: 'Europe/Paris',
      greeting: 'Bonjour',
      day: '15',
      hour: '17',
    });
  });
});

test.describe('localization in Tokyo', () => {
  test.use({ locale: 'ja-JP', timezoneId: 'Asia/Tokyo' });

  test('formats the fixture instant in Japanese', async ({ page }) => {
    annotate('localization');
    await expectInstant(page, {
      locale: 'ja-JP',
      timeZone: 'Asia/Tokyo',
      greeting: 'こんにちは',
      day: '16',
      hour: '00',
    });
  });
});
