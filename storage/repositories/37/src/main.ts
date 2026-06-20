import { DownloaderController } from './ui/controller.js';
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('app');
  if (!root) throw new Error('Root #app missing');
  new DownloaderController(root).init();
});
