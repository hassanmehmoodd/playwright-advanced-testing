export async function renderTasks(list, status) {
  try {
    const response = await fetch('/api/tasks');
    if (!response.ok) throw new Error(String(response.status));

    const data = await response.json();
    list.replaceChildren();

    for (const task of data.tasks) {
      const item = document.createElement('li');
      item.dataset.taskId = task.id;

      const id = document.createElement('span');
      id.className = 'task-id';
      id.textContent = task.id;

      const title = document.createElement('span');
      title.className = 'task-title';
      title.textContent = task.title;

      const owner = document.createElement('span');
      owner.className = 'task-owner';
      owner.textContent = task.owner;

      item.append(id, title, owner);
      list.append(item);
    }

    status.textContent = `${data.tasks.length} open tasks`;
    list.dataset.ready = 'true';
  } catch (error) {
    const reason =
      error instanceof Error && /^\d+$/.test(error.message) ? error.message : 'network';
    status.textContent = `Could not load tasks (${reason})`;
    list.dataset.ready = 'error';
    list.replaceChildren();
  }
}
