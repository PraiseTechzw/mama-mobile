import unittest
from datetime import datetime, timedelta, timezone
from unittest.mock import patch

import psycopg

from backend.app import create_app
from backend.mamabot.openrouter import DEFAULT_CLASSIFICATION_MODEL
from backend.mamabot.language_sessions import LanguageSession
from twilio.request_validator import RequestValidator


class FakeLanguageSessionStore:
    def __init__(self) -> None:
        self.sessions: dict[tuple[str, str], tuple[LanguageSession, datetime]] = {}
        self.now = datetime.now(timezone.utc)

    def get(self, channel: str, sender: str) -> LanguageSession | None:
        key = (channel, sender)
        stored = self.sessions.get(key)
        if stored is None or stored[1] <= self.now:
            self.sessions.pop(key, None)
            return None
        session = stored[0]
        self.sessions[key] = (session, self.now + timedelta(hours=24))
        return session

    def await_selection(self, channel: str, sender: str) -> None:
        self.sessions[(channel, sender)] = (
            LanguageSession(None, True),
            self.now + timedelta(hours=24),
        )

    def set_language(self, channel: str, sender: str, language: str) -> None:
        self.sessions[(channel, sender)] = (
            LanguageSession(language, False),
            self.now + timedelta(hours=24),
        )


class WebhookTests(unittest.TestCase):
    def setUp(self) -> None:
        self.app = create_app(
            {
                "TESTING": True,
                "TWILIO_AUTH_TOKEN": "test-auth-token",
                "TWILIO_WEBHOOK_BASE_URL": "https://mamabot.example",
                "OPENROUTER_API_KEY": "",
                "OPENROUTER_MESSAGING_ENABLED": False,
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
            json={"message": "Ndiri kubuda ropa rakawanda", "language": "sn"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["mode"], "safety")
        self.assertIn("chimbichimbi", response.json["reply"])

    def test_app_chat_api_uses_context_when_online_classification_is_unavailable(self) -> None:
        response = self.client.post(
            "/api/chat",
            json={
                "message": "What should I know about week 6?",
                "language": "en",
                "use_online": True,
                "context": {"pregnancy_week": 6},
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["mode"], "offline")
        self.assertIn("around week 6", response.json["reply"])
        self.assertIn("first trimester", response.json["reply"])

    def test_app_chat_api_uses_selected_language_for_english_question(self) -> None:
        response = self.client.post(
            "/api/chat",
            json={
                "message": "What foods should I eat?",
                "language": "sn",
                "use_online": True,
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["mode"], "offline")
        self.assertIn("Edza kudya", response.json["reply"])

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
                "language": "sn",
                "use_online": True,
            },
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["mode"], "online")
        self.assertIn("Edza kudya", response.json["reply"])

    @patch("backend.app.classify_with_openrouter")
    def test_app_chat_api_passes_pregnancy_and_recent_chat_context(self, classify) -> None:
        classify.return_value = ("nutrition", "en")
        app = create_app(
            {
                "TESTING": True,
                "OPENROUTER_API_KEY": "test-key",
            }
        )
        context = {
            "pregnancy_week": 24,
            "recent_messages": [
                {"author": "you", "text": "I am around week 24."},
                {"author": "mama", "text": "How can I help?"},
            ],
        }

        response = app.test_client().post(
            "/api/chat",
            json={
                "message": "What should I eat?",
                "language": "en",
                "use_online": True,
                "context": context,
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json["mode"], "online")
        self.assertEqual(classify.call_args.kwargs["context"], context)

    @patch("backend.app.classify_with_openrouter")
    def test_app_chat_api_selects_default_model_when_model_is_unset(self, classify) -> None:
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
        self.assertEqual(classify.call_args.args[2], DEFAULT_CLASSIFICATION_MODEL)

    @patch("backend.app.classify_with_openrouter")
    def test_app_chat_api_migrates_legacy_free_router_model(self, classify) -> None:
        classify.return_value = ("nutrition", "en")
        app = create_app(
            {
                "TESTING": True,
                "OPENROUTER_API_KEY": "test-key",
                "OPENROUTER_MODEL": "openrouter/free",
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
        self.assertEqual(classify.call_args.args[2], DEFAULT_CLASSIFICATION_MODEL)

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
        self.assertEqual(
            client.post(
                "/api/chat",
                json={
                    "message": "hello",
                    "context": {"pregnancy_week": 43},
                },
            ).status_code,
            400,
        )
        self.assertEqual(
            client.post(
                "/api/chat",
                json={
                    "message": "hello",
                    "context": {"recent_messages": [{"author": "system", "text": "hello"}]},
                },
            ).status_code,
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

    def test_whatsapp_auto_detects_shona_for_non_urgent_question(self) -> None:
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
            data={"Body": "Ndinofanira kudyei?"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(classifier_calls, ["Ndinofanira kudyei?"])
        self.assertIn("Edza kudya", response.text)
        self.assertNotIn("EN:", response.text)

    def test_first_messaging_contact_is_asked_to_choose_a_language(self) -> None:
        store = FakeLanguageSessionStore()
        app = create_app(
            {
                "TESTING": True,
                "TWILIO_AUTH_TOKEN": "test-auth-token",
                "TWILIO_WEBHOOK_BASE_URL": "https://mamabot.example",
                "LANGUAGE_SESSION_STORE": store,
                "OPENROUTER_MESSAGING_ENABLED": False,
            }
        )

        response = app.test_client().post(
            "/twilio/whatsapp",
            data={"From": "whatsapp:+263700000001", "Body": "hello"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("1 English, 2 Shona, 3 Ndebele", response.text)
        self.assertIn("saved for 24h", response.text)
        self.assertIn(("whatsapp", "whatsapp:+263700000001"), store.sessions)
        self.assertTrue(store.sessions[("whatsapp", "whatsapp:+263700000001")][0].awaiting_selection)

    def test_language_selection_is_confirmed_and_used_for_replies(self) -> None:
        store = FakeLanguageSessionStore()
        classifier_calls: list[str] = []
        app = create_app(
            {
                "TESTING": True,
                "TWILIO_AUTH_TOKEN": "test-auth-token",
                "TWILIO_WEBHOOK_BASE_URL": "https://mamabot.example",
                "LANGUAGE_SESSION_STORE": store,
                "OPENROUTER_MESSAGING_ENABLED": True,
                "CHATBOT_CLASSIFIER": lambda message: (
                    classifier_calls.append(message) or ("nutrition", "en")
                ),
            }
        )
        client = app.test_client()
        client.post(
            "/twilio/whatsapp",
            data={"From": "whatsapp:+263700000002", "Body": "hello"},
        )
        selection = client.post(
            "/twilio/whatsapp",
            data={"From": "whatsapp:+263700000002", "Body": "2"},
        )
        answer = client.post(
            "/twilio/whatsapp",
            data={"From": "whatsapp:+263700000002", "Body": "What foods should I eat?"},
        )

        self.assertEqual(selection.status_code, 200)
        self.assertIn("Ndichapindura neChiShona", selection.text)
        self.assertIn("Edza kudya", answer.text)
        self.assertEqual(classifier_calls, ["What foods should I eat?"])
        self.assertEqual(
            store.sessions[("whatsapp", "whatsapp:+263700000002")][0],
            LanguageSession("sn", False),
        )

    def test_user_can_change_the_language_during_a_conversation(self) -> None:
        store = FakeLanguageSessionStore()
        store.set_language("sms", "+263700000003", "sn")
        app = create_app(
            {
                "TESTING": True,
                "TWILIO_AUTH_TOKEN": "test-auth-token",
                "TWILIO_WEBHOOK_BASE_URL": "https://mamabot.example",
                "LANGUAGE_SESSION_STORE": store,
            }
        )

        prompt = app.test_client().post(
            "/twilio/sms",
            data={"From": "+263700000003", "Body": "change language"},
        )
        changed = app.test_client().post(
            "/twilio/sms",
            data={"From": "+263700000003", "Body": "Ndebele"},
        )

        self.assertIn("1 English, 2 Shona, 3 Ndebele", prompt.text)
        self.assertIn("Ngizaphendula ngesiNdebele", changed.text)
        self.assertEqual(
            store.sessions[("sms", "+263700000003")][0],
            LanguageSession("nd", False),
        )

    def test_language_choice_expires_after_24_hours_of_inactivity(self) -> None:
        store = FakeLanguageSessionStore()
        store.set_language("sms", "+263700000004", "en")
        store.now += timedelta(hours=24, seconds=1)
        app = create_app(
            {
                "TESTING": True,
                "TWILIO_AUTH_TOKEN": "test-auth-token",
                "TWILIO_WEBHOOK_BASE_URL": "https://mamabot.example",
                "LANGUAGE_SESSION_STORE": store,
                "OPENROUTER_MESSAGING_ENABLED": False,
            }
        )

        response = app.test_client().post(
            "/twilio/sms",
            data={"From": "+263700000004", "Body": "hello"},
        )

        self.assertIn("1 English, 2 Shona, 3 Ndebele", response.text)
        self.assertTrue(store.sessions[("sms", "+263700000004")][0].awaiting_selection)

    def test_language_database_failure_returns_service_unavailable(self) -> None:
        class FailingStore(FakeLanguageSessionStore):
            def get(self, channel: str, sender: str) -> LanguageSession | None:
                raise psycopg.OperationalError("database unavailable")

        app = create_app(
            {
                "TESTING": True,
                "TWILIO_AUTH_TOKEN": "test-auth-token",
                "TWILIO_WEBHOOK_BASE_URL": "https://mamabot.example",
                "LANGUAGE_SESSION_STORE": FailingStore(),
            }
        )

        response = app.test_client().post(
            "/twilio/sms",
            data={"From": "+263700000005", "Body": "hello"},
        )

        self.assertEqual(response.status_code, 503)

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
