"""SQLite schema. Every record table shares one shape: JSON input + JSON result."""
RECORD_TABLES = ["Projects", "Analyses", "Reports", "Benchmarks", "OptimizationHistory", "DeviceSimulations"]

SCHEMA = """
CREATE TABLE IF NOT EXISTS Users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL, name TEXT NOT NULL,
  password_hash TEXT NOT NULL, salt TEXT NOT NULL,
  created_at TEXT NOT NULL
);
""" + "".join(f"""
CREATE TABLE IF NOT EXISTS {t} (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES Users(id),
  kind TEXT NOT NULL, label TEXT NOT NULL,
  input TEXT NOT NULL, result TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_{t}_user ON {t}(user_id);
""" for t in RECORD_TABLES)
