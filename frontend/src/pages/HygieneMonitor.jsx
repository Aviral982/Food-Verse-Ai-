import React, { useState } from 'react';
import {
  ShieldCheck,
  Upload,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Activity,
  Sparkles,
  RefreshCw,
  Video,
  Camera,
} from 'lucide-react';
import { api, getErrorMessage } from '../utils/api';

export default function HygieneMonitor() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isVideo, setIsVideo] = useState(false);
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const isVid = selected.type.startsWith('video/') || selected.name.endsWith('.mp4') || selected.name.endsWith('.mov');
      setIsVideo(isVid);
      setPreview(URL.createObjectURL(selected));
      setResult(null);
      setError(null);
    }
  };

  const handleReset = () => {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setIsVideo(false);
    setContext('');
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an image or video file of the kitchen area.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    if (context.trim()) formData.append('context', context.trim());

    try {
      const data = await api.analyzeHygiene(formData);
      setResult(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity) => {
    const s = (severity || '').toLowerCase();
    if (s === 'critical') {
      return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    } else if (s === 'high') {
      return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    } else if (s === 'medium') {
      return 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30';
    } else {
      return 'bg-slate-700/50 text-slate-300 border-slate-600/50';
    }
  };

  const getGradeColor = (grade) => {
    const g = (grade || '').toUpperCase();
    if (g === 'A') return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (g === 'B') return 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10';
    if (g === 'C') return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Restaurant Kitchen Hygiene Monitor
            </h1>
            <p className="text-sm text-slate-400">
              Commercial AI inspection for food prep cleanliness, cross-contamination, PPE adherence, and regulatory compliance.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Column */}
        <div className="lg:col-span-5 space-y-5">
          <form onSubmit={handleSubmit} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
            <h2 className="text-base font-semibold text-white">Inspection Media Upload</h2>

            {/* Media Upload Area */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Kitchen Photo or Video <span className="text-emerald-400">*</span>
              </label>

              {preview ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-900 group">
                  {isVideo ? (
                    <video src={preview} controls className="w-full h-52 object-cover" />
                  ) : (
                    <img src={preview} alt="Kitchen preview" className="w-full h-52 object-cover" />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <label className="cursor-pointer px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium">
                      Change File
                      <input type="file" accept="image/*,video/*" onChange={handleFileChange} className="hidden" />
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
                <label className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-900/40 hover:bg-slate-900/70">
                  <Camera className="w-10 h-10 text-slate-500 mb-3" />
                  <span className="text-sm font-medium text-slate-200">Upload kitchen area photo or video</span>
                  <span className="text-xs text-slate-500 mt-1">Supports JPG, PNG, WEBP, MP4, MOV (Max 25MB)</span>
                  <input type="file" accept="image/*,video/*" onChange={handleFileChange} className="hidden" />
                </label>
              )}
            </div>

            {/* Context */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Audit Station / Context (Optional)
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="e.g. Hot line station during lunch rush, prep counter sanitization audit..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-500/50 placeholder-slate-500"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={loading || !file}
                className="flex-1 py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-navy-950 shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Auditing Kitchen...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run Hygiene Audit</span>
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
                <h4 className="font-semibold text-sm text-rose-200">Audit Processing Error</h4>
                <p className="text-xs leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {!result && !error && !loading && (
            <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-500">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-white">No Kitchen Inspection Active</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Upload a photo or video clip of your commercial prep line, storage racks, or dishwashing zone.
              </p>
            </div>
          )}

          {loading && (
            <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-white">Commercial Sanitation Inspection</h3>
                <p className="text-xs text-slate-400">
                  {isVideo
                    ? 'Extracting representative inspection frames and auditing compliance...'
                    : 'Auditing prep surfaces, cross-contamination risks, and staff sanitation practices...'}
                </p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-5 animate-fadeIn">
              {/* Score & Grade Header */}
              <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 uppercase tracking-wider">
                      Commercial Hygiene Audit
                    </span>
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                      Score: <span className="text-cyan-400 font-mono">{result.overall_score}/100</span>
                    </h2>
                    <p className="text-xs text-slate-400 max-w-md">
                      {result.summary}
                    </p>
                  </div>

                  <div className={`p-4 rounded-2xl border ${getGradeColor(result.hygiene_grade)} flex flex-col items-center justify-center min-w-[90px]`}>
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Grade</span>
                    <span className="text-3xl font-extrabold font-mono">{result.hygiene_grade}</span>
                  </div>
                </div>
              </div>

              {/* Sub-Category Ratings */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="glass-panel p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Cleanliness</span>
                  <div className="text-lg font-bold text-white font-mono">{result.cleanliness_score}/100</div>
                </div>

                <div className="glass-panel p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Food Handling</span>
                  <div className="text-lg font-bold text-white font-mono">{result.food_handling_score}/100</div>
                </div>

                <div className="glass-panel p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">PPE & Gloves</span>
                  <div className="text-lg font-bold text-white font-mono">{result.ppe_sanitization_score}/100</div>
                </div>

                <div className="glass-panel p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Separation</span>
                  <div className="text-lg font-bold text-white font-mono">{result.cross_contamination_score}/100</div>
                </div>
              </div>

              {/* Violations List */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs uppercase font-semibold tracking-wider text-slate-400">
                    Detected Infractions & Hazards
                  </h4>
                  <span className="text-xs font-mono text-slate-400">
                    {result.violations?.length || 0} items
                  </span>
                </div>

                {result.violations && result.violations.length > 0 ? (
                  <div className="space-y-3">
                    {result.violations.map((violation, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-slate-200">{violation.title}</span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${getSeverityBadge(
                              violation.severity
                            )}`}
                          >
                            {violation.severity} Severity
                          </span>
                        </div>
                        <div className="text-slate-400">
                          <strong className="text-slate-300">Location:</strong> {violation.location}
                        </div>
                        <p className="text-slate-300">{violation.explanation}</p>
                        <div className="pt-1 text-emerald-400 flex items-start gap-1.5 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>Fix: {violation.remediation}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>No critical or high-risk hygiene infractions detected in this area.</span>
                  </div>
                )}
              </div>

              {/* Staff Recommendations */}
              {result.recommendations && result.recommendations.length > 0 && (
                <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
                  <h4 className="text-xs uppercase font-semibold tracking-wider text-cyan-400">
                    Corrective Directives for Kitchen Staff
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {result.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

