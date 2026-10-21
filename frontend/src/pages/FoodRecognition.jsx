import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Upload,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Flame,
  Dna,
  Wheat,
  Droplet,
  Heart,
  HelpCircle,
  RefreshCw,
  Info,
} from 'lucide-react';
import { api, getErrorMessage } from '../utils/api';
import AudioRecorderButton from '../components/AudioRecorderButton';

export default function FoodRecognition() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [context, setContext] = useState('');
  const [audioFile, setAudioFile] = useState(null);
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
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setContext('');
    setAudioFile(null);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select or drag an image of food to analyze.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('image', file);
    if (context.trim()) {
      formData.append('context', context.trim());
    }
    if (audioFile) {
      formData.append('audio', audioFile);
    }

    try {
      const data = await api.analyzeFood(formData);
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
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Food Recognition & Nutrition Analysis
            </h1>
            <p className="text-sm text-slate-400">
              Upload a meal photo to identify ingredients, calculate macronutrients, and receive an AI health audit.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Column */}
        <div className="lg:col-span-5 space-y-5">
          <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <span>Input Food Media</span>
            </h2>

            {/* Image Upload Area */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Food Image <span className="text-emerald-400">*</span>
              </label>

              {preview ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-900 group">
                  <img
                    src={preview}
                    alt="Food Preview"
                    className="w-full h-56 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium">
                      Change Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-900/40 hover:bg-slate-900/70">
                  <Upload className="w-10 h-10 text-slate-500 mb-3" />
                  <span className="text-sm font-medium text-slate-200">Click to upload or drag image here</span>
                  <span className="text-xs text-slate-500 mt-1">Supports JPG, PNG, WEBP (Max 25MB)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Optional Context Input */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Context / Notes (Optional)
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="e.g., Homemade salad with light olive oil dressing, estimated 200g portion..."
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500/60"
              />
            </div>

            {/* Audio Voice Note Context */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Voice Context (Optional)
              </label>
              <AudioRecorderButton
                onAudioCaptured={(audio) => setAudioFile(audio)}
                onAudioCleared={() => setAudioFile(null)}
                disabled={loading}
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={loading || !file}
                className="flex-1 py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-navy-950 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Food...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Identify & Analyze</span>
                  </>
                )}
              </button>

              {(file || result || error) && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-3 rounded-xl text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  Clear
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
                <h4 className="font-semibold text-sm text-rose-200">Analysis Error</h4>
                <p className="text-xs leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {!result && !error && !loading && (
            <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-500">
                <UtensilsCrossed className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-white">No Analysis Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Upload a food photo on the left and submit to view instant nutritional breakdown and health scores.
              </p>
            </div>
          )}

          {loading && (
            <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white">Multimodal Vision Processing</h3>
                <p className="text-xs text-slate-400">
                  Scanning dish textures, ingredients, and estimating macro-nutritional density...
                </p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-5 animate-fadeIn">
              {/* Not Food Alert */}
              {!result.is_food && (
                <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-start gap-3">
                  <Info className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-amber-200">Non-Food Item Detected</h4>
                    <p className="text-xs mt-1">
                      {result.message || 'The AI inspected the image and did not find food or culinary ingredients. Please upload a clear photo of food.'}
                    </p>
                  </div>
                </div>
              )}

              {result.is_food && (
                <>
                  {/* Dish Title & Health Score Banner */}
                  <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                          {result.category || 'Identified Dish'}
                        </span>
                        <h2 className="text-2xl font-bold text-white tracking-tight">
                          {result.food_name || 'Detected Meal'}
                        </h2>
                        <p className="text-xs text-slate-400">
                          Serving: <span className="text-slate-200">{result.serving_size || '1 portion'}</span>
                          {result.confidence && (
                            <> • Confidence: <span className="text-emerald-400 font-mono">{result.confidence}%</span></>
                          )}
                        </p>
                      </div>

                      {result.health_score !== null && result.health_score !== undefined && (
                        <div className="flex items-center gap-3 bg-slate-900/80 px-4 py-3 rounded-xl border border-slate-700/60 shrink-0">
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Health Score</span>
                            <span className="text-xs font-semibold text-emerald-400">{result.health_label || 'Rating'}</span>
                          </div>
                          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                            <span className="text-lg font-bold text-emerald-300 font-mono">
                              {result.health_score}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Macronutrient Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="glass-panel p-4 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-2 text-rose-400 text-xs font-medium mb-1">
                        <Flame className="w-4 h-4" /> Calories
                      </div>
                      <div className="text-xl font-bold text-white font-mono">
                        {result.calories !== null ? `${result.calories} kcal` : 'N/A'}
                      </div>
                    </div>

                    <div className="glass-panel p-4 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-2 text-blue-400 text-xs font-medium mb-1">
                        <Dna className="w-4 h-4" /> Protein
                      </div>
                      <div className="text-xl font-bold text-white font-mono">
                        {result.protein !== null ? `${result.protein}g` : 'N/A'}
                      </div>
                    </div>

                    <div className="glass-panel p-4 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-2 text-amber-400 text-xs font-medium mb-1">
                        <Wheat className="w-4 h-4" /> Carbs
                      </div>
                      <div className="text-xl font-bold text-white font-mono">
                        {result.carbohydrates !== null ? `${result.carbohydrates}g` : 'N/A'}
                      </div>
                    </div>

                    <div className="glass-panel p-4 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-2 text-purple-400 text-xs font-medium mb-1">
                        <Droplet className="w-4 h-4" /> Fats
                      </div>
                      <div className="text-xl font-bold text-white font-mono">
                        {result.fats !== null ? `${result.fats}g` : 'N/A'}
                      </div>
                    </div>

                    <div className="glass-panel p-4 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium mb-1">
                        <Heart className="w-4 h-4" /> Fiber
                      </div>
                      <div className="text-xl font-bold text-white font-mono">
                        {result.fiber !== null ? `${result.fiber}g` : 'N/A'}
                      </div>
                    </div>

                    <div className="glass-panel p-4 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-2 text-cyan-400 text-xs font-medium mb-1">
                        <Sparkles className="w-4 h-4" /> Sugars
                      </div>
                      <div className="text-xl font-bold text-white font-mono">
                        {result.sugar !== null ? `${result.sugar}g` : 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Health Reasoning */}
                  {result.health_reasoning && (
                    <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
                      <h4 className="text-xs uppercase font-semibold tracking-wider text-slate-400">
                        Nutritional Analysis
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {result.health_reasoning}
                      </p>
                    </div>
                  )}

                  {/* Ingredients & Allergens */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.detected_ingredients && result.detected_ingredients.length > 0 && (
                      <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
                        <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">
                          Detected Ingredients
                        </span>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {result.detected_ingredients.map((ing, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-xs border border-slate-700/60"
                            >
                              {ing}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.allergens && result.allergens.length > 0 && (
                      <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
                        <span className="text-xs uppercase font-semibold tracking-wider text-rose-400">
                          Potential Allergens
                        </span>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {result.allergens.map((all, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 text-xs border border-rose-500/30"
                            >
                              {all}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Healthier Alternatives */}
                  {result.healthier_alternatives && result.healthier_alternatives.length > 0 && (
                    <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
                      <h4 className="text-xs uppercase font-semibold tracking-wider text-emerald-400">
                        Healthier Alternatives & Swaps
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {result.healthier_alternatives.map((alt, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span>{alt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

