import os
from collections.abc import Mapping
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, Response, abort, request
from twilio.request_validator import RequestValidator
from twilio.twiml.messaging_response import MessagingResponse

from backend.mamabot.chatbot import answer_question


load_dotenv(Path(__file__).resolve().parent / ".env")


def create_app(test_config: Mapping[str, object] | None = None) -> Flask:
    app = Flask(__name__)
    app.config.from_mapping(
        MAX_CONTENT_LENGTH=16_384,
        TWILIO_AUTH_TOKEN=os.environ.get("TWILIO_AUTH_TOKEN", ""),
        TWILIO_WEBHOOK_BASE_URL=os.environ.get("TWILIO_WEBHOOK_BASE_URL", ""),
    )
    if test_config:
        app.config.update(test_config)

    @app.get("/healthz")
    def healthcheck() -> Response:
        return Response("ok", status=200, mimetype="text/plain")

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
        response.message(answer_question(message))
        return Response(str(response), status=200, mimetype="application/xml")

    @app.post("/twilio/whatsapp")
    def whatsapp_webhook() -> Response:
        return twilio_reply("whatsapp")

    @app.post("/twilio/sms")
    def sms_webhook() -> Response:
        return twilio_reply("sms")

    return app


app = create_app()
