import { DownloadTask, ProgressCallback, DoneCallback } from './task.js';

export class DownloadManager {
  private tasks: DownloadTask[] = [];

  addTask(url: string, filename?: string, onProgress?: ProgressCallback, onDone?: DoneCallback): DownloadTask {
    const task = new DownloadTask({ url, filename, onProgress, onDone });
    this.tasks.push(task);
    return task;
  }

  getTasks(): DownloadTask[] { return [...this.tasks]; }
  getActiveTasks(): DownloadTask[] { return this.tasks.filter(t => t.status === 'Pending' || t.status === 'Downloading'); }
  getFinishedTasks(): DownloadTask[] { return this.tasks.filter(t => t.status === 'Complete' || t.status === 'Error'); }

  startAll(): void { this.tasks.forEach(t => t.status === 'Pending' && t.start()); }
  stopAll(): void { this.tasks.forEach(t => (t.status === 'Downloading' || t.status === 'Pending') && t.stop()); }
  clearFinished(): void { this.tasks = this.tasks.filter(t => t.status !== 'Complete' && t.status !== 'Error'); }
}
