from datetime import datetime
from pathlib import Path


def format_dt(dt: datetime | None) -> str | None:
    """
    Format a datetime like:(YYYY-MM-DD | HH:MM:SS)

    Returns None if dt is None.
    """
    if dt is None:
        return None
    return dt.strftime("%Y-%m-%d | %H:%M:%S")

TEXT_EXTENSIONS = {
    ".txt", ".md", ".py", ".cs", ".js", ".ts", ".html", ".css",
    ".json", ".xml", ".yaml", ".yml", ".sql", ".sh", ".bat",
    ".dockerfile", ".gitignore", ".env",
    # پسوندهای جدید
    ".cpp", ".c", ".h", ".hpp",      # C/C++
    ".java",                          # Java
    ".rb", ".go", ".rs",              # Ruby, Go, Rust
    ".php", ".asp", ".aspx",          # Web
    ".log", ".cfg", ".conf", ".ini",  # Config files
    ".csv", ".tsv",                   # Data files
    ".rst", ".tex",                   # Documentation
    ".vue", ".jsx", ".tsx",           # Frontend frameworks
    ".rbxlx", ".lua",                 # Game dev
}
def is_text_file(file_name: str) -> bool:

    suffix = Path(file_name).suffix.lower()

    return suffix in TEXT_EXTENSIONS