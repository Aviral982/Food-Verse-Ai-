from datetime import datetime
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.config import settings
from backend.services.groq_service import groq_service

# Import routers
from backend.routers.food_recognition import router as food_recognition_router
from backend.routers.freshness_detector import router as freshness_detector_router
from backend.routers.hygiene_monitor import router as hygiene_monitor_router
from backend.routers.kitchen_assistant import router as kitchen_assistant_router
from backend.routers.meal_planner import router as meal_planner_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Multimodal AI platform for food recognition, freshness detection, kitchen hygiene monitoring, smart culinary assistance, and personalized nutrition planning.",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(food_recognition_router)
app.include_router(freshness_detector_router)
app.include_router(hygiene_monitor_router)
app.include_router(kitchen_assistant_router)
app.include_router(meal_planner_router)


@app.get("/", tags=["General"])
async def root():
    """
    Root endpoint verifying FoodVerse AI backend is operational.
    """
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "operational",
        "documentation": "/docs",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/health", tags=["Health"])
@app.get("/api/health", tags=["Health"])
async def health_check():
    """
    System health and AI service connectivity check.
    """
    groq_ready = groq_service.is_configured()
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "groq_ai": {
            "configured": groq_ready,
            "vision_model": settings.GROQ_VISION_MODEL,
            "text_model": settings.GROQ_TEXT_MODEL,
            "audio_model": settings.GROQ_AUDIO_MODEL
        },
        "timestamp": datetime.utcnow().isoformat()
    }


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "status_code": exc.status_code}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "detail": f"An unexpected server error occurred: {str(exc)}",
            "status_code": 500
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
