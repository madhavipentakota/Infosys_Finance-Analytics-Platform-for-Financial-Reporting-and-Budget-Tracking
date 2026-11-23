import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  Percent,
  Coins,
  ArrowRight,
  AlertTriangle,
  Info,
  Sliders
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, BarChart, Bar
} from 'recharts';
import { ChartCard } from '../components/ChartCard';
import { KPICard } from '../components/KPIcard';
import { DataSourceBadge } from '../components/DataSourceBadge';
import { analyticsService } from '../services/analyticsService';
import { formatCurrency, formatNumber, formatPercentage } from '../utils/formatters';

export const RiskAnalysis = () => {
  const [crops, setCrops] = useState([]);
  const [regions, setRegions] = useState([]);
  const [form, setForm] = useState({
    crop_name: 'Soybean',
    region: 'Madhya Pradesh',
    land_area: 10
  });

  const [sensitivityResult, setSensitivityResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const [c, r] = await Promise.all([
          analyticsService.getCrops(),
          analyticsService.getRegions()
        ]);
        setCrops(c || []);
        setRegions(r || []);
        if (c?.length > 0) setForm(prev => ({ ...prev, crop_name: c[0].crop_name }));
        if (r?.length > 0) setForm(prev => ({ ...prev, region: r[0] }));
      } catch (err) {
        console.error("Risk init error:", err);
      }
    };
    init();
  }, []);

  const handleRunSensitivity = async () => {
    setLoading(true);
    try {
      const res = await analyticsService.calculateSensitivity({
        crop_name: form.crop_name,
        region: form.region,
        land_area: Number(form.land_area),
        price_variations_pct: [-15, -10, -5, 0, 5, 10, 15],
        yield_variations_pct: [-20, -10, 0, 10, 20]
      });
      setSensitivityResult(res);
    } catch (err) {
      console.error("Sensitivity failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (form.crop_name) {
      handleRunSensitivity();
    }
  }, [form.crop_name, form.region, form.land_area]);

  const priceCurveData = React.useMemo(() => {
    return (sensitivityResult?.price_sensitivity || []).map(p => ({
      ...p,
      variation_pct: p.percentage_change,
      net_profit: p.profit,
      roi_pct: p.roi_percentage
    }));
  }, [sensitivityResult]);

  const yieldCurveData = React.useMemo(() => {
    return (sensitivityResult?.yield_sensitivity || []).map(y => ({
      ...y,
      variation_pct: y.percentage_change,
      net_profit: y.profit,
      roi_pct: y.roi_percentage
    }));
  }, [sensitivityResult]);

  const scenarios = React.useMemo(() => {
    if (!sensitivityResult?.base_case) return null;
    const base = sensitivityResult.base_case;
    const pItem = (sensitivityResult.price_sensitivity || []).find(p => p.percentage_change === -10) || sensitivityResult.price_sensitivity?.[1] || {};
    const oItem = (sensitivityResult.price_sensitivity || []).find(p => p.percentage_change === 10) || sensitivityResult.price_sensitivity?.[sensitivityResult.price_sensitivity.length - 2] || {};

    return {
      base: {
        net_profit: base.profit,
        revenue: base.revenue,
        roi_pct: base.roi_percentage
      },
      pessimistic: {
        net_profit: pItem.profit ?? (base.profit * 1.3),
        revenue: pItem.revenue ?? (base.revenue * 0.9),
        roi_pct: pItem.roi_percentage ?? (base.roi_percentage - 10)
      },
      optimistic: {
        net_profit: oItem.profit ?? (base.profit * 0.7),
        revenue: oItem.revenue ?? (base.revenue * 1.1),
        roi_pct: oItem.roi_percentage ?? (base.roi_percentage + 10)
      }
    };
  }, [sensitivityResult]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-rose-400" />
          Risk & Stress Testing Sensitivity Analysis
        </h1>
        <p className="text-xs lg:text-sm text-slate-400 mt-1">
          Evaluate downside financial exposure against market price collapses, monsoon drought yield shocks, and input cost inflation.
        </p>
      </div>

      {/* Input Controls */}
      <div className="glass-card rounded-xl p-4 border border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Crop</label>
          <select
            value={form.crop_name}
            onChange={(e) => setForm({ ...form, crop_name: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
          >
            {crops.map((c) => (
              <option key={c.id || c.crop_name} value={c.crop_name}>{c.crop_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Region</label>
          <select
            value={form.region}
            onChange={(e) => setForm({ ...form, region: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
          >
            {regions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Land (ha)</label>
          <input
            type="number"
            min="1"
            value={form.land_area}
            onChange={(e) => setForm({ ...form, land_area: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
          />
        </div>

        <div className="pt-4">
          <button
            onClick={handleRunSensitivity}
            disabled={loading}
            className="w-full py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-900/30 transition-colors"
          >
            {loading ? "Simulating..." : "Run Stress Test"}
          </button>
        </div>
      </div>

      {/* 3 Core Scenario Archetypes */}
      {sensitivityResult && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pessimistic */}
          <div className="glass-card rounded-xl p-4 border border-rose-800/60 bg-rose-950/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                Downside Shock (-10% Price & -10% Yield)
              </span>
              <TrendingDown className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-xl font-extrabold text-white">
              {formatCurrency(sensitivityResult.scenarios?.pessimistic?.net_profit)}
            </div>
            <div className="text-xs text-rose-300 font-mono">
              ROI: {formatPercentage(sensitivityResult.scenarios?.pessimistic?.roi_pct, 1)}
            </div>
            <p className="text-[10px] text-slate-400 pt-2 border-t border-slate-800">
              Severe drought / gluts scenario: Revenue {formatCurrency(sensitivityResult.scenarios?.pessimistic?.revenue)}
            </p>
          </div>

          {/* Base Case */}
          <div className="glass-card rounded-xl p-4 border border-harvest-700/60 bg-harvest-950/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-harvest-400 uppercase tracking-wider">
                Base Case (Historical Baseline)
              </span>
              <Percent className="w-4 h-4 text-harvest-400" />
            </div>
            <div className="text-xl font-extrabold text-white">
              {formatCurrency(sensitivityResult.scenarios?.base?.net_profit)}
            </div>
            <div className="text-xs text-harvest-300 font-mono">
              ROI: {formatPercentage(sensitivityResult.scenarios?.base?.roi_pct, 1)}
            </div>
            <p className="text-[10px] text-slate-400 pt-2 border-t border-slate-800">
              Mean regional yield & Mandi prices: Revenue {formatCurrency(sensitivityResult.scenarios?.base?.revenue)}
            </p>
          </div>

          {/* Optimistic */}
          <div className="glass-card rounded-xl p-4 border border-emerald-800/60 bg-emerald-950/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Upside Shock (+10% Price & +10% Yield)
              </span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-extrabold text-white">
              {formatCurrency(sensitivityResult.scenarios?.optimistic?.net_profit)}
            </div>
            <div className="text-xs text-emerald-300 font-mono">
              ROI: {formatPercentage(sensitivityResult.scenarios?.optimistic?.roi_pct, 1)}
            </div>
            <p className="text-[10px] text-slate-400 pt-2 border-t border-slate-800">
              Favorable monsoon & strong demand: Revenue {formatCurrency(sensitivityResult.scenarios?.optimistic?.revenue)}
            </p>
          </div>
        </div>
      )}

      {/* Sensitivity Curves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Price Sensitivity Elasticity"
          subtitle="Net Profit impact across Mandi price variations (-15% to +15%)"
          sourceType="calculated"
          sourceName="Sensitivity Model"
        >
          {priceCurveData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={priceCurveData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#243722" />
                <XAxis dataKey="variation_pct" stroke="#8fae88" tick={{ fontSize: 11 }} unit="%" />
                <YAxis stroke="#8fae88" tick={{ fontSize: 11 }} tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(val, name) => [
                  name === 'ROI (%)' ? `${val}%` : formatCurrency(val),
                  name
                ]} />
                <Legend />
                <Line type="monotone" dataKey="net_profit" name="Net Profit (₹)" stroke="#ea8e0e" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-xs">
              Calculating price curve...
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Agronomic Yield Sensitivity Elasticity"
          subtitle="Net Profit impact across harvest yield variations (-20% to +20%)"
          sourceType="calculated"
          sourceName="Sensitivity Model"
        >
          {yieldCurveData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={yieldCurveData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#243722" />
                <XAxis dataKey="variation_pct" stroke="#8fae88" tick={{ fontSize: 11 }} unit="%" />
                <YAxis stroke="#8fae88" tick={{ fontSize: 11 }} tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(val, name) => [
                  name === 'ROI (%)' ? `${val}%` : formatCurrency(val),
                  name
                ]} />
                <Legend />
                <Line type="monotone" dataKey="net_profit" name="Net Profit (₹)" stroke="#358525" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-xs">
              Calculating yield curve...
            </div>
          )}
        </ChartCard>
      </div>

      {/* Risk Vulnerability Checklist */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
        <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
          <Info className="w-4 h-4 text-rose-400" />
          <span>Downside Risk Matrix Summary</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-slate-400">
          <div>
            <strong className="text-slate-200">Price Elasticity:</strong> For every 5% dip in Mandi wholesale realizations, net return declines by approximately{' '}
            <span className="text-rose-400 font-semibold font-mono">
              {priceCurveData.length >= 2 ? formatCurrency(Math.abs(priceCurveData[3]?.net_profit - priceCurveData[2]?.net_profit)) : '₹ 15,000'}
            </span>.
          </div>
          <div>
            <strong className="text-slate-200">Yield Vulnerability:</strong> Rainfed cultivation without supplementary drip irrigation faces severe loss risks when precipitation falls &gt;20% below IMD district normal.
          </div>
        </div>
      </div>
    </div>
  );
};
