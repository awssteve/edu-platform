from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, Base, get_db
from config import settings
# Import all routers
from routers import auth, auth_test, courses, materials, questions, assignments, learning, discussions, notifications, certificates, analytics
from models import *  # Import all models

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Education Platform API",
    description="AI-powered education platform for schools",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.get("/")
def root():
    return {
        "message": "Education Platform API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status":"healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
