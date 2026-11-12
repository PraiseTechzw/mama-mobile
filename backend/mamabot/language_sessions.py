import hashlib
import hmac
import logging
import re
from dataclasses import dataclass
from pathlib import Path

import psycopg

from backend.mamabot.chatbot import LANGUAGES


LOGGER = logging.getLogger(__name__)
SESSION_TTL = "24 hours"
SCHEMA_PATH = Path(__file__).resolve().parents[1] / "schema.sql"

LANGUAGE_NAMES = {
    "en": ("english",),
    "sn": ("shona", "chishona"),
    "nd": ("ndebele", "isindebele"),
}
CHANGE_LANGUAGE_PHRASES = (
    "change language",
    "change my language",
    "switch language",
    "chinja mutauro",
    "shandura mutauro",
    "tshintsha ulimi",
    "guqula ulimi",
)


@dataclass(frozen=True)
class LanguageSession:
    language: str | None
    awaiting_selection: bool


class LanguageSessionStore:
    def __init__(self, database_url: str, hash_key: str) -> None:
        if not database_url.strip() or not hash_key.strip():
            raise ValueError("Both DATABASE_URL and LANGUAGE_SESSION_HASH_KEY are required.")
        self._database_url = database_url
        self._hash_key = hash_key.encode("utf-8")

    def _sender_hash(self, channel: str, sender: str) -> bytes:
        normalized_sender = sender.strip().casefold()
        if channel not in {"sms", "whatsapp"} or not normalized_sender:
            raise ValueError("A valid messaging channel and sender are required.")
        return hmac.new(
            self._hash_key,
            f"{channel}:{normalized_sender}".encode("utf-8"),
            hashlib.sha256,
        ).digest()

    def initialize(self) -> None:
        schema = SCHEMA_PATH.read_text(encoding="utf-8")
        try:
            with psycopg.connect(self._database_url, connect_timeout=5) as connection:
                connection.execute(schema)
        except psycopg.Error as error:
            LOGGER.error("Could not initialize MamaBot language sessions (%s).", type(error).__name__)
            raise RuntimeError("Could not initialize MamaBot language sessions.") from error

    def get(self, channel: str, sender: str) -> LanguageSession | None:
        sender_hash = self._sender_hash(channel, sender)
        with psycopg.connect(self._database_url, connect_timeout=3) as connection:
            connection.execute(
                """
                WITH expired AS (
                    SELECT sender_hash
                    FROM mamabot_language_session
                    WHERE expires_at <= now()
                    ORDER BY expires_at
                    LIMIT 100
                )
                DELETE FROM mamabot_language_session AS sessions
                USING expired
                WHERE sessions.sender_hash = expired.sender_hash
                """
            )
            row = connection.execute(
                """
                UPDATE mamabot_language_session
                SET last_activity_at = now(),
                    expires_at = now() + interval '24 hours'
                WHERE sender_hash = %s
                  AND expires_at > now()
                RETURNING language, awaiting_selection
                """,
                (sender_hash,),
            ).fetchone()
        return LanguageSession(row[0], row[1]) if row else None

    def await_selection(self, channel: str, sender: str) -> None:
        self._upsert(channel, sender, None, True)

    def set_language(self, channel: str, sender: str, language: str) -> None:
        if language not in LANGUAGES:
            raise ValueError("Unsupported language.")
        self._upsert(channel, sender, language, False)

    def _upsert(
        self,
        channel: str,
        sender: str,
        language: str | None,
        awaiting_selection: bool,
    ) -> None:
        sender_hash = self._sender_hash(channel, sender)
        with psycopg.connect(self._database_url, connect_timeout=3) as connection:
            connection.execute(
                """
                INSERT INTO mamabot_language_session (
                    sender_hash, language, awaiting_selection, last_activity_at, expires_at
                )
                VALUES (%s, %s, %s, now(), now() + interval '24 hours')
                ON CONFLICT (sender_hash) DO UPDATE
                SET language = EXCLUDED.language,
                    awaiting_selection = EXCLUDED.awaiting_selection,
                    last_activity_at = now(),
                    expires_at = now() + interval '24 hours'
                """,
                (sender_hash, language, awaiting_selection),
            )


def parse_language_selection(message: str, allow_number: bool = False) -> str | None:
    normalized = re.sub(r"[^\w\s]", " ", message.casefold())
    words = set(normalized.split())
    for language, names in LANGUAGE_NAMES.items():
        if words.intersection(names):
            return language
    if allow_number:
        return {"1": "en", "2": "sn", "3": "nd"}.get(normalized.strip())
    return None


def is_change_language_request(message: str) -> bool:
    normalized = re.sub(r"\s+", " ", message.casefold()).strip()
    return any(phrase in normalized for phrase in CHANGE_LANGUAGE_PHRASES)


def language_prompt(openrouter_enabled: bool) -> str:
    privacy_notice = (
        " Questions are sent to AI for classification, not stored here."
        if openrouter_enabled
        else " Message text is not stored here."
    )
    return (
        "Choose language / Sarudza mutauro / Khetha ulimi: "
        "1 English, 2 Shona, 3 Ndebele. Your choice is saved for 24h after "
        f"your last message.{privacy_notice}"
    )


def language_confirmation(language: str) -> str:
    return {
        "en": "Thanks. I’ll reply in English. Your choice expires after 24 hours of inactivity. Ask your pregnancy question now.",
        "sn": "Ndatenda. Ndichapindura neChiShona. Sarudzo yako inopera kana maawa 24 apera pasina meseji. Bvunza mubvunzo wako zvino.",
        "nd": "Ngiyabonga. Ngizaphendula ngesiNdebele. Ukukhetha kwakho kuzaphela nxa kungelamlayezo okwamahora angu-24. Buza umbuzo wakho wokukhulelwa khathesi.",
    }[language]
