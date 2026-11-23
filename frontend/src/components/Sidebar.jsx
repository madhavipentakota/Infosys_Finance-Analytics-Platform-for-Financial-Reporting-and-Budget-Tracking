import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Sprout,
  Scale,
  Droplets,
  Coins,
  TrendingUp,
  LineChart,
  Split,
  Layers,
  FileDown,
  Database,
  Shield,
  ChevronDown,
  ChevronRight,
  Sparkles,
  BarChart3,
  DollarSign,
  Trophy,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = () => {
  const { isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Parse query params for active subpart and topic
  const searchParams = new URLSearchParams(location.search);
  const currentSubpart = searchParams.get('subpart');
  const currentTopic = searchParams.get('topic');

  const navSections = [
    {
      title: "Core Analytics",
      icon: Sprout,
      items: [
        { name: "Executive Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { name: "Production & Yield", path: "/production", icon: Sprout },
        { name: "Land & Seed Calculator", path: "/land-seed", icon: Scale },
        { name: "Oil Production", path: "/oil-production", icon: Droplets },
      ]
    },
    {
      title: "Financial Intelligence",
      icon: Coins,
      items: [
        { name: "Cost Analysis (CACP)", path: "/costs", icon: Coins },
        { name: "Market Prices (APMC)", path: "/market", icon: TrendingUp },
        { name: "Profitability & ROI", path: "/profitability", icon: LineChart },
        { name: "Break-Even Engine", path: "/break-even", icon: Layers },
      ]
    },
    {
      title: "Comparative Analytics",
      icon: Split,
      items: [
        {
          name: "Crop Comparison",
          path: "/crop-comparison",
          icon: Split,
          subparts: [
            {
              id: "financial",
              title: "1. Financial Comparison",
              icon: Coins,
              path: "/crop-comparison?subpart=financial&topic=rev_vs_cost",
              color: "text-amber-400",
              badge: "CACP",
              topics: [
                {
                  id: "rev_vs_cost",
                  name: "Revenue vs Cost",
                  icon: Scale,
                  path: "/crop-comparison?subpart=financial&topic=rev_vs_cost"
                },
                {
                  id: "cost_vs_profit",
                  name: "Cost vs Profit",
                  icon: Coins,
                  path: "/crop-comparison?subpart=financial&topic=cost_vs_profit"
                },
                {
                  id: "rev_vs_profit",
                  name: "Revenue vs Profit",
                  icon: DollarSign,
                  path: "/crop-comparison?subpart=financial&topic=rev_vs_profit"
                },
                {
                  id: "all_financial",
                  name: "All-in-One Financials",
                  icon: Layers,
                  path: "/crop-comparison?subpart=financial&topic=all_financial"
                },
                {
                  id: "roi_benchmark",
                  name: "ROI & Profit Ranking",
                  icon: Trophy,
                  path: "/crop-comparison?subpart=financial&topic=roi_benchmark"
                },
              ]
            },
            {
              id: "oil",
              title: "2. Oil Extraction & Efficiency",
              icon: Droplets,
              path: "/crop-comparison?subpart=oil&topic=roi_vs_oil",
              color: "text-cyan-400",
              badge: "IIOR",
              topics: [
                {
                  id: "roi_vs_oil",
                  name: "ROI vs Oil %",
                  icon: Trophy,
                  path: "/crop-comparison?subpart=oil&topic=roi_vs_oil"
                },
                {
                  id: "crude_oil_kg",
                  name: "Crude Oil (kg/ha)",
                  icon: Droplets,
                  path: "/crop-comparison?subpart=oil&topic=crude_oil_kg"
                },
                {
                  id: "oil_extraction_pct",
                  name: "Oil Extraction Rate (%)",
                  icon: Sparkles,
                  path: "/crop-comparison?subpart=oil&topic=oil_extraction_pct"
                },
                {
                  id: "rev_vs_oil",
                  name: "Revenue vs Oil %",
                  icon: DollarSign,
                  path: "/crop-comparison?subpart=oil&topic=rev_vs_oil"
                },
                {
                  id: "cost_vs_oil",
                  name: "Cost vs Oil %",
                  icon: Coins,
                  path: "/crop-comparison?subpart=oil&topic=cost_vs_oil"
                },
                {
                  id: "profit_vs_oil",
                  name: "Profit vs Oil %",
                  icon: TrendingUp,
                  path: "/crop-comparison?subpart=oil&topic=profit_vs_oil"
                },
              ]
            }
          ]
        },
      ]
    },
    {
      title: "Data & Reports",
      icon: FileDown,
      items: [
        { name: "Report Generator", path: "/reports", icon: FileDown },
        { name: "Datasets & Quality", path: "/datasets", icon: Database },
      ]
    }
  ];

  if (isAdmin) {
    navSections.push({
      title: "Administration",
      icon: Shield,
      items: [
        { name: "Admin Ingestion", path: "/admin/datasets", icon: Shield }
      ]
    });
  }

  // Determine which sections are active
  const getDefaultOpen = () => {
    const open = {};
    navSections.forEach((sec, idx) => {
      const hasActive = sec.items.some(item =>
        location.pathname === item.path ||
        (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
      );
      if (hasActive) open[idx] = true;
    });
    if (Object.keys(open).length === 0) open[0] = true;
    return open;
  };

  const [openSections, setOpenSections] = useState(getDefaultOpen);

  // Subpart collapse state inside Crop Comparison
  const [openSubparts, setOpenSubparts] = useState({
    financial: true,
    oil: true
  });

  const toggleSection = (idx) => {
    setOpenSections(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleSubpart = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenSubparts(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const isCropComparisonActive = location.pathname === '/crop-comparison';

  return (
    <aside className="w-64 bg-navy-950/95 backdrop-blur-xl border-r border-slate-800 min-h-[calc(100vh-61px)] p-3 flex flex-col justify-between shrink-0 shadow-xl overflow-y-auto">
      <div className="space-y-2">
        {navSections.map((sec, idx) => {
          const SectionIcon = sec.icon;
          const isOpen = !!openSections[idx];
          const hasActive = sec.items.some(item =>
            location.pathname === item.path ||
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
          );

          return (
            <div key={idx} className="rounded-xl overflow-hidden border border-slate-800/60 bg-navy-900/40">
              {/* Section header — click to toggle */}
              <button
                onClick={() => toggleSection(idx)}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold uppercase tracking-wider transition-all group ${
                  hasActive
                    ? 'bg-brand-500/10 text-brand-300 border-b border-brand-500/20'
                    : 'text-slate-400 hover:text-brand-300 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <SectionIcon className={`w-3.5 h-3.5 ${hasActive ? 'text-brand-400' : 'text-slate-400 group-hover:text-brand-300'}`} />
                  <span className="tracking-wide">{sec.title}</span>
                </div>
                {isOpen
                  ? <ChevronDown className="w-3.5 h-3.5 text-brand-400 transition-transform duration-200" />
                  : <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-transform duration-200" />
                }
              </button>

              {/* Sub-items — shown when open */}
              {isOpen && (
                <div className="p-1.5 space-y-1">
                  {sec.items.map((item) => {
                    const Icon = item.icon;
                    const hasSubparts = Array.isArray(item.subparts) && item.subparts.length > 0;
                    const isItemActive = isCropComparisonActive && item.path === '/crop-comparison';

                    if (hasSubparts) {
                      return (
                        <div key={item.path} className="space-y-1">
                          {/* Main Crop Comparison Link */}
                          <div
                            onClick={() => navigate('/crop-comparison?subpart=financial&topic=rev_vs_cost')}
                            className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                              isItemActive && (!currentSubpart || currentSubpart === 'financial') && (!currentTopic || currentTopic === 'rev_vs_cost')
                                ? 'bg-gradient-to-r from-brand-500/20 to-teal-500/20 text-brand-300 font-semibold border border-brand-500/40 shadow-sm shadow-brand-500/10'
                                : isItemActive
                                ? 'text-white bg-slate-800/40 border border-slate-700/50'
                                : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <Icon className="w-3.5 h-3.5 shrink-0 text-brand-400" />
                              <span className="font-bold truncate">{item.name}</span>
                            </div>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 font-mono">
                              Studio
                            </span>
                          </div>

                          {/* Nested Subparts Container */}
                          <div className="pl-2 space-y-2 mt-1">
                            {item.subparts.map((sub) => {
                              const SubIcon = sub.icon;
                              const isSubOpen = !!openSubparts[sub.id];
                              const isSubActive = isCropComparisonActive && currentSubpart === sub.id;

                              return (
                                <div key={sub.id} className="rounded-lg bg-navy-950/70 border border-slate-800/80 overflow-hidden">
                                  {/* Subpart Title / Header */}
                                  <div
                                    onClick={() => navigate(sub.path)}
                                    className={`flex items-center justify-between px-2.5 py-1.5 text-[11px] font-bold cursor-pointer transition-all group ${
                                      isSubActive && !currentTopic
                                        ? 'bg-brand-500/20 text-white border-l-2 border-brand-400'
                                        : isSubActive
                                        ? 'text-white bg-slate-800/30'
                                        : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 truncate">
                                      <SubIcon className={`w-3.5 h-3.5 shrink-0 ${sub.color}`} />
                                      <span className="truncate">{sub.title}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <button
                                        type="button"
                                        onClick={(e) => toggleSubpart(sub.id, e)}
                                        className="p-0.5 hover:bg-slate-700/50 rounded"
                                      >
                                        {isSubOpen ? (
                                          <ChevronDown className="w-3 h-3 text-slate-400" />
                                        ) : (
                                          <ChevronRight className="w-3 h-3 text-slate-500" />
                                        )}
                                      </button>
                                    </div>
                                  </div>

                                  {/* Subpart Topics */}
                                  {isSubOpen && (
                                    <div className="p-1 space-y-0.5 pl-2 border-t border-slate-800/60 bg-navy-950/90">
                                      {sub.topics.map((t) => {
                                        const TopicIcon = t.icon;
                                        const isTopicActive = isCropComparisonActive &&
                                          (currentTopic === t.id || (!currentTopic && sub.id === 'financial' && t.id === 'rev_vs_cost'));

                                        return (
                                          <NavLink
                                            key={t.path}
                                            to={t.path}
                                            className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] transition-all ${
                                              isTopicActive
                                                ? 'bg-brand-500/25 text-white font-bold border border-brand-400/40 shadow-sm shadow-brand-500/10'
                                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                                            }`}
                                          >
                                            <TopicIcon className={`w-3 h-3 shrink-0 ${isTopicActive ? 'text-brand-300' : 'text-slate-500'}`} />
                                            <span className="truncate">{t.name}</span>
                                          </NavLink>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }

                    // Standard nav item
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/dashboard'}
                        className={({ isActive }) =>
                          `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-brand-500/20 to-teal-500/20 text-brand-300 font-semibold border border-brand-500/40 shadow-sm shadow-brand-500/10'
                              : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                          }`
                        }
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{item.name}</span>
                      </NavLink>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-slate-800/80 mt-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-navy-900 to-navy-950 border border-brand-500/20 text-[11px] text-slate-300">
          <div className="flex items-center gap-1.5 text-brand-400 font-semibold mb-1">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse inline-block" />
            Verified Data Sources
          </div>
          <p className="text-[10px] leading-relaxed text-slate-400">
            All calculations use official Government of India (DES, CACP, Agmarknet) &amp; ICAR publications.
          </p>
        </div>
      </div>
    </aside>
  );
};
