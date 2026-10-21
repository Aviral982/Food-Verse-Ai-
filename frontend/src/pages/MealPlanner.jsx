import React, { useState } from 'react';
import {
  CalendarDays,
  Activity,
  AlertCircle,
  CheckCircle2,
  Droplet,
  Flame,
  Dna,
  Wheat,
  Clock,
  Sparkles,
  RefreshCw,
  Info,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { api, getErrorMessage } from '../utils/api';

export default function MealPlanner() {
  const [formData, setFormData] = useState({
    age: 28,
    gender: 'Male',
    height: 175,
    weight: 72,
    activity_level: 'Moderately active',
    health_conditions: '',
    health_goals: 'Weight Loss',
    diet_type: 'Balanced',
    cuisine_preference: 'Mediterranean',
    allergies: '',
    recent_diet_history: '',
    weight_target: 'Lose 3kg sustainably over 8 weeks',
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.age || !formData.height || !formData.weight) {
      setError('Please fill in valid age, height, and weight values.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await api.generateMealPlan({
        ...formData,
        age: Number(formData.age),
        height: Number(formData.height),
        weight: Number(formData.weight),
      });
      setResult(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const mealOrder = [
    { key: 'breakfast', label: 'Breakfast', time: '08:00 AM' },
    { key: 'mid_morning_snack', label: 'Mid-Morning Snack', time: '10:30 AM' },
    { key: 'lunch', label: 'Lunch', time: '01:00 PM' },
    { key: 'evening_snack', label: 'Evening Snack', time: '04:30 PM' },
    { key: 'dinner', label: 'Dinner', time: '07:30 PM' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Personalized Meal Planner
            </h1>
            <p className="text-sm text-slate-400">
              Calibrated daily nutrition with five timed meals, exact macronutrient ratios, and strict allergy prevention.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-5 space-y-5">
          <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-base font-semibold text-white">Biometrics & Lifestyle Parameters</h2>

            {/* Age, Gender */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Age (years) <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="number"
                  name="age"
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-blue-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-blue-500/50"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            {/* Height & Weight */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Height (cm) <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="number"
                  name="height"
                  min="50"
                  max="260"
                  value={formData.height}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-blue-500/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Weight (kg) <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="number"
                  name="weight"
                  min="20"
                  max="350"
                  value={formData.weight}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-blue-500/50"
                />
              </div>
            </div>

            {/* Activity Level & Goals */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Activity Level
                </label>
                <select
                  name="activity_level"
                  value={formData.activity_level}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-blue-500/50"
                >
                  <option value="Sedentary">Sedentary (Desk Job)</option>
                  <option value="Lightly active">Lightly Active (1-2x/wk)</option>
                  <option value="Moderately active">Moderately Active (3-5x/wk)</option>
                  <option value="Very active">Very Active (6-7x/wk)</option>
                  <option value="Extremely active">Extremely Active (Athlete)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Health & Fitness Goal
                </label>
                <select
                  name="health_goals"
                  value={formData.health_goals}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-blue-500/50"
                >
                  <option value="Weight Loss">Weight Loss (Caloric Deficit)</option>
                  <option value="Muscle Gain">Muscle Gain (Hypertrophy)</option>
                  <option value="Maintenance">Maintenance & Vitality</option>
                  <option value="Heart Health">Cardiovascular / Heart Health</option>
                  <option value="Endurance">Endurance & Stamina</option>
                </select>
              </div>
            </div>

            {/* Diet Type & Cuisine */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Diet Type
                </label>
                <select
                  name="diet_type"
                  value={formData.diet_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-blue-500/50"
                >
                  <option value="Balanced">Balanced (Omnivore)</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Mediterranean">Mediterranean</option>
                  <option value="Keto">Keto / High-Fat</option>
                  <option value="Low-Carb">Low-Carb</option>
                  <option value="Pescatarian">Pescatarian</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Cuisine Preference
                </label>
                <select
                  name="cuisine_preference"
                  value={formData.cuisine_preference}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-blue-500/50"
                >
                  <option value="Any">Any / Global</option>
                  <option value="Mediterranean">Mediterranean</option>
                  <option value="Asian">Asian / Stir-Fry</option>
                  <option value="Indian">Indian Cuisine</option>
                  <option value="Mexican">Mexican / Latin</option>
                  <option value="American">American Fresh</option>
                  <option value="Italian">Italian Light</option>
                </select>
              </div>
            </div>

            {/* Allergies - Critical */}
            <div>
              <label className="block text-xs font-medium text-rose-300 mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                Allergies & Intolerances (Crucial)
              </label>
              <input
                type="text"
                name="allergies"
                placeholder="e.g. Peanuts, Tree Nuts, Shellfish, Gluten, Lactose..."
                value={formData.allergies}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-rose-500/40 text-slate-100 text-xs focus:outline-none focus:border-rose-400 placeholder-slate-500"
              />
            </div>

            {/* Pre-existing conditions */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Health Conditions (Optional)
              </label>
              <input
                type="text"
                name="health_conditions"
                placeholder="e.g. Mild Hypertension, Pre-diabetes, None..."
                value={formData.health_conditions}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-blue-500/50 placeholder-slate-500"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-navy-950 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Calibrating Nutrition Plan...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Personalized Plan</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7">
          {error && (
            <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-semibold text-sm text-rose-200">Meal Plan Generation Error</h4>
                <p className="text-xs leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {!result && !error && !loading && (
            <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-500">
                <CalendarDays className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-white">No Meal Plan Formulated</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Configure your biometrics, target goals, and dietary restrictions on the left to synthesize your tailored daily plan.
              </p>
            </div>
          )}

          {loading && (
            <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full border-2 border-blue-500/20 border-t-blue-400 animate-spin" />
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white">Synthesizing Clinical Nutrition Plan</h3>
                <p className="text-xs text-slate-400">
                  Calculating Basal Metabolic Rate (BMR), Total Daily Energy Expenditure (TDEE), and mapping micronutrient targets...
                </p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-5 animate-fadeIn">
              {/* Daily Caloric & Macro Targets */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-300 uppercase tracking-wider">
                      Target Daily Plan
                    </span>
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                      {result.target_daily_calories} <span className="text-slate-400 text-sm font-normal">kcal / day</span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      {result.plan_summary}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-900/80 px-4 py-2.5 rounded-xl border border-slate-700/60 shrink-0">
                    <Droplet className="w-5 h-5 text-cyan-400 shrink-0" />
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Hydration</span>
                      <span className="text-sm font-bold text-cyan-300 font-mono">
                        {result.hydration_target_liters} Liters
                      </span>
                    </div>
                  </div>
                </div>

                {/* Macro Target Pills */}
                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-800">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
                    <span className="text-[10px] uppercase font-semibold text-blue-300 block">Protein</span>
                    <span className="text-base font-bold text-white font-mono">{result.target_protein_g}g</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                    <span className="text-[10px] uppercase font-semibold text-amber-300 block">Carbs</span>
                    <span className="text-base font-bold text-white font-mono">{result.target_carbs_g}g</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
                    <span className="text-[10px] uppercase font-semibold text-purple-300 block">Fats</span>
                    <span className="text-base font-bold text-white font-mono">{result.target_fats_g}g</span>
                  </div>
                </div>
              </div>

              {/* Five Timed Meal Cards */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-semibold tracking-wider text-slate-400">
                  Daily Structured Meal Breakdown (5 Courses)
                </h4>

                {mealOrder.map(({ key, label, time }) => {
                  const meal = result.meals?.[key];
                  if (!meal) return null;

                  return (
                    <div
                      key={key}
                      className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                            {label}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-cyan-400" /> {time}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs font-mono">
                          <span className="text-rose-400">{meal.calories} kcal</span>
                          <span className="text-slate-600">|</span>
                          <span className="text-blue-400">{meal.protein_g}g P</span>
                          <span className="text-amber-400">{meal.carbs_g}g C</span>
                          <span className="text-purple-400">{meal.fats_g}g F</span>
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-white pt-1">{meal.name}</h3>
                      <p className="text-xs text-slate-300 leading-relaxed">{meal.prep_note}</p>

                      {meal.ingredients?.length > 0 && (
                        <div className="pt-1 flex flex-wrap gap-1 text-[11px] text-slate-400">
                          {meal.ingredients.map((ing, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                              {ing}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Weekly Recommendations & Dietary Tips */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.weekly_recommendations?.length > 0 && (
                  <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
                    <h4 className="text-xs uppercase font-semibold tracking-wider text-emerald-400">
                      Weekly Adherence Directives
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {result.weekly_recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.dietary_tips?.length > 0 && (
                  <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
                    <h4 className="text-xs uppercase font-semibold tracking-wider text-cyan-400">
                      Nutritional Guidance
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {result.dietary_tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-cyan-400 font-bold">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Medical Disclaimer */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-blue-300">Clinical Disclaimer:</strong> {result.disclaimer}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
