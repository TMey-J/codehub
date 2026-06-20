import os
import time
import re

class SystemMonitor:
    def __init__(self):
        self.prev_cpu = self._read_cpu_times()

    def _read_cpu_times(self):
        with open('/proc/stat', 'r') as f:
            line = f.readline()
            parts = line.split()
            return list(map(int, parts[1:]))

    def get_cpu_usage(self):
        curr = self._read_cpu_times()
        prev = self.prev_cpu
        total = sum(curr) - sum(prev)
        if total == 0:
            return 0.0
        idle = curr[3] - prev[3]
        usage = (total - idle) / total * 100
        self.prev_cpu = curr
        return usage

    def get_memory_info(self):
        meminfo = {}
        with open('/proc/meminfo', 'r') as f:
            for line in f:
                parts = line.split(':')
                if len(parts) == 2:
                    key = parts[0].strip()
                    val = parts[1].strip().split()[0]
                    meminfo[key] = int(val)
        total = meminfo.get('MemTotal', 0)
        available = meminfo.get('MemAvailable', 0)
        used = total - available
        return {
            'total': total * 1024,
            'used': used * 1024,
            'available': available * 1024
        }

    def get_disk_usage(self, path='/'):
        stat = os.statvfs(path)
        total = stat.f_blocks * stat.f_frsize
        free = stat.f_bfree * stat.f_frsize
        used = total - free
        return {
            'total': total,
            'used': used,
            'free': free
        }

    def get_all(self):
        return {
            'cpu': self.get_cpu_usage(),
            'memory': self.get_memory_info(),
            'disk': self.get_disk_usage()
        }