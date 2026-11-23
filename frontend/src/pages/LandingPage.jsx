import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sprout, TrendingUp, BarChart3, Droplets, Coins, ShieldCheck,
  ArrowRight, ChevronDown, Zap, Globe2, Database, CheckCircle2,
  LineChart, Scale, Layers, Sparkles
} from 'lucide-react';

const FEATURES = [
  {
    icon: BarChart3,
    title: "Production Analytics",
    desc: "Track oilseed yield trends across crops and regions with DES-verified datasets spanning 20+ years.",
    color: "from-brand-400 to-teal-500",
    delay: 0
  },
  {
    icon: Coins,
    title: "Cost & Profitability",
    desc: "CACP-based cost analysis (A2+FL, C2) with real-time ROI, break-even, and net profit per hectare.",
    color: "from-teal-400 to-emerald-500",
    delay: 100
  },
  {
    icon: TrendingUp,
    title: "Market Intelligence",
    desc: "Live Agmarknet APMC mandi prices to benchmark farm-gate returns against production costs.",
    color: "from-brand-300 to-brand-500",
    delay: 200
  },
  {
    icon: Droplets,
    title: "Oil Extraction Engine",
    desc: "Compute crude oil output, refinery volumes, and extraction efficiency per crop scenario.",
    color: "from-brand-500 to-teal-600",
    delay: 300
  },
  {
    icon: Scale,
    title: "Land & Seed Calculator",
    desc: "Scenario planning for land area, seed requirements, fertilizer costs, and expected harvest.",
    color: "from-violet-400 to-brand-400",
    delay: 400
  },
  {
    icon: Layers,
    title: "Crop Comparison Studio",
    desc: "Side-by-side interactive benchmarking with custom multi-metric filters and dual-axis charts.",
    color: "from-teal-400 to-brand-400",
    delay: 500
  },
];

const STATS = [
  { label: "Oilseed Crops Covered", value: "8+", icon: Sprout },
  { label: "Years of Historical Data", value: "25+", icon: Database },
  { label: "Verified Data Sources", value: "5", icon: ShieldCheck },
  { label: "Analytics Modules", value: "12+", icon: LineChart },
];

const FLOATING_ICONS = [
  { icon: Sprout, color: "#00d4ff", size: 36, top: "12%", left: "8%", delay: 0, dur: 6 },
  { icon: Droplets, color: "#14b8a6", size: 28, top: "25%", right: "6%", delay: 1, dur: 7 },
  { icon: TrendingUp, color: "#38bdf8", size: 32, top: "60%", left: "5%", delay: 2, dur: 5 },
  { icon: BarChart3, color: "#00d4ff", size: 30, top: "72%", right: "8%", delay: 0.5, dur: 8 },
  { icon: Coins, color: "#f59e0b", size: 26, top: "45%", left: "4%", delay: 1.5, dur: 6 },
  { icon: Globe2, color: "#2dd4bf", size: 38, top: "15%", right: "12%", delay: 2.5, dur: 9 },
];

const FeatureCard = ({ feature, index }) => {
  const Icon = feature.icon;
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(40px)',
        transition: `opacity 0.6s ease ${feature.delay}ms, transform 0.6s ease ${feature.delay}ms`
      }}
      className="group relative bg-navy-900/70 backdrop-blur-md rounded-2xl p-6 border border-slate-800 hover:border-brand-500/50 shadow-xl hover:shadow-2xl hover:shadow-brand-500/10 transition-all duration-300 cursor-default overflow-hidden"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl`} />
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} mb-4 shadow-lg shadow-brand-500/20`}>
        <Icon className="w-6 h-6 text-navy-950 font-bold" />
      </div>
      <h3 className="font-bold text-white text-base mb-2 group-hover:text-brand-300 transition-colors">{feature.title}</h3>
      <p className="text-sm text-slate-300 leading-relaxed">{feature.desc}</p>
    </div>
  );
};

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    // If logged in, go to dashboard directly
    if (isAuthenticated) {
      navigate('/dashboard');
      return;
    }
    setTimeout(() => setHeroVisible(true), 100);
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-navy-900 text-slate-100 overflow-x-hidden selection:bg-brand-500 selection:text-navy-950">

      {/* Decorative background orbs for dark navy theme */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-brand-500/10 blur-[120px] animate-orb" />
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-[120px]" style={{ animation: 'orbFloat 14s ease-in-out infinite 3s' }} />
        <div className="absolute bottom-0 left-0 w-[550px] h-[550px] rounded-full bg-brand-600/10 blur-[120px]" style={{ animation: 'orbFloat 11s ease-in-out infinite 6s' }} />
      </div>

      {/* === TOP NAV === */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-navy-950/90 backdrop-blur-xl shadow-xl border-b border-slate-800' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-teal-500 flex items-center justify-center shadow-lg shadow-brand-500/25">
              <Sprout className="w-5 h-5 text-navy-950 font-bold" />
            </div>
            <div>
              <span className="font-extrabold text-base text-white tracking-tight">OilCrop</span>
              <span className="ml-1.5 text-xs px-2 py-0.5 rounded-md bg-brand-500/15 text-brand-300 border border-brand-500/30 font-semibold tracking-wide uppercase">Intelligence</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold px-4 py-2 rounded-xl border border-slate-700 text-slate-200 hover:text-white hover:border-brand-400 hover:bg-slate-800/80 transition-all">
              Sign In
            </Link>
            <Link to="/register" className="text-sm font-bold px-4 py-2 rounded-xl bg-gradient-to-r from-brand-400 to-teal-500 text-navy-950 shadow-lg shadow-brand-500/25 hover:from-brand-300 hover:to-teal-400 transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* === HERO === */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16">
        {/* Floating icons in background */}
        {FLOATING_ICONS.map((fi, i) => {
          const Icon = fi.icon;
          const style = {
            position: 'absolute',
            top: fi.top,
            left: fi.left,
            right: fi.right,
            animationDelay: `${fi.delay}s`,
            animationDuration: `${fi.dur}s`,
          };
          return (
            <div key={i} style={style} className="animate-float opacity-30 pointer-events-none hidden md:block">
              <Icon style={{ width: fi.size, height: fi.size, color: fi.color }} />
            </div>
          );
        })}

        {/* Badge */}
        <div
          style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s'
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-semibold mb-6 shadow-lg shadow-brand-500/10"
        >
          <Zap className="w-3.5 h-3.5 text-brand-400" />
          <span>Real-World Oilseed Agriculture Intelligence Platform</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
        </div>

        {/* Main heading */}
        <h1
          style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'translateY(0)' : 'translateY(30px)',
            transition: 'opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s'
          }}
          className="text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-tight max-w-4xl mx-auto tracking-tight"
        >
          India's Oilseed Analytics{' '}
          <span className="bg-gradient-to-r from-brand-300 via-teal-300 to-brand-400 bg-clip-text text-transparent">
            Intelligence Engine
          </span>
        </h1>

        {/* Sub-heading */}
        <p
          style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'translateY(0)' : 'translateY(25px)',
            transition: 'opacity 0.7s ease 0.4s, transform 0.7s ease 0.4s'
          }}
          className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed"
        >
          Empowering farmers, analysts, and policymakers with verified DES, CACP, and Agmarknet data.
          Make high-precision decisions on crops, costs, profitability, and oil extraction.
        </p>

        {/* CTA buttons */}
        <div
          style={{
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.7s ease 0.6s, transform 0.7s ease 0.6s'
          }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4"
        >
          <Link
            to="/register"
            className="group flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-400 to-teal-500 text-navy-950 font-bold text-sm shadow-xl shadow-brand-500/25 hover:shadow-brand-400/40 hover:from-brand-300 hover:to-teal-400 transition-all"
          >
            Start Analyzing Now
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl border border-slate-700 text-white font-semibold text-sm hover:border-brand-400 hover:bg-slate-800/80 transition-all"
          >
            Sign In to Platform
          </Link>
        </div>

        {/* Scroll hint */}
        <div className="mt-16 flex flex-col items-center gap-2 text-slate-400 text-xs animate-bounce">
          <span>Explore Features</span>
          <ChevronDown className="w-4 h-4 text-brand-400" />
        </div>
      </section>

      {/* === STATS BAND === */}
      <section className="py-16 bg-navy-950/80 border-y border-slate-800">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 mb-3">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-black text-white mb-1 font-mono">{s.value}</div>
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{s.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* === FEATURES GRID === */}
      <section className="py-24 px-6 bg-navy-900/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-brand-400 uppercase tracking-widest mb-3 block">Platform Capabilities</span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight">
              Everything you need for{' '}
              <span className="bg-gradient-to-r from-brand-300 to-teal-400 bg-clip-text text-transparent">
                Oilseed Intelligence
              </span>
            </h2>
            <p className="text-slate-300 max-w-xl mx-auto text-sm leading-relaxed">
              From raw production data to advanced financial modeling — our platform covers the complete analytics lifecycle.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => <FeatureCard key={i} feature={f} index={i} />)}
          </div>
        </div>
      </section>

      {/* === DATA SOURCES === */}
      <section className="py-24 px-6 bg-navy-950/90 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-bold text-brand-400 uppercase tracking-widest mb-3 block">Verified &amp; Trusted</span>
          <h2 className="text-2xl sm:text-4xl font-black text-white mb-4 tracking-tight">
            Built on Official Government Data
          </h2>
          <p className="text-slate-300 text-sm mb-12 leading-relaxed max-w-xl mx-auto">
            Every insight is powered exclusively by official publications. No fabricated mock data — ever.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {['DES (Directorate of Economics & Statistics)', 'CACP (Commission for Agricultural Costs & Prices)', 'Agmarknet / APMC Mandi Prices', 'ICAR-IIOR Research Publications', 'FAO FAOSTAT Global Datasets'].map((src, i) => (
              <div key={i} className="flex items-center gap-2 p-3.5 rounded-xl bg-navy-900 border border-slate-800 text-left">
                <CheckCircle2 className="w-4 h-4 text-brand-400 shrink-0" />
                <span className="text-xs text-slate-200 font-medium leading-tight">{src}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === CTA FOOTER === */}
      <section className="py-24 px-6 relative overflow-hidden bg-gradient-to-b from-navy-950 to-navy-900 border-t border-slate-800">
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight">
            Ready to unlock your{' '}
            <span className="bg-gradient-to-r from-brand-300 to-teal-400 bg-clip-text text-transparent">
              Oilseed Potential?
            </span>
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mb-8 leading-relaxed max-w-xl mx-auto">
            Join analysts and agri-professionals already using OilCrop Intelligence for smarter agricultural decisions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="group flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-400 to-teal-500 text-navy-950 font-bold text-sm shadow-xl shadow-brand-500/25 hover:from-brand-300 hover:to-teal-400 transition-all"
            >
              Create Free Account
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="text-brand-300 font-semibold text-sm hover:text-white transition-colors underline underline-offset-4">
              Already have an account?
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-950 border-t border-slate-800 py-8 px-6 text-center text-xs text-slate-400">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sprout className="w-4 h-4 text-brand-400" />
          <span className="font-bold text-white">OilCrop Intelligence</span>
        </div>
        <p>Data sourced from DES, CACP, Agmarknet, ICAR-IIOR &amp; FAO. All rights reserved © 2025.</p>
      </footer>

    </div>
  );
};

export default LandingPage;
