const displayName = document.querySelector('#display-name');
const sessionNote = document.querySelector('#session-note');
const preference = document.querySelector('#preference-token');
const localValue = document.querySelector('[data-testid="local-value"]');
const sessionValue = document.querySelector('[data-testid="session-value"]');
const cookieValue = document.querySelector('[data-testid="cookie-value"]');
const serverSession = document.querySelector('[data-testid="server-session"]');

function show(element, value) {
  element.textContent = value || 'Empty';
}

function readCookie(name) {
  const prefix = `${name}=`;
  const found = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));
  return found ? decodeURIComponent(found.slice(prefix.length)) : '';
}

async function render() {
  show(localValue, localStorage.getItem('harbor.displayName') || '');
  show(sessionValue, sessionStorage.getItem('harbor.sessionNote') || '');
  show(cookieValue, readCookie('harbor_pref'));

  try {
    const response = await fetch('/api/session');
    const data = await response.json();
    show(serverSession, data.session || '');
  } catch {
    show(serverSession, '');
  }
}

document.querySelector('#save-local').addEventListener('click', () => {
  localStorage.setItem('harbor.displayName', displayName.value);
  void render();
});

document.querySelector('#save-session').addEventListener('click', () => {
  sessionStorage.setItem('harbor.sessionNote', sessionNote.value);
  void render();
});

document.querySelector('#save-cookie').addEventListener('click', () => {
  document.cookie = `harbor_pref=${encodeURIComponent(preference.value)}; path=/; samesite=lax`;
  void render();
});

document.querySelector('#refresh-state').addEventListener('click', () => {
  void render();
});

await render();
