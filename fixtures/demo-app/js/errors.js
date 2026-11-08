const result = document.querySelector('[data-testid="dialog-result"]');
const requestResult = document.querySelector('[data-testid="request-result"]');

document.querySelector('#show-alert').addEventListener('click', () => {
  window.alert('Harbor Desk saved the draft.');
  result.textContent = 'Alert accepted';
});

document.querySelector('#show-confirm').addEventListener('click', () => {
  const accepted = window.confirm('Discard this draft?');
  result.textContent = accepted ? 'Confirm accepted' : 'Confirm dismissed';
});

document.querySelector('#show-prompt').addEventListener('click', () => {
  const value = window.prompt('Case label');
  result.textContent = value === null ? 'Prompt dismissed' : `Prompt: ${value}`;
});

document.querySelector('#log-error').addEventListener('click', () => {
  console.error('Harbor desk failed to sync');
});

document.querySelector('#throw-error').addEventListener('click', () => {
  setTimeout(() => {
    throw new Error('Intake worker crashed');
  }, 0);
});

document.querySelector('#load-failure').addEventListener('click', async () => {
  try {
    const response = await fetch('/api/status/500');
    if (!response.ok) {
      requestResult.textContent = `Request failed (${response.status})`;
      return;
    }
    requestResult.textContent = 'Request completed';
  } catch {
    requestResult.textContent = 'Request failed (network)';
  }
});
