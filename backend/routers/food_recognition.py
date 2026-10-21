from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel, Field
from backend.services.groq_service import groq_service
from backend.utils.file_handler import validate_and_read_image

router = APIRouter(prefix="/api/food-recognition", tags=["Food Recognition & Nutrition"])


class FoodRecognitionResponse(BaseModel):
    is_food: bool = Field(..., description="Whether food was detected in the image")
    food_name: Optional[str] = Field(None, description="Identified food or dish name")
    confidence: Optional[float] = Field(None, description="Recognition confidence percentage (0-100)")
    category: Optional[str] = Field(None, description="Food category (e.g. Main Dish, Salad, Snack)")
    serving_size: Optional[str] = Field(None, description="Estimated serving size")
    calories: Optional[float] = Field(None, description="Calories in kcal")
    protein: Optional[float] = Field(None, description="Protein in grams")
    carbohydrates: Optional[float] = Field(None, description="Carbohydrates in grams")
    fats: Optional[float] = Field(None, description="Total fats in grams")
    fiber: Optional[float] = Field(None, description="Dietary fiber in grams")
    sugar: Optional[float] = Field(None, description="Sugars in grams")
    health_score: Optional[int] = Field(None, description="Overall health score from 0 to 100")
    health_label: Optional[str] = Field(None, description="Health rating label")
    health_reasoning: Optional[str] = Field(None, description="Explanation for the health rating")
    healthier_alternatives: Optional[List[str]] = Field(default_factory=list, description="Suggestions for healthier alternatives")
    detected_ingredients: Optional[List[str]] = Field(default_factory=list, description="Visual ingredients detected")
    allergens: Optional[List[str]] = Field(default_factory=list, description="Potential allergens")
    message: Optional[str] = Field(None, description="Status or error message")


@router.post("/analyze", response_model=FoodRecognitionResponse)
async def analyze_food(
    image: UploadFile = File(..., description="Food image to analyze"),
    context: Optional[str] = Form(None, description="Optional text context or preparation notes"),
    audio: Optional[UploadFile] = File(None, description="Optional audio recording")
):
    """
    Analyzes an uploaded food image, identifies the food item, estimates macronutrients/calories,
    and provides health scoring with dietary recommendations.
    """
    image_bytes, mime_type = await validate_and_read_image(image)

    # Handle audio transcription if provided
    audio_context = ""
    if audio:
        try:
            audio_bytes = await audio.read()
            if len(audio_bytes) > 0:
                transcription = await groq_service.transcribe_audio(
                    audio_bytes, filename=audio.filename or "audio.webm"
                )
                if transcription:
                    audio_context = f" User voice note: '{transcription}'"
        except Exception:
            pass

    full_context = (context or "").strip() + audio_context

    system_prompt = (
        "You are an expert culinary AI nutritionist and food recognition specialist in FoodVerse AI. "
        "Analyze the uploaded image with rigorous accuracy. "
        "First check if the image depicts food, a beverage, or culinary ingredients. "
        "If it is NOT food (e.g. electronic device, person, car, animal, furniture, scenery), return JSON with is_food=false and a polite explanation in message. "
        "If it IS food, set is_food=true, identify the dish or food item, estimate realistic nutrition per serving, "
        "assign an objective health score (0-100), health label, reasoning, and list healthier alternatives and potential allergens. "
        "Output ONLY valid JSON adhering to the specified schema."
    )

    user_prompt = f"""
Analyze this food image.
Additional context from user: "{full_context if full_context else 'None provided'}"

Provide your response strictly in the following JSON format:
{{
  "is_food": true or false,
  "food_name": "Name of dish or null if not food",
  "confidence": 92.5,
  "category": "Main Dish / Salad / Dessert / Beverage / Snack",
  "serving_size": "e.g. 1 bowl (350g)",
  "calories": 450.0,
  "protein": 28.5,
  "carbohydrates": 42.0,
  "fats": 16.0,
  "fiber": 6.5,
  "sugar": 5.0,
  "health_score": 82,
  "health_label": "Nutritious & Balanced / Indulgent / Moderate / Low Nutrient",
  "health_reasoning": "Detailed nutritional breakdown explaining the score...",
  "healthier_alternatives": ["Alternative 1", "Alternative 2"],
  "detected_ingredients": ["Ingredient 1", "Ingredient 2"],
  "allergens": ["Gluten", "Dairy"],
  "message": "Summary or note"
}}
If is_food is false, all nutrition numbers can be null and provide explanation in message.
"""

    result = await groq_service.analyze_image(
        image_bytes=image_bytes,
        mime_type=mime_type,
        prompt=user_prompt,
        system_prompt=system_prompt
    )

    # Validate into Pydantic model
    try:
        return FoodRecognitionResponse(**result)
    except Exception as e:
        # Fallback if minor schema mismatch
        return FoodRecognitionResponse(
            is_food=result.get("is_food", True),
            food_name=result.get("food_name", "Unknown Dish"),
            confidence=float(result.get("confidence", 85.0)),
            category=result.get("category", "Food Item"),
            serving_size=result.get("serving_size", "1 serving"),
            calories=float(result.get("calories", 0.0)) if result.get("calories") is not None else None,
            protein=float(result.get("protein", 0.0)) if result.get("protein") is not None else None,
            carbohydrates=float(result.get("carbohydrates", 0.0)) if result.get("carbohydrates") is not None else None,
            fats=float(result.get("fats", 0.0)) if result.get("fats") is not None else None,
            fiber=float(result.get("fiber", 0.0)) if result.get("fiber") is not None else None,
            sugar=float(result.get("sugar", 0.0)) if result.get("sugar") is not None else None,
            health_score=int(result.get("health_score", 70)) if result.get("health_score") is not None else None,
            health_label=result.get("health_label", "Moderate"),
            health_reasoning=result.get("health_reasoning", "Analysis completed."),
            healthier_alternatives=result.get("healthier_alternatives", []),
            detected_ingredients=result.get("detected_ingredients", []),
            allergens=result.get("allergens", []),
            message=result.get("message")
        )
