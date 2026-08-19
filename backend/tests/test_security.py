from app.core.security import hash_password, hash_token, issue_session_token, verify_password


def test_passwords_use_salted_argon2_hashes() -> None:
    first = hash_password("novu2026")
    second = hash_password("novu2026")

    assert first.startswith("$argon2id$")
    assert first != second
    assert verify_password(first, "novu2026")
    assert not verify_password(first, "incorrecta")


def test_session_stores_only_token_hash() -> None:
    token, stored_hash, expires_at = issue_session_token(24)

    assert token not in stored_hash
    assert stored_hash == hash_token(token)
    assert len(stored_hash) == 64
    assert expires_at.tzinfo is not None

