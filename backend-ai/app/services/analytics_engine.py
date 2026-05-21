"""Local educational analytics — no custom ML models."""


def compute_comprehension_score(
    success_rate: float,
    participation_rate: float,
    avg_response_time_sec: float,
) -> int:
    correctness = success_rate / 100
    participation = participation_rate / 100
    speed_score = max(0.0, 1.0 - avg_response_time_sec / 30) if avg_response_time_sec > 0 else 0.5
    score = 0.5 * correctness + 0.3 * participation + 0.2 * speed_score
    return round(score * 100)


def compute_engagement(comprehension_score: float, participation_rate: float) -> str:
    if comprehension_score < 40 or participation_rate < 50:
        return "low"
    if comprehension_score > 70 and participation_rate > 75:
        return "high"
    return "medium"


def compute_performance_trend(success_rates: list[float]) -> str:
    if len(success_rates) < 2:
        return "stable"
    recent = success_rates[-3:]
    if len(recent) >= 2 and recent[-1] > recent[0] + 10:
        return "improving"
    if len(recent) >= 2 and recent[-1] < recent[0] - 10:
        return "declining"
    return "stable"


def compute_drop_rate(participant_count: int, active_count: int) -> float:
    if participant_count == 0:
        return 0.0
    return round(((participant_count - active_count) / participant_count) * 100, 1)


def adaptive_difficulty(success_rate: float, current: int = 3) -> tuple[int, str | None]:
    if success_rate > 80:
        return min(5, current + 1), "High success — increase difficulty"
    if success_rate < 50:
        return max(1, current - 1), "Low success — decrease difficulty"
    return current, None


def individual_adaptation(student_rate: float, group_rate: float, current: int = 3) -> int:
    gap = group_rate - student_rate
    if gap > 30:
        return max(1, current - 1)
    if student_rate > group_rate + 20:
        return min(5, current + 1)
    return current


def compute_suspicion(
    response_time_ms: int,
    flags: list[str],
    recent_answers: list[str],
    score: float,
) -> dict:
    suspicion_score = 0
    result_flags = list(flags)

    if response_time_ms < 500:
        suspicion_score += 35
        if "fast_response" not in result_flags:
            result_flags.append("fast_response")

    if len(recent_answers) >= 3 and len(set(recent_answers)) == 1:
        suspicion_score += 40
        result_flags.append("repetitive")

    if score > 0.9 and response_time_ms < 1000:
        suspicion_score += 25
        result_flags.append("abnormal_score_jump")

    if len(recent_answers) >= 5:
        patterns = [recent_answers[i] == recent_answers[i - 1] for i in range(1, len(recent_answers))]
        if all(patterns):
            suspicion_score += 20
            result_flags.append("possible_guessing")

    suspicion_score = min(100, suspicion_score)
    return {
        "suspicionScore": suspicion_score,
        "flags": list(set(result_flags)),
        "alert": suspicion_score >= 60,
    }


def predict_dropout(success_rate: float, participation: float, avg_time: float) -> dict:
    risk = 0
    if success_rate < 40:
        risk += 35
    if participation < 50:
        risk += 30
    if avg_time > 25000:
        risk += 15
    risk = min(100, risk)

    future_comprehension = max(0, min(100, int(success_rate * 0.7 + participation * 0.3)))
    needs_support = risk > 50

    return {
        "dropoutRisk": risk,
        "futureComprehension": future_comprehension,
        "needsSupport": needs_support,
        "performanceTrend": "declining" if risk > 60 else "stable",
    }
