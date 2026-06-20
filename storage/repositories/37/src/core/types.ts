export type TaskStatus = 'Pending' | 'Downloading' | 'Complete' | 'Error' | 'Stopped';
export type ProgressCallback = (task: DownloadTask) => void;
export type DoneCallback = (task: DownloadTask, success: boolean, error?: string) => void;

export interface DownloadTaskConfig {
  url: string;
  filename?: string;
  onProgress?: ProgressCallback;
  onDone?: DoneCallback;
}
