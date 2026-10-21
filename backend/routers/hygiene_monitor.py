from typing import Optional, List
import os
import io
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel, Field
from backend.services.groq_service import groq_service
from backend.utils.file_handler import validate_and_read_file, safe_delete_file, save_temp_file
from PIL import Image

router = APIRouter(prefix="/api/hygiene-monitor", tags=["Restaurant Kitchen Hygiene Monitor"])


class HygieneViolation(BaseModel):
    title: str = Field(..., description="Title of the hygiene violation")
    severity: str = Field(..., description="Severity level: Low, Medium, High, or Critical")
    location: str = Field(..., description="Observed location (e.g., Prep Counter, Sink, Floor, Storage)")
    explanation: str = Field(..., description="Detailed explanation of the safety or hygiene risk")
    remediation: str = Field(..., description="Specific corrective action required")


class HygieneResponse(BaseModel):
    overall_score: int = Field(..., description="Overall restaurant hygiene score (0-100)")
    hygiene_grade: str = Field(..., description="Hygiene letter grade: A, B, C, D, or Critical")
    cleanliness_score: int = Field(..., description="Surface and equipment cleanliness score (0-100)")
    food_handling_score: int = Field(..., description="Safe food handling and storage compliance (0-100)")
    ppe_sanitization_score: int = Field(..., description="Staff PPE, hairnets, glove use and sanitization (0-100)")
    cross_contamination_score: int = Field(..., description="Cross-contamination prevention rating (0-100)")
    summary: str = Field(..., description="Executive summary of the inspection")
    violations: List[HygieneViolation] = Field(default_factory=list, description="List of detected hygiene infractions")
    observations: List[str] = Field(default_factory=list, description="Key operational observations")
    recommendations: List[str] = Field(default_factory=list, description="Top actionable recommendations for staff")


def extract_frame_from_video(video_bytes: bytes) -> Optional[bytes]:
    """
    Attempts to extract a representative frame from video bytes using cv2 if installed.
    """
    try:
        import cv2
        import numpy as np

        # Write to temporary file for cv2 VideoCapture
        temp_path = None
        try:
            import tempfile
            with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as f:
                f.write(video_bytes)
                temp_path = f.name
            
            cap = cv2.VideoCapture(temp_path)
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            # Grab frame at 25% or first valid frame
            target_frame = max(0, total_frames // 4)
            cap.set(cv2.CAP_PROP_POS_FRAMES, target_frame)
            ret, frame = cap.read()
            cap.release()

            if ret and frame is not None:
                # Convert BGR to RGB
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                pil_img = Image.fromarray(rgb_frame)
                buf = io.BytesIO()
                pil_img.save(buf, format="JPEG", quality=85)
                return buf.getvalue()
        finally:
            if temp_path and os.path.exists(temp_path):
                os.remove(temp_path)
    except Exception:
        pass
    return None


@router.post("/analyze", response_model=HygieneResponse)
async def analyze_hygiene(
    file: UploadFile = File(..., description="Image or video of commercial/restaurant kitchen area"),
    context: Optional[str] = Form(None, description="Optional notes on kitchen station or inspection type")
):
    """
    Analyzes kitchen prep surfaces, food storage, sanitation stations, and staff practices
    to detect sanitation violations and calculate commercial hygiene compliance scores.
    """
    content, mime_type, category = await validate_and_read_file(file, allowed_types="image_or_video")

    frame_bytes = content
    frame_mime = mime_type

    if category == "video":
        extracted = extract_frame_from_video(content)
        if extracted:
            frame_bytes = extracted
            frame_mime = "image/jpeg"
        else:
            # Fallback if cv2 not available or frame extraction fails
            raise HTTPException(
                status_code=422,
                detail="Video upload received, but could not extract inspection frames. Please upload a high-resolution JPEG, PNG, or WEBP photo of the kitchen area."
            )

    system_prompt = (
        "You are an OSHA and FDA certified commercial kitchen health inspector in FoodVerse AI. "
        "Inspect this commercial kitchen photo for hygiene, cleanliness, pest vulnerability, "
        "cross-contamination risks (raw meat near ready-to-eat foods), sanitizer stations, "
        "temperature safety, personal protective equipment (gloves, hairnets, aprons), and general sanitation. "
        "Calculate an overall hygiene score (0-100) and letter grade (A for 90+, B for 80-89, C for 70-79, D for 60-69, Critical for <60). "
        "List all detected violations with severity (Low, Medium, High, Critical), precise location, explanation, and remediation steps. "
        "Be rigorous, realistic, and objective. Output ONLY valid JSON adhering to the specified schema."
    )

    user_prompt = f"""
Inspect this kitchen inspection photo.
Inspection Context: "{context if context else 'Standard commercial kitchen inspection'}"

Provide your hygiene audit strictly in this JSON format:
{{
  "overall_score": 84,
  "hygiene_grade": "B",
  "cleanliness_score": 82,
  "food_handling_score": 86,
  "ppe_sanitization_score": 80,
  "cross_contamination_score": 88,
  "summary": "Comprehensive executive summary of kitchen sanitation state...",
  "violations": [
    {{
      "title": "Uncovered container in prep line",
      "severity": "Medium",
      "location": "Central prep table upper shelf",
      "explanation": "Food items left open to airborne debris and dust during non-service hours.",
      "remediation": "Immediately label, date, and seal all prepped containers with food-safe lids."
    }}
  ],
  "observations": [
    "Stainless steel prep counters wiped down properly",
    "Handwashing sink accessible and stocked with soap"
  ],
  "recommendations": [
    "Mandate beard nets and hair restraints for all active line cooks",
    "Install digital temperature loggers on walk-in refrigeration units"
  ]
}}
"""

    result = await groq_service.analyze_image(
        image_bytes=frame_bytes,
        mime_type=frame_mime,
        prompt=user_prompt,
        system_prompt=system_prompt
    )

    try:
        return HygieneResponse(**result)
    except Exception:
        return HygieneResponse(
            overall_score=int(result.get("overall_score", 85)),
            hygiene_grade=result.get("hygiene_grade", "B"),
            cleanliness_score=int(result.get("cleanliness_score", 85)),
            food_handling_score=int(result.get("food_handling_score", 85)),
            ppe_sanitization_score=int(result.get("ppe_sanitization_score", 85)),
            cross_contamination_score=int(result.get("cross_contamination_score", 85)),
            summary=result.get("summary", "Kitchen hygiene inspection completed."),
            violations=result.get("violations", []),
            observations=result.get("observations", ["Kitchen surfaces observed"]),
            recommendations=result.get("recommendations", ["Maintain standard sanitization schedule"])
        )
