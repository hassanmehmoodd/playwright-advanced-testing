const locale = navigator.language || 'en-US';
const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const instant = new Date('2026-06-15T15:00:00.000Z');

const greetings = {
  'en-US': 'Hello',
  'en-GB': 'Hello',
  'fr-FR': 'Bonjour',
  'ja-JP': 'こんにちは',
};

document.documentElement.lang = locale;
document.querySelector('[data-testid="locale"]').textContent = locale;
document.querySelector('[data-testid="timezone"]').textContent = timeZone;
document.querySelector('[data-testid="greeting"]').textContent =
  greetings[locale] || `Hello (${locale})`;

const dateParts = new Intl.DateTimeFormat(locale, {
  timeZone,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  numberingSystem: 'latn',
}).formatToParts(instant);

function part(type) {
  return dateParts.find((item) => item.type === type)?.value ?? '';
}

function digits(value, size) {
  return value.replace(/\D/g, '').padStart(size, '0');
}

const appointment = document.querySelector('[data-testid="appointment"]');
appointment.dataset.year = digits(part('year'), 4);
appointment.dataset.month = digits(part('month'), 2);
appointment.dataset.day = digits(part('day'), 2);
appointment.dataset.hour = digits(part('hour'), 2);
appointment.dataset.minute = digits(part('minute'), 2);
appointment.textContent = new Intl.DateTimeFormat(locale, {
  timeZone,
  dateStyle: 'full',
  timeStyle: 'short',
  hourCycle: 'h23',
  numberingSystem: 'latn',
}).format(instant);

const amountParts = new Intl.NumberFormat(locale, {
  style: 'currency',
  currency: 'USD',
  currencyDisplay: 'code',
  minimumFractionDigits: 2,
  numberingSystem: 'latn',
}).formatToParts(1234.5);

const amount = document.querySelector('[data-testid="amount"]');
amount.dataset.currency = amountParts.find((item) => item.type === 'currency')?.value ?? '';
amount.dataset.integer = amountParts
  .filter((item) => item.type === 'integer')
  .map((item) => item.value)
  .join('');
amount.dataset.fraction = amountParts.find((item) => item.type === 'fraction')?.value ?? '';
amount.textContent = new Intl.NumberFormat(locale, {
  style: 'currency',
  currency: 'USD',
  currencyDisplay: 'code',
  numberingSystem: 'latn',
}).format(1234.5);
