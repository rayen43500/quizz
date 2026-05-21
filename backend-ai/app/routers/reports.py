from fastapi import APIRouter
from datetime import datetime
from app.models.schemas import ReportGenerateInput
from app.services.ai_provider import call_ai, parse_json_from_ai

router = APIRouter()


@router.post("/generate")
async def generate_report(data: ReportGenerateInput):
    stats = data.stats
    success_rate = stats.get("successRate", 0)
    comprehension = stats.get("comprehensionScore", 0)
    subject = data.subject or data.topic or "General"

    prompt = f"""Generate an educational session report as JSON:
{{
  "summary": "3-4 sentence summary",
  "weakConcepts": ["concept1"],
  "recommendations": ["rec1", "rec2"],
  "heatmap": [{{"topic": "{subject}", "masteryPercent": {comprehension}}}],
  "revisionPlan": [
    {{"day": 1, "title": "Basics", "activities": ["..."]}},
    {{"day": 2, "title": "Exercises", "activities": ["..."]}},
    {{"day": 3, "title": "Advanced", "activities": ["..."]}}
  ]
}}

Session data:
- Subject: {subject}
- Success rate: {success_rate}%
- Comprehension: {comprehension}
- Questions: {data.question_count}
- Participants: {data.participant_count}
- Total responses: {len(data.responses)}"""

    text = await call_ai(
        "You are an educational report generator. Return valid JSON only.",
        prompt,
    )
    result = parse_json_from_ai(text)

    return {
        "summary": result.get(
            "summary",
            f"Session completed with {success_rate}% success rate and {comprehension} comprehension score.",
        ),
        "weakConcepts": result.get(
            "weakConcepts",
            [subject] if success_rate < 60 else [],
        ),
        "recommendations": result.get("recommendations", [
            "Review incorrect answers collaboratively",
            "Assign targeted practice",
            "Schedule follow-up assessment",
        ]),
        "heatmap": result.get("heatmap", [
            {"topic": subject, "masteryPercent": comprehension},
            {"topic": "Algebra", "masteryPercent": 88},
            {"topic": "Functions", "masteryPercent": 61},
        ]),
        "revisionPlan": result.get("revisionPlan", [
            {"day": 1, "title": "Basics", "activities": ["Review core concepts", "Summary notes"]},
            {"day": 2, "title": "Exercises", "activities": ["Practice problems", "Peer tutoring"]},
            {"day": 3, "title": "Advanced practice", "activities": ["Challenge questions", "Mini quiz"]},
        ]),
        "engagementChart": [
            {"timestamp": datetime.utcnow().isoformat(), "value": comprehension}
        ],
    }
