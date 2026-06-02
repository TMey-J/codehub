import base64
import hashlib

import bcrypt


def get_pre_hashed_password(password: str) -> bytes:
    # 1. Hash with SHA256 to handle any length
    sha256_hash = hashlib.sha256(password.encode('utf-8')).digest()
    # 2. Base64 encode it so it's a clean string for bcrypt
    # (A SHA256 digest is always 32 bytes, base64 is ~44 chars, well under the 72 limit)
    return base64.b64encode(sha256_hash)

def hash_password(password: str) -> str:
    pre_hashed = get_pre_hashed_password(password)
    # Generate salt and hash
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pre_hashed, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    pre_hashed = get_pre_hashed_password(plain_password)
    return bcrypt.checkpw(pre_hashed, hashed_password.encode('utf-8'))