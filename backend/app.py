import os
from collections.abc import Mapping
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, Response, abort, jsonify, request
from twilio.request_validator import RequestValidator
from twilio.twiml.messaging_response import MessagingResponse

from backend.mamabot.chatbot import IntentClassifier, answer_question_with_mode
from backend.mamabot.openrouter import DEFAULT_FREE_MODEL, classify_with_openrouter


load_dotenv(Path(__file__).resolve().parent / ".env")


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
    )
    if test_config:
        app.config.update(test_config)

    @app.get("/healthz")
    def healthcheck() -> Response:
        return Response("ok", status=200, mimetype="text/plain")

    def chatbot_classifier(
        enabled: bool = True,
        preferred_language: str = "en",
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

        reply, mode = answer_question_with_mode(
            message.strip(),
            language,
            chatbot_classifier(enabled=use_online, preferred_language=language),
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
        response = MessagingResponse()
        reply, _mode = answer_question_with_mode(
            message,
            classifier=chatbot_classifier(
                enabled=bool(app.config["OPENROUTER_MESSAGING_ENABLED"])
            ),
        )
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
