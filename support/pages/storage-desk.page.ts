import type { Page } from '@playwright/test';

export class StorageDesk {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/storage');
  }

  displayName() {
    return this.page.getByLabel('Display name');
  }

  sessionNote() {
    return this.page.getByLabel('Session note');
  }

  preferenceToken() {
    return this.page.getByLabel('Preference token');
  }

  localValue() {
    return this.page.getByTestId('local-value');
  }

  sessionValue() {
    return this.page.getByTestId('session-value');
  }

  cookieValue() {
    return this.page.getByTestId('cookie-value');
  }

  serverSession() {
    return this.page.getByTestId('server-session');
  }

  async saveLocally(name: string): Promise<void> {
    await this.displayName().fill(name);
    await this.page.getByRole('button', { name: 'Save locally' }).click();
  }

  async saveForThisTab(note: string): Promise<void> {
    await this.sessionNote().fill(note);
    await this.page.getByRole('button', { name: 'Save for this tab' }).click();
  }

  async setPreference(token: string): Promise<void> {
    await this.preferenceToken().fill(token);
    await this.page.getByRole('button', { name: 'Set cookie' }).click();
  }
}
