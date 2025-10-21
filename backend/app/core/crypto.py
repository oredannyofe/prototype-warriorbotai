import os
from typing import Optional
from cryptography.fernet import Fernet, InvalidToken

_key: Optional[bytes] = None
_cipher: Optional[Fernet] = None

try:
    K = os.getenv("DATA_KEY")
    if K:
        _key = K.encode()
        _cipher = Fernet(_key)
except Exception:
    _cipher = None


def encrypt_string(s: str) -> Optional[str]:
    if not _cipher:
        return None
    return _cipher.encrypt(s.encode()).decode()


def decrypt_string(s: str) -> Optional[str]:
    if not _cipher:
        return None
    try:
        return _cipher.decrypt(s.encode()).decode()
    except InvalidToken:
        return None
