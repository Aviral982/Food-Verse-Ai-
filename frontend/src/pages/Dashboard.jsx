import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UtensilsCrossed,
  ShieldAlert,
  ShieldCheck,
  ChefHat,
  CalendarDays,
  Sparkles,
  ArrowRight,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Cpu,
  Layers,
} from 'lucide-react';
import { api } from '../utils/api';

const modules = [
  {
    title: 'Food Recognition & Nutrition',
    description: 'Instant visual identification of dishes, automatic macronutrient calculation, and clinical health scoring.',
    path: '/food-recognition',
    icon: UtensilsCrossed,
    color: 'from-emerald-500/20 to-emerald-500/5',
    border: 'border-emerald-500/30',
    iconColor: 'text-emerald-400',
    tag: 'Vision + Nutrition',
  },
  {
    title: 'Freshness & Spoilage Detector',
    description: 'Visual decomposition analysis, shelf-life estimation, and safety risk alerts based on storage conditions.',
    path: '/freshness-detector',
    icon: ShieldAlert,
    color: 'from-amber-500/20 to-amber-500/5',
    border: 'border-amber-500/30',
    iconColor: 'text-amber-400',
    tag: 'Food Safety',
  },
  {
    title: 'Restaurant Hygiene Monitor',
    description: 'Automated OSHA & FDA compliance audit for prep areas, cross-contamination risks, and staff sanitation.',
    path: '/hygiene-monitor',
    icon: ShieldCheck,
    color: 'from-cyan-500/20 to-cyan-500/5',
    border: 'border-cyan-500/30',
    iconColor: 'text-cyan-400',
    tag: 'Commercial Audit',
  },
  {
    title: 'Smart Kitchen Assistant',
    description: 'Executive chef AI that formulates delicious recipes from available pantry ingredients or photos.',
    path: '/kitchen-assistant',
    icon: ChefHat,
    color: 'from-purple-500/20 to-purple-500/5',
    border: 'border-purple-500/30',
    iconColor: 'text-purple-400',
    tag: 'Chef AI',
  },
  {
    title: 'Personalized Meal Planner',
    description: 'Precision daily meal planning with 5 timed meals, exact macronutrient ratios, and strict allergy safety.',
    path: '/meal-planner',
    icon: CalendarDays,
    color: 'from-blue-500/20 to-blue-500/5',
    border: 'border-blue-500/30',
    iconColor: 'text-blue-400',
    tag: 'Dietary AI',
  },
];

export default function Dashboard() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const data = await api.checkHealth();
        setHealthData(data);
      } catch (err) {
        setHealthData({ status: 'unreachable' });
      } finally {
        setLoading(false);
      }
    };
    fetchHealth();
  }, []);

  const isHealthy = healthData?.status === 'healthy';
  const isGroqActive = healthData?.groq_ai?.configured;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-24 -mb-16 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Next-Gen Culinary Intelligence
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">FoodVerse AI</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            A comprehensive multimodal AI ecosystem unifying real-time food recognition, freshness and spoilage estimation, commercial kitchen hygiene auditing, dynamic recipe crafting, and clinical personalized meal planning.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/food-recognition"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-navy-950 font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
            >
              <UtensilsCrossed className="w-4 h-4" /> Analyze Food Now
            </Link>
            <Link
              to="/meal-planner"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm border border-slate-700 transition-colors"
            >
              <CalendarDays className="w-4 h-4 text-cyan-400" /> Plan Daily Meals
            </Link>
          </div>
        </div>
      </div>

      {/* System Status Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Backend Service</span>
            <div className="flex items-center gap-2">
              {loading ? (
                <span className="text-xs text-slate-400">Checking...</span>
              ) : isHealthy ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-white">FastAPI Operational</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span className="text-sm font-semibold text-rose-300">Disconnected</span>
                </>
              )}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800/80 text-cyan-400">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">AI Vision Engine</span>
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-semibold text-white">
                {healthData?.groq_ai?.vision_model || 'LLaMA 3.2 Vision'}
              </span>
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800/80 text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">Groq API Key</span>
            <div className="flex items-center gap-2">
              {isGroqActive ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-sm font-semibold text-emerald-400">Configured & Ready</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-sm font-semibold text-amber-300">Set GROQ_API_KEY</span>
                </>
              )}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-800/80 text-purple-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Module Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Explore Modules</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-normal">
              5 Core Engines
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.path}
                to={mod.path}
                className={`group relative flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-b ${mod.color} bg-navy-900 border ${mod.border} hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl bg-slate-900/80 border border-slate-800 ${mod.iconColor} shadow-inner`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/50">
                      {mod.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {mod.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                      {mod.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs font-semibold text-slate-300 group-hover:text-emerald-400">
                  <span>Launch Engine</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
