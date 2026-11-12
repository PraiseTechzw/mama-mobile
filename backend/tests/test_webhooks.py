import unittest

from backend.app import create_app
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
        response = create_app({"TESTING": True}).test_client().post(
            "/twilio/sms",
            data={"Body": "hello"},
        )
        self.assertEqual(response.status_code, 503)


if __name__ == "__main__":
    unittest.main()
