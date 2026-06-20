export function extractFilenameFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const base = parsed.pathname.split('/').pop();
    return base && base.length > 0 ? base : null;
  } catch { return null; }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[\\/]/g, '_').trim() || 'downloaded_file';
}
