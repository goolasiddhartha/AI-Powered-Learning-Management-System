import pytest
from pydantic import ValidationError

from app.schemas.quiz import QuizQuestionInput, QuizQuestionPublic
from app.services.quiz_service import score_answers


def test_score_answers_uses_weighted_server_keys_and_passing_percentage():
    questions = [
        {"id": "one", "question": "One?", "options": ["A", "B"], "correctAnswer": "A", "marks": 3},
        {"id": "two", "question": "Two?", "options": ["C", "D"], "correctAnswer": "D", "marks": 1},
    ]

    result = score_answers(questions, {"one": "A", "two": "C"}, passing_score=70)

    assert result["earnedMarks"] == 3
    assert result["totalMarks"] == 4
    assert result["score"] == 75
    assert result["passed"] is True
    assert result["results"][1]["correctAnswer"] == "D"


def test_score_answers_marks_unanswered_questions_incorrect():
    questions = [
        {"id": "one", "question": "One?", "options": ["A", "B"], "correctAnswer": "A", "marks": 2}
    ]

    result = score_answers(questions, {}, passing_score=1)

    assert result["score"] == 0
    assert result["passed"] is False
    assert result["results"][0]["selectedAnswer"] is None


def test_question_requires_correct_answer_to_match_an_option():
    with pytest.raises(ValidationError):
        QuizQuestionInput(
            question="Pick one",
            options=["A", "B"],
            correctAnswer="C",
        )


def test_student_question_shape_excludes_correct_answer_and_explanation():
    question = QuizQuestionPublic.model_validate(
        {
            "id": "q-1",
            "question": "Pick one",
            "type": "MCQ",
            "options": ["A", "B"],
            "marks": 1,
            "correctAnswer": "A",
            "explanation": "Private until submission",
        }
    )

    assert "correctAnswer" not in question.model_dump()
    assert "explanation" not in question.model_dump()
