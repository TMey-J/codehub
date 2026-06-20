import { DownloadManager } from '../core/manager.js';
import { DownloadTask } from '../core/task.js';
import * as Components from './components.js';

export class DownloaderController {
  private manager = new DownloadManager();
  private widgets = new Map<string, ReturnType<typeof Components.createTaskRow>>();
  private root: HTMLElement;
  private urlInput!: HTMLInputElement;
  private filenameInput!: HTMLInputElement;
  private startBtn!: HTMLButtonElement;
  private stopBtn!: HTMLButtonElement;
  private clearBtn!: HTMLButtonElement;
  private taskList!: HTMLElement;
  private statusText!: HTMLElement;

  constructor(root: HTMLElement) { this.root = root; }

  init() {
    this.buildUI();
    this.updateUI();
  }

  private buildUI() {
    this.root.innerHTML = '';
    const container = Components.createAppContainer();
    this.root.appendChild(container);

    const bar = Components.createControlBar();
    container.appendChild(bar);

    bar.appendChild(document.createTextNode('URL:'));
    this.urlInput = Components.createInput('https://example.com/file.zip', 2);
    bar.appendChild(this.urlInput);

    this.filenameInput = Components.createInput('Save as (optional)', 1);
    bar.appendChild(this.filenameInput);

    const addBtn = Components.createButton('Add URL', '#3498db', () => this.addTask());
    bar.appendChild(addBtn);

    this.startBtn = Components.createButton('Start All', '#27ae60', () => this.startAll());
    bar.appendChild(this.startBtn);

    this.stopBtn = Components.createButton('Stop All', '#e74c3c', () => this.stopAll());
    this.stopBtn.disabled = true;
    bar.appendChild(this.stopBtn);

    this.clearBtn = Components.createButton('Clear Finished', '#95a5a6', () => this.clearFinished());
    bar.appendChild(this.clearBtn);

    this.taskList = Components.createTaskList();
    container.appendChild(this.taskList);

    const statusBar = Components.createStatusBar();
    container.appendChild(statusBar);
    this.statusText = statusBar.querySelector('#status-text')!;
  }

  private addTask() {
    const url = this.urlInput.value.trim();
    if (!url) { alert('Enter a URL.'); return; }
    const filename = this.filenameInput.value.trim() || undefined;

    const widgets = Components.createTaskRow(url, filename || 'auto');
    this.taskList.appendChild(widgets.row);

    const task = this.manager.addTask(
      url,
      filename,
      (t) => this.updateTaskUI(t),
      (t, success, error) => this.updateTaskUI(t)
    );
    this.widgets.set(task.id, widgets);
    this.urlInput.value = '';
    this.filenameInput.value = '';
    this.filenameInput.placeholder = 'Save as (optional)';
    this.updateUI();
  }

  private updateTaskUI(task: DownloadTask) {
    const w = this.widgets.get(task.id);
    if (!w) return;
    w.progressBar.value = Math.round(task.percent);
    w.percentLabel.textContent = `${task.percent.toFixed(1)}%`;
    const colors: Record<string, string> = { Pending: '#ffd93d', Downloading: '#ffd93d', Complete: '#00ff99', Error: '#ff4444', Stopped: '#ff8c00' };
    w.statusLabel.textContent = task.status === 'Complete' ? '✓ Complete' : task.status === 'Error' ? `✗ ${task.error || 'Error'}` : task.status;
    w.statusLabel.style.color = colors[task.status] || '#ffd93d';
    this.updateUI();
  }

  private startAll() {
    const pending = this.manager.getTasks().filter(t => t.status === 'Pending');
    if (!pending.length) { alert('No pending tasks.'); return; }
    this.startBtn.disabled = true;
    this.stopBtn.disabled = false;
    this.statusText.textContent = `Downloading ${pending.length} task${pending.length > 1 ? 's' : ''}...`;
    this.manager.startAll();
    this.updateUI();
  }

  private stopAll() {
    this.manager.stopAll();
    this.startBtn.disabled = false;
    this.stopBtn.disabled = true;
    this.statusText.textContent = 'Stopped';
    this.updateUI();
  }

  private clearFinished() {
    const finished = this.manager.getFinishedTasks();
    if (!finished.length) { alert('No finished tasks.'); return; }
    for (const t of finished) {
      this.widgets.get(t.id)?.row.remove();
      this.widgets.delete(t.id);
    }
    this.manager.clearFinished();
    this.updateUI();
  }

  private updateUI() {
    const all = this.manager.getTasks();
    const active = this.manager.getActiveTasks();
    const finished = this.manager.getFinishedTasks();
    this.startBtn.disabled = !all.some(t => t.status === 'Pending');
    this.stopBtn.disabled = active.length === 0;
    this.clearBtn.disabled = finished.length === 0;
    document.getElementById('task-counter')!.textContent = `${all.length} task${all.length !== 1 ? 's' : ''} (${active.length} active)`;
  }
}
