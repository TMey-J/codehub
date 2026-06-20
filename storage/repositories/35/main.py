import tkinter as tk
from gui import SystemMonitorGUI

if __name__ == "__main__":
    root = tk.Tk()
    app = SystemMonitorGUI(root)
    root.mainloop()