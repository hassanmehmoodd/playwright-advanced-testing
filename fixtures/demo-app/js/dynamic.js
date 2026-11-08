class StatusBadge extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>
        button {
          font-family: Inter, sans-serif;
          font-weight: 600;
          background: #0f5f56;
          color: #ffffff;
          border: 0;
          border-radius: 999px;
          padding: 8px 14px;
        }
      </style>
      <button type="button">Acknowledge case</button>
    `;
    const button = root.querySelector('button');
    button.addEventListener('click', () => {
      button.textContent = 'Acknowledged';
    });
  }
}

class CaseFolder extends HTMLElement {
  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>
        p { margin: 0; font-family: Inter, sans-serif; }
      </style>
      <p>Nested shadow folder</p>
    `;
  }
}

customElements.define('status-badge', StatusBadge);
customElements.define('case-folder', CaseFolder);

const loadButton = document.querySelector('#load-activity');
const activityStatus = document.querySelector('[data-testid="activity-status"]');
const activityPanel = document.querySelector('[data-testid="activity-panel"]');
const replaceButton = document.querySelector('#replace-row');

loadButton.addEventListener('click', async () => {
  activityStatus.textContent = 'Loading activity…';
  activityPanel.hidden = true;
  const response = await fetch('/api/activity');
  if (!response.ok) {
    activityStatus.textContent = `Activity failed (${response.status})`;
    return;
  }
  const data = await response.json();
  activityPanel.querySelector('[data-testid="activity-title"]').textContent = data.title;
  activityPanel.hidden = false;
  activityStatus.textContent = 'Activity ready';
});

replaceButton.addEventListener('click', () => {
  const current = document.querySelector('#queue-item');
  const next = Number(current.dataset.generation || '1') + 1;
  const item = document.createElement('li');
  item.id = 'queue-item';
  item.dataset.generation = String(next);
  item.textContent = `Generation ${next}`;
  current.replaceWith(item);
});
