<<<<<<< HEAD
# FoodVerse AI — Multimodal Food Intelligence Platform

FoodVerse AI is an enterprise-grade multimodal artificial intelligence platform designed for comprehensive food analysis, visual freshness detection, commercial kitchen hygiene monitoring, smart culinary recipe formulation, and personalized clinical nutrition planning.

---

## 1. Project Overview & Features

FoodVerse AI integrates five specialized AI engines behind a unified, responsive dashboard built with React, Tailwind CSS, Framer Motion, and a high-performance FastAPI backend powered by Groq's low-latency LLaMA 3.2 Vision and LLaMA 3.3 models.

### Key Capabilities

1. **Food Recognition & Nutrition Analysis**
   - Instant visual identification of complex dishes and raw culinary ingredients.
   - Automatic macronutrient quantification: Calories (kcal), Protein (g), Carbohydrates (g), Total Fats (g), Fiber (g), and Sugar (g).
   - Health score rating (0–100) with diagnostic clinical reasoning, allergen alerts, and healthier dietary substitutions.
   - Multimodal support: accepts images, descriptive text notes, and recorded microphone voice context.
   - `NOT_FOOD` detection: rejects non-culinary photos without fabricating nutrition data.

2. **Freshness & Spoilage Detection**
   - High-resolution visual inspection for fungal mycelium, bacterial rot, surface discoloration, dehydration, and wilting.
   - Storage factor incorporation: calibrates remaining shelf life using storage temperature (Refrigerated, Room Temp, Freezer, Pantry) and elapsed days.
   - Visual status indicators: **Fresh** (green), **Moderate** (amber), and **Spoiled** (red).
   - Clear food safety advisory emphasizing visual analysis limitations.

3. **Restaurant Kitchen Hygiene Monitoring**
   - Automated commercial inspection simulating OSHA and FDA sanitary standards.
   - Comprehensive scoring: Cleanliness, Food Handling & Storage, PPE & Sanitization, and Cross-Contamination Risk.
   - Pinpoints detected infractions with severity level (Low, Medium, High, Critical), location, risk explanation, and remediation directives.
   - Supports both high-resolution inspection photos and video uploads.

4. **Smart Kitchen Assistant**
   - Generates chef-crafted recipes tailored to user-specified pantry ingredients or uploaded fridge photos.
   - Provides prep time, cook time, difficulty rating, precise ingredient measurements, numbered cooking steps, chef pro tips, and nutritional highlights.
   - Respects dietary constraints (Vegetarian, Vegan, Keto, Gluten-Free, High-Protein).

5. **Personalized Meal Planner**
   - Calculates daily caloric and macronutrient targets calibrated to biometrics (Age, Gender, Height, Weight, Activity Level, Fitness Goal).
   - Synthesizes 5 structured daily meals: **Breakfast**, **Mid-Morning Snack**, **Lunch**, **Evening Snack**, and **Dinner**.
   - Strict allergen safety compliance and daily hydration targets.
   - Includes weekly adherence tips and a clear medical advisory notice.

---

## 2. Technology Stack

### Frontend
- **Framework**: React 18 + Vite 5
- **Routing**: React Router DOM v6
- **Styling**: Tailwind CSS with custom dark navy palette (`#070a12`, `#0b1120`, `#0f172a`) and emerald/cyan accents
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **HTTP Client**: Axios with centralized error handling and timeout interceptors
- **Audio Recording**: Web Audio MediaRecorder API (`frontend/src/utils/audioRecorder.js`)

### Backend
- **Framework**: Python 3.9+ / FastAPI
- **Server**: Uvicorn ASGI
- **Data Validation**: Pydantic v2
- **Multipart Uploads**: `python-multipart`
- **Environment**: `python-dotenv`
- **Image Processing**: Pillow (PIL), NumPy
- **AI Engine**: Groq SDK (`groq`) using:
  - Vision: `llama-3.2-11b-vision-preview`
  - Text & Reasoning: `llama-3.3-70b-versatile`
  - Audio Transcription: `whisper-large-v3`

---

## 3. Project Structure

```
Fodd-verse-Ai/
├── backend/
│   ├── main.py                     # FastAPI app instance, CORS, routes & health check
│   ├── config.py                   # Centralized configuration & environment loader
│   ├── requirements.txt            # Python dependencies
│   ├── .env.example                # Backend environment template
│   ├── services/
│   │   ├── __init__.py
│   │   └── groq_service.py         # Groq client wrapper, JSON extraction & Whisper
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── food_recognition.py     # Module 1: Food & Nutrition Analysis
│   │   ├── freshness_detector.py   # Module 2: Freshness & Spoilage Detection
│   │   ├── hygiene_monitor.py      # Module 3: Commercial Kitchen Hygiene Monitor
│   │   ├── kitchen_assistant.py    # Module 4: Smart Kitchen Assistant
│   │   └── meal_planner.py         # Module 5: Personalized Meal Planner
│   ├── utils/
│   │   ├── __init__.py
│   │   └── file_handler.py         # File validation, mime checking & temp file cleanup
│   └── tests/
│       └── test_api.py             # Integration test suite for validation & error flows
│
├── frontend/
│   ├── index.html                  # HTML5 entry with Inter font
│   ├── package.json                # Dependencies & build scripts
│   ├── vite.config.js              # Vite bundler configuration
│   ├── tailwind.config.js          # Dark navy theme & accent extensions
│   ├── postcss.config.js
│   ├── vercel.json                 # Vercel SPA routing
│   ├── .env.example                # Frontend environment template
│   └── src/
│       ├── main.jsx                # React root mount
│       ├── App.jsx                 # App routing configuration
│       ├── index.css               # Global CSS & Tailwind layers
│       ├── components/
│       │   ├── Layout.jsx          # Dark navy sidebar & top navigation bar
│       │   └── AudioRecorderButton.jsx # Interactive voice context capture
│       ├── pages/
│       │   ├── Dashboard.jsx       # Main landing dashboard with system status
│       │   ├── FoodRecognition.jsx # Module 1 UI
│       │   ├── FreshnessDetector.jsx # Module 2 UI
│       │   ├── HygieneMonitor.jsx  # Module 3 UI
│       │   ├── KitchenAssistant.jsx# Module 4 UI
│       │   └── MealPlanner.jsx     # Module 5 UI
│       └── utils/
│           ├── api.js              # Centralized Axios client & API helpers
│           └── audioRecorder.js    # Browser Web Audio MediaRecorder utility
│
├── Procfile                        # Backend process config for Render / Railway / Heroku
├── render.yaml                     # Render infrastructure blueprint
├── vercel.json                     # Root Vercel deployment configuration
├── .gitignore                      # Git exclusion rules
├── .env.example                    # Unified root environment template
└── README.md                       # Comprehensive documentation
```

---

## 4. Verified API Endpoints

All endpoints have been implemented and verified via automated integration tests:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Operational status and API metadata |
| `GET` | `/health` / `/api/health` | System health and Groq AI connectivity check |
| `GET` | `/docs` | Interactive Swagger API documentation |
| `POST` | `/api/food-recognition/analyze` | Food identification, macro calculations, health score |
| `POST` | `/api/freshness-detector/analyze`| Visual spoilage, shelf life, and safety assessment |
| `POST` | `/api/hygiene-monitor/analyze` | Commercial kitchen sanitary inspection & score |
| `POST` | `/api/kitchen-assistant/generate-recipe` | Dynamic recipe generation from ingredients/photos |
| `POST` | `/api/meal-planner/generate` | Calibrated 5-meal daily dietary planner |

---

## 5. Prerequisites

- **Python**: Version 3.9+ (tested with 3.9.6)
- **Node.js**: Version 18+ (tested with v24.22.1) & npm
- **Groq API Key**: Free API key from [Groq Console](https://console.groq.com/keys)

---

## 6. Local Installation & Startup

### Step 1: Clone or Navigate to the Repository
```bash
cd /Users/aviral/Documents/Fodd-verse-Ai
```

### Step 2: Backend Setup
```bash
# 1. Create a Python virtual environment
python3 -m venv backend/venv

# 2. Activate the virtual environment
source backend/venv/bin/activate

# 3. Install required Python packages
pip install -r backend/requirements.txt

# 4. Configure environment variables
cp backend/.env.example backend/.env
# Edit backend/.env and add your GROQ_API_KEY:
# GROQ_API_KEY=gsk_your_actual_key_here

# 5. Start the FastAPI backend
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
The backend will be live at: **`http://localhost:8000`**  
Interactive API Docs: **`http://localhost:8000/docs`**

### Step 3: Frontend Setup
In a new terminal window:
```bash
cd /Users/aviral/Documents/Fodd-verse-Ai/frontend

# 1. Install frontend packages
npm install

# 2. Configure frontend environment
cp .env.example .env

# 3. Start the Vite development server
npm run dev
```
The frontend dashboard will be live at: **`http://localhost:5173`**

---

## 7. Testing & Verification

### Run Automated Backend Integration Tests
```bash
PYTHONPATH=. backend/venv/bin/python3 backend/tests/test_api.py
```
This tests:
- Root & health endpoints
- Validation of file sizes, unsupported file formats (.txt, empty bytes)
- Pydantic schema validation for all endpoints
- Proper HTTP 503 response when Groq API credentials need configuration

### Run Frontend Production Build
```bash
npm run build --prefix frontend
```
Verifies zero JSX errors, full Vite module tree resolution, and Tailwind CSS output.

---

## 8. Deployment Instructions

### Deploy Frontend to Vercel
1. Push your repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: complete FoodVerse AI full-stack platform"
   git remote add origin https://github.com/<your-username>/FoodVerse-AI.git
   git push -u origin main
   ```
2. Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Set the **Root Directory** to `frontend` (or leave as root; both `vercel.json` files are configured).
5. In **Environment Variables**, add:
   - `VITE_API_BASE_URL`: The URL of your deployed backend (e.g., `https://foodverse-backend.onrender.com`).
6. Click **Deploy**. Vercel will build and provide a live production URL.

### Deploy Backend to Render / Railway / Fly.io

#### Option A: Render
1. In [Render Dashboard](https://dashboard.render.com), click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure the settings:
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
4. In **Environment Variables**, add:
   - `GROQ_API_KEY`: Your Groq API key (`gsk_...`)
   - `GROQ_VISION_MODEL`: `llama-3.2-11b-vision-preview`
   - `GROQ_TEXT_MODEL`: `llama-3.3-70b-versatile`
   - `GROQ_AUDIO_MODEL`: `whisper-large-v3`
   - `ENVIRONMENT`: `production`
5. Click **Create Web Service**.

#### Option B: Railway
1. In [Railway](https://railway.app), click **New Project** → **Deploy from GitHub repo**.
2. Railway detects the `Procfile` automatically.
3. Add `GROQ_API_KEY` under the service's **Variables** tab.

---

## 9. Known Limitations & Safety Advisories

1. **Food Safety Estimation**: AI visual analysis detects visible indicators of spoilage (such as mycelial molds, oxidation, browning, and cellular collapse). However, visual inspection alone cannot detect microscopic, odorless bacterial toxins (e.g., *Staphylococcus enterotoxin*, *Salmonella*, *Clostridium botulinum*). Always prioritize physical inspection of odor and texture; if unsure, discard the item.
2. **Nutritional Approximations**: Calorie and macronutrient estimations are calculated using AI visual volume heuristics. Actual nutritional values may differ depending on unseen cooking oils, sugars, and exact portion weight.
3. **Clinical Advice**: The personalized meal planner provides nutritional guidelines for educational and personal health tracking only. Users with severe metabolic conditions (e.g. Type 1 Diabetes, advanced renal disease) should consult their physician or a registered dietitian.
4. **Live AI Verification**: To enable live AI inferences, set a valid `GROQ_API_KEY` in `backend/.env`. When no key is set, the system safely returns descriptive `503 Service Unavailable` responses explaining setup instructions.

=======
# Food-Verse-Ai-
SmartBridge
>>>>>>> 53ce9d0c962f2794de97bd997b3a5a8c52ead85a
