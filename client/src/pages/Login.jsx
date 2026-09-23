import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  HeartPulse,
  Lock,
  User,
  AlertCircle,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Clock,
  CheckCircle2
} from 'lucide-react';

export default function Login() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [adminKey, setAdminKey] = useState('');
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(usernameOrEmail, password, adminKey);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex bg-slate-50 font-sans overflow-hidden">
      
      {/* LEFT SIDE: VISUAL HEALTHCARE HERO (Visible on Desktop / Laptop) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 select-none overflow-hidden">
        
        {/* HIGH-RES CLINICAL PHOTOGRAPHY */}
        <img
          src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80"
          alt="Healthcare Center Consultation"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-40 scale-105 transition-transform duration-1000 ease-out"
        />

        {/* DEEP FOREST EMERALD & NAVY GRADIENT OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#064e3b] via-[#064e3b]/80 to-slate-950/70 backdrop-blur-[2px]"></div>

        {/* HERO CONTENT OVERLAY */}
        <div className="relative z-10 p-12 lg:p-16 flex flex-col justify-between h-full text-white">
          
          {/* TOP LOGO */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white text-[#064e3b] flex items-center justify-center font-black shadow-lg shadow-black/20">
              <HeartPulse className="w-6 h-6 text-[#064e3b]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-white text-xl tracking-tight leading-none">MediTrack</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              </div>
              <p className="text-[11px] text-emerald-200 font-medium tracking-wider uppercase mt-0.5">
                Barangay Health Center System
              </p>
            </div>
          </div>

          {/* MIDDLE: VALUE PROPOSITION */}
          <div className="space-y-6 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Grassroots Healthcare Modernization</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Fast Electronic Records & Precision Medicine Inventory.
            </h2>

            <p className="text-sm text-emerald-100/90 leading-relaxed font-normal">
              Replacing manual paper logbooks with automated First-In, First-Out (FIFO) pharmaceutical batch control, real-time cellular SMS reminders, and centralized resident medical histories.
            </p>

            {/* 3 CORE PILLARS */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs font-semibold text-white/90">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                </div>
                <span>Sub-5 minute patient record retrieval & vitals triage</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-white/90">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                </div>
                <span>Strict FIFO batch allocation preventing expired medicine waste</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-white/90">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                </div>
                <span>Automated Semaphore SMS reminders for appointments & vaccines</span>
              </div>
            </div>
          </div>

          {/* BOTTOM COMPLIANCE BADGE */}
          <div className="pt-6 border-t border-white/15 flex items-center justify-between text-xs text-emerald-200/80">
            <span>Republic of the Philippines • Primary Care Zone</span>
            <span className="font-mono text-[11px]">v1.0 Production</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: CLEAN, AESTHETIC LOGIN FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-6">
          
          {/* MOBILE LOGO (Visible only on mobile/tablet) */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-[#064e3b] text-white flex items-center justify-center shadow-md">
              <HeartPulse className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <span className="font-black text-slate-900 text-lg tracking-tight">MediTrack</span>
              <p className="text-[10px] text-slate-400 font-semibold">Barangay Health Center</p>
            </div>
          </div>

          {/* HEADING */}
          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Sign In to Health Portal
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Enter your authorized staff credentials to access patient records and medicine inventory.
            </p>
          </div>

          {/* SECURITY RESTRICTION BANNER */}
          <div className="p-3.5 bg-slate-100/80 border border-slate-200/80 rounded-2xl flex items-start gap-3 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-[#064e3b] shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <span className="font-bold text-slate-800">Authorized Personnel Only.</span> Public registration is restricted. Staff accounts are provisioned exclusively by the Clinic Administrator.
            </div>
          </div>

          {/* ERROR ALERT */}
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-2.5 text-xs font-semibold animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
            {/* USERNAME */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Staff Username or Email *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  required
                  type="text"
                  placeholder="e.g. carlangelo or admin"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#064e3b] transition shadow-sm placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>
            </div>

            {/* PASSWORD WITH SHOW/HIDE TOGGLE */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#064e3b] transition shadow-sm placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-700 transition cursor-pointer p-0.5"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* ADMIN LOGIN CHECKBOX */}
            <div className="pt-1">
              <label className="flex items-center gap-2.5 text-slate-700 font-bold text-xs cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAdminLogin}
                  onChange={(e) => setIsAdminLogin(e.target.checked)}
                  className="w-4 h-4 rounded-lg border-slate-300 text-[#064e3b] focus:ring-[#064e3b] cursor-pointer"
                />
                <span>I am logging in as Clinic Administrator</span>
              </label>
            </div>

            {/* SLIDE-DOWN MASTER SECURITY KEY INPUT */}
            {isAdminLogin && (
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2 animate-fade-in">
                <div className="flex items-center justify-between">
                  <label className="block font-extrabold text-emerald-950 text-xs">
                    Admin Master Security Key *
                  </label>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Required for Admin
                  </span>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-emerald-700 absolute left-3.5 top-3" />
                  <input
                    required={isAdminLogin}
                    type="password"
                    placeholder="Enter Master Security Key"
                    value={adminKey}
                    onChange={(e) => setAdminKey(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-emerald-300 rounded-xl text-xs font-mono font-bold text-emerald-900 focus:outline-none focus:ring-2 focus:ring-[#064e3b] shadow-sm"
                  />
                </div>
                <p className="text-[10px] text-emerald-700 font-medium">Default key: MEDITRACK-ADMIN-2026</p>
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#064e3b] hover:bg-[#04382a] text-white text-xs font-bold rounded-2xl shadow-lg shadow-emerald-950/20 hover:shadow-xl transition-all duration-150 disabled:opacity-50 cursor-pointer pt-3"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* FOOTER NOTICE */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span>Compliant with RA 10173 (Data Privacy Act)</span>
            <span>MediTrack 2026</span>
          </div>

        </div>
      </div>
    </div>
  );
}