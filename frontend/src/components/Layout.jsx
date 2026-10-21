import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShieldAlert,
  ShieldCheck,
  ChefHat,
  CalendarDays,
  Menu,
  X,
  Sparkles,
  Activity,
  CheckCircle2,
  AlertCircle,
  Cpu,
} from 'lucide-react';
import { api } from '../utils/api';

const navItems = [
  {
    path: '/',
    name: 'Dashboard',
    icon: LayoutDashboard,
    badge: null,
  },
  {
    path: '/food-recognition',
    name: 'Food Recognition & Nutrition',
    icon: UtensilsCrossed,
    badge: 'Vision AI',
  },
  {
    path: '/freshness-detector',
    name: 'Freshness & Spoilage',
    icon: ShieldAlert,
    badge: 'Safety',
  },
  {
    path: '/hygiene-monitor',
    name: 'Kitchen Hygiene Monitor',
    icon: ShieldCheck,
    badge: 'Audit',
  },
  {
    path: '/kitchen-assistant',
    name: 'Smart Kitchen Assistant',
    icon: ChefHat,
    badge: 'Chef AI',
  },
  {
    path: '/meal-planner',
    name: 'Personalized Meal Planner',
    icon: CalendarDays,
    badge: 'Dietary',
  },
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [systemStatus, setSystemStatus] = useState({
    checked: false,
    healthy: false,
    groqConfigured: false,
  });
  const location = useLocation();

  useEffect(() => {
    // Check backend health
    const fetchStatus = async () => {
      try {
        const data = await api.checkHealth();
        setSystemStatus({
          checked: true,
          healthy: data.status === 'healthy',
          groqConfigured: !!data.groq_ai?.configured,
        });
      } catch (err) {
        setSystemStatus({
          checked: true,
          healthy: false,
          groqConfigured: false,
        });
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-navy-950 text-slate-100 overflow-hidden font-sans">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 flex flex-col bg-navy-900 border-r border-slate-800/80 transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 text-navy-950 font-bold" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                FoodVerse <span className="text-emerald-400">AI</span>
              </h1>
              <p className="text-xs text-slate-400">Multimodal Food Intelligence</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Platform Modules
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center space-x-3 truncate">
                  <Icon className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110" />
                  <span className="truncate">{item.name}</span>
                </div>
                {item.badge && (
                  <span className="ml-2 px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-slate-800 text-slate-400 border border-slate-700/60 group-hover:border-emerald-500/30 group-hover:text-emerald-300">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* System Status in Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-navy-950/60">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" /> System Status
            </span>
            {systemStatus.checked ? (
              systemStatus.healthy ? (
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Online
                </span>
              ) : (
                <span className="flex items-center gap-1 text-rose-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-rose-400" /> Offline
                </span>
              )
            ) : (
              <span className="text-slate-400">Connecting...</span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 bg-slate-900/80 rounded-lg p-2.5 border border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span>Groq AI Engine:</span>
              <span
                className={`font-semibold ${
                  systemStatus.groqConfigured ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {systemStatus.groqConfigured ? 'Active' : 'Key Needed'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>LLaMA Vision 3.2</span>
              <span>FastAPI Backend</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 px-6 bg-navy-900/60 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Multimodal AI Platform</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300 font-mono">v1.0.0</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="px-3 py-1.5 rounded-full bg-slate-800/70 border border-slate-700/60 flex items-center space-x-2 text-xs">
              <span className="text-slate-400">Backend:</span>
              <span className="text-cyan-400 font-mono font-medium">http://localhost:8000</span>
            </div>
          </div>
        </header>

        {/* Scrollable Route Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
