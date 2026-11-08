import { renderTasks } from './tasks.js';

const list = document.querySelector('[data-testid="task-list"]');
const status = document.querySelector('[data-testid="task-status"]');
const clock = document.querySelector('[data-testid="session-clock"]');
const requestId = document.querySelector('[data-testid="request-id"]');

if (requestId) {
  requestId.textContent = Math.random().toString(36).slice(2, 8);
}

function tick() {
  if (!clock) return;
  const now = new Date();
  const hours = String(now.getUTCHours()).padStart(2, '0');
  const minutes = String(now.getUTCMinutes()).padStart(2, '0');
  const seconds = String(now.getUTCSeconds()).padStart(2, '0');
  clock.textContent = `${hours}:${minutes}:${seconds}`;
}

tick();
setInterval(tick, 1000);

if (list && status) {
  await renderTasks(list, status);
}
