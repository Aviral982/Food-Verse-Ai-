import io
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "FoodVerse AI"
    assert data["status"] == "operational"
    print("✓ Root endpoint test passed")

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "groq_ai" in data
    print("✓ Health endpoint test passed")

def test_food_recognition_validation():
    # Test missing file
    res = client.post("/api/food-recognition/analyze")
    assert res.status_code == 422
    
    # Test invalid file type
    fake_txt = io.BytesIO(b"not an image")
    res = client.post(
        "/api/food-recognition/analyze",
        files={"image": ("test.txt", fake_txt, "text/plain")}
    )
    assert res.status_code == 400
    assert "Unsupported image type" in res.json()["detail"]
    print("✓ Food recognition validation tests passed")

def test_freshness_detector_validation():
    # Test missing file
    res = client.post("/api/freshness-detector/analyze")
    assert res.status_code == 422

    # Test invalid file type
    fake_txt = io.BytesIO(b"not an image")
    res = client.post(
        "/api/freshness-detector/analyze",
        files={"image": ("test.txt", fake_txt, "text/plain")}
    )
    assert res.status_code == 400
    print("✓ Freshness detector validation tests passed")

def test_hygiene_monitor_validation():
    # Test missing file
    res = client.post("/api/hygiene-monitor/analyze")
    assert res.status_code == 422

    # Test invalid file type
    fake_txt = io.BytesIO(b"not an image")
    res = client.post(
        "/api/hygiene-monitor/analyze",
        files={"file": ("test.txt", fake_txt, "text/plain")}
    )
    assert res.status_code == 400
    print("✓ Hygiene monitor validation tests passed")

def test_kitchen_assistant_validation():
    # Test empty request
    res = client.post("/api/kitchen-assistant/generate-recipe")
    assert res.status_code == 400
    assert "Please provide ingredient details" in res.json()["detail"]
    print("✓ Kitchen assistant validation tests passed")

def test_meal_planner_validation():
    # Test invalid age (< 1)
    invalid_payload = {
        "age": 0,
        "gender": "Male",
        "height": 175,
        "weight": 70,
        "activity_level": "Sedentary",
        "health_goals": "Weight Loss",
        "diet_type": "Balanced"
    }
    res = client.post("/api/meal-planner/generate", json=invalid_payload)
    assert res.status_code == 422
    print("✓ Meal planner validation tests passed")

def test_unconfigured_ai_handling():
    # Test realistic 503 response when Groq API key is placeholder
    fake_img = io.BytesIO(b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xff\xdb\x00C\x00")
    res = client.post(
        "/api/food-recognition/analyze",
        files={"image": ("sample.jpg", fake_img, "image/jpeg")}
    )
    assert res.status_code == 503
    assert "GROQ_API_KEY" in res.json()["detail"]
    print("✓ Unconfigured AI key handling verified: returns 503 with exact instructions")

if __name__ == "__main__":
    test_root()
    test_health()
    test_food_recognition_validation()
    test_freshness_detector_validation()
    test_hygiene_monitor_validation()
    test_kitchen_assistant_validation()
    test_meal_planner_validation()
    test_unconfigured_ai_handling()
    print("\nALL API VALIDATION & FAILURE TESTS PASSED!")
