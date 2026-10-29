from datetime import datetime

def now_iso():
    return datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

def mean(xs):
    xs = list(xs)
    return sum(xs) / len(xs) if xs else 0.0

def half_delta(values):
    """% change between first and second half of a chronological series."""
    if len(values) < 2:
        return 0.0
    h = len(values) // 2
    a, b = mean(values[:h]), mean(values[h:])
    return round((b - a) / a * 100, 1) if a else 0.0
