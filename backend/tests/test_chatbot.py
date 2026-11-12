import unittest

from backend.mamabot.chatbot import answer_question, classify_question


class ChatbotTests(unittest.TestCase):
    def test_english_danger_sign_question(self) -> None:
        self.assertEqual(classify_question("Which warning signs need urgent care?"), ("danger_signs", "en"))

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

    def test_unknown_question_uses_safe_localized_fallback(self) -> None:
        self.assertEqual(classify_question("Can you tell me a story?"), ("fallback", "en"))
        self.assertIn("ANC provider", answer_question("ND: random question"))


if __name__ == "__main__":
    unittest.main()
