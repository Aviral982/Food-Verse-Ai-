import React, { useState } from 'react';
import {
  ChefHat,
  Upload,
  AlertCircle,
  CheckCircle2,
  Clock,
  Users,
  Utensils,
  Sparkles,
  RefreshCw,
  Camera,
  Lightbulb,
} from 'lucide-react';
import { api, getErrorMessage } from '../utils/api';

export default function KitchenAssistant() {
  const [ingredients, setIngredients] = useState('');
  const [dietaryPreferences, setDietaryPreferences] = useState('');
  const [servings, setServings] = useState(2);
  const [cookingTime, setCookingTime] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setResult(null);
      setError(null);
    }
  };

  const handleReset = () => {
    setIngredients('');
    setDietaryPreferences('');
    setServings(2);
    setCookingTime('');
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ingredients.trim() && !file) {
      setError('Please provide ingredients text or upload a photo of your fridge/pantry.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    if (ingredients.trim()) formData.append('ingredients', ingredients.trim());
    if (dietaryPreferences.trim()) formData.append('dietary_preferences', dietaryPreferences.trim());
    formData.append('servings', servings.toString());
    if (cookingTime.trim()) formData.append('cooking_time_limit', cookingTime.trim());
    if (file) formData.append('image', file);

    try {
      const data = await api.generateRecipe(formData);
      setResult(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Smart Kitchen Assistant
            </h1>
            <p className="text-sm text-slate-400">
              Transform random pantry ingredients or fridge photos into chef-crafted, step-by-step recipes.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Column */}
        <div className="lg:col-span-5 space-y-5">
          <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-base font-semibold text-white">Recipe Parameters</h2>

            {/* Ingredients Input */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Available Ingredients / Desired Dish
              </label>
              <textarea
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                placeholder="e.g. Eggs, cherry tomatoes, spinach, leftover jasmine rice, olive oil, garlic..."
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-purple-500/60"
              />
            </div>

            {/* Optional Photo of Ingredients */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Or Upload Pantry / Fridge Photo (Optional)
              </label>
              {preview ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-900 group">
                  <img src={preview} alt="Ingredients Preview" className="w-full h-36 object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium">
                      Change Photo
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        if (preview) URL.revokeObjectURL(preview);
                        setPreview(null);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label className="border border-dashed border-slate-700 hover:border-purple-500/50 rounded-xl p-4 flex items-center justify-center gap-3 cursor-pointer transition-colors bg-slate-900/40 hover:bg-slate-900/70">
                  <Camera className="w-5 h-5 text-slate-400" />
                  <span className="text-xs text-slate-300">Upload photo of ingredients</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              )}
            </div>

            {/* Dietary Preferences & Servings */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Dietary Needs
                </label>
                <select
                  value={dietaryPreferences}
                  onChange={(e) => setDietaryPreferences(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-purple-500/50"
                >
                  <option value="">No Restrictions</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Gluten-Free">Gluten-Free</option>
                  <option value="Keto">Keto / Low-Carb</option>
                  <option value="High-Protein">High Protein</option>
                  <option value="Dairy-Free">Dairy-Free</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Servings
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={servings}
                  onChange={(e) => setServings(parseInt(e.target.value) || 2)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>

            {/* Time constraint */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Max Cooking Time (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 20 mins, under 30 mins"
                value={cookingTime}
                onChange={(e) => setCookingTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-purple-500/50 placeholder-slate-500"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={loading || (!ingredients.trim() && !file)}
                className="flex-1 py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-purple-500 to-emerald-500 hover:from-purple-600 hover:to-emerald-600 text-navy-950 shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Crafting Recipe...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Recipe</span>
                  </>
                )}
              </button>

              {(ingredients || file || result || error) && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-3 rounded-xl text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7">
          {error && (
            <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-semibold text-sm text-rose-200">Recipe Formulation Error</h4>
                <p className="text-xs leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {!result && !error && !loading && (
            <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-500">
                <ChefHat className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-white">No Recipe Formulated</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Enter your available ingredients or upload a photo to generate an instant chef-crafted dish.
              </p>
            </div>
          )}

          {loading && (
            <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full border-2 border-purple-500/20 border-t-purple-400 animate-spin" />
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white">Formulating Culinary Architecture</h3>
                <p className="text-xs text-slate-400">
                  Matching ingredient flavor pairings, calibrating cooking times, and writing numbered steps...
                </p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-5 animate-fadeIn">
              {/* Recipe Title & Overview */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative overflow-hidden space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-300">
                    {result.cuisine || 'Chef Special'}
                  </span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                    Difficulty: {result.difficulty}
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {result.dish_name}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {result.description}
                </p>

                {/* Quick Stats Pill */}
                <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-400 border-t border-slate-800/80">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" /> Prep: <strong className="text-slate-200">{result.prep_time}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> Cook: <strong className="text-slate-200">{result.cook_time}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-400" /> Servings: <strong className="text-slate-200">{result.servings}</strong>
                  </span>
                </div>
              </div>

              {/* Ingredients List */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-xs uppercase font-semibold tracking-wider text-slate-400 flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-purple-400" /> Required Ingredients
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-200">
                  {result.ingredients?.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-purple-400 font-bold">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Numbered Preparation Steps */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-xs uppercase font-semibold tracking-wider text-slate-400">
                  Step-by-Step Preparation Instructions
                </h4>
                <div className="space-y-3">
                  {result.instructions?.map((step, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-200">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-bold font-mono shrink-0 text-xs">
                        {i + 1}
                      </span>
                      <p className="leading-relaxed pt-0.5">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chef Tips & Nutritional Highlights */}
              {(result.chef_tips?.length > 0 || result.nutritional_highlights) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.chef_tips?.length > 0 && (
                    <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold uppercase">
                        <Lightbulb className="w-4 h-4" /> Chef's Pro Tips
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {result.chef_tips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-amber-400">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.nutritional_highlights && (
                    <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold uppercase">
                        <Sparkles className="w-4 h-4" /> Nutrition Highlights
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {result.nutritional_highlights}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
