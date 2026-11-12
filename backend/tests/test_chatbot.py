import unittest

from backend.mamabot.chatbot import answer_question, answer_question_with_mode, classify_question


class ChatbotTests(unittest.TestCase):
    def test_english_danger_sign_question(self) -> None:
        self.assertEqual(classify_question("Which warning signs need urgent care?"), ("danger_signs", "en"))
        reply = answer_question("Which warning signs need urgent care?")
        self.assertIn("Do not wait for another message", reply)
        self.assertNotIn("app", reply.casefold())
        self.assertNotIn("offline", reply.casefold())

    def test_shona_urgent_symptom_is_prioritized(self) -> None:
        intent, language = classify_question("Ndiri kubuda ropa rakawanda")
        self.assertEqual((intent, language), ("urgent_symptoms", "sn"))
        self.assertIn("chimbichimbi", answer_question("Ndiri kubuda ropa rakawanda"))

    def test_ndebele_urgent_symptom_is_prioritized(self) -> None:
        intent, language = classify_question("Ngiyopha kakhulu")
        self.assertEqual((intent, language), ("urgent_symptoms", "nd"))
        self.assertIn("khathesi", answer_question("Ngiyopha kakhulu"))

    def test_language_prefix_selects_reply_language(self) -> None:
        intent, language = classify_question("SN: what foods are helpful?")
        self.assertEqual((intent, language), ("nutrition", "sn"))
        self.assertIn("Edza kudya", answer_question("SN: what foods are helpful?"))
        self.assertEqual(classify_question("an unrecognized message", "nd")[1], "nd")

    def test_phrase_ranking_selects_the_best_topic_and_detects_language(self) -> None:
        self.assertEqual(
            classify_question("Ndinobuda ropa rakawanda uye ndiri kunetseka kufema"),
            ("urgent_symptoms", "sn"),
        )
        self.assertEqual(classify_question("Ngiyopha kakhulu")[1], "nd")

    def test_online_classifier_selects_catalog_reply_but_not_freeform_advice(self) -> None:
        reply, mode = answer_question_with_mode(
            "How should I prepare before the clinic?",
            classifier=lambda _message: ("visit_preparation", "sn"),
        )
        self.assertEqual(mode, "online")
        self.assertIn("ANC", reply)
        self.assertNotIn("How should I prepare", reply)

    def test_urgent_local_match_bypasses_online_classifier(self) -> None:
        def unexpected_classifier(_message: str) -> tuple[str, str]:
            raise AssertionError("Urgent symptoms must bypass the model.")

        _reply, mode = answer_question_with_mode(
            "I have heavy bleeding",
            classifier=unexpected_classifier,
        )
        self.assertEqual(mode, "safety")

    def test_online_fallback_does_not_discard_a_local_topic_match(self) -> None:
        _reply, mode = answer_question_with_mode(
            "What foods should I eat?",
            classifier=lambda _message: ("fallback", "en"),
        )
        self.assertEqual(mode, "offline")

    def test_suggested_language_prompts_match_their_intents(self) -> None:
        self.assertEqual(
            classify_question("Ndezvipi zviratidzo zvinoda rubatsiro rwechimbichimbi?")[0],
            "danger_signs",
        )
        self.assertEqual(
            classify_question("Yiluphi utshintsho engingalubona emzimbeni wami?")[0],
            "body_changes",
        )
        self.assertEqual(classify_question("Hello MamaBot")[0], "greeting")

    def test_unknown_question_uses_safe_localized_fallback(self) -> None:
        self.assertEqual(classify_question("Can you tell me a story?"), ("fallback", "en"))
        reply = answer_question("ND: random question")
        self.assertIn("umhlanzi wakho", reply)
        self.assertNotIn("intanethi", reply)
        self.assertNotIn("app", reply)

    def test_channel_replies_do_not_reference_offline_app_features(self) -> None:
        for question in (
            "I have heavy bleeding",
            "Ndiri kubuda ropa rakawanda",
            "Ngiyopha kakhulu",
            "How many weeks pregnant am I?",
            "Can you tell me a story?",
        ):
            with self.subTest(question=question):
                reply = answer_question(question).casefold()
                self.assertNotIn("offline", reply)
                self.assertNotIn("app", reply)


if __name__ == "__main__":
    unittest.main()
