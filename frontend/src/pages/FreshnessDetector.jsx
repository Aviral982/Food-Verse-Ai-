import React, { useState } from 'react';
import {
  ShieldAlert,
  Upload,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Thermometer,
  ShieldX,
  Sparkles,
  RefreshCw,
  Info,
} from 'lucide-react';
import { api, getErrorMessage } from '../utils/api';
import AudioRecorderButton from '../components/AudioRecorderButton';

export default function FreshnessDetector() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [storageTime, setStorageTime] = useState('');
  const [storageType, setStorageType] = useState('Refrigerated');
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
    setStorageTime('');
    setStorageType('Refrigerated');
    setContext('');
    setAudioFile(null);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select or upload a food image to inspect.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('image', file);
    if (storageTime) formData.append('storage_time', storageTime);
    if (storageType) formData.append('storage_type', storageType);
    if (context.trim()) formData.append('context', context.trim());
    if (audioFile) formData.append('audio', audioFile);

    try {
      const data = await api.analyzeFreshness(formData);
      setResult(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Status visual badge styling
  const getStatusBadge = (classification) => {
    const val = (classification || '').toLowerCase();
    if (val.includes('fresh')) {
      return {
        bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
        dot: 'bg-emerald-400',
        icon: CheckCircle2,
      };
    } else if (val.includes('moderate')) {
      return {
        bg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
        dot: 'bg-amber-400',
        icon: AlertTriangle,
      };
    } else {
      return {
        bg: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
        dot: 'bg-rose-400',
        icon: ShieldX,
      };
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Freshness & Spoilage Detection
            </h1>
            <p className="text-sm text-slate-400">
              Inspect food items for fungal mold, oxidation, discoloration, and calculate safe consumption windows.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Column */}
        <div className="lg:col-span-5 space-y-5">
          <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
            <h2 className="text-base font-semibold text-white">Food Item & Storage Profile</h2>

            {/* Image Upload */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Food Image <span className="text-emerald-400">*</span>
              </label>

              {preview ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-900 group">
                  <img src={preview} alt="Freshness preview" className="w-full h-52 object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium">
                      Change Photo
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
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
                <label className="border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-900/40 hover:bg-slate-900/70">
                  <Upload className="w-10 h-10 text-slate-500 mb-3" />
                  <span className="text-sm font-medium text-slate-200">Upload produce or dish image</span>
                  <span className="text-xs text-slate-500 mt-1">Clear lighting improves fungal & mold detection</span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
              )}
            </div>

            {/* Storage Parameters */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Storage Condition
                </label>
                <select
                  value={storageType}
                  onChange={(e) => setStorageType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-amber-500/50"
                >
                  <option value="Refrigerated">Refrigerated (2°C - 4°C)</option>
                  <option value="Room Temperature">Room Temperature</option>
                  <option value="Pantry / Dry Storage">Pantry / Dry Storage</option>
                  <option value="Freezer">Freezer (-18°C)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Storage Duration
                </label>
                <input
                  type="text"
                  placeholder="e.g. 3 days, 1 week"
                  value={storageTime}
                  onChange={(e) => setStorageTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-amber-500/50 placeholder-slate-500"
                />
              </div>
            </div>

            {/* Context Notes */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Observed Odor / Texture Notes (Optional)
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="e.g. Purchased fresh on Monday, noticed slight softening on top side..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-amber-500/50 placeholder-slate-500"
              />
            </div>

            {/* Voice Input */}
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
                className="flex-1 py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-navy-950 shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Auditing Freshness...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Evaluate Spoilage</span>
                  </>
                )}
              </button>

              {(file || result || error) && (
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
                <h4 className="font-semibold text-sm text-rose-200">Freshness Audit Error</h4>
                <p className="text-xs leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {!result && !error && !loading && (
            <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-500">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-white">No Inspection Performed</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Upload a photo of perishable produce, dairy, meat, or leftovers to test for spoilage and safety.
              </p>
            </div>
          )}

          {loading && (
            <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full border-2 border-amber-500/20 border-t-amber-400 animate-spin" />
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white">Visual Spoilage Diagnostics</h3>
                <p className="text-xs text-slate-400">
                  Inspecting surface mycelium, cellular breakdown, and cross-referencing storage lifetime...
                </p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-5 animate-fadeIn">
              {/* Classification Banner */}
              {(() => {
                const badge = getStatusBadge(result.freshness_classification);
                const BadgeIcon = badge.icon;
                return (
                  <div className={`p-6 rounded-2xl border ${badge.bg} relative overflow-hidden`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${badge.dot}`} />
                          <span className="text-xs uppercase font-bold tracking-wider">
                            {result.freshness_classification} Condition
                          </span>
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">
                          {result.food_item}
                        </h2>
                        <div className="flex items-center gap-3 text-xs text-slate-300">
                          <span>Status: <strong className="text-white">{result.safety_status}</strong></span>
                          <span>•</span>
                          <span>Confidence: <strong className="font-mono text-emerald-300">{result.confidence}%</strong></span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-black/30 border border-white/10 shrink-0 flex items-center justify-center">
                        <BadgeIcon className="w-8 h-8" />
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Shelf Life & Recommendation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold uppercase">
                    <Clock className="w-4 h-4" /> Estimated Shelf Life
                  </div>
                  <p className="text-sm font-semibold text-white">
                    {result.estimated_shelf_life || 'Assess daily before consumption'}
                  </p>
                </div>

                <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-cyan-400 font-semibold uppercase">
                    <Thermometer className="w-4 h-4" /> Recommended Action
                  </div>
                  <p className="text-xs text-slate-200">
                    {result.recommendation}
                  </p>
                </div>
              </div>

              {/* Detected Signs */}
              {result.detected_signs && result.detected_signs.length > 0 && (
                <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2.5">
                  <h4 className="text-xs uppercase font-semibold tracking-wider text-slate-400">
                    Detected Visual Indicators
                  </h4>
                  <div className="space-y-1.5">
                    {result.detected_signs.map((sign, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{sign}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reasoning */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
                <h4 className="text-xs uppercase font-semibold tracking-wider text-slate-400">
                  Diagnostic Reasoning
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {result.reasoning}
                </p>
              </div>

              {/* Critical Safety Disclaimer */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-amber-300">Important Advisory:</strong> {result.disclaimer || 'Image-based freshness predictions are estimates and cannot detect invisible bacterial pathogens (e.g. Salmonella, Listeria, E. coli). Always smell and inspect texture carefully. When in doubt, do not consume.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
