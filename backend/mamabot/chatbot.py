import json
import math
import re
from collections import Counter
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


def _read_catalog() -> tuple[
    list[Intent],
    dict[str, dict[str, str]],
    dict[str, tuple[str, ...]],
    dict[str, tuple[str, ...]],
]:
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
    indicators = {
        language: tuple(values)
        for language, values in intents_data["languageIndicators"].items()
    }

    if "fallback" not in responses or any(intent.response not in responses for intent in intents):
        raise ValueError("The MamaBot intent catalog references a missing response.")

    return intents, responses, prefixes, indicators


INTENTS, RESPONSES, LANGUAGE_PREFIXES, LANGUAGE_INDICATORS = _read_catalog()
IntentClassifier = Callable[[str], tuple[str, str] | None]
_TOKEN_PATTERN = re.compile(r"[a-z0-9]+")
_BM25_K1 = 1.2
_BM25_B = 0.75
_STOP_WORDS = frozenset(
    "a an and are as at be been but by can could did do does for from had has have he her "
    "how i if in is it me my of on or our please she should so tell that the their them "
    "there these they this to us was we were what when where which who why will with would "
    "you your".split()
)


def _tokens(text: str) -> list[str]:
    return [
        token
        for token in _TOKEN_PATTERN.findall(text.casefold())
        if token not in _STOP_WORDS
    ]


_SEARCH_DOCUMENTS = [
    (
        intent,
        order,
        language,
        Counter(_tokens(" ".join(intent.patterns[language]))),
    )
    for order, intent in enumerate(INTENTS)
    for language in LANGUAGES
]
_DOCUMENT_FREQUENCIES = Counter(
    token
    for _intent, _order, _language, frequencies in _SEARCH_DOCUMENTS
    for token in frequencies
)
_AVERAGE_DOCUMENT_LENGTH = (
    sum(sum(frequencies.values()) for _intent, _order, _language, frequencies in _SEARCH_DOCUMENTS)
    / max(1, len(_SEARCH_DOCUMENTS))
)


def _normalize(message: str) -> str:
    return message.strip().casefold()


def _find_language_prefix(message: str) -> tuple[str, str] | None:
    for language in LANGUAGES:
        for prefix in LANGUAGE_PREFIXES.get(language, ()):
            if message.startswith(prefix):
                return language, prefix
    return None


def _detect_language(message: str, preferred_language: str) -> str | None:
    normalized = " ".join(_TOKEN_PATTERN.findall(_normalize(message)))
    tokens = set(normalized.split())

    def matches_indicator(indicator: str) -> bool:
        if " " in indicator:
            return f" {indicator} " in f" {normalized} "
        return indicator in tokens

    scores = {
        language: sum(
            len(indicator.split()) + 1
            for indicator in LANGUAGE_INDICATORS[language]
            if matches_indicator(indicator)
        )
        for language in LANGUAGES
    }
    best_score = max(scores.values())
    if best_score == 0:
        return None
    best_languages = [
        language for language, score in scores.items() if score == best_score
    ]
    if preferred_language in best_languages:
        return preferred_language
    return best_languages[0] if len(best_languages) == 1 else None


def classify_question(
    message: str,
    preferred_language: str = "en",
) -> tuple[str, str]:
    normalized = _normalize(message)
    preferred = preferred_language if preferred_language in LANGUAGES else "en"
    prefix_match = _find_language_prefix(normalized)
    explicit_language = prefix_match[0] if prefix_match else None
    if prefix_match:
        normalized = normalized[len(prefix_match[1]) :].strip()

    inferred_language = explicit_language or _detect_language(normalized, preferred)
    urgent_intent = next(intent for intent in INTENTS if intent.id == "urgent_symptoms")
    urgent_languages = {
        language: sum(
            1
            for phrase in urgent_intent.patterns[language]
            if _normalize(phrase) in normalized
        )
        for language in LANGUAGES
    }
    if any(urgent_languages.values()):
        best_urgent_score = max(urgent_languages.values())
        detected_language = inferred_language or next(
            (
                language
                for language in (preferred, *LANGUAGES)
                if urgent_languages[language] == best_urgent_score
            ),
            preferred,
        )
        return "urgent_symptoms", detected_language

    query_tokens = Counter(_tokens(normalized))
    if not query_tokens:
        return "fallback", inferred_language or preferred

    intent_language_scores: dict[str, dict[str, float]] = {}
    for intent, _order, language, frequencies in _SEARCH_DOCUMENTS:
        document_length = sum(frequencies.values())
        score = 0.0
        for token, query_frequency in query_tokens.items():
            term_frequency = frequencies.get(token, 0)
            if not term_frequency:
                continue
            document_frequency = _DOCUMENT_FREQUENCIES[token]
            inverse_frequency = math.log(
                1 + (len(_SEARCH_DOCUMENTS) - document_frequency + 0.5)
                / (document_frequency + 0.5)
            )
            denominator = term_frequency + _BM25_K1 * (
                1 - _BM25_B + _BM25_B * document_length / _AVERAGE_DOCUMENT_LENGTH
            )
            score += (
                inverse_frequency
                * term_frequency
                * (_BM25_K1 + 1)
                / denominator
                * min(query_frequency, 2)
            )
        for phrase in intent.patterns[language]:
            normalized_phrase = _normalize(phrase)
            if normalized_phrase and normalized_phrase in normalized:
                score += 1 + min(len(normalized_phrase.split()), 3) * 0.25
        language_scores = intent_language_scores.setdefault(
            intent.id,
            {candidate: 0.0 for candidate in LANGUAGES},
        )
        language_scores[language] = score

    intent_order = {intent.id: order for order, intent in enumerate(INTENTS)}
    matched_intent = max(
        INTENTS,
        key=lambda intent: (
            max(intent_language_scores[intent.id].values()),
            -intent_order[intent.id],
        ),
    )
    best_intent_score = max(intent_language_scores[matched_intent.id].values())
    if best_intent_score <= 0:
        return "fallback", inferred_language or preferred

    language_scores = intent_language_scores[matched_intent.id]
    best_language_score = max(language_scores.values())
    tied_languages = [
        language for language, score in language_scores.items() if score == best_language_score
    ]
    detected_language = inferred_language or (
        preferred if preferred in tied_languages else tied_languages[0]
    )
    return matched_intent.id, detected_language


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
    if local_intent == "urgent_symptoms":
        return _render_response(local_intent, local_language, pregnancy_week), "safety"

    online_classification = classifier(message) if classifier else None
    if online_classification is not None:
        intent_id, language = online_classification
        if force_language:
            language = preferred_language
        else:
            prefix_match = _find_language_prefix(_normalize(message))
            detected_language = (
                prefix_match[0]
                if prefix_match
                else _detect_language(message, preferred_language)
            )
            if detected_language:
                language = detected_language
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
