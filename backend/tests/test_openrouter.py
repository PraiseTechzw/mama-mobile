import io
import json
import unittest
from unittest.mock import patch

from backend.mamabot.openrouter import classify_with_openrouter


class OpenRouterTests(unittest.TestCase):
    def make_response(self, result: dict[str, object]):
        data = json.dumps(
            {
                "choices": [
                    {"message": {"content": json.dumps(result)}},
                ],
            }
        ).encode()

        class FakeResponse(io.BytesIO):
            def __enter__(self):
                return self

            def __exit__(self, *_args):
                self.close()

        return FakeResponse(data)

    @patch("backend.mamabot.openrouter.urlopen")
    def test_sends_privacy_restricted_classification_and_parses_reply(self, mocked_urlopen) -> None:
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
        payload = json.loads(request.data)
        self.assertEqual(payload["provider"], {"data_collection": "deny", "zdr": True})
        self.assertEqual(payload["response_format"]["type"], "json_schema")
        self.assertEqual(payload["messages"][-1]["content"], "Ndinofanira kudyei?")
        self.assertNotIn("name", payload["messages"][-1]["content"])
        self.assertEqual(mocked_urlopen.call_args.kwargs["timeout"], 5)

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


if __name__ == "__main__":
    unittest.main()
