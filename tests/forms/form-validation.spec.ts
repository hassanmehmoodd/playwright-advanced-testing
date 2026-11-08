import { fixedClock } from '../../support/constants';
import { annotate } from '../../support/helpers/annotate';
import { expect, test } from '../../support/fixtures';

test.describe('case form validation', () => {
  test.beforeEach(async ({ page }) => {
    annotate('form-validation');
    await page.clock.install({ time: fixedClock });
  });

  test('blocks an empty submit and focuses the first invalid field', async ({ page, caseForm }) => {
    await caseForm.open();
    await caseForm.submit();

    await expect(caseForm.fullName()).toBeFocused();
    await expect(page.getByText('Enter the contact name.')).toBeVisible();
    await expect(page.getByText('Enter an email address.')).toBeVisible();
    await expect(page.getByText('Enter a phone number.')).toBeVisible();
    await expect(page.getByText('Choose an appointment date.')).toBeVisible();
    await expect(page.getByText('Select a department.')).toBeVisible();
    await expect(page.getByText('Create a password.')).toBeVisible();
    await expect(page.getByText('Confirm the password.')).toBeVisible();
    await expect(page.getByText('Consent is required before saving.')).toBeVisible();
    await expect(caseForm.fullName()).toHaveAttribute('aria-invalid', 'true');
  });

  test('checks email and phone when the field blurs', async ({ page, caseForm }) => {
    await caseForm.open();
    await caseForm.email().fill('not-an-email');
    await caseForm.email().blur();
    await expect(page.getByText('Enter an email like name@example.com.')).toBeVisible();

    await caseForm.email().fill('ada@example.com');
    await caseForm.email().blur();
    await expect(page.getByText('Enter an email like name@example.com.')).toBeHidden();
    await expect(caseForm.email()).toHaveAttribute('aria-invalid', 'false');

    await caseForm.phone().fill('555');
    await caseForm.phone().blur();
    await expect(page.getByText('Use the format 555-010-1234.')).toBeVisible();
  });

  test('rejects a contact name that contains a digit', async ({ page, caseForm }) => {
    await caseForm.open();
    await caseForm.fullName().fill('Ada1');
    await caseForm.fullName().blur();
    await expect(page.getByText('Use letters, spaces, apostrophes, or hyphens.')).toBeVisible();
  });

  test('enforces password length and a letter plus a number', async ({ page, caseForm }) => {
    await caseForm.open();
    await caseForm.password().fill('short1');
    await caseForm.password().blur();
    await expect(page.getByText('Use at least 8 characters.')).toBeVisible();

    await caseForm.password().fill('longpassword');
    await caseForm.password().blur();
    await expect(page.getByText('Include a letter and a number.')).toBeVisible();
  });

  test('rejects a confirmation that does not match', async ({ page, caseForm }) => {
    await caseForm.open();
    await caseForm.fillValid();
    await caseForm.confirmPassword().fill('Harbor2027');
    await caseForm.submit();
    await expect(page.getByText('Passwords do not match.')).toBeVisible();
  });

  test('rejects an appointment before the frozen clock date', async ({ page, caseForm }) => {
    await caseForm.open();
    await caseForm.appointment().fill('2026-06-01');
    await caseForm.appointment().blur();
    await expect(page.getByText('Choose today or a future date.')).toBeVisible();
  });

  test('rejects a weekend appointment', async ({ page, caseForm }) => {
    await caseForm.open();
    await caseForm.appointment().fill('2026-06-20');
    await caseForm.appointment().blur();
    await expect(page.getByText('Choose a weekday.')).toBeVisible();
  });

  test('counts notes and rejects text over the limit', async ({ page, caseForm }) => {
    await caseForm.open();
    await caseForm.notes().fill('x'.repeat(121));
    await expect(caseForm.notesCount()).toHaveText('121 / 120');
    await caseForm.submit();
    await expect(page.getByText('Keep notes to 120 characters.')).toBeVisible();
  });

  test('saves a valid case', async ({ caseForm }) => {
    await caseForm.open();
    await caseForm.fillValid();
    await caseForm.submit();
    await expect(caseForm.status()).toHaveText('Case saved for Ada Lovelace.');
  });
});
