from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel, Field
from backend.services.groq_service import groq_service
from backend.utils.file_handler import validate_and_read_image

router = APIRouter(prefix="/api/kitchen-assistant", tags=["Smart Kitchen Assistant"])


class RecipeResponse(BaseModel):
    dish_name: str = Field(..., description="Name of the recipe")
    description: str = Field(..., description="Engaging culinary description")
    cuisine: str = Field(..., description="Cuisine type or culinary tradition")
    prep_time: str = Field(..., description="Preparation time (e.g. 15 mins)")
    cook_time: str = Field(..., description="Cooking time (e.g. 25 mins)")
    servings: int = Field(..., description="Number of portions/servings")
    difficulty: str = Field(..., description="Difficulty: Easy, Intermediate, or Advanced")
    ingredients: List[str] = Field(..., description="List of ingredients with exact measurements")
    instructions: List[str] = Field(..., description="Numbered step-by-step cooking steps")
    chef_tips: List[str] = Field(default_factory=list, description="Pro tips, substitutions, or safety notes")
    nutritional_highlights: Optional[str] = Field(None, description="Key nutritional benefits or macro highlights")


@router.post("/generate-recipe", response_model=RecipeResponse)
async def generate_recipe(
    ingredients: Optional[str] = Form(None, description="Available ingredients or desired dish concept"),
    dietary_preferences: Optional[str] = Form(None, description="Dietary preference (e.g., Vegan, Gluten-Free, Keto, Low Sodium)"),
    servings: Optional[int] = Form(2, description="Target number of servings"),
    cooking_time_limit: Optional[str] = Form(None, description="Max time available (e.g. 30 mins)"),
    image: Optional[UploadFile] = File(None, description="Optional photo of pantry, fridge, or ingredients")
):
    """
    Generates a creative, nutritious, step-by-step recipe based on supplied ingredients,
    pantry photos, or specific culinary requests.
    """
    if not ingredients and not image:
        raise HTTPException(
            status_code=400,
            detail="Please provide ingredient details or upload an image of your ingredients."
        )

    system_prompt = (
        "You are an executive master chef and culinary nutritionist in FoodVerse AI. "
        "Create practical, appetizing, clear, and delicious recipes tailored precisely to the user's available ingredients, "
        "dietary restrictions, and serving requirements. "
        "Each step in the instructions should be distinct, clear, and actionable. "
        "Output strictly valid JSON matching the requested structure."
    )

    prompt = f"""
Create a customized recipe based on the following criteria:
- User ingredients / request: "{ingredients or 'Detect ingredients from the uploaded image'}"
- Dietary preferences: "{dietary_preferences or 'None specified'}"
- Servings: {servings or 2}
- Cooking time constraint: "{cooking_time_limit or 'Standard'}"

Respond strictly with a JSON object in this format:
{{
  "dish_name": "Tuscan White Bean & Garlic Skillet",
  "description": "A comforting, herb-infused skillet dish with crispy garlic, sun-dried tomatoes, and tender white beans.",
  "cuisine": "Mediterranean",
  "prep_time": "10 mins",
  "cook_time": "20 mins",
  "servings": 2,
  "difficulty": "Easy",
  "ingredients": [
    "1 can (15 oz) cannellini beans, rinsed and drained",
    "3 cloves garlic, thinly sliced",
    "2 tbsp extra virgin olive oil",
    "1/4 cup chopped sun-dried tomatoes",
    "2 cups fresh baby spinach",
    "1/4 tsp crushed red pepper flakes",
    "Salt and freshly cracked black pepper to taste"
  ],
  "instructions": [
    "Heat olive oil in a wide skillet over medium heat.",
    "Add sliced garlic and red pepper flakes; sauté for 1-2 minutes until fragrant and golden.",
    "Fold in drained cannellini beans and sun-dried tomatoes, cooking for 5 minutes.",
    "Stir in baby spinach until wilted, seasoning with salt and black pepper.",
    "Remove from heat and serve warm with crusty whole-grain bread."
  ],
  "chef_tips": [
    "Mash a portion of the beans with a fork to create a naturally creamy sauce.",
    "Top with toasted pine nuts or nutritional yeast for extra texture and umami."
  ],
  "nutritional_highlights": "Rich in plant-based fiber, iron, and heart-healthy monounsaturated fats."
}}
"""

    if image:
        image_bytes, mime_type = await validate_and_read_image(image)
        result = await groq_service.analyze_image(
            image_bytes=image_bytes,
            mime_type=mime_type,
            prompt=prompt,
            system_prompt=system_prompt
        )
    else:
        result = await groq_service.generate_json(
            prompt=prompt,
            system_prompt=system_prompt
        )

    try:
        return RecipeResponse(**result)
    except Exception:
        return RecipeResponse(
            dish_name=result.get("dish_name", "Chef's Special Recipe"),
            description=result.get("description", "A tasty dish prepared from your ingredients."),
            cuisine=result.get("cuisine", "Contemporary"),
            prep_time=result.get("prep_time", "15 mins"),
            cook_time=result.get("cook_time", "25 mins"),
            servings=int(result.get("servings", 2)),
            difficulty=result.get("difficulty", "Easy"),
            ingredients=result.get("ingredients", ["Fresh ingredients"]),
            instructions=result.get("instructions", ["Prepare ingredients", "Cook and serve"]),
            chef_tips=result.get("chef_tips", []),
            nutritional_highlights=result.get("nutritional_highlights")
        )
