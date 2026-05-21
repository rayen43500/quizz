from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import analytics, ai, reports

app = FastAPI(
    title="Quisi AI Service",
    description="Educational analytics and AI orchestration",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


async def verify_internal_key(x_internal_key: str = Header(None)):
    if x_internal_key != settings.internal_key:
        raise HTTPException(status_code=403, detail="Invalid internal key")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "quisi-ai", "provider": settings.ai_provider}


app.include_router(analytics.router, prefix="/api/v1/analytics", dependencies=[Depends(verify_internal_key)])
app.include_router(ai.router, prefix="/api/v1/ai", dependencies=[Depends(verify_internal_key)])
app.include_router(reports.router, prefix="/api/v1/reports", dependencies=[Depends(verify_internal_key)])
