from fastapi import APIRouter
from app.models.schemas import (
    InsightsInput,
    GenerateQuizInput,
    ChatInput,
    RevisionPlanInput,
    ExplainAnswerInput,
)
from app.services.ai_provider import call_ai, parse_json_from_ai
import json

router = APIRouter()


@router.post("/insights")
async def generate_insights(data: InsightsInput):
    prompt = f"""Analyze educational performance and return JSON:
{{
  "summary": "2-3 sentence pedagogical summary",
  "recommendations": ["action1", "action2", "action3"],
  "misunderstoodConcepts": ["concept1"],
  "difficultySuggestion": "increase|decrease|maintain"
}}

Data:
- Topic: {data.topic}
- Success rate: {data.success_rate}%
- Avg response time: {data.avg_response_time}s
- Engagement: {data.engagement}
- Comprehension score: {data.comprehension_score}"""

    text = await call_ai(
        "You are an expert educational data analyst. Respond only with valid JSON.",
        prompt,
    )
    result = parse_json_from_ai(text)
    return {
        "summary": result.get("summary", "Performance analysis complete."),
        "recommendations": result.get("recommendations", []),
        "misunderstoodConcepts": result.get("misunderstoodConcepts", []),
        "difficultySuggestion": result.get("difficultySuggestion", "maintain"),
    }


@router.post("/generate-quiz")
async def generate_quiz(data: GenerateQuizInput):
    types_str = ", ".join(data.types)
    prompt = f"""Generate {data.question_count} educational quiz questions about "{data.topic}".
Difficulty level: {data.difficulty}/5
Question types allowed: {types_str}

Return JSON:
{{
  "questions": [
    {{
      "type": "multiple_choice",
      "text": "...",
      "options": [{{"id": "a", "label": "...", "isCorrect": true}}],
      "correctAnswer": null,
      "explanation": "...",
      "difficulty": 3
    }}
  ]
}}"""

    text = await call_ai(
        "You are an expert teacher creating quiz content. Return valid JSON only.",
        prompt,
    )
    result = parse_json_from_ai(text)

    if "questions" not in result:
        result = {
            "questions": [
                {
                    "type": "multiple_choice",
                    "text": f"What is a key concept in {data.topic}?",
                    "options": [
                        {"id": "a", "label": "Core concept A", "isCorrect": True},
                        {"id": "b", "label": "Incorrect B", "isCorrect": False},
                        {"id": "c", "label": "Incorrect C", "isCorrect": False},
                    ],
                    "explanation": f"Review fundamentals of {data.topic}.",
                    "difficulty": data.difficulty,
                }
            ]
        }

    return result


@router.post("/chat")
async def educational_chat(data: ChatInput):
    ctx = data.context
    prompt = f"""Student question: {data.message}

Context:
- Question: {ctx.get('questionText', 'N/A')}
- Student answer: {ctx.get('studentAnswer', 'N/A')}
- Correct answer: {ctx.get('correctAnswer', 'N/A')}
- Explanation: {ctx.get('explanation', 'N/A')}

Provide a clear, encouraging educational explanation. Max 200 words."""

    text = await call_ai(
        "You are a supportive educational tutor. Explain concepts clearly without being condescending.",
        prompt,
    )
    return {"reply": text, "type": "educational_explanation"}


@router.post("/revision-plan")
async def revision_plan(data: RevisionPlanInput):
    topics = data.weak_topics or [
        t.get("topic") for t in data.topics_progress if t.get("masteryPercent", 100) < 60
    ]
    topics_str = ", ".join(topics) if topics else "general review"

    prompt = f"""Create a {data.days}-day revision plan for a student weak in: {topics_str}

Return JSON:
{{
  "plan": [
    {{"day": 1, "title": "...", "activities": ["...", "..."]}}
  ]
}}"""

    text = await call_ai(
        "You are an educational coach creating structured revision plans. Return valid JSON.",
        prompt,
    )
    result = parse_json_from_ai(text)

    if "plan" not in result:
        result = {
            "plan": [
                {"day": 1, "title": "Basics", "activities": ["Review notes", "Watch tutorial"]},
                {"day": 2, "title": "Exercises", "activities": ["Practice problems", "Peer study"]},
                {"day": 3, "title": "Advanced practice", "activities": ["Challenge quiz", "Self-test"]},
            ]
        }

    return result


@router.post("/explain-answer")
async def explain_answer(data: ExplainAnswerInput):
    prompt = f"""Explain why the student's answer was incorrect in an educational way.

Question: {data.question_text}
Student answer: {data.student_answer}
Correct answer: {data.correct_answer}
Reference explanation: {data.explanation or 'N/A'}

Be encouraging and pedagogical. Max 150 words."""

    text = await call_ai(
        "You are a patient tutor helping students learn from mistakes.",
        prompt,
    )
    return {"explanation": text}
