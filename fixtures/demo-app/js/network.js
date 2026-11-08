import { renderTasks } from './tasks.js';

const list = document.querySelector('[data-testid="task-list"]');
const status = document.querySelector('[data-testid="task-status"]');

if (list && status) {
  await renderTasks(list, status);
}
