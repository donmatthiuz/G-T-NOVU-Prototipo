from datetime import UTC, datetime, timedelta
from hashlib import sha256
from secrets import token_urlsafe

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerifyMismatchError


password_hasher = PasswordHasher(time_cost=2, memory_cost=19_456, parallelism=1)


def hash_password(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(password_hash: str, password: str) -> bool:
    try:
        return password_hasher.verify(password_hash, password)
    except (VerifyMismatchError, InvalidHashError):
        return False


def issue_session_token(hours: int) -> tuple[str, str, datetime]:
    token = token_urlsafe(32)
    return token, hash_token(token), datetime.now(UTC) + timedelta(hours=hours)


def hash_token(token: str) -> str:
    return sha256(token.encode("utf-8")).hexdigest()


def hash_ip(value: str | None) -> str | None:
    return sha256(value.encode("utf-8")).hexdigest() if value else None

