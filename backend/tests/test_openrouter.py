import io
import json
import unittest
from urllib.error import HTTPError
from unittest.mock import patch

from backend.mamabot.openrouter import classify_with_openrouter


class OpenRouterTests(unittest.TestCase):
    def make_response(self, result: dict[str, object]):
        intent_answer: dict[str, object] = {
            "type": "choice",
            "choice": result["intent_id"],
        }
        for field in ("confidence", "probabilities"):
            if field in result:
                intent_answer[field] = result[field]
        data = json.dumps(
            {
                "answers": {
                    "intent_id": intent_answer,
                    "language": {
                        "type": "choice",
                        "choice": result["language"],
                    },
                },
            }
        ).encode()

        class FakeResponse(io.BytesIO):
            def __enter__(self):
                return self

            def __exit__(self, *_args):
                self.close()

        return FakeResponse(data)

    @patch("backend.mamabot.openrouter.urlopen")
    def test_sends_decisions_classification_and_parses_reply(self, mocked_urlopen) -> None:
        mocked_urlopen.return_value = self.make_response(
            {"intent_id": "nutrition", "language": "sn", "confidence": 0.94}
        )
        result = classify_with_openrouter(
            "Ndinofanira kudyei?",
            "test-key",
            "provider/test-model",
        )
        self.assertEqual(result, ("nutrition", "sn"))
        request = mocked_urlopen.call_args.args[0]
        self.assertEqual(request.get_header("Authorization"), "Bearer test-key")
        self.assertEqual(request.full_url, "https://openrouter.ai/api/alpha/decisions")
        payload = json.loads(request.data)
        self.assertEqual(payload["model"], "provider/test-model")
        self.assertNotIn("provider", payload)
        self.assertEqual(payload["questions"]["intent_id"]["type"], "choice")
        self.assertIn("nutrition", payload["questions"]["intent_id"]["criteria"])
        self.assertEqual(payload["state"]["current_question"], "Ndinofanira kudyei?")
        self.assertEqual(mocked_urlopen.call_args.kwargs["timeout"], 5)

    @patch("backend.mamabot.openrouter.urlopen")
    def test_includes_only_supplied_question_and_context(self, mocked_urlopen) -> None:
        mocked_urlopen.return_value = self.make_response(
            {"intent_id": "nutrition", "language": "en", "confidence": 0.94}
        )
        context = {
            "pregnancy_week": 24,
            "recent_messages": [{"author": "you", "text": "I am around week 24."}],
        }
        classify_with_openrouter(
            "What should I eat?",
            "test-key",
            "provider/test-model",
            context=context,
        )

        payload = json.loads(mocked_urlopen.call_args.args[0].data)
        self.assertEqual(payload["state"]["current_question"], "What should I eat?")
        self.assertEqual(payload["state"]["context"], context)
        self.assertNotIn("phone", payload["state"]["context"])

    @patch("backend.mamabot.openrouter.urlopen")
    def test_rejects_untrusted_or_low_confidence_classification(self, mocked_urlopen) -> None:
        mocked_urlopen.return_value = self.make_response(
            {"intent_id": "made_up", "language": "en", "confidence": 0.99}
        )
        self.assertIsNone(
            classify_with_openrouter("question", "test-key", "provider/test-model")
        )

        mocked_urlopen.return_value = self.make_response(
            {"intent_id": "nutrition", "language": "en", "confidence": 0.4}
        )
        self.assertEqual(
            classify_with_openrouter("question", "test-key", "provider/test-model"),
            ("clarify", "en"),
        )

        mocked_urlopen.return_value = self.make_response(
            {
                "intent_id": "nutrition",
                "language": "en",
                "probabilities": {"nutrition": 0.94},
            }
        )
        self.assertEqual(
            classify_with_openrouter("question", "test-key", "provider/test-model"),
            ("nutrition", "en"),
        )

    @patch("backend.mamabot.openrouter.urlopen", side_effect=TimeoutError)
    def test_provider_timeout_falls_back_without_exposing_question(self, mocked_urlopen) -> None:
        self.assertIsNone(
            classify_with_openrouter(
                "private health question",
                "test-key",
                "provider/test-model",
            )
        )
        self.assertEqual(mocked_urlopen.call_count, 1)

    @patch("backend.mamabot.openrouter.urlopen")
    def test_http_error_logs_status_and_provider_message_without_question(self, mocked_urlopen) -> None:
        question = "private health question"
        recent_message = "recent private detail"
        body = json.dumps(
            {
                "error": {
                    "message": (
                        "No endpoints found matching your data policy: "
                        f"{question}; {recent_message}"
                    )
                }
            }
        ).encode()
        mocked_urlopen.side_effect = HTTPError(
            "https://openrouter.ai/api/alpha/decisions",
            404,
            "Not Found",
            {},
            io.BytesIO(body),
        )

        with self.assertLogs("backend.mamabot.openrouter", level="WARNING") as logs:
            result = classify_with_openrouter(
                question,
                "test-key",
                "perplexity/pplx-decider-v1.3:free",
                context={
                    "recent_messages": [
                        {"author": "you", "text": recent_message},
                    ],
                },
            )

        self.assertIsNone(result)
        message = "\n".join(logs.output)
        self.assertIn("HTTP 404", message)
        self.assertIn("No endpoints found matching your data policy", message)
        self.assertNotIn(question, message)
        self.assertNotIn(recent_message, message)


if __name__ == "__main__":
    unittest.main()
