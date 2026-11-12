import unittest
from unittest.mock import patch

from backend.app import create_app
from backend.mamabot.openrouter import DEFAULT_FREE_MODEL
from twilio.request_validator import RequestValidator


class WebhookTests(unittest.TestCase):
    def setUp(self) -> None:
        self.app = create_app(
            {
                "TESTING": True,
                "TWILIO_AUTH_TOKEN": "test-auth-token",
                "TWILIO_WEBHOOK_BASE_URL": "https://mamabot.example",
            }
        )
        self.client = self.app.test_client()

    def test_healthcheck_does_not_require_twilio_configuration(self) -> None:
        response = create_app({"TESTING": True}).test_client().get("/healthz")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.text, "ok")

    def test_app_chat_api_uses_local_answers_without_openrouter_configuration(self) -> None:
        response = self.client.post(
            "/api/chat",
            json={"message": "Ndiri kubuda ropa rakawanda", "language": "en"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["mode"], "safety")
        self.assertIn("chimbichimbi", response.json["reply"])

    def test_app_chat_api_uses_model_classification_for_catalog_lookup(self) -> None:
        app = create_app(
            {
                "TESTING": True,
                "CHATBOT_CLASSIFIER": lambda _message: ("nutrition", "sn"),
            }
        )
        response = app.test_client().post(
            "/api/chat",
            json={
                "message": "What foods should I eat?",
                "language": "en",
                "use_online": True,
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["mode"], "online")
        self.assertIn("Edza kudya", response.json["reply"])

    @patch("backend.app.classify_with_openrouter")
    def test_app_chat_api_selects_free_router_when_model_is_unset(self, classify) -> None:
        classify.return_value = ("nutrition", "en")
        app = create_app(
            {
                "TESTING": True,
                "OPENROUTER_API_KEY": "test-key",
                "OPENROUTER_MODEL": "",
            }
        )
        response = app.test_client().post(
            "/api/chat",
            json={
                "message": "What foods should I eat?",
                "language": "en",
                "use_online": True,
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["mode"], "online")
        self.assertEqual(classify.call_args.args[2], DEFAULT_FREE_MODEL)

    def test_app_chat_api_validates_payload(self) -> None:
        client = create_app({"TESTING": True}).test_client()
        self.assertEqual(client.post("/api/chat", data="not json").status_code, 415)
        self.assertEqual(client.post("/api/chat", json={"message": ""}).status_code, 400)
        self.assertEqual(
            client.post(
                "/api/chat",
                json={"message": "hello", "language": "xx"},
            ).status_code,
            400,
        )
        self.assertEqual(
            client.post(
                "/api/chat",
                json={"message": "hello", "language": []},
            ).status_code,
            400,
        )
        self.assertEqual(
            client.post(
                "/api/chat",
                json={"message": "hello", "use_online": "yes"},
            ).status_code,
            400,
        )
        self.assertEqual(
            client.post("/api/chat", json={"message": "x" * 501}).status_code,
            400,
        )

    def test_sms_webhook_returns_a_localized_twiml_reply(self) -> None:
        response = self.client.post(
            "/twilio/sms",
            data={"Body": "ND: Ngiyopha kakhulu"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("application/xml", response.content_type)
        self.assertIn("usizo lwezempilakahle ngokuphangisa", response.text)
        self.assertIn("Ungalindi omunye umlayezo", response.text)
        self.assertNotIn("app le", response.text)

    def test_whatsapp_webhook_returns_a_twiml_reply(self) -> None:
        response = self.client.post(
            "/twilio/whatsapp",
            data={"Body": "What foods and drinks are helpful?"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("Aim for a varied diet", response.text)

    def test_whatsapp_uses_online_classifier_only_when_enabled(self) -> None:
        classifier_calls: list[str] = []
        app = create_app(
            {
                "TESTING": True,
                "TWILIO_AUTH_TOKEN": "test-auth-token",
                "TWILIO_WEBHOOK_BASE_URL": "https://mamabot.example",
                "OPENROUTER_MESSAGING_ENABLED": True,
                "CHATBOT_CLASSIFIER": lambda message: (
                    classifier_calls.append(message) or ("nutrition", "sn")
                ),
            }
        )
        response = app.test_client().post(
            "/twilio/whatsapp",
            data={"Body": "What foods should I eat?"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(classifier_calls, ["What foods should I eat?"])
        self.assertIn("Edza kudya", response.text)

    def test_webhook_rejects_invalid_twilio_signature(self) -> None:
        app = create_app(
            {
                "TESTING": False,
                "TWILIO_AUTH_TOKEN": "test-auth-token",
                "TWILIO_WEBHOOK_BASE_URL": "https://mamabot.example",
            }
        )
        response = app.test_client().post(
            "/twilio/sms",
            data={"Body": "hello"},
            headers={"X-Twilio-Signature": "invalid"},
        )
        self.assertEqual(response.status_code, 403)

    def test_webhook_accepts_valid_twilio_signature(self) -> None:
        body = "Which warning signs need urgent care?"
        params = {"Body": body}
        signature = RequestValidator("test-auth-token").compute_signature(
            "https://mamabot.example/twilio/sms",
            params,
        )
        app = create_app(
            {
                "TESTING": False,
                "TWILIO_AUTH_TOKEN": "test-auth-token",
                "TWILIO_WEBHOOK_BASE_URL": "https://mamabot.example",
            }
        )
        response = app.test_client().post(
            "/twilio/sms",
            data=params,
            headers={"X-Twilio-Signature": signature},
        )
        self.assertEqual(response.status_code, 200)

    def test_webhook_fails_closed_when_configuration_is_missing(self) -> None:
        response = create_app(
            {
                "TESTING": True,
                "TWILIO_AUTH_TOKEN": "",
                "TWILIO_WEBHOOK_BASE_URL": "",
            }
        ).test_client().post(
            "/twilio/sms",
            data={"Body": "hello"},
        )
        self.assertEqual(response.status_code, 503)


if __name__ == "__main__":
    unittest.main()
