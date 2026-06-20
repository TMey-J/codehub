export function createAppContainer(): HTMLElement {
  const el = document.createElement('div');
  el.style.cssText = `
    display:flex; flex-direction:column; height:100vh; max-width:900px; margin:0 auto;
    padding:16px; background:#1a1a1a; color:#fff; font-family:sans-serif; box-sizing:border-box;
  `;
  return el;
}

export function createControlBar(): HTMLElement {
  const bar = document.createElement('div');
  bar.style.cssText = `display:flex; flex-wrap:wrap; gap:8px; align-items:center; padding:8px 0; background:#1a1a1a;`;
  return bar;
}

export function createInput(placeholder: string, flex = 1): HTMLInputElement {
  const inp = document.createElement('input');
  inp.type = 'text';
  inp.placeholder = placeholder;
  inp.style.cssText = `
    background:#2d2d2d; color:#fff; border:1px solid #444; border-radius:4px;
    padding:6px 10px; flex:${flex}; min-width:120px; outline:none;
  `;
  inp.addEventListener('focus', () => inp.style.borderColor = '#3498db');
  inp.addEventListener('blur', () => inp.style.borderColor = '#444');
  return inp;
}

export function createButton(text: string, color: string, onClick: () => void): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.textContent = text;
  btn.style.cssText = `
    background:${color}; color:#fff; border:none; border-radius:4px; padding:6px 16px;
    cursor:pointer; font-size:14px; transition:opacity 0.2s; white-space:nowrap;
  `;
  btn.addEventListener('mouseenter', () => btn.style.opacity = '0.85');
  btn.addEventListener('mouseleave', () => btn.style.opacity = '1');
  btn.addEventListener('click', onClick);
  return btn;
}

export function createTaskList(): HTMLElement {
  const list = document.createElement('div');
  list.style.cssText = `
    flex:1; overflow-y:auto; background:#1a1a1a; border:1px solid #333;
    border-radius:4px; padding:4px; min-height:200px;
  `;
  return list;
}

export function createTaskRow(url: string, filename: string) {
  const row = document.createElement('div');
  row.style.cssText = `display:flex; align-items:center; gap:10px; background:#2d2d2d; padding:6px 10px; margin-bottom:2px; border-radius:3px;`;

  const urlLabel = document.createElement('div');
  urlLabel.textContent = url;
  urlLabel.style.cssText = `color:#00ff99; flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:13px;`;
  urlLabel.title = `${url}\nSave as: ${filename}`;
  row.appendChild(urlLabel);

  const statusLabel = document.createElement('span');
  statusLabel.textContent = 'Pending';
  statusLabel.style.cssText = `color:#ffd93d; min-width:80px; text-align:center; font-size:13px; font-weight:500;`;
  row.appendChild(statusLabel);

  const progressBar = document.createElement('progress');
  progressBar.value = 0;
  progressBar.max = 100;
  progressBar.style.cssText = `width:150px; height:18px; border-radius:4px; overflow:hidden; flex-shrink:0;`;
  row.appendChild(progressBar);

  const percentLabel = document.createElement('span');
  percentLabel.textContent = '0%';
  percentLabel.style.cssText = `color:#aaaaaa; min-width:48px; text-align:right; font-size:13px; font-variant-numeric:tabular-nums;`;
  row.appendChild(percentLabel);

  return { row, statusLabel, progressBar, percentLabel, urlLabel };
}

export function createStatusBar(): HTMLElement {
  const bar = document.createElement('div');
  bar.style.cssText = `padding:8px 4px; margin-top:8px; border-top:1px solid #333; color:#aaa; font-size:14px; display:flex; justify-content:space-between;`;
  const status = document.createElement('span');
  status.id = 'status-text';
  status.textContent = 'Ready';
  bar.appendChild(status);
  const counter = document.createElement('span');
  counter.id = 'task-counter';
  counter.textContent = '0 tasks';
  counter.style.cssText = 'color:#666; font-size:12px;';
  bar.appendChild(counter);
  return bar;
}
