from datetime import datetime

def format_dt(dt: datetime | None) -> str | None:
    """
    Format a datetime like:(YYYY-MM-DD | HH:MM:SS)

    Returns None if dt is None.
    """
    if dt is None:
        return None
    return dt.strftime("%Y-%m-%d | %H:%M:%S")