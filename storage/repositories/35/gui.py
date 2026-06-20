import tkinter as tk
from tkinter import ttk
from monitor import SystemMonitor

class SystemMonitorGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("System Resource Monitor")
        self.root.geometry("500x400")
        self.root.configure(bg='#1a1a1a')
        self.root.resizable(False, False)

        self.monitor = SystemMonitor()
        self.running = True

        self._create_widgets()
        self._update_loop()

    def _create_widgets(self):
        main = tk.Frame(self.root, bg='#1a1a1a')
        main.pack(fill='both', expand=True, padx=20, pady=20)

        # CPU
        tk.Label(main, text="CPU Usage", font=('Segoe UI', 12, 'bold'),
                 fg='#00ff99', bg='#1a1a1a').grid(row=0, column=0, sticky='w', pady=(0,5))
        self.cpu_label = tk.Label(main, text="0.0%", font=('Segoe UI', 16),
                                  fg='white', bg='#1a1a1a')
        self.cpu_label.grid(row=1, column=0, sticky='w', pady=(0,10))
        self.cpu_progress = ttk.Progressbar(main, length=400, mode='determinate')
        self.cpu_progress.grid(row=2, column=0, pady=(0,15))

        # Memory
        tk.Label(main, text="Memory Usage", font=('Segoe UI', 12, 'bold'),
                 fg='#ffd93d', bg='#1a1a1a').grid(row=3, column=0, sticky='w', pady=(0,5))
        self.mem_label = tk.Label(main, text="0.0 MB / 0.0 MB", font=('Segoe UI', 14),
                                  fg='white', bg='#1a1a1a')
        self.mem_label.grid(row=4, column=0, sticky='w', pady=(0,10))
        self.mem_progress = ttk.Progressbar(main, length=400, mode='determinate')
        self.mem_progress.grid(row=5, column=0, pady=(0,15))

        # Disk
        tk.Label(main, text="Disk Usage", font=('Segoe UI', 12, 'bold'),
                 fg='#6bcbff', bg='#1a1a1a').grid(row=6, column=0, sticky='w', pady=(0,5))
        self.disk_label = tk.Label(main, text="0.0 GB / 0.0 GB", font=('Segoe UI', 14),
                                   fg='white', bg='#1a1a1a')
        self.disk_label.grid(row=7, column=0, sticky='w', pady=(0,10))
        self.disk_progress = ttk.Progressbar(main, length=400, mode='determinate')
        self.disk_progress.grid(row=8, column=0, pady=(0,15))

        self.quit_btn = tk.Button(main, text="Quit", command=self.quit,
                                  bg='#e74c3c', fg='white', relief='flat', padx=20)
        self.quit_btn.grid(row=9, column=0, pady=10)

    def _update_loop(self):
        if not self.running:
            return
        data = self.monitor.get_all()

        cpu = data['cpu']
        self.cpu_label.config(text=f"{cpu:.1f}%")
        self.cpu_progress['value'] = cpu

        mem = data['memory']
        total_mb = mem['total'] / (1024**2)
        used_mb = mem['used'] / (1024**2)
        self.mem_label.config(text=f"{used_mb:.1f} MB / {total_mb:.1f} MB")
        self.mem_progress['value'] = (used_mb / total_mb) * 100

        disk = data['disk']
        total_gb = disk['total'] / (1024**3)
        used_gb = disk['used'] / (1024**3)
        self.disk_label.config(text=f"{used_gb:.1f} GB / {total_gb:.1f} GB")
        self.disk_progress['value'] = (used_gb / total_gb) * 100

        self.root.after(1000, self._update_loop)

    def quit(self):
        self.running = False
        self.root.destroy()