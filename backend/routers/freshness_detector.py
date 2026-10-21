from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel, Field
from backend.services.groq_service import groq_service
from backend.utils.file_handler import validate_and_read_image

router = APIRouter(prefix="/api/freshness-detector", tags=["Freshness & Spoilage Detection"])


class FreshnessResponse(BaseModel):
    food_item: str = Field(..., description="Identified food item")
    freshness_classification: str = Field(..., description="Classification: Fresh, Moderate, or Spoiled")
    confidence: float = Field(..., description="Model confidence score (0-100)")
    safety_status: str = Field(..., description="Safety status: Safe to Consume, Consume Promptly, or Unsafe - Do Not Consume")
    detected_signs: List[str] = Field(default_factory=list, description="Visual indicators observed")
    reasoning: str = Field(..., description="Detailed explanation of the visual and context analysis")
    recommendation: str = Field(..., description="Practical recommendation on storage or disposal")
    estimated_shelf_life: Optional[str] = Field(None, description="Estimated remaining shelf life")
    disclaimer: str = Field(
        default="Notice: AI image analysis provides visual estimates only and cannot detect microscopic bacterial, fungal, or toxin contamination. When in doubt regarding odor, texture, or safety, discard the food.",
        description="Health and food safety advisory"
    )


@router.post("/analyze", response_model=FreshnessResponse)
async def analyze_freshness(
    image: UploadFile = File(..., description="Image of food item to assess for freshness"),
    storage_time: Optional[str] = Form(None, description="Storage duration (e.g. 3 days, 1 week)"),
    storage_type: Optional[str] = Form(None, description="Storage condition: Refrigerated, Room Temperature, Pantry, Freezer"),
    audio: Optional[UploadFile] = File(None, description="Optional audio recording with context"),
    context: Optional[str] = Form(None, description="Optional text context")
):
    """
    Evaluates visual indicators of food freshness or spoilage (discoloration, mold, dehydration, wilting),
    incorporating storage environment and duration.
    """
    image_bytes, mime_type = await validate_and_read_image(image)

    audio_context = ""
    if audio:
        try:
            audio_bytes = await audio.read()
            if len(audio_bytes) > 0:
                transcription = await groq_service.transcribe_audio(
                    audio_bytes, filename=audio.filename or "audio.webm"
                )
                if transcription:
                    audio_context = f" Audio observation: '{transcription}'"
        except Exception:
            pass

    storage_info = []
    if storage_time:
        storage_info.append(f"Storage Time: {storage_time}")
    if storage_type:
        storage_info.append(f"Storage Environment: {storage_type}")
    if context:
        storage_info.append(f"Context: {context}")
    if audio_context:
        storage_info.append(audio_context)

    storage_str = "; ".join(storage_info) if storage_info else "No storage conditions provided"

    system_prompt = (
        "You are a food safety expert and bio-chemist specializing in food preservation and spoilage detection in FoodVerse AI. "
        "Analyze the visual condition of the food item in the image, considering the user's reported storage environment and duration. "
        "Categorize freshness strictly into one of three classifications: 'Fresh', 'Moderate', or 'Spoiled'. "
        "Assign safety_status strictly as one of: 'Safe to Consume', 'Consume Promptly', or 'Unsafe - Do Not Consume'. "
        "If there are any visible signs of mold, rot, extreme sliminess, or oxidation indicating danger, designate as 'Spoiled' and 'Unsafe - Do Not Consume'. "
        "Always emphasize prudent caution. Output ONLY valid JSON adhering to the specified format."
    )

    user_prompt = f"""
Inspect this food image for freshness and spoilage.
Storage details & context: {storage_str}

Provide your evaluation strictly as JSON matching this format:
{{
  "food_item": "Specific name of produce or food item",
  "freshness_classification": "Fresh / Moderate / Spoiled",
  "confidence": 94.0,
  "safety_status": "Safe to Consume / Consume Promptly / Unsafe - Do Not Consume",
  "detected_signs": [
    "Firm skin without blemishes",
    "Natural uniform coloration",
    "No visible mycelium or fungal colonies"
  ],
  "reasoning": "Thorough visual breakdown of why this classification was determined...",
  "recommendation": "Storage advice, cooking promptness, or proper safe disposal steps...",
  "estimated_shelf_life": "e.g. 4-5 days under refrigeration",
  "disclaimer": "AI image analysis provides visual estimates only and cannot detect microscopic bacterial, fungal, or toxin contamination. When in doubt regarding odor, texture, or safety, discard the food."
}}
"""

    result = await groq_service.analyze_image(
        image_bytes=image_bytes,
        mime_type=mime_type,
        prompt=user_prompt,
        system_prompt=system_prompt
    )

    try:
        return FreshnessResponse(**result)
    except Exception:
        return FreshnessResponse(
            food_item=result.get("food_item", "Food Item"),
            freshness_classification=result.get("freshness_classification", "Moderate"),
            confidence=float(result.get("confidence", 80.0)),
            safety_status=result.get("safety_status", "Consume Promptly"),
            detected_signs=result.get("detected_signs", ["Visual inspection completed"]),
            reasoning=result.get("reasoning", "Analysis concluded."),
            recommendation=result.get("recommendation", "Store properly in airtight refrigerated container."),
            estimated_shelf_life=result.get("estimated_shelf_life", "1-2 days"),
            disclaimer="Notice: AI image analysis provides visual estimates only and cannot detect microscopic bacterial, fungal, or toxin contamination. When in doubt regarding odor, texture, or safety, discard the food."
        )
