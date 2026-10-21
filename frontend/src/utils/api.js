import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 90000, // 90 seconds for multimodal AI inference
  headers: {
    'Accept': 'application/json',
  },
});

export const getErrorMessage = (error) => {
  if (!error) return 'An unexpected error occurred.';
  if (error.response) {
    // Backend returned HTTP error
    const detail = error.response.data?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail.map((d) => d.msg || JSON.stringify(d)).join('; ');
    }
    return `Server error (${error.response.status}): ${error.response.statusText || 'Request failed'}`;
  } else if (error.request) {
    return 'Unable to connect to FoodVerse AI backend. Please verify the FastAPI server is running at ' + API_BASE_URL;
  } else {
    return error.message || 'Error formulating request.';
  }
};

export const api = {
  // System Health
  checkHealth: async () => {
    const res = await apiClient.get('/api/health');
    return res.data;
  },

  // Module 1: Food Recognition & Nutrition
  analyzeFood: async (formData) => {
    const res = await apiClient.post('/api/food-recognition/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // Module 2: Freshness & Spoilage Detection
  analyzeFreshness: async (formData) => {
    const res = await apiClient.post('/api/freshness-detector/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // Module 3: Restaurant Hygiene Monitoring
  analyzeHygiene: async (formData) => {
    const res = await apiClient.post('/api/hygiene-monitor/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // Module 4: Smart Kitchen Assistant
  generateRecipe: async (formData) => {
    const res = await apiClient.post('/api/kitchen-assistant/generate-recipe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // Module 5: Personalized Meal Planner
  generateMealPlan: async (payload) => {
    const res = await apiClient.post('/api/meal-planner/generate', payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    return res.data;
  },
};

export default api;
