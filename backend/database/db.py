import json, os, sqlite3
from contextlib import contextmanager
from pathlib import Path
from models.tables import SCHEMA, RECORD_TABLES
from utils.helpers import now_iso

DB_PATH = os.getenv("DB_PATH", str(Path(__file__).resolve().parent.parent / "edge_ai.db"))

@contextmanager
def conn():
    c = sqlite3.connect(DB_PATH)
    c.row_factory = sqlite3.Row
    try:
        yield c
        c.commit()
    finally:
        c.close()

def init():
    with conn() as c:
        c.executescript(SCHEMA)

def save(table, user_id, kind, label, inp, res, created_at=None):
    assert table in RECORD_TABLES
    with conn() as c:
        cur = c.execute(
            f"INSERT INTO {table}(user_id,kind,label,input,result,created_at) VALUES(?,?,?,?,?,?)",
            (user_id, kind, label, json.dumps(inp), json.dumps(res), created_at or now_iso()))
        return cur.lastrowid

def rows(table, user_id=None, limit=500):
    """Seed/demo rows (user_id NULL) plus the signed-in user's own rows."""
    with conn() as c:
        out = c.execute(
            f"SELECT * FROM {table} WHERE user_id IS NULL OR user_id=? ORDER BY created_at DESC LIMIT ?",
            (user_id if user_id else -1, limit)).fetchall()
    return [dict(r, input=json.loads(r["input"]), result=json.loads(r["result"])) for r in out]

def count(table):
    with conn() as c:
        return c.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0]

def user_by_email(email):
    with conn() as c:
        r = c.execute("SELECT * FROM Users WHERE email=?", (email.lower(),)).fetchone()
    return dict(r) if r else None

def user_by_id(uid):
    with conn() as c:
        r = c.execute("SELECT * FROM Users WHERE id=?", (uid,)).fetchone()
    return dict(r) if r else None

def create_user(email, name, pw_hash, salt):
    with conn() as c:
        return c.execute("INSERT INTO Users(email,name,password_hash,salt,created_at) VALUES(?,?,?,?,?)",
                         (email.lower(), name, pw_hash, salt, now_iso())).lastrowid

def set_password(uid, pw_hash, salt):
    with conn() as c:
        c.execute("UPDATE Users SET password_hash=?, salt=? WHERE id=?", (pw_hash, salt, uid))
