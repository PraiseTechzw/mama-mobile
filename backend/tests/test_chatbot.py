import unittest

from backend.mamabot.chatbot import (
    LANGUAGES,
    RESPONSES,
    answer_question,
    answer_question_with_mode,
    classify_question,
)


class ChatbotTests(unittest.TestCase):
    def test_every_offline_response_has_all_supported_languages(self) -> None:
        for response_id, translations in RESPONSES.items():
            with self.subTest(response_id=response_id):
                self.assertEqual(set(translations), set(LANGUAGES))
                self.assertTrue(all(translations[language].strip() for language in LANGUAGES))

    def test_pregnancy_guidance_avoids_anc_jargon(self) -> None:
        for response_id, translations in RESPONSES.items():
            with self.subTest(response_id=response_id):
                for language in LANGUAGES:
                    self.assertNotRegex(
                        translations[language].casefold(),
                        r"\b(?:anc|antenatal)\b",
                    )

    def test_expanded_offline_topics_are_searchable_in_all_supported_languages(self) -> None:
        examples = (
            ("When should I start antenatal care?", "antenatal_care", "en"),
            ("Ndinofanira kutanga riini kushanyira ANC?", "antenatal_care", "sn"),
            ("How should I plan transport for delivery?", "birth_plan", "en"),
            ("Usizo ngokuncelisa", "breastfeeding", "nd"),
            ("Kuchengetwa mushure mekusununguka", "postpartum_care", "sn"),
        )
        for question, expected_intent, expected_language in examples:
            with self.subTest(question=question):
                self.assertEqual(
                    classify_question(question),
                    (expected_intent, expected_language),
                )

    def test_ranked_search_handles_paraphrased_antenatal_question(self) -> None:
        self.assertEqual(
            classify_question("How often must I visit the clinic while expecting?"),
            ("antenatal_care", "en"),
        )

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

    def test_shona_headache_variations_get_localized_safety_guidance(self) -> None:
        for question in (
            "ndikunzza musoro",
            "ndikunzwa musoro",
            "ndinonzwa musoro",
            "ndiri kunzwa musoro",
            "ndirikunzwa musoro",
            "musoro unorwadza",
        ):
            with self.subTest(question=question):
                self.assertEqual(classify_question(question), ("headache", "sn"))
                reply, mode = answer_question_with_mode(question)
                self.assertEqual(mode, "offline")
                self.assertIn("mushandi", reply)
                self.assertNotIn("ANC", reply)
                self.assertIn("Kana uchirwadza zvikuru", reply)

    def test_uncertain_online_result_keeps_local_shona_headache_match(self) -> None:
        reply, mode = answer_question_with_mode(
            "ndikunzza musoro",
            classifier=lambda _message: ("clarify", "sn"),
        )

        self.assertEqual(mode, "offline")
        self.assertIn("mushandi", reply)
        self.assertNotIn("ANC", reply)
        self.assertNotIn("Handina kunyatsonzwisisa", reply)

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
        self.assertIn("kuongororwa kwepamuviri", reply)
        self.assertNotIn("How should I prepare", reply)

    def test_pregnancy_week_context_personalizes_backend_reply(self) -> None:
        reply, mode = answer_question_with_mode(
            "What should I know about week 6?",
            context={"pregnancy_week": 6},
        )

        self.assertEqual(mode, "offline")
        self.assertIn("around week 6", reply)
        self.assertIn("first trimester", reply)

    def test_selected_language_is_used_for_english_questions(self) -> None:
        for language, expected in (("sn", "Edza kudya"), ("nd", "Zama ukudla")):
            with self.subTest(language=language):
                reply, _mode = answer_question_with_mode(
                    "What foods should I eat?",
                    preferred_language=language,
                    force_language=True,
                )
                self.assertIn(expected, reply)

    def test_pregnancy_basics_reply_uses_saved_week_context(self) -> None:
        reply, _mode = answer_question_with_mode(
            "What happens during pregnancy?",
            context={"pregnancy_week": 24},
        )

        self.assertIn("around week 24", reply)

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
        self.assertIn("umsebenzi wezempilakahle", reply)
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
