import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Split, TrendingUp, Percent, Coins, Droplets, Trophy,
  CheckSquare, Square, BarChart3, RefreshCw, SlidersHorizontal,
  Layers, ArrowUpDown, Sparkles, Filter, Factory, DollarSign,
  Activity, Table, LineChart as LineChartIcon, PieChart,
  ArrowRight, ShieldCheck, Scale, Zap, Info, ChevronRight
} from 'lucide-react';
import {
  BarChart, Bar, AreaChart, Area, LineChart, Line, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';
import { DataTable } from '../components/DataTable';
import { DataSourceBadge } from '../components/DataSourceBadge';
import { analyticsService } from '../services/analyticsService';
import { formatCurrency, formatNumber, formatPercentage } from '../utils/formatters';

// =========================================================================
// INNOVATIVE HIGH-CONTRAST DATA VIZ PALETTE
// Specifically crafted to be completely distinct from frontend UI chrome
// =========================================================================
const COLOR_REVENUE = '#f046c8'; // Electric Neon Magenta (Gross Sales)
const COLOR_COST    = '#ff7828'; // Solar Flame Tangerine (C2 Cost of Cultivation)
const COLOR_PROFIT  = '#00f090'; // Luminous Phosphor Mint (Net Farmer Profit)
const COLOR_ROI     = '#9333ea'; // Royal Cosmic Violet (Capital ROI %)
const COLOR_OIL     = '#ffd000'; // Sunburst Gold / Pure Lipid Yellow (Oil Extraction %)
const COLOR_CRUDE   = '#ff4772'; // Radiant Coral Crimson (Crude Oil Output kg/ha)
const COLOR_SPREAD  = '#00e5ff'; // Electric Turquoise (Spread Differential)
const COLOR_LOSS    = '#f43f5e'; // Deep Crimson Rose (Loss / Negative Spread)

// Crop-level unique identity palette for ranked/single-metric visualizations
const CROP_PALETTE = [
  '#f046c8', // Electric Magenta
  '#00e5ff', // Radiant Turquoise
  '#ffd000', // Sunburst Gold
  '#00f090', // Neon Mint
  '#ff7828', // Solar Tangerine
  '#a855f7', // Electric Violet
  '#ff4772', // Coral Crimson
  '#3b82f6', // Sapphire Cobalt
  '#14b8a6', // Persian Teal
  '#fb7185', // Strawberry Coral
];

const GRID_COLOR = '#1e293b';
const AXIS_COLOR = '#94a3b8';

export const CropComparison = () => {
  const [searchParams, setSearchParams]       = useSearchParams();
  const [cropsList, setCropsList]             = useState([]);
  const [selectedCrops, setSelectedCrops]     = useState([]);
  const [comparisonData, setComparisonData]   = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [filterLoading, setFilterLoading]     = useState(false);

  // Active subpart: 'financial' | 'oil' (defaults to 'financial')
  const initialSubpart = searchParams.get('subpart') === 'oil' ? 'oil' : 'financial';
  const [activeSubpart, setActiveSubpart]     = useState(initialSubpart);

  // Active topic: defaults based on subpart
  const initialTopic = searchParams.get('topic') || (initialSubpart === 'oil' ? 'roi_vs_oil' : 'rev_vs_cost');
  const [activeTopic, setActiveTopic]         = useState(initialTopic);

  // Active graph tab for the selected topic
  const [activeGraphTab, setActiveGraphTab]   = useState(initialSubpart === 'oil' ? 'composed' : 'grouped_bar');

  // Load available crops on mount
  useEffect(() => {
    const init = async () => {
      try {
        const c = await analyticsService.getCrops();
        const list = c || [];
        setCropsList(list);
        // Default to first 5 crops
        const initial = list.slice(0, 5).map(item => item.crop_name);
        setSelectedCrops(initial);
      } catch (err) {
        console.error("Failed to load crops:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // All Topic Definitions
  const allTopics = [
    // Subpart 1: Financial Comparison Topics
    {
      id: 'rev_vs_cost',
      subpart: 'financial',
      subpartTitle: '1. Financial Comparison',
      label: 'Revenue vs Cost',
      icon: Scale,
      tag: 'Core Viability',
      sourceType: 'CACP Benchmark (₹/ha)',
      desc: 'Farm-gate gross revenue versus official C2 cost of cultivation per hectare',
      defaultTab: 'grouped_bar',
      supportedTabs: [
        { id: 'grouped_bar',  label: 'Grouped Bar', icon: BarChart3 },
        { id: 'composed',     label: 'Composed (Bar + Line)', icon: LineChartIcon },
        { id: 'differential', label: 'Net Spread / Margin', icon: TrendingUp },
        { id: 'area',         label: 'Area Curve', icon: Activity },
        { id: 'breakdown',    label: 'Data Breakdown', icon: Table }
      ]
    },
    {
      id: 'cost_vs_profit',
      subpart: 'financial',
      subpartTitle: '1. Financial Comparison',
      label: 'Cost vs Profit',
      icon: Coins,
      tag: 'Capital Return',
      sourceType: 'CACP Benchmark (₹/ha)',
      desc: 'Production expenditure invested per hectare vs net farmer profit pocketed',
      defaultTab: 'grouped_bar',
      supportedTabs: [
        { id: 'grouped_bar',  label: 'Grouped Bar', icon: BarChart3 },
        { id: 'composed',     label: 'Composed Trend', icon: LineChartIcon },
        { id: 'area',         label: 'Area Curve', icon: Activity },
        { id: 'breakdown',    label: 'Data Breakdown', icon: Table }
      ]
    },
    {
      id: 'rev_vs_profit',
      subpart: 'financial',
      subpartTitle: '1. Financial Comparison',
      label: 'Revenue vs Profit',
      icon: DollarSign,
      tag: 'Margin Capture',
      sourceType: 'CACP Benchmark (₹/ha)',
      desc: 'Conversion of gross market realization into realized bottom-line surplus',
      defaultTab: 'grouped_bar',
      supportedTabs: [
        { id: 'grouped_bar',  label: 'Grouped Bar', icon: BarChart3 },
        { id: 'composed',     label: 'Composed View', icon: LineChartIcon },
        { id: 'area',         label: 'Area Curve', icon: Activity },
        { id: 'breakdown',    label: 'Data Breakdown', icon: Table }
      ]
    },
    {
      id: 'all_financial',
      subpart: 'financial',
      subpartTitle: '1. Financial Comparison',
      label: 'All-in-One Financials',
      icon: Layers,
      tag: '3-Way Balance',
      sourceType: 'CACP Benchmark (₹/ha)',
      desc: 'Integrated triple-metric comparison: Gross Revenue, Cost C2, and Net Profit',
      defaultTab: 'grouped_bar',
      supportedTabs: [
        { id: 'grouped_bar',  label: 'Triple Clustered Bar', icon: BarChart3 },
        { id: 'composed',     label: 'Composed Spectrum', icon: LineChartIcon },
        { id: 'area',         label: 'Stacked Area', icon: Activity },
        { id: 'breakdown',    label: 'Full Balance Sheet', icon: Table }
      ]
    },
    {
      id: 'roi_benchmark',
      subpart: 'financial',
      subpartTitle: '1. Financial Comparison',
      label: 'ROI & Profit Ranking',
      icon: Trophy,
      tag: 'Capital Efficiency',
      sourceType: 'CACP Benchmark (₹/ha)',
      desc: 'Net Return on Investment (%) ranking across all evaluated oilseed crops',
      defaultTab: 'grouped_bar',
      supportedTabs: [
        { id: 'grouped_bar',  label: 'Ranked Bar Chart', icon: BarChart3 },
        { id: 'area',         label: 'ROI Distribution Curve', icon: Activity },
        { id: 'breakdown',    label: 'ROI League Table', icon: Table }
      ]
    },

    // Subpart 2: Oil Extraction & Processing Efficiency Topics
    {
      id: 'roi_vs_oil',
      subpart: 'oil',
      subpartTitle: '2. Oil Extraction & Efficiency',
      label: 'ROI vs Oil %',
      icon: Trophy,
      tag: 'Synergy',
      sourceType: 'ICAR-IIOR Verified',
      desc: 'Cross-benchmarking financial return on investment with physical oil content',
      defaultTab: 'composed',
      supportedTabs: [
        { id: 'composed',   label: 'Dual-Axis Composed', icon: LineChartIcon },
        { id: 'bar',        label: 'Dual-Axis Bars', icon: BarChart3 },
        { id: 'breakdown',  label: 'Efficiency Table', icon: Table }
      ]
    },
    {
      id: 'crude_oil_kg',
      subpart: 'oil',
      subpartTitle: '2. Oil Extraction & Efficiency',
      label: 'Crude Oil Output (kg/ha)',
      icon: Droplets,
      tag: 'Physical Yield',
      sourceType: 'ICAR-IIOR Verified',
      desc: 'Crude vegetable oil produced per hectare (Crop Yield × Lipid Extraction %)',
      defaultTab: 'composed',
      supportedTabs: [
        { id: 'composed',   label: 'Oil Output & Seed Yield', icon: LineChartIcon },
        { id: 'bar',        label: 'Crude Oil Bars', icon: BarChart3 },
        { id: 'area',       label: 'Volume Curve', icon: Activity },
        { id: 'breakdown',  label: 'Crush Matrix', icon: Table }
      ]
    },
    {
      id: 'oil_extraction_pct',
      subpart: 'oil',
      subpartTitle: '2. Oil Extraction & Efficiency',
      label: 'Oil Extraction Rate (%)',
      icon: Sparkles,
      tag: 'Crush Rate',
      sourceType: 'ICAR-IIOR Verified',
      desc: 'Industrial & laboratory lipid recovery rate benchmark from ICAR-IIOR',
      defaultTab: 'bar',
      supportedTabs: [
        { id: 'bar',        label: 'Ranked Extraction %', icon: BarChart3 },
        { id: 'area',       label: 'Lipid Gradient', icon: Activity },
        { id: 'breakdown',  label: 'Processing Table', icon: Table }
      ]
    },
    {
      id: 'rev_vs_oil',
      subpart: 'oil',
      subpartTitle: '2. Oil Extraction & Efficiency',
      label: 'Revenue vs Oil %',
      icon: DollarSign,
      tag: 'Value Density',
      sourceType: 'ICAR-IIOR Verified',
      desc: 'Farm-gate revenue earned per hectare relative to seed lipid extraction concentration',
      defaultTab: 'composed',
      supportedTabs: [
        { id: 'composed',   label: 'Dual-Axis Composed', icon: LineChartIcon },
        { id: 'bar',        label: 'Dual-Axis Bars', icon: BarChart3 },
        { id: 'breakdown',  label: 'Revenue & Oil Matrix', icon: Table }
      ]
    },
    {
      id: 'cost_vs_oil',
      subpart: 'oil',
      subpartTitle: '2. Oil Extraction & Efficiency',
      label: 'Cost vs Oil %',
      icon: Coins,
      tag: 'Crush Costing',
      sourceType: 'ICAR-IIOR Verified',
      desc: 'Cultivation cost C2 benchmarked against physical lipid extraction rate',
      defaultTab: 'composed',
      supportedTabs: [
        { id: 'composed',   label: 'Dual-Axis Composed', icon: LineChartIcon },
        { id: 'bar',        label: 'Dual-Axis Bars', icon: BarChart3 },
        { id: 'breakdown',  label: 'Cost & Oil Matrix', icon: Table }
      ]
    },
    {
      id: 'profit_vs_oil',
      subpart: 'oil',
      subpartTitle: '2. Oil Extraction & Efficiency',
      label: 'Profit vs Oil %',
      icon: TrendingUp,
      tag: 'Wealth Spread',
      sourceType: 'ICAR-IIOR Verified',
      desc: 'Net farmer profit realized per hectare across different crop lipid recovery tiers',
      defaultTab: 'composed',
      supportedTabs: [
        { id: 'composed',   label: 'Dual-Axis Composed', icon: LineChartIcon },
        { id: 'bar',        label: 'Dual-Axis Bars', icon: BarChart3 },
        { id: 'breakdown',  label: 'Profit & Oil Matrix', icon: Table }
      ]
    }
  ];

  // Active topic object
  const currentTopicObj = allTopics.find(t => t.id === activeTopic) || allTopics[0];

  // Synchronize state when URL search params change (e.g. from sidebar clicks)
  useEffect(() => {
    const subpartParam = searchParams.get('subpart');
    const topicParam = searchParams.get('topic');

    if (subpartParam === 'oil') {
      setActiveSubpart('oil');
      const targetTopic = topicParam || 'roi_vs_oil';
      setActiveTopic(targetTopic);
      const target = allTopics.find(t => t.id === targetTopic);
      if (target) {
        setActiveGraphTab(target.defaultTab);
      }
    } else {
      setActiveSubpart('financial');
      const targetTopic = topicParam || 'rev_vs_cost';
      setActiveTopic(targetTopic);
      const target = allTopics.find(t => t.id === targetTopic);
      if (target) {
        setActiveGraphTab(target.defaultTab);
      }
    }
  }, [searchParams]);

  // Fetch comparison whenever crop selection changes
  useEffect(() => {
    if (selectedCrops.length > 0) {
      fetchComparison();
    } else {
      setComparisonData([]);
    }
  }, [selectedCrops]);

  const fetchComparison = async () => {
    setFilterLoading(true);
    try {
      const res = await analyticsService.compareCrops({ crops: selectedCrops.join(',') });
      const rawCrops = Array.isArray(res?.crops) ? res.crops : [];
      const normalized = rawCrops
        .filter(c => selectedCrops.includes(c.crop_name))
        .map(c => {
          const rev = Number(c.revenue_per_ha ?? c.gross_revenue_ha ?? 0);
          const cost = Number(c.cost_per_ha ?? c.avg_cost_ha ?? 0);
          const profit = Number(c.profit_per_ha ?? c.net_profit_ha ?? (rev - cost));
          const roi = Number(c.roi_percentage ?? c.roi_pct ?? (cost > 0 ? (profit / cost) * 100 : 0));
          const price = Number(c.price_per_kg ?? c.avg_price_kg ?? 0);
          const ext = Number(c.oil_extraction_pct ?? c.extraction_rate_pct ?? 0);
          const yld = Number(c.avg_yield_t_ha ?? 0);
          // Crude oil output in kg/ha = Yield (tonnes/ha) * 1000 * (Extraction % / 100)
          const crudeKgHa = Math.round(yld * 1000 * (ext / 100));
          // Liquid volume in litres = crude oil kg / 0.92 density
          const litresHa = Math.round(crudeKgHa / 0.92);
          const marginSpread = rev - cost;
          const profitMarginPct = rev > 0 ? (profit / rev) * 100 : 0;
          const costToRevPct = rev > 0 ? (cost / rev) * 100 : 0;

          // Unit realization per kg of crude oil recovered
          const revPerOilKg = crudeKgHa > 0 ? rev / crudeKgHa : 0;
          const costPerOilKg = crudeKgHa > 0 ? cost / crudeKgHa : 0;
          const profitPerOilKg = crudeKgHa > 0 ? profit / crudeKgHa : 0;

          return {
            ...c,
            gross_revenue_ha:    rev,
            avg_cost_ha:         cost,
            net_profit_ha:       profit,
            roi_pct:             roi,
            avg_price_kg:        price,
            extraction_rate_pct: ext,
            avg_yield_t_ha:      yld,
            crude_oil_kg_ha:     crudeKgHa,
            liquid_litres_ha:    litresHa,
            margin_spread:       marginSpread,
            profit_margin_pct:   profitMarginPct,
            cost_to_rev_pct:     costToRevPct,
            rev_per_oil_kg:      revPerOilKg,
            cost_per_oil_kg:     costPerOilKg,
            profit_per_oil_kg:   profitPerOilKg
          };
        });
      setComparisonData(normalized);
    } catch (err) {
      console.error("Failed to fetch crop comparison:", err);
    } finally {
      setFilterLoading(false);
    }
  };

  // Crop multi-select toggles
  const toggleCrop = (name) => {
    if (selectedCrops.includes(name)) {
      if (selectedCrops.length === 1) return; // Keep at least one
      setSelectedCrops(prev => prev.filter(c => c !== name));
    } else {
      setSelectedCrops(prev => [...prev, name]);
    }
  };

  const selectAll = () => setSelectedCrops(cropsList.map(c => c.crop_name));
  const selectTopROI = () => {
    const sorted = [...comparisonData].sort((a, b) => (b.roi_pct || 0) - (a.roi_pct || 0));
    setSelectedCrops(sorted.slice(0, 3).map(c => c.crop_name));
  };
  const selectTopOil = () => {
    const sorted = [...comparisonData].sort((a, b) => (b.extraction_rate_pct || 0) - (a.extraction_rate_pct || 0));
    setSelectedCrops(sorted.slice(0, 3).map(c => c.crop_name));
  };
  const resetDefaults = () => {
    if (cropsList.length) setSelectedCrops(cropsList.slice(0, 5).map(c => c.crop_name));
  };

  // Custom high-contrast tooltip
  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-navy-950/95 border border-slate-600 p-3.5 rounded-xl shadow-2xl backdrop-blur-md min-w-[220px] z-50">
          <div className="text-xs font-black text-white border-b border-slate-700 pb-1.5 mb-2 flex items-center justify-between">
            <span>{label}</span>
            <span className="text-[10px] text-brand-300 font-mono">Government Verified</span>
          </div>
          <div className="space-y-1.5 text-xs">
            {payload.map((entry, idx) => {
              let displayVal = entry.value;
              if (
                entry.dataKey.includes('revenue') ||
                entry.dataKey.includes('cost') ||
                entry.dataKey.includes('profit') ||
                entry.dataKey.includes('margin_spread')
              ) {
                displayVal = formatCurrency(entry.value);
              } else if (
                entry.dataKey.includes('pct') ||
                entry.dataKey.includes('rate') ||
                entry.dataKey.includes('roi')
              ) {
                displayVal = `${formatNumber(entry.value, 1)}%`;
              } else if (entry.dataKey.includes('crude')) {
                displayVal = `${formatNumber(entry.value, 0)} kg/ha`;
              } else if (entry.dataKey.includes('litres')) {
                displayVal = `${formatNumber(entry.value, 0)} L/ha`;
              } else if (entry.dataKey.includes('yield')) {
                displayVal = `${formatNumber(entry.value, 2)} t/ha`;
              }

              return (
                <div key={idx} className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-1.5 text-slate-200 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
                    {entry.name}:
                  </span>
                  <span className="font-bold text-white font-mono">
                    {displayVal}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  // Gradients for rich aesthetic graphs using innovative color palette
  const renderGradients = () => (
    <defs>
      <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor={COLOR_REVENUE} stopOpacity={0.55} />
        <stop offset="95%" stopColor={COLOR_REVENUE} stopOpacity={0.03} />
      </linearGradient>
      <linearGradient id="gradCost" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor={COLOR_COST} stopOpacity={0.55} />
        <stop offset="95%" stopColor={COLOR_COST} stopOpacity={0.03} />
      </linearGradient>
      <linearGradient id="gradProfit" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor={COLOR_PROFIT} stopOpacity={0.6} />
        <stop offset="95%" stopColor={COLOR_PROFIT} stopOpacity={0.03} />
      </linearGradient>
      <linearGradient id="gradOil" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor={COLOR_OIL} stopOpacity={0.6} />
        <stop offset="95%" stopColor={COLOR_OIL} stopOpacity={0.03} />
      </linearGradient>
      <linearGradient id="gradROI" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor={COLOR_ROI} stopOpacity={0.6} />
        <stop offset="95%" stopColor={COLOR_ROI} stopOpacity={0.03} />
      </linearGradient>
      <linearGradient id="gradCrude" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor={COLOR_CRUDE} stopOpacity={0.6} />
        <stop offset="95%" stopColor={COLOR_CRUDE} stopOpacity={0.03} />
      </linearGradient>
      <linearGradient id="gradSpread" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor={COLOR_SPREAD} stopOpacity={0.55} />
        <stop offset="95%" stopColor={COLOR_SPREAD} stopOpacity={0.03} />
      </linearGradient>
    </defs>
  );

  // Quick stats calculations for active topics
  const topicStats = useMemo(() => {
    if (!comparisonData.length) return null;
    const topRev = [...comparisonData].sort((a, b) => b.gross_revenue_ha - a.gross_revenue_ha)[0];
    const lowCost = [...comparisonData].sort((a, b) => a.avg_cost_ha - b.avg_cost_ha)[0];
    const topProfit = [...comparisonData].sort((a, b) => b.net_profit_ha - a.net_profit_ha)[0];
    const topROI = [...comparisonData].sort((a, b) => b.roi_pct - a.roi_pct)[0];
    const topExtraction = [...comparisonData].sort((a, b) => b.extraction_rate_pct - a.extraction_rate_pct)[0];
    const topCrude = [...comparisonData].sort((a, b) => b.crude_oil_kg_ha - a.crude_oil_kg_ha)[0];

    return { topRev, lowCost, topProfit, topROI, topExtraction, topCrude };
  }, [comparisonData]);

  // Master datatable columns
  const tableColumns = [
    {
      key: 'rank',
      header: 'Rank',
      render: (_, r) => {
        const sorted = [...comparisonData].sort((a, b) => (b.roi_pct || 0) - (a.roi_pct || 0));
        const rank = sorted.findIndex(item => item.crop_name === r.crop_name) + 1;
        return (
          <span className={`px-2.5 py-1 rounded text-xs font-black ${
            rank === 1 ? 'bg-amber-400 text-navy-950 font-black shadow-sm shadow-amber-400/30' :
            rank === 2 ? 'bg-slate-300 text-navy-950 font-bold' :
            rank === 3 ? 'bg-amber-600 text-white font-bold' :
            'bg-navy-900 text-slate-300 border border-slate-700'
          }`}>#{rank}</span>
        );
      }
    },
    {
      key: 'crop_name',
      header: 'Oilseed Crop',
      render: (val) => <span className="font-extrabold text-white text-xs">{val}</span>
    },
    {
      key: 'extraction_rate_pct',
      header: 'Oil Extraction Rate',
      unit: '%',
      render: (val) => <span style={{ color: COLOR_OIL }} className="font-extrabold">{formatNumber(val, 1)}%</span>
    },
    {
      key: 'crude_oil_kg_ha',
      header: 'Crude Oil Yield',
      unit: 'kg/ha',
      render: (val, r) => (
        <div>
          <span style={{ color: COLOR_CRUDE }} className="font-bold">{formatNumber(val, 0)} kg/ha</span>
          <span className="text-[10px] text-slate-400 block font-normal">≈ {formatNumber(r.liquid_litres_ha, 0)} L/ha</span>
        </div>
      )
    },
    {
      key: 'avg_yield_t_ha',
      header: 'Crop Yield',
      unit: 't/ha',
      render: (val) => <span className="text-slate-200">{formatNumber(val, 2)} t/ha</span>
    },
    {
      key: 'avg_cost_ha',
      header: 'Production Cost C2',
      unit: '₹/ha',
      render: (val) => <span style={{ color: COLOR_COST }} className="font-medium">{formatCurrency(val)}</span>
    },
    {
      key: 'gross_revenue_ha',
      header: 'Farm-gate Revenue',
      unit: '₹/ha',
      render: (val) => <span style={{ color: COLOR_REVENUE }} className="font-bold">{formatCurrency(val)}</span>
    },
    {
      key: 'net_profit_ha',
      header: 'Net Farmer Profit',
      unit: '₹/ha',
      render: (val) => (
        <span style={{ color: val >= 0 ? COLOR_PROFIT : COLOR_LOSS }} className="font-bold">
          {formatCurrency(val)}
        </span>
      )
    },
    {
      key: 'roi_pct',
      header: 'Net ROI',
      unit: '%',
      render: (val) => (
        <span style={{ color: val >= 0 ? '#c084fc' : COLOR_LOSS }} className="font-extrabold">
          {formatPercentage(val, 1)}
        </span>
      )
    },
  ];

  const TopicIcon = currentTopicObj.icon;

  return (
    <div className="space-y-6">
      {/* ========================================================
          PAGE HEADER
         ======================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span className="p-2.5 rounded-2xl bg-gradient-to-br from-brand-500/30 to-teal-500/20 border border-brand-400/40 text-brand-300 shadow-lg shadow-brand-500/10">
              <Split className="w-6 h-6" />
            </span>
            <span>Comparative Crop Intelligence Studio</span>
          </h1>
          <p className="text-xs lg:text-sm text-slate-300 mt-1 font-medium">
            Side-by-side agronomic economics, farm profitability, and physical crushing extraction benchmarking.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DataSourceBadge type="calculated" sourceName="DES × CACP × ICAR-IIOR" />
        </div>
      </div>

      {/* ========================================================
          UNIVERSAL CROP SELECTION BAR (HIGH CONTRAST)
         ======================================================== */}
      <div className="bg-navy-950 rounded-2xl p-4 sm:p-5 border border-slate-700 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-brand-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Select Oilseeds to Benchmark ({selectedCrops.length} Active)
            </span>
            {filterLoading && <RefreshCw className="w-3.5 h-3.5 text-brand-400 animate-spin" />}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={selectAll}
              className="px-3 py-1.5 rounded-lg bg-navy-900 text-white font-bold text-xs border border-slate-600 hover:border-brand-400 transition-colors shadow-sm"
            >
              Select All
            </button>
            <button
              onClick={selectTopROI}
              className="px-3 py-1.5 rounded-lg bg-violet-950 text-violet-200 font-bold text-xs border border-violet-600 hover:border-violet-400 transition-colors shadow-sm"
            >
              Top 3 ROI
            </button>
            <button
              onClick={selectTopOil}
              className="px-3 py-1.5 rounded-lg bg-cyan-950 text-cyan-200 font-bold text-xs border border-cyan-600 hover:border-cyan-400 transition-colors shadow-sm"
            >
              Top 3 Oil Content
            </button>
            <button
              onClick={resetDefaults}
              className="px-3 py-1.5 rounded-lg bg-navy-900 text-slate-300 font-bold text-xs border border-slate-700 hover:text-white transition-colors shadow-sm"
            >
              Reset Defaults
            </button>
          </div>
        </div>

        {/* Crop Pills */}
        <div className="flex flex-wrap gap-2.5">
          {cropsList.map((c) => {
            const isSelected = selectedCrops.includes(c.crop_name);
            return (
              <button
                key={c.crop_name}
                onClick={() => toggleCrop(c.crop_name)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                  isSelected
                    ? 'bg-gradient-to-r from-brand-500/30 to-teal-500/30 text-white border-brand-400 shadow-md shadow-brand-500/20'
                    : 'bg-navy-900 text-slate-300 border-slate-700 hover:border-slate-500 hover:text-white'
                }`}
              >
                {isSelected ? (
                  <CheckSquare className="w-4 h-4 text-brand-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500" />
                )}
                <span>{c.crop_name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          ONLY THE SELECTED OPTION GRAPH (FULL WIDTH & PROMINENT)
         ======================================================== */}
      <div className="bg-navy-950 rounded-2xl p-5 sm:p-6 border border-slate-700 shadow-2xl flex flex-col justify-between space-y-5">
        <div>
          {/* Card Header + Graph Tabs Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-2xl border shrink-0 ${
                activeSubpart === 'financial'
                  ? 'bg-purple-500/20 border-purple-400/40 text-purple-300'
                  : 'bg-amber-500/20 border-amber-400/40 text-amber-300'
              }`}>
                <TopicIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg lg:text-xl font-black text-white tracking-tight">
                    {currentTopicObj.label} Comparison
                  </h2>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                    activeSubpart === 'financial'
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}>
                    {currentTopicObj.subpartTitle}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({selectedCrops.length} Active Crops)
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  {currentTopicObj.desc}
                </p>
              </div>
            </div>

            {/* DEDICATED GRAPH TABS FOR THE SELECTED TOPIC */}
            <div className="flex items-center gap-1.5 bg-navy-900 p-1.5 rounded-xl border border-slate-700 flex-wrap self-start lg:self-auto">
              <span className="text-[10px] font-bold text-slate-400 px-2 uppercase tracking-wider">
                Graph Tabs:
              </span>
              {currentTopicObj.supportedTabs.map((tab) => {
                const isTabActive = activeGraphTab === tab.id;
                const TabIcon = tab.icon;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveGraphTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isTabActive
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-md shadow-purple-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-navy-800'
                    }`}
                  >
                    <TabIcon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Micro-Stats Highlights for the Selected Topic with matching innovative palette */}
          {topicStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 text-[11px]">
              {activeSubpart === 'financial' ? (
                <>
                  <div className="bg-navy-900/90 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block font-medium">Top Gross Revenue</span>
                    <span style={{ color: COLOR_REVENUE }} className="font-extrabold font-mono text-xs">
                      {topicStats.topRev?.crop_name}: {formatCurrency(topicStats.topRev?.gross_revenue_ha)}
                    </span>
                  </div>
                  <div className="bg-navy-900/90 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block font-medium">Lowest Production Cost (C2)</span>
                    <span style={{ color: COLOR_COST }} className="font-extrabold font-mono text-xs">
                      {topicStats.lowCost?.crop_name}: {formatCurrency(topicStats.lowCost?.avg_cost_ha)}
                    </span>
                  </div>
                  <div className="bg-navy-900/90 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block font-medium">Peak Farmer Net Profit</span>
                    <span style={{ color: COLOR_PROFIT }} className="font-extrabold font-mono text-xs">
                      {topicStats.topProfit?.crop_name}: {formatCurrency(topicStats.topProfit?.net_profit_ha)}
                    </span>
                  </div>
                  <div className="bg-navy-900/90 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block font-medium">Top Capital ROI %</span>
                    <span style={{ color: '#c084fc' }} className="font-extrabold font-mono text-xs">
                      {topicStats.topROI?.crop_name}: {formatPercentage(topicStats.topROI?.roi_pct, 1)}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-navy-900/90 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block font-medium">Peak Extraction Rate</span>
                    <span style={{ color: COLOR_OIL }} className="font-extrabold font-mono text-xs">
                      {topicStats.topExtraction?.crop_name}: {formatNumber(topicStats.topExtraction?.extraction_rate_pct, 1)}%
                    </span>
                  </div>
                  <div className="bg-navy-900/90 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block font-medium">Top Crude Oil Output</span>
                    <span style={{ color: COLOR_CRUDE }} className="font-extrabold font-mono text-xs">
                      {topicStats.topCrude?.crop_name}: {formatNumber(topicStats.topCrude?.crude_oil_kg_ha, 0)} kg/ha
                    </span>
                  </div>
                  <div className="bg-navy-900/90 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block font-medium">Liquid Oil Equivalent</span>
                    <span style={{ color: COLOR_PROFIT }} className="font-extrabold font-mono text-xs">
                      {topicStats.topCrude?.crop_name}: ≈ {formatNumber(topicStats.topCrude?.liquid_litres_ha, 0)} L/ha
                    </span>
                  </div>
                  <div className="bg-navy-900/90 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-[10px] block font-medium">Highest Economic ROI</span>
                    <span style={{ color: '#c084fc' }} className="font-extrabold font-mono text-xs">
                      {topicStats.topROI?.crop_name}: {formatPercentage(topicStats.topROI?.roi_pct, 1)}
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* --------------------------------------------------------
              ACTIVE GRAPH CANVAS
             -------------------------------------------------------- */}
          <div className="mt-5 min-h-[380px] w-full">
            {comparisonData.length === 0 ? (
              <div className="flex items-center justify-center h-96 text-slate-400 text-xs">
                Select crops above to generate comparison visualization.
              </div>
            ) : activeGraphTab === 'breakdown' ? (
              /* TABULAR DATA BREAKDOWN TAILORED FOR THIS SPECIFIC TOPIC */
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-navy-900/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-navy-900 text-slate-300 font-bold border-b border-slate-800 uppercase text-[10px]">
                    <tr>
                      <th className="p-3.5">Oilseed Crop</th>
                      {activeTopic === 'rev_vs_oil' && (
                        <>
                          <th className="p-3.5 text-right">Farm Revenue (₹/ha)</th>
                          <th className="p-3.5 text-right">Oil Extract Rate (%)</th>
                          <th className="p-3.5 text-right">Crude Oil (kg/ha)</th>
                          <th className="p-3.5 text-right">Liquid Vol (L/ha)</th>
                          <th className="p-3.5 text-right">Realization (₹/kg oil)</th>
                        </>
                      )}
                      {activeTopic === 'cost_vs_oil' && (
                        <>
                          <th className="p-3.5 text-right">Cost C2 (₹/ha)</th>
                          <th className="p-3.5 text-right">Oil Extract Rate (%)</th>
                          <th className="p-3.5 text-right">Crude Oil (kg/ha)</th>
                          <th className="p-3.5 text-right">Liquid Vol (L/ha)</th>
                          <th className="p-3.5 text-right">Extraction Cost (₹/kg oil)</th>
                        </>
                      )}
                      {activeTopic === 'profit_vs_oil' && (
                        <>
                          <th className="p-3.5 text-right">Net Profit (₹/ha)</th>
                          <th className="p-3.5 text-right">Oil Extract Rate (%)</th>
                          <th className="p-3.5 text-right">Crude Oil (kg/ha)</th>
                          <th className="p-3.5 text-right">Liquid Vol (L/ha)</th>
                          <th className="p-3.5 text-right">Net Margin (₹/kg oil)</th>
                        </>
                      )}
                      {activeTopic !== 'rev_vs_oil' && activeTopic !== 'cost_vs_oil' && activeTopic !== 'profit_vs_oil' && (
                        <>
                          <th className="p-3.5 text-right">Farm Revenue (₹/ha)</th>
                          <th className="p-3.5 text-right">Cost C2 (₹/ha)</th>
                          <th className="p-3.5 text-right">Net Profit (₹/ha)</th>
                          <th className="p-3.5 text-right">Net Margin %</th>
                          <th className="p-3.5 text-right">Capital ROI %</th>
                          <th className="p-3.5 text-right">Oil Extract %</th>
                          <th className="p-3.5 text-right">Crude Oil (kg/ha)</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono">
                    {comparisonData.map((c) => (
                      <tr key={c.crop_name} className="hover:bg-navy-900/70 transition-colors">
                        <td className="p-3.5 font-sans font-bold text-white flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-brand-400" />
                          <span>{c.crop_name}</span>
                        </td>
                        {activeTopic === 'rev_vs_oil' && (
                          <>
                            <td style={{ color: COLOR_REVENUE }} className="p-3.5 text-right font-bold">{formatCurrency(c.gross_revenue_ha)}</td>
                            <td style={{ color: COLOR_OIL }} className="p-3.5 text-right font-extrabold">{formatNumber(c.extraction_rate_pct, 1)}%</td>
                            <td style={{ color: COLOR_CRUDE }} className="p-3.5 text-right font-bold">{formatNumber(c.crude_oil_kg_ha, 0)} kg</td>
                            <td className="p-3.5 text-right text-slate-300">{formatNumber(c.liquid_litres_ha, 0)} L</td>
                            <td style={{ color: COLOR_SPREAD }} className="p-3.5 text-right font-bold">{formatCurrency(c.rev_per_oil_kg)}/kg</td>
                          </>
                        )}
                        {activeTopic === 'cost_vs_oil' && (
                          <>
                            <td style={{ color: COLOR_COST }} className="p-3.5 text-right font-bold">{formatCurrency(c.avg_cost_ha)}</td>
                            <td style={{ color: COLOR_OIL }} className="p-3.5 text-right font-extrabold">{formatNumber(c.extraction_rate_pct, 1)}%</td>
                            <td style={{ color: COLOR_CRUDE }} className="p-3.5 text-right font-bold">{formatNumber(c.crude_oil_kg_ha, 0)} kg</td>
                            <td className="p-3.5 text-right text-slate-300">{formatNumber(c.liquid_litres_ha, 0)} L</td>
                            <td style={{ color: COLOR_COST }} className="p-3.5 text-right font-bold">{formatCurrency(c.cost_per_oil_kg)}/kg</td>
                          </>
                        )}
                        {activeTopic === 'profit_vs_oil' && (
                          <>
                            <td style={{ color: c.net_profit_ha >= 0 ? COLOR_PROFIT : COLOR_LOSS }} className="p-3.5 text-right font-bold">{formatCurrency(c.net_profit_ha)}</td>
                            <td style={{ color: COLOR_OIL }} className="p-3.5 text-right font-extrabold">{formatNumber(c.extraction_rate_pct, 1)}%</td>
                            <td style={{ color: COLOR_CRUDE }} className="p-3.5 text-right font-bold">{formatNumber(c.crude_oil_kg_ha, 0)} kg</td>
                            <td className="p-3.5 text-right text-slate-300">{formatNumber(c.liquid_litres_ha, 0)} L</td>
                            <td style={{ color: c.profit_per_oil_kg >= 0 ? COLOR_PROFIT : COLOR_LOSS }} className="p-3.5 text-right font-bold">{formatCurrency(c.profit_per_oil_kg)}/kg</td>
                          </>
                        )}
                        {activeTopic !== 'rev_vs_oil' && activeTopic !== 'cost_vs_oil' && activeTopic !== 'profit_vs_oil' && (
                          <>
                            <td style={{ color: COLOR_REVENUE }} className="p-3.5 text-right font-bold">{formatCurrency(c.gross_revenue_ha)}</td>
                            <td style={{ color: COLOR_COST }} className="p-3.5 text-right">{formatCurrency(c.avg_cost_ha)}</td>
                            <td style={{ color: c.net_profit_ha >= 0 ? COLOR_PROFIT : COLOR_LOSS }} className="p-3.5 text-right font-bold">
                              {formatCurrency(c.net_profit_ha)}
                            </td>
                            <td className="p-3.5 text-right text-slate-300">{formatPercentage(c.profit_margin_pct, 1)}</td>
                            <td style={{ color: '#c084fc' }} className="p-3.5 text-right font-bold">{formatPercentage(c.roi_pct, 1)}</td>
                            <td style={{ color: COLOR_OIL }} className="p-3.5 text-right font-extrabold">{formatNumber(c.extraction_rate_pct, 1)}%</td>
                            <td style={{ color: COLOR_CRUDE }} className="p-3.5 text-right font-bold">{formatNumber(c.crude_oil_kg_ha, 0)} kg</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : activeGraphTab === 'differential' && activeTopic === 'rev_vs_cost' ? (
              /* SPREAD / MARGIN DIFFERENTIAL BAR */
              <ResponsiveContainer width="100%" height={380}>
                <BarChart data={comparisonData}>
                  {renderGradients()}
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                  <XAxis dataKey="crop_name" stroke={AXIS_COLOR} tick={{ fontSize: 12, fill: '#f0f9ff', fontWeight: 600 }} />
                  <YAxis stroke={AXIS_COLOR} tick={{ fontSize: 11, fill: AXIS_COLOR }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={customTooltip} />
                  <Legend wrapperStyle={{ color: '#ffffff', fontSize: 12, paddingTop: 6 }} />
                  <Bar dataKey="margin_spread" name="Net Margin Spread (Revenue − Cost C2)" radius={[6, 6, 0, 0]}>
                    {comparisonData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.margin_spread >= 0 ? COLOR_PROFIT : COLOR_LOSS}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : activeGraphTab === 'area' ? (
              /* AREA GRADIENT CHART WITH INNOVATIVE PALETTE */
              <ResponsiveContainer width="100%" height={380}>
                <AreaChart data={comparisonData}>
                  {renderGradients()}
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                  <XAxis dataKey="crop_name" stroke={AXIS_COLOR} tick={{ fontSize: 12, fill: '#f0f9ff', fontWeight: 600 }} />
                  <YAxis
                    stroke={AXIS_COLOR}
                    tick={{ fontSize: 11, fill: AXIS_COLOR }}
                    tickFormatter={(v) =>
                      activeTopic === 'roi_benchmark'
                        ? `${v}%`
                        : activeTopic === 'crude_oil_kg'
                        ? `${v} kg`
                        : activeTopic === 'oil_extraction_pct'
                        ? `${v}%`
                        : `₹${(v / 1000).toFixed(0)}k`
                    }
                  />
                  <Tooltip content={customTooltip} />
                  <Legend wrapperStyle={{ color: '#ffffff', fontSize: 12, paddingTop: 6 }} />

                  {(activeTopic === 'rev_vs_cost' || activeTopic === 'rev_vs_profit' || activeTopic === 'all_financial' || activeTopic === 'rev_vs_oil') && (
                    <Area type="monotone" dataKey="gross_revenue_ha" name="Farm Revenue (₹/ha)" stroke={COLOR_REVENUE} fill="url(#gradRev)" fillOpacity={1} strokeWidth={2.5} />
                  )}
                  {(activeTopic === 'rev_vs_cost' || activeTopic === 'cost_vs_profit' || activeTopic === 'all_financial' || activeTopic === 'cost_vs_oil') && (
                    <Area type="monotone" dataKey="avg_cost_ha" name="Cost C2 (₹/ha)" stroke={COLOR_COST} fill="url(#gradCost)" fillOpacity={1} strokeWidth={2.5} />
                  )}
                  {(activeTopic === 'cost_vs_profit' || activeTopic === 'rev_vs_profit' || activeTopic === 'all_financial' || activeTopic === 'profit_vs_oil') && (
                    <Area type="monotone" dataKey="net_profit_ha" name="Net Profit (₹/ha)" stroke={COLOR_PROFIT} fill="url(#gradProfit)" fillOpacity={1} strokeWidth={2.5} />
                  )}
                  {activeTopic === 'roi_benchmark' && (
                    <Area type="monotone" dataKey="roi_pct" name="Capital ROI (%)" stroke={COLOR_ROI} fill="url(#gradROI)" fillOpacity={1} strokeWidth={2.5} />
                  )}
                  {activeTopic === 'crude_oil_kg' && (
                    <Area type="monotone" dataKey="crude_oil_kg_ha" name="Crude Oil Yield (kg/ha)" stroke={COLOR_CRUDE} fill="url(#gradCrude)" fillOpacity={1} strokeWidth={3} />
                  )}
                  {activeTopic === 'oil_extraction_pct' && (
                    <Area type="monotone" dataKey="extraction_rate_pct" name="Oil Extraction Rate (%)" stroke={COLOR_OIL} fill="url(#gradOil)" fillOpacity={1} strokeWidth={3} />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            ) : activeGraphTab === 'composed' ? (
              /* COMPOSED MULTI-AXIS CHART */
              <ResponsiveContainer width="100%" height={380}>
                {activeSubpart === 'financial' ? (
                  <ComposedChart data={comparisonData}>
                    {renderGradients()}
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                    <XAxis dataKey="crop_name" stroke={AXIS_COLOR} tick={{ fontSize: 12, fill: '#f0f9ff', fontWeight: 600 }} />
                    <YAxis stroke={AXIS_COLOR} tick={{ fontSize: 11, fill: AXIS_COLOR }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={customTooltip} />
                    <Legend wrapperStyle={{ color: '#ffffff', fontSize: 12, paddingTop: 6 }} />

                    {activeTopic === 'rev_vs_cost' && (
                      <>
                        <Bar dataKey="gross_revenue_ha" name="Farm Revenue (₹/ha)" fill={COLOR_REVENUE} radius={[5, 5, 0, 0]} />
                        <Line type="monotone" dataKey="avg_cost_ha" name="Cultivation Cost C2 (₹/ha)" stroke={COLOR_COST} strokeWidth={3.5} dot={{ r: 5, fill: COLOR_COST, stroke: '#020817', strokeWidth: 1.5 }} />
                      </>
                    )}

                    {activeTopic === 'cost_vs_profit' && (
                      <>
                        <Bar dataKey="avg_cost_ha" name="Cultivation Cost C2 (₹/ha)" fill={COLOR_COST} radius={[5, 5, 0, 0]} />
                        <Line type="monotone" dataKey="net_profit_ha" name="Net Farmer Profit (₹/ha)" stroke={COLOR_PROFIT} strokeWidth={3.5} dot={{ r: 5, fill: COLOR_PROFIT, stroke: '#020817', strokeWidth: 1.5 }} />
                      </>
                    )}

                    {activeTopic === 'rev_vs_profit' && (
                      <>
                        <Bar dataKey="gross_revenue_ha" name="Farm Revenue (₹/ha)" fill={COLOR_REVENUE} radius={[5, 5, 0, 0]} />
                        <Line type="monotone" dataKey="net_profit_ha" name="Net Farmer Profit (₹/ha)" stroke={COLOR_PROFIT} strokeWidth={3.5} dot={{ r: 5, fill: COLOR_PROFIT, stroke: '#020817', strokeWidth: 1.5 }} />
                      </>
                    )}

                    {activeTopic === 'all_financial' && (
                      <>
                        <Bar dataKey="gross_revenue_ha" name="Revenue (₹/ha)" fill={COLOR_REVENUE} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="avg_cost_ha" name="Cost C2 (₹/ha)" fill={COLOR_COST} radius={[4, 4, 0, 0]} />
                        <Line type="monotone" dataKey="net_profit_ha" name="Net Profit (₹/ha)" stroke={COLOR_PROFIT} strokeWidth={3.5} dot={{ r: 5, fill: COLOR_PROFIT, stroke: '#020817', strokeWidth: 1.5 }} />
                      </>
                    )}

                    {activeTopic === 'roi_benchmark' && (
                      <>
                        <Bar dataKey="roi_pct" name="Capital ROI (%)" fill={COLOR_ROI} radius={[5, 5, 0, 0]}>
                          {comparisonData.map((_, idx) => (
                            <Cell key={`cell-roi-composed-${idx}`} fill={CROP_PALETTE[idx % CROP_PALETTE.length]} />
                          ))}
                        </Bar>
                        <Line type="monotone" dataKey="net_profit_ha" name="Net Profit (₹/ha)" stroke={COLOR_PROFIT} strokeWidth={3} dot={{ r: 4, fill: COLOR_PROFIT, stroke: '#020817' }} />
                      </>
                    )}
                  </ComposedChart>
                ) : (
                  /* DUAL-AXIS COMPOSED FOR ALL OIL TOPICS */
                  <ComposedChart data={comparisonData}>
                    {renderGradients()}
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                    <XAxis dataKey="crop_name" stroke={AXIS_COLOR} tick={{ fontSize: 12, fill: '#f0f9ff', fontWeight: 600 }} />
                    
                    {/* Left Axis: Monetary (₹/ha), Yield (kg), or ROI (%) */}
                    <YAxis
                      yAxisId="left"
                      stroke={AXIS_COLOR}
                      tick={{ fontSize: 11, fill: AXIS_COLOR }}
                      tickFormatter={(v) =>
                        activeTopic === 'roi_vs_oil'
                          ? `${v}%`
                          : activeTopic === 'crude_oil_kg'
                          ? `${v} kg`
                          : `₹${(v / 1000).toFixed(0)}k`
                      }
                    />

                    {/* Right Axis: Oil Extraction Rate (%) */}
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke={COLOR_OIL}
                      tick={{ fontSize: 11, fill: COLOR_OIL }}
                      unit="%"
                      domain={[0, (dataMax) => Math.max(60, Math.ceil(dataMax + 5))]}
                    />

                    <Tooltip content={customTooltip} />
                    <Legend wrapperStyle={{ color: '#ffffff', fontSize: 12, paddingTop: 6 }} />

                    {/* Primary Bar on Left Axis */}
                    {activeTopic === 'roi_vs_oil' && (
                      <Bar yAxisId="left" dataKey="roi_pct" name="Net ROI (%)" fill={COLOR_ROI} radius={[5, 5, 0, 0]} />
                    )}
                    {activeTopic === 'crude_oil_kg' && (
                      <Bar yAxisId="left" dataKey="crude_oil_kg_ha" name="Crude Oil Yield (kg/ha)" fill={COLOR_CRUDE} radius={[5, 5, 0, 0]} />
                    )}
                    {activeTopic === 'rev_vs_oil' && (
                      <Bar yAxisId="left" dataKey="gross_revenue_ha" name="Farm Revenue (₹/ha)" fill={COLOR_REVENUE} radius={[5, 5, 0, 0]} />
                    )}
                    {activeTopic === 'cost_vs_oil' && (
                      <Bar yAxisId="left" dataKey="avg_cost_ha" name="Production Cost C2 (₹/ha)" fill={COLOR_COST} radius={[5, 5, 0, 0]} />
                    )}
                    {activeTopic === 'profit_vs_oil' && (
                      <Bar yAxisId="left" dataKey="net_profit_ha" name="Net Farmer Profit (₹/ha)" fill={COLOR_PROFIT} radius={[5, 5, 0, 0]} />
                    )}

                    {/* Prominent Oil Extraction Rate % Line on Right Axis */}
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="extraction_rate_pct"
                      name="Oil Extraction Rate (%)"
                      stroke={COLOR_OIL}
                      strokeWidth={3.5}
                      dot={{ r: 6, fill: COLOR_OIL, stroke: '#020817', strokeWidth: 2 }}
                      activeDot={{ r: 8, stroke: '#ffffff', strokeWidth: 2 }}
                    />
                  </ComposedChart>
                )}
              </ResponsiveContainer>
            ) : (
              /* DUAL-AXIS OR MULTI-CROP BAR CHART */
              <ResponsiveContainer width="100%" height={380}>
                {activeSubpart === 'oil' && (activeTopic === 'rev_vs_oil' || activeTopic === 'cost_vs_oil' || activeTopic === 'profit_vs_oil' || activeTopic === 'roi_vs_oil') ? (
                  /* DUAL-AXIS BAR CHART FOR OIL RATIO COMPARISONS */
                  <BarChart data={comparisonData}>
                    {renderGradients()}
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                    <XAxis dataKey="crop_name" stroke={AXIS_COLOR} tick={{ fontSize: 12, fill: '#f0f9ff', fontWeight: 600 }} />
                    <YAxis
                      yAxisId="left"
                      stroke={AXIS_COLOR}
                      tick={{ fontSize: 11, fill: AXIS_COLOR }}
                      tickFormatter={(v) => activeTopic === 'roi_vs_oil' ? `${v}%` : `₹${(v / 1000).toFixed(0)}k`}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      stroke={COLOR_OIL}
                      tick={{ fontSize: 11, fill: COLOR_OIL }}
                      unit="%"
                      domain={[0, (dataMax) => Math.max(60, Math.ceil(dataMax + 5))]}
                    />
                    <Tooltip content={customTooltip} />
                    <Legend wrapperStyle={{ color: '#ffffff', fontSize: 12, paddingTop: 6 }} />

                    {activeTopic === 'rev_vs_oil' && (
                      <Bar yAxisId="left" dataKey="gross_revenue_ha" name="Farm Revenue (₹/ha)" fill={COLOR_REVENUE} radius={[5, 5, 0, 0]} />
                    )}
                    {activeTopic === 'cost_vs_oil' && (
                      <Bar yAxisId="left" dataKey="avg_cost_ha" name="Production Cost C2 (₹/ha)" fill={COLOR_COST} radius={[5, 5, 0, 0]} />
                    )}
                    {activeTopic === 'profit_vs_oil' && (
                      <Bar yAxisId="left" dataKey="net_profit_ha" name="Net Farmer Profit (₹/ha)" fill={COLOR_PROFIT} radius={[5, 5, 0, 0]} />
                    )}
                    {activeTopic === 'roi_vs_oil' && (
                      <Bar yAxisId="left" dataKey="roi_pct" name="Net ROI (%)" fill={COLOR_ROI} radius={[5, 5, 0, 0]} />
                    )}

                    <Bar yAxisId="right" dataKey="extraction_rate_pct" name="Oil Extraction Rate (%)" fill={COLOR_OIL} radius={[5, 5, 0, 0]} />
                  </BarChart>
                ) : (
                  /* SINGLE-AXIS OR CLUSTERED BAR CHART */
                  <BarChart data={comparisonData}>
                    {renderGradients()}
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                    <XAxis dataKey="crop_name" stroke={AXIS_COLOR} tick={{ fontSize: 12, fill: '#f0f9ff', fontWeight: 600 }} />
                    <YAxis
                      stroke={AXIS_COLOR}
                      tick={{ fontSize: 11, fill: AXIS_COLOR }}
                      tickFormatter={(v) =>
                        activeTopic === 'roi_benchmark' || activeTopic === 'oil_extraction_pct'
                          ? `${v}%`
                          : activeTopic === 'crude_oil_kg'
                          ? `${v} kg`
                          : `₹${(v / 1000).toFixed(0)}k`
                      }
                    />
                    <Tooltip content={customTooltip} />
                    <Legend wrapperStyle={{ color: '#ffffff', fontSize: 12, paddingTop: 6 }} />

                    {(activeTopic === 'rev_vs_cost' || activeTopic === 'rev_vs_profit' || activeTopic === 'all_financial') && (
                      <Bar dataKey="gross_revenue_ha" name="Farm Revenue (₹/ha)" fill={COLOR_REVENUE} radius={[5, 5, 0, 0]} />
                    )}
                    {(activeTopic === 'rev_vs_cost' || activeTopic === 'cost_vs_profit' || activeTopic === 'all_financial') && (
                      <Bar dataKey="avg_cost_ha" name="Cost C2 (₹/ha)" fill={COLOR_COST} radius={[5, 5, 0, 0]} />
                    )}
                    {(activeTopic === 'cost_vs_profit' || activeTopic === 'rev_vs_profit' || activeTopic === 'all_financial') && (
                      <Bar dataKey="net_profit_ha" name="Net Profit (₹/ha)" fill={COLOR_PROFIT} radius={[5, 5, 0, 0]} />
                    )}
                    {activeTopic === 'roi_benchmark' && (
                      <Bar dataKey="roi_pct" name="Capital ROI (%)" radius={[5, 5, 0, 0]}>
                        {comparisonData.map((_, idx) => (
                          <Cell key={`cell-roi-${idx}`} fill={CROP_PALETTE[idx % CROP_PALETTE.length]} />
                        ))}
                      </Bar>
                    )}
                    {activeTopic === 'crude_oil_kg' && (
                      <Bar dataKey="crude_oil_kg_ha" name="Crude Oil Yield (kg/ha)" radius={[5, 5, 0, 0]}>
                        {comparisonData.map((_, idx) => (
                          <Cell key={`cell-crude-${idx}`} fill={CROP_PALETTE[idx % CROP_PALETTE.length]} />
                        ))}
                      </Bar>
                    )}
                    {activeTopic === 'oil_extraction_pct' && (
                      <Bar dataKey="extraction_rate_pct" name="Oil Extraction Rate (%)" radius={[5, 5, 0, 0]}>
                        {comparisonData.map((_, idx) => (
                          <Cell key={`cell-ext-${idx}`} fill={CROP_PALETTE[idx % CROP_PALETTE.length]} />
                        ))}
                      </Bar>
                    )}
                  </BarChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Card Footer */}
        <div className="pt-3.5 border-t border-slate-800 text-[11px] text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <span className="text-slate-200 font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
            <span>Active Display: {currentTopicObj.label} ({activeGraphTab.replace('_', ' ').toUpperCase()})</span>
          </span>
          <span className="text-slate-400 font-mono">
            {currentTopicObj.sourceType}
          </span>
        </div>
      </div>

      {/* ========================================================
          DETAILED COMPARATIVE BENCHMARK MASTER TABLE AT THE END
         ======================================================== */}
      <div className="mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Factory className="w-5 h-5 text-brand-400" />
              <span>Comprehensive Oilseed Agronomic, Processing &amp; Financial Master Table</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Complete multi-variable matrix with instant sorting, search filter, and CSV data export.
            </p>
          </div>
        </div>

        <DataTable
          columns={tableColumns}
          data={comparisonData}
          searchPlaceholder="Search in compared oilseeds..."
          exportFileName={`crop_comparison_${selectedCrops.join('_')}.csv`}
          itemsPerPage={10}
        />
      </div>
    </div>
  );
};

export default CropComparison;
