import type { Page } from '@playwright/test';
import { validCase } from '../data/case';

export class CaseForm {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto('/form');
  }

  fullName() {
    return this.page.getByLabel('Full name');
  }

  email() {
    return this.page.getByLabel('Email');
  }

  phone() {
    return this.page.getByLabel('Phone');
  }

  appointment() {
    return this.page.getByLabel('Appointment date');
  }

  department() {
    return this.page.getByLabel('Department');
  }

  password() {
    return this.page.getByLabel('Password', { exact: true });
  }

  confirmPassword() {
    return this.page.getByLabel('Confirm password');
  }

  notes() {
    return this.page.getByLabel('Notes');
  }

  consent() {
    return this.page.getByRole('checkbox', { name: 'I agree to store this sample case.' });
  }

  save() {
    return this.page.getByRole('button', { name: 'Save case' });
  }

  status() {
    return this.page.getByTestId('save-status');
  }

  notesCount() {
    return this.page.getByTestId('notes-count');
  }

  async submit(): Promise<void> {
    await this.save().click();
  }

  async fillValid(overrides: Partial<typeof validCase> = {}): Promise<void> {
    const data = { ...validCase, ...overrides };
    await this.fullName().fill(data.fullName);
    await this.email().fill(data.email);
    await this.phone().fill(data.phone);
    await this.appointment().fill(data.appointment);
    await this.department().selectOption(data.department);
    await this.password().fill(data.password);
    await this.confirmPassword().fill(data.password);
    await this.notes().fill(data.notes);
    await this.consent().check();
  }
}
