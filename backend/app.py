import logging
import os
from collections.abc import Mapping
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, Response, abort, jsonify, request
import psycopg
from twilio.request_validator import RequestValidator
from twilio.twiml.messaging_response import MessagingResponse

from backend.mamabot.chatbot import IntentClassifier, answer_question_with_mode
from backend.mamabot.language_sessions import (
    LanguageSessionStore,
    is_change_language_request,
    language_confirmation,
    language_prompt,
    parse_language_selection,
)
from backend.mamabot.openrouter import DEFAULT_FREE_MODEL, classify_with_openrouter


load_dotenv(Path(__file__).resolve().parent / ".env")
LOGGER = logging.getLogger(__name__)


def create_app(test_config: Mapping[str, object] | None = None) -> Flask:
    app = Flask(__name__)
    app.config.from_mapping(
        MAX_CONTENT_LENGTH=16_384,
        TWILIO_AUTH_TOKEN=os.environ.get("TWILIO_AUTH_TOKEN", ""),
        TWILIO_WEBHOOK_BASE_URL=os.environ.get("TWILIO_WEBHOOK_BASE_URL", ""),
        OPENROUTER_API_KEY=os.environ.get("OPENROUTER_API_KEY", ""),
        OPENROUTER_MODEL=os.environ.get("OPENROUTER_MODEL", "").strip(),
        OPENROUTER_TIMEOUT_SECONDS=5,
        OPENROUTER_MESSAGING_ENABLED=(
            os.environ.get("OPENROUTER_MESSAGING_ENABLED", "true").strip().lower() == "true"
        ),
        DATABASE_URL=os.environ.get("DATABASE_URL", ""),
        LANGUAGE_SESSION_HASH_KEY=os.environ.get("LANGUAGE_SESSION_HASH_KEY", ""),
        LANGUAGE_SESSION_STORE=None,
    )
    if test_config:
        app.config.update(test_config)

    if app.config["LANGUAGE_SESSION_STORE"] is None:
        database_url = str(app.config["DATABASE_URL"]).strip()
        hash_key = str(app.config["LANGUAGE_SESSION_HASH_KEY"]).strip()
        if database_url and hash_key:
            store = LanguageSessionStore(database_url, hash_key)
            store.initialize()
            app.config["LANGUAGE_SESSION_STORE"] = store
        elif database_url or hash_key:
            raise RuntimeError(
                "Both DATABASE_URL and LANGUAGE_SESSION_HASH_KEY must be configured."
            )
        else:
            LOGGER.warning(
                "PostgreSQL language sessions are disabled; messaging replies will use automatic language detection."
            )

    @app.get("/healthz")
    def healthcheck() -> Response:
        return Response("ok", status=200, mimetype="text/plain")

    def chatbot_classifier(
        enabled: bool = True,
        preferred_language: str = "en",
        context: dict[str, object] | None = None,
    ) -> IntentClassifier | None:
        if not enabled:
            return None
        configured_classifier = app.config.get("CHATBOT_CLASSIFIER")
        if configured_classifier is not None:
            return configured_classifier

        api_key = str(app.config["OPENROUTER_API_KEY"])
        configured_model = str(app.config["OPENROUTER_MODEL"]).strip()
        if not api_key:
            return None
        model = configured_model or DEFAULT_FREE_MODEL

        return lambda message: classify_with_openrouter(
            message,
            api_key,
            model,
            float(app.config["OPENROUTER_TIMEOUT_SECONDS"]),
            preferred_language,
            context=context,
        )

    @app.post("/api/chat")
    def chat_api() -> Response | tuple[Response, int]:
        if not request.is_json:
            return jsonify(error="Expected a JSON request."), 415
        payload = request.get_json()
        if not isinstance(payload, dict):
            return jsonify(error="Expected a JSON object."), 400

        message = payload.get("message")
        if not isinstance(message, str) or not message.strip() or len(message) > 500:
            return jsonify(error="Message must contain 1 to 500 characters."), 400

        language = payload.get("language", "en")
        if not isinstance(language, str) or language not in {"en", "sn", "nd"}:
            return jsonify(error="Language must be en, sn, or nd."), 400
        use_online = payload.get("use_online", False)
        if not isinstance(use_online, bool):
            return jsonify(error="use_online must be a boolean."), 400

        context = payload.get("context", {})
        if not isinstance(context, dict):
            return jsonify(error="Context must be an object."), 400
        pregnancy_week = context.get("pregnancy_week")
        if pregnancy_week is not None and (
            isinstance(pregnancy_week, bool)
            or not isinstance(pregnancy_week, int)
            or not 1 <= pregnancy_week <= 42
        ):
            return jsonify(error="Pregnancy week must be between 1 and 42."), 400
        recent_messages = context.get("recent_messages", [])
        if not isinstance(recent_messages, list) or len(recent_messages) > 6:
            return jsonify(error="Recent messages must contain at most 6 items."), 400
        for item in recent_messages:
            if (
                not isinstance(item, dict)
                or item.get("author") not in {"mama", "you"}
                or not isinstance(item.get("text"), str)
                or not item["text"].strip()
                or len(item["text"]) > 500
            ):
                return jsonify(error="Recent message context is invalid."), 400

        classification_context = {
            "pregnancy_week": pregnancy_week,
            "recent_messages": recent_messages,
        }
        reply, mode = answer_question_with_mode(
            message.strip(),
            language,
            chatbot_classifier(
                enabled=use_online,
                preferred_language=language,
                context=classification_context,
            ),
        )
        return jsonify(reply=reply, mode=mode)

    def twilio_reply(channel: str) -> Response:
        auth_token = str(app.config["TWILIO_AUTH_TOKEN"])
        webhook_base_url = str(app.config["TWILIO_WEBHOOK_BASE_URL"]).rstrip("/")
        if not auth_token or not webhook_base_url:
            abort(503)

        if not app.config["TESTING"]:
            signature = request.headers.get("X-Twilio-Signature", "")
            webhook_url = f"{webhook_base_url}/twilio/{channel}"
            if not RequestValidator(auth_token).validate(
                webhook_url,
                request.form,
                signature,
            ):
                abort(403)

        message = request.form.get("Body", "")[:500]
        sender = request.form.get("From", "").strip()
        response = MessagingResponse()
        store = app.config["LANGUAGE_SESSION_STORE"]
        if store is None:
            reply, _mode = answer_question_with_mode(
                message,
                classifier=chatbot_classifier(
                    enabled=bool(app.config["OPENROUTER_MESSAGING_ENABLED"])
                ),
            )
        else:
            if not sender:
                abort(400)
            try:
                session = store.get(channel, sender)
                if session is None:
                    selected_language = parse_language_selection(message, allow_number=True)
                    if selected_language:
                        store.set_language(channel, sender, selected_language)
                        reply = language_confirmation(selected_language)
                    else:
                        store.await_selection(channel, sender)
                        reply = language_prompt(
                            bool(app.config["OPENROUTER_MESSAGING_ENABLED"])
                        )
                elif session.awaiting_selection:
                    selected_language = parse_language_selection(message, allow_number=True)
                    if selected_language:
                        store.set_language(channel, sender, selected_language)
                        reply = language_confirmation(selected_language)
                    else:
                        reply = language_prompt(
                            bool(app.config["OPENROUTER_MESSAGING_ENABLED"])
                        )
                elif is_change_language_request(message):
                    store.await_selection(channel, sender)
                    reply = language_prompt(
                        bool(app.config["OPENROUTER_MESSAGING_ENABLED"])
                    )
                else:
                    selected_language = parse_language_selection(message)
                    if selected_language:
                        store.set_language(channel, sender, selected_language)
                        reply = language_confirmation(selected_language)
                    else:
                        reply, _mode = answer_question_with_mode(
                            message,
                            preferred_language=session.language or "en",
                            classifier=chatbot_classifier(
                                enabled=bool(app.config["OPENROUTER_MESSAGING_ENABLED"]),
                                preferred_language=session.language or "en",
                            ),
                            force_language=True,
                        )
            except psycopg.Error:
                LOGGER.exception("PostgreSQL language-session request failed.")
                abort(503)
        response.message(reply)
        return Response(str(response), status=200, mimetype="application/xml")

    @app.post("/twilio/whatsapp")
    def whatsapp_webhook() -> Response:
        return twilio_reply("whatsapp")

    @app.post("/twilio/sms")
    def sms_webhook() -> Response:
        return twilio_reply("sms")

    return app


app = create_app()
