import { generateId, sanitizeFilename, extractFilenameFromUrl } from '../utils/helpers.js';

export type TaskStatus = 'Pending' | 'Downloading' | 'Complete' | 'Error' | 'Stopped';
export type ProgressCallback = (task: DownloadTask) => void;
export type DoneCallback = (task: DownloadTask, success: boolean, error?: string) => void;

export interface DownloadTaskConfig {
  url: string;
  filename?: string;
  onProgress?: ProgressCallback;
  onDone?: DoneCallback;
}

export class DownloadTask {
  public readonly id: string;
  public readonly url: string;
  public readonly filename: string;
  public percent = 0;
  public status: TaskStatus = 'Pending';
  public error?: string;

  private abortController: AbortController | null = null;
  private onProgress?: ProgressCallback;
  private onDone?: DoneCallback;

  constructor(config: DownloadTaskConfig) {
    this.id = generateId();
    this.url = config.url;
    this.filename = config.filename
      ? sanitizeFilename(config.filename)
      : extractFilenameFromUrl(config.url) || 'downloaded_file';
    this.onProgress = config.onProgress;
    this.onDone = config.onDone;
  }

  start(): void {
    if (this.status === 'Downloading' || this.status === 'Complete') return;
    this.abortController = new AbortController();
    this.status = 'Downloading';
    this.percent = 0;
    this.error = undefined;
    this.performDownload().catch(() => {});
  }

  stop(): void {
    if (this.status === 'Downloading' || this.status === 'Pending') {
      this.abortController?.abort();
      this.abortController = null;
      this.status = 'Stopped';
      this.onProgress?.(this);
    }
  }

  private async performDownload(): Promise<void> {
    try {
      const response = await fetch(this.url, { signal: this.abortController?.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

      const totalSize = parseInt(response.headers.get('Content-Length') || '0', 10);
      const reader = response.body!.getReader();
      const chunks: Uint8Array[] = [];
      let downloaded = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        downloaded += value.length;
        this.percent = totalSize > 0
          ? Math.min(100, (downloaded / totalSize) * 100)
          : Math.min(99, this.percent + 0.5);
        this.onProgress?.(this);
      }

      await this.saveFile(chunks);
      this.status = 'Complete';
      this.percent = 100;
      this.onProgress?.(this);
      this.onDone?.(this, true);
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        this.status = 'Stopped';
        this.onProgress?.(this);
      } else {
        this.status = 'Error';
        this.error = (err as Error).message;
        this.onProgress?.(this);
        this.onDone?.(this, false, this.error);
      }
    }
  }

  private async saveFile(chunks: Uint8Array[]): Promise<void> {
    const blob = new Blob(chunks as BlobPart[]);

    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: this.filename,
          types: [{ description: 'Downloaded File', accept: { 'application/octet-stream': ['.*'] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return;
      } catch { }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
}
