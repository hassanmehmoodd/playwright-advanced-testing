const form = document.querySelector('#case-form');
const status = document.querySelector('[data-testid="save-status"]');
const notes = document.querySelector('#notes');
const counter = document.querySelector('[data-testid="notes-count"]');
const notesLimit = 120;

const controls = [
  {
    id: 'full-name',
    validate(value) {
      const trimmed = String(value).trim();
      if (!trimmed) return 'Enter the contact name.';
      if (trimmed.length < 2) return 'Use at least 2 characters.';
      if (!/^[\p{L}][\p{L}\s'.-]*$/u.test(trimmed)) {
        return 'Use letters, spaces, apostrophes, or hyphens.';
      }
      return '';
    },
  },
  {
    id: 'email',
    validate(value) {
      const trimmed = String(value).trim();
      if (!trimmed) return 'Enter an email address.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        return 'Enter an email like name@example.com.';
      }
      return '';
    },
  },
  {
    id: 'phone',
    validate(value) {
      const trimmed = String(value).trim();
      if (!trimmed) return 'Enter a phone number.';
      if (!/^\d{3}-\d{3}-\d{4}$/.test(trimmed)) return 'Use the format 555-010-1234.';
      return '';
    },
  },
  {
    id: 'appointment',
    validate(value) {
      if (!value) return 'Choose an appointment date.';
      const selected = new Date(`${value}T00:00:00`);
      if (Number.isNaN(selected.getTime())) return 'Choose a valid date.';
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) return 'Choose today or a future date.';
      const day = selected.getDay();
      if (day === 0 || day === 6) return 'Choose a weekday.';
      return '';
    },
  },
  {
    id: 'department',
    validate(value) {
      if (!value) return 'Select a department.';
      return '';
    },
  },
  {
    id: 'password',
    validate(value) {
      const text = String(value);
      if (!text) return 'Create a password.';
      if (text.length < 8) return 'Use at least 8 characters.';
      if (!/[A-Za-z]/.test(text) || !/\d/.test(text)) return 'Include a letter and a number.';
      return '';
    },
  },
  {
    id: 'confirm-password',
    validate(value) {
      const text = String(value);
      const password = document.querySelector('#password');
      if (!text) return 'Confirm the password.';
      if (text !== password.value) return 'Passwords do not match.';
      return '';
    },
  },
  {
    id: 'notes',
    validate(value) {
      if (String(value).length > notesLimit) return 'Keep notes to 120 characters.';
      return '';
    },
  },
  {
    id: 'consent',
    validate(checked) {
      if (!checked) return 'Consent is required before saving.';
      return '';
    },
  },
];

function currentValue(input) {
  if (input instanceof HTMLInputElement && input.type === 'checkbox') return input.checked;
  return input.value;
}

function setError(input, message) {
  const error = document.getElementById(`${input.id}-error`);
  if (!error) return;

  if (message) {
    error.hidden = false;
    error.textContent = message;
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', error.id);
    return;
  }

  error.hidden = true;
  error.textContent = '';
  input.setAttribute('aria-invalid', 'false');
  input.removeAttribute('aria-describedby');
}

function validateAll() {
  let firstInvalid = null;
  for (const spec of controls) {
    const input = document.getElementById(spec.id);
    const message = spec.validate(currentValue(input));
    setError(input, message);
    if (message && !firstInvalid) firstInvalid = input;
  }
  return firstInvalid;
}

notes.addEventListener('input', () => {
  counter.textContent = `${notes.value.length} / ${notesLimit}`;
});

form.addEventListener('focusout', (event) => {
  const target = event.target;
  if (!(
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement
  )) {
    return;
  }
  const spec = controls.find((item) => item.id === target.id);
  if (!spec) return;
  setError(target, spec.validate(currentValue(target)));
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  status.textContent = '';
  const firstInvalid = validateAll();
  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }
  const name = document.querySelector('#full-name').value.trim();
  status.textContent = `Case saved for ${name}.`;
});
