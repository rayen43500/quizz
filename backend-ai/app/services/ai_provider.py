import json
import re
from app.config import settings


async def call_ai(system_prompt: str, user_prompt: str) -> str:
    if settings.ai_provider == "gemini" and settings.gemini_api_key:
        return await _call_gemini(system_prompt, user_prompt)
    if settings.openai_api_key:
        return await _call_openai(system_prompt, user_prompt)
    return _fallback_response(user_prompt)


async def _call_openai(system_prompt: str, user_prompt: str) -> str:
    from openai import AsyncOpenAI

    client = AsyncOpenAI(api_key=settings.openai_api_key)
    response = await client.chat.completions.create(
        model=settings.openai_model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.7,
        max_tokens=1500,
    )
    return response.choices[0].message.content or ""


async def _call_gemini(system_prompt: str, user_prompt: str) -> str:
    import google.generativeai as genai

    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel(settings.gemini_model)
    response = model.generate_content(f"{system_prompt}\n\n{user_prompt}")
    return response.text or ""


def _fallback_response(user_prompt: str) -> str:
    return json.dumps({
        "summary": "AI provider not configured. Using local analytics only.",
        "recommendations": [
            "Review concepts with concrete examples",
            "Encourage group discussion",
            "Provide formative feedback",
        ],
        "misunderstoodConcepts": ["Review core material"],
        "message": "Students may need additional support. Consider simpler examples.",
    })


def parse_json_from_ai(text: str) -> dict:
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{[\s\S]*\}", text)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass
    return {"raw": text}
