import { test as base, expect } from '@playwright/test';
import { CaseForm } from './pages/case-form.page';
import { StorageDesk } from './pages/storage-desk.page';

type AppFixtures = {
  caseForm: CaseForm;
  storageDesk: StorageDesk;
};

export const test = base.extend<AppFixtures>({
  caseForm: async ({ page }, use) => {
    await use(new CaseForm(page));
  },
  storageDesk: async ({ page }, use) => {
    await use(new StorageDesk(page));
  },
});

export { expect };
