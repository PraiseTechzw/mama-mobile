import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any


LANGUAGES = ("en", "sn", "nd")
SHARED_DIRECTORY = Path(__file__).resolve().parents[2] / "shared"


@dataclass(frozen=True)
class Intent:
    id: str
    response: str
    patterns: dict[str, tuple[str, ...]]


def _read_catalog() -> tuple[list[Intent], dict[str, dict[str, str]], dict[str, tuple[str, ...]]]:
    intents_data: dict[str, Any] = json.loads(
        (SHARED_DIRECTORY / "chatbot-intents.json").read_text(encoding="utf-8")
    )
    responses_data: dict[str, Any] = json.loads(
        (SHARED_DIRECTORY / "chatbot-responses.json").read_text(encoding="utf-8")
    )

    intents = [
        Intent(
            id=item["id"],
            response=item["response"],
            patterns={
                language: tuple(item["patterns"][language])
                for language in LANGUAGES
            },
        )
        for item in intents_data["intents"]
    ]
    responses = {
        response_id: {
            language: text[language]
            for language in LANGUAGES
        }
        for response_id, text in responses_data.items()
    }
    prefixes = {
        language: tuple(values)
        for language, values in intents_data["languagePrefixes"].items()
    }

    if "fallback" not in responses or any(intent.response not in responses for intent in intents):
        raise ValueError("The MamaBot intent catalog references a missing response.")

    return intents, responses, prefixes


INTENTS, RESPONSES, LANGUAGE_PREFIXES = _read_catalog()


def _normalize(message: str) -> str:
    return message.strip().casefold()


def classify_question(message: str) -> tuple[str, str]:
    normalized = _normalize(message)
    preferred_language: str | None = None

    for language in LANGUAGES:
        for prefix in LANGUAGE_PREFIXES.get(language, ()):
            if normalized.startswith(prefix):
                preferred_language = language
                normalized = normalized[len(prefix) :].strip()
                break
        if preferred_language:
            break

    scores = {language: 0 for language in LANGUAGES}
    for intent in INTENTS:
        for language in LANGUAGES:
            scores[language] += sum(
                phrase in normalized for phrase in intent.patterns[language]
            )

    detected_language = preferred_language or max(
        LANGUAGES,
        key=lambda language: scores[language],
    )
    matched_intent = next(
        (
            intent
            for intent in INTENTS
            if any(
                phrase in normalized
                for language in LANGUAGES
                for phrase in intent.patterns[language]
            )
        ),
        None,
    )
    return (matched_intent.id if matched_intent else "fallback", detected_language)


def answer_question(message: str) -> str:
    intent_id, language = classify_question(message)
    intent = next((item for item in INTENTS if item.id == intent_id), None)
    response_id = intent.response if intent else "fallback"

    if intent_id == "pregnancy_week":
        response_id = "pregnancy_week_missing_channel"
    elif intent_id == "visit_preparation":
        response_id = "anc_visit"
    elif intent_id in {"urgent_symptoms", "danger_signs", "fallback"}:
        response_id = f"{response_id}_channel"

    template = RESPONSES.get(response_id, RESPONSES["fallback"])[language]
    return re.sub(r"\{[^{}]*\}", "", template).strip()
