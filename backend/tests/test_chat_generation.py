import io
import json
import unittest
from unittest.mock import patch

from backend.mamabot.chat_generation import (
    DEFAULT_CHAT_MODEL,
    generate_chat_reply,
)


class ChatGenerationTests(unittest.TestCase):
    @patch("backend.mamabot.chat_generation.urlopen")
    def test_generates_reply_with_recent_context_and_reviewed_guidance(
        self, mocked_urlopen
    ) -> None:
        class FakeResponse(io.BytesIO):
            def __enter__(self):
                return self

            def __exit__(self, *_args):
                self.close()

        mocked_urlopen.return_value = FakeResponse(
            json.dumps({
                "choices": [{
                    "message": {
                        "content": "**Try this:**\n- Ask your health worker.",
                    },
                }],
            }).encode()
        )

        reply = generate_chat_reply(
            "Can you explain this?",
            "test-key",
            context={
                "pregnancy_week": 24,
                "recent_messages": [
                    {"author": "you", "text": "I am worried about a visit."},
                    {"author": "mama", "text": "You can ask the clinic."},
                ],
            },
            reviewed_guidance="Write down your questions and take them to the clinic.",
        )

        self.assertEqual(reply, "**Try this:**\n- Ask your health worker.")
        request = mocked_urlopen.call_args.args[0]
        self.assertEqual(request.full_url, "https://openrouter.ai/api/v1/chat/completions")
        self.assertEqual(request.get_header("Authorization"), "Bearer test-key")
        payload = json.loads(request.data)
        self.assertEqual(payload["model"], DEFAULT_CHAT_MODEL)
        messages = payload["messages"]
        self.assertTrue(any("Write down your questions" in item["content"] for item in messages))
        self.assertEqual(
            [item["role"] for item in messages[-3:]],
            ["assistant", "system", "user"],
        )

    @patch("backend.mamabot.chat_generation.urlopen")
    def test_returns_none_for_empty_or_oversized_provider_reply(self, mocked_urlopen) -> None:
        class FakeResponse(io.BytesIO):
            def __enter__(self):
                return self

            def __exit__(self, *_args):
                self.close()

        for content in ("  ", "x" * 4001):
            with self.subTest(length=len(content)):
                mocked_urlopen.return_value = FakeResponse(
                    json.dumps({
                        "choices": [{"message": {"content": content}}],
                    }).encode()
                )
                self.assertIsNone(generate_chat_reply("question", "test-key"))


if __name__ == "__main__":
    unittest.main()
