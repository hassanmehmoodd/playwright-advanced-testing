const form = document.querySelector('#upload-form');
const input = document.querySelector('#file');
const result = document.querySelector('[data-testid="upload-result"]');
const bytes = document.querySelector('[data-testid="upload-bytes"]');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  result.textContent = '';
  bytes.textContent = '';

  if (!input.files || input.files.length === 0) {
    result.textContent = 'Choose a file first.';
    return;
  }

  const body = new FormData(form);
  const response = await fetch('/api/upload', { method: 'POST', body });
  const payload = await response.json();

  if (!response.ok) {
    result.textContent = payload.error || 'Upload failed.';
    return;
  }

  result.textContent = payload.filename;
  bytes.textContent = String(payload.bytes);
});
