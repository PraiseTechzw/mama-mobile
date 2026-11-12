import json
import re
from collections.abc import Mapping
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable


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
IntentClassifier = Callable[[str], tuple[str, str] | None]


def _normalize(message: str) -> str:
    return message.strip().casefold()


def classify_question(
    message: str,
    preferred_language: str = "en",
) -> tuple[str, str]:
    normalized = _normalize(message)
    preferred = preferred_language if preferred_language in LANGUAGES else "en"
    explicit_language: str | None = None

    for language in LANGUAGES:
        for prefix in LANGUAGE_PREFIXES.get(language, ()):
            if normalized.startswith(prefix):
                explicit_language = language
                normalized = normalized[len(prefix) :].strip()
                break
        if explicit_language:
            break

    language_scores = {language: 0 for language in LANGUAGES}
    intent_scores: list[tuple[int, float, Intent]] = []
    for order, intent in enumerate(INTENTS):
        score = 0.0
        for language in LANGUAGES:
            for phrase in intent.patterns[language]:
                if phrase in normalized:
                    evidence = max(1, len(phrase.split()))
                    score += evidence + len(phrase) / 100
                    language_scores[language] += evidence
        intent_scores.append((order, score, intent))

    intent_scores.sort(
        key=lambda item: (
            item[1] > 0 and item[2].id == "urgent_symptoms",
            item[1],
            -item[0],
        ),
        reverse=True,
    )
    matched_intent = intent_scores[0][2] if intent_scores[0][1] > 0 else None
    best_language_score = max(language_scores.values())
    tied_languages = [
        language
        for language, score in language_scores.items()
        if score == best_language_score
    ]
    detected_language = explicit_language or (
        preferred
        if best_language_score == 0 or preferred in tied_languages
        else tied_languages[0]
    )

    return (matched_intent.id if matched_intent else "fallback", detected_language)


def _render_response(
    intent_id: str,
    language: str,
    pregnancy_week: int | None = None,
) -> str:
    intent = next((item for item in INTENTS if item.id == intent_id), None)
    response_id = intent.response if intent else "fallback"
    values: dict[str, str] = {}

    if intent_id == "pregnancy_week":
        if pregnancy_week:
            response_id = "pregnancy_week_saved"
            trimester_id = (
                "ordinal_first"
                if pregnancy_week <= 13
                else "ordinal_second"
                if pregnancy_week <= 27
                else "ordinal_third"
            )
            values = {
                "week": str(pregnancy_week),
                "trimester": RESPONSES[trimester_id][language],
            }
        else:
            response_id = "pregnancy_week_missing_channel"
    elif intent_id == "pregnancy_basics":
        if pregnancy_week:
            values["savedWeek"] = RESPONSES["saved_week"][language].format(
                week=pregnancy_week
            )
    elif intent_id == "visit_preparation":
        response_id = "anc_visit"
    elif intent_id in {"urgent_symptoms", "danger_signs", "fallback"}:
        response_id = f"{response_id}_channel"

    template = RESPONSES.get(response_id, RESPONSES["fallback"])[language]
    return re.sub(
        r"\{(\w+)\}",
        lambda match: values.get(match.group(1), ""),
        template,
    ).strip()


def answer_question_with_mode(
    message: str,
    preferred_language: str = "en",
    classifier: IntentClassifier | None = None,
    force_language: bool = False,
    context: Mapping[str, object] | None = None,
) -> tuple[str, str]:
    local_intent, local_language = classify_question(message, preferred_language)
    pregnancy_week = (context or {}).get("pregnancy_week")
    if not isinstance(pregnancy_week, int) or isinstance(pregnancy_week, bool):
        pregnancy_week = None
    if force_language and preferred_language in LANGUAGES:
        local_language = preferred_language
    if local_intent in {"urgent_symptoms", "danger_signs"}:
        return _render_response(local_intent, local_language, pregnancy_week), "safety"

    online_classification = classifier(message) if classifier else None
    if online_classification is not None:
        intent_id, language = online_classification
        if force_language:
            language = preferred_language
        valid_intents = {intent.id for intent in INTENTS}
        if intent_id == "clarify" and language in LANGUAGES:
            if local_intent != "fallback":
                return _render_response(local_intent, local_language, pregnancy_week), "offline"
            return RESPONSES["clarify_question"][language], "online"
        if (
            isinstance(intent_id, str)
            and intent_id in valid_intents
            and isinstance(language, str)
            and language in LANGUAGES
        ):
            if intent_id == "fallback" and local_intent != "fallback":
                return _render_response(local_intent, local_language, pregnancy_week), "offline"
            return _render_response(intent_id, language, pregnancy_week), "online"

    return _render_response(local_intent, local_language, pregnancy_week), "offline"


def answer_question(
    message: str,
    preferred_language: str = "en",
    classifier: IntentClassifier | None = None,
) -> str:
    reply, _mode = answer_question_with_mode(message, preferred_language, classifier)
    return reply
