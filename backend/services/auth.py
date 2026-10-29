import base64, hashlib, hmac, json, os, time

SECRET = os.getenv("SECRET_KEY", "dev-secret-change-me")

def hash_pw(pw, salt=None):
    salt = salt or os.urandom(16).hex()
    h = hashlib.pbkdf2_hmac("sha256", pw.encode(), bytes.fromhex(salt), 120_000).hex()
    return h, salt

def verify_pw(pw, h, salt):
    return hmac.compare_digest(hash_pw(pw, salt)[0], h)

def make_token(uid, purpose="auth", ttl=7 * 86400):
    body = base64.urlsafe_b64encode(json.dumps({"uid": uid, "p": purpose, "exp": time.time() + ttl}).encode()).decode()
    sig = hmac.new(SECRET.encode(), body.encode(), "sha256").hexdigest()
    return f"{body}.{sig}"

def read_token(tok, purpose="auth"):
    try:
        body, sig = tok.split(".")
        if not hmac.compare_digest(sig, hmac.new(SECRET.encode(), body.encode(), "sha256").hexdigest()):
            return None
        d = json.loads(base64.urlsafe_b64decode(body))
        return d["uid"] if d["p"] == purpose and d["exp"] > time.time() else None
    except Exception:
        return None
