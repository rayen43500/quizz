from fastapi import APIRouter
from app.models.schemas import MetricsInput, LiveAssistantInput, SuspicionInput, PredictInput
from app.services import analytics_engine
from app.services.ai_provider import call_ai, parse_json_from_ai

router = APIRouter()


@router.post("/compute")
async def compute_metrics(data: MetricsInput):
    comprehension = analytics_engine.compute_comprehension_score(
        data.success_rate,
        data.participation_rate,
        data.avg_response_time,
    )
    engagement = analytics_engine.compute_engagement(comprehension, data.participation_rate)
    drop_rate = analytics_engine.compute_drop_rate(
        data.participant_count,
        max(1, int(data.participant_count * data.participation_rate / 100)),
    )

    return {
        "comprehensionScore": comprehension,
        "successRate": data.success_rate,
        "avgResponseTime": data.avg_response_time,
        "participationRate": data.participation_rate,
        "engagement": engagement,
        "dropRate": drop_rate,
        "performanceTrend": "stable",
    }


@router.post("/live")
async def live_assistant(data: LiveAssistantInput):
    message = None
    priority = "medium"

    if data.success_rate < 50:
        priority = "high"
        prompt = f"""Analyze this live classroom data and give ONE short actionable recommendation (max 2 sentences):
Topic: {data.topic}
Success rate: {data.success_rate}%
Avg response time: {data.avg_response_time}s
Engagement: {data.engagement}
Comprehension score: {data.comprehension_score}
Active students: {data.active_participants}

Return JSON: {{"message": "...", "priority": "high|medium|low", "actions": ["..."]}}"""

        ai_text = await call_ai(
            "You are a live teaching assistant. Be concise and pedagogical.",
            prompt,
        )
        parsed = parse_json_from_ai(ai_text)
        message = parsed.get(
            "message",
            f"{100 - data.success_rate:.0f}% des élèves ont échoué. Envisagez des exemples plus simples.",
        )
        priority = parsed.get("priority", "high")
        actions = parsed.get("actions", ["Simplify explanation", "Give a worked example"])
    else:
        message = "Class performance is on track. Continue with current pace."
        actions = []
        priority = "low"

    new_diff, reason = analytics_engine.adaptive_difficulty(data.success_rate)

    return {
        "message": message,
        "priority": priority,
        "actions": actions if data.success_rate < 50 else [],
        "suggestedDifficulty": new_diff,
        "difficultyReason": reason,
    }


@router.post("/suspicion")
async def detect_suspicion(data: SuspicionInput):
    return analytics_engine.compute_suspicion(
        data.response_time_ms,
        data.flags,
        data.recent_answers,
        data.score,
    )


@router.post("/predict")
async def predict(data: PredictInput):
    participation = min(100, data.response_count * 10) if data.response_count else 50
    return analytics_engine.predict_dropout(
        data.success_rate,
        participation,
        data.avg_response_time,
    )
