from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, Base, get_db
from config import settings
import time
import os
# Import all routers
from routers import auth, auth_test, courses, materials, questions, assignments, learning, discussions, notifications, certificates, analytics, projects, ai_tutor
from test_ai_mock import router as mock_router
from webrtc_signaling import router as webrtc_router, manager
from livekit_service import router as livekit_router
from models import *  # Import all models
from error_handlers import setup_logging, setup_error_handlers, log_api_request, log_api_response

# Setup logging
os.makedirs("logs", exist_ok=True)
setup_logging()

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Education Platform API",
    description="AI-powered education platform for schools with project-based learning and real-time analytics",
    version="2.0.0"
)

# Setup error handlers
setup_error_handlers(app)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """记录所有请求和响应"""
    start_time = time.time()

    # 记录请求
    log_api_request(request)

    try:
        response = await call_next(request)

        # 记录响应
        duration_ms = (time.time() - start_time) * 1000
        log_api_response(request, response.status_code, duration_ms)

        return response

    except Exception as e:
        # 记录错误响应
        duration_ms = (time.time() - start_time) * 1000
        log_api_response(request, 500, duration_ms)
        raise

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(courses.router, prefix="/api/v1/courses", tags=["Courses"])
app.include_router(materials.router, prefix="/api/v1/materials", tags=["Materials"])
app.include_router(questions.router, prefix="/api/v1/questions", tags=["Questions"])
app.include_router(assignments.router, prefix="/api/v1/assignments", tags=["Assignments"])
app.include_router(learning.router, prefix="/api/v1/learning", tags=["Learning"])
app.include_router(discussions.router, prefix="/api/v1/discussions", tags=["Discussions"])
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["Notifications"])
app.include_router(certificates.router, prefix="/api/v1/certificates", tags=["Certificates"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["Analytics"])
app.include_router(projects.router, prefix="/api/v1/projects", tags=["Projects"])
app.include_router(ai_tutor.router, prefix="/api/v1/ai-tutor", tags=["AI Tutor - 24/7 Teaching Assistant"])
app.include_router(mock_router, tags=["Mock API - For Testing"])
app.include_router(webrtc_router, prefix="/api/v1/webrtc", tags=["WebRTC Video Conferencing"])
app.include_router(livekit_router, tags=["LiveKit Video Conferencing"])

@app.get("/")
def root():
    return {
        "message": "Education Platform API - AI-Powered Learning with Project-Based Approach",
        "version": "2.0.0",
        "features": [
            "AI-powered content analysis",
            "Intelligent question generation",
            "Automated answer grading",
            "Real-time analytics",
            "Project-based learning",
            "Team collaboration"
        ],
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health")
def health_check():
    """健康检查端点"""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "version": "2.0.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
