import { test } from '@playwright/test';

export function annotate(capability: string): void {
  test.info().annotations.push({ type: 'capability', description: capability });
}
