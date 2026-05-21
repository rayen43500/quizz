from pydantic import BaseModel, Field
from typing import Optional


class MetricsInput(BaseModel):
    topic: str = "General"
    success_rate: float = Field(alias="successRate", default=0)
    avg_response_time: float = Field(alias="avgResponseTime", default=0)
    participation_rate: float = Field(alias="participationRate", default=0)
    response_count: int = Field(alias="responseCount", default=0)
    participant_count: int = Field(alias="participantCount", default=1)

    model_config = {"populate_by_name": True}


class LiveAssistantInput(BaseModel):
    topic: str = "General"
    success_rate: float = Field(alias="successRate")
    avg_response_time: float = Field(alias="avgResponseTime", default=0)
    engagement: str = "medium"
    comprehension_score: float = Field(alias="comprehensionScore", default=0)
    active_participants: int = Field(alias="activeParticipants", default=0)

    model_config = {"populate_by_name": True}


class SuspicionInput(BaseModel):
    user_id: str = Field(alias="userId")
    response_time_ms: int = Field(alias="responseTimeMs")
    flags: list[str] = []
    recent_answers: list[str] = Field(alias="recentAnswers", default=[])
    score: float = 0

    model_config = {"populate_by_name": True}


class PredictInput(BaseModel):
    session_id: Optional[str] = Field(alias="sessionId", default=None)
    user_id: Optional[str] = Field(alias="userId", default=None)
    response_count: int = Field(alias="responseCount", default=0)
    success_rate: float = Field(alias="successRate", default=0)
    avg_response_time: float = Field(alias="avgResponseTime", default=0)

    model_config = {"populate_by_name": True}


class InsightsInput(BaseModel):
    topic: str = "General"
    success_rate: float = Field(alias="successRate")
    avg_response_time: float = Field(alias="avgResponseTime", default=0)
    engagement: str = "medium"
    comprehension_score: float = Field(alias="comprehensionScore", default=0)

    model_config = {"populate_by_name": True}


class GenerateQuizInput(BaseModel):
    topic: str
    difficulty: int = 3
    question_count: int = Field(alias="questionCount", default=5)
    types: list[str] = ["multiple_choice", "true_false"]

    model_config = {"populate_by_name": True}


class ChatInput(BaseModel):
    message: str
    context: dict = {}


class RevisionPlanInput(BaseModel):
    topics_progress: list[dict] = Field(alias="topicsProgress", default=[])
    weak_topics: list[str] = Field(alias="weakTopics", default=[])
    days: int = 3

    model_config = {"populate_by_name": True}


class ExplainAnswerInput(BaseModel):
    question_text: str = Field(alias="questionText")
    student_answer: str = Field(alias="studentAnswer")
    correct_answer: str = Field(alias="correctAnswer")
    explanation: Optional[str] = None

    model_config = {"populate_by_name": True}


class ReportGenerateInput(BaseModel):
    session_id: str = Field(alias="sessionId")
    topic: Optional[str] = None
    subject: Optional[str] = None
    stats: dict = {}
    question_count: int = Field(alias="questionCount", default=0)
    participant_count: int = Field(alias="participantCount", default=0)
    responses: list[dict] = []

    model_config = {"populate_by_name": True}
