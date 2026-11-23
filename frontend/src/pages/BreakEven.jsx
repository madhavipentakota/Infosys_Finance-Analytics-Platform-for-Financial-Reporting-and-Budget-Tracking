import React, { useState, useEffect } from 'react';
import {
  Layers,
  TrendingUp,
  Scale,
  Coins,
  ArrowRight,
  ShieldAlert,
  Info
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine, ReferenceArea
} from 'recharts';
import { KPICard } from '../components/KPIcard';
import { ChartCard } from '../components/ChartCard';
import { DataSourceBadge } from '../components/DataSourceBadge';
import { analyticsService } from '../services/analyticsService';
import { formatCurrency, formatNumber, formatPercentage } from '../utils/formatters';

export const BreakEven = () => {
  const [crops, setCrops] = useState([]);
  const [regions, setRegions] = useState([]);
  const [form, setForm] = useState({
    crop_name: 'Soybean',
    region: 'Madhya Pradesh',
    land_area: 10
  });

  const [result, setResult] = useState(null);
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
        console.error("Init failed:", err);
      }
    };
    init();
  }, []);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const res = await analyticsService.calculateBreakEven({
        crop_name: form.crop_name,
        region: form.region,
        land_area: Number(form.land_area)
      });
      setResult(res);
    } catch (err) {
      console.error("Break even calc error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (form.crop_name) {
      handleCalculate();
    }
  }, [form.crop_name, form.region, form.land_area]);

  // Normalized Break-Even metrics
  const bePriceKg = result?.break_even_price_per_kg ?? result?.break_even_price_kg ?? 0;
  const bePriceQuintal = result?.break_even_price_per_quintal ?? (bePriceKg * 100);
  const beProdTonnes = result?.break_even_production_tonnes ?? 0;
  const beYield = result?.break_even_yield_t_ha ?? (beProdTonnes / (Number(form.land_area) || 1));
  const safetyPct = result?.margin_of_safety_pct ?? result?.safety_margin_pct ?? 0;

  // Break-Even Chart points from backend or derived
  let chartData = [];
  if (result) {
    if (result.chart_points && result.chart_points.length > 0) {
      chartData = result.chart_points.map((pt) => ({
        production: pt.production_tonnes ?? pt.production,
        revenue: Math.round(pt.revenue),
        totalCost: Math.round(pt.cost ?? pt.totalCost),
        netProfit: Math.round(pt.net_profit ?? pt.netProfit)
      }));
    } else {
      const expProd = result.crop_production_tonnes || result.expected_production_tonnes || 10;
      const pricePerTonne = (result.market_price_per_kg || result.market_price_kg || 50) * 1000;
      const totalCost = result.total_cost || 100000;

      for (let p = 0; p <= 200; p += 20) {
        const prodVal = (expProd * p) / 100;
        const revVal = prodVal * pricePerTonne;
        chartData.push({
          production: parseFloat(prodVal.toFixed(1)),
          revenue: Math.round(revVal),
          totalCost: Math.round(totalCost),
          netProfit: Math.round(revVal - totalCost)
        });
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-white flex items-center gap-2">
          <Layers className="w-6 h-6 text-amber-400" />
          Break-Even Decision Engine
        </h1>
        <p className="text-xs lg:text-sm text-slate-400 mt-1">
          Identify operational thresholds: minimum yield harvest and minimum mandi market price required to avert capital losses.
        </p>
      </div>

      {/* Inputs Bar */}
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
          <label className="block text-[11px] font-medium text-slate-400 mb-1">Land (Hectares)</label>
          <input
            type="number"
            min="0.5"
            step="0.5"
            value={form.land_area}
            onChange={(e) => setForm({ ...form, land_area: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
          />
        </div>

        <div className="pt-4">
          <button
            onClick={handleCalculate}
            disabled={loading}
            className="w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md shadow-amber-900/30 transition-colors"
          >
            {loading ? "Calculating..." : "Update Break-Even"}
          </button>
        </div>
      </div>

      {/* KPI Threshold Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <KPICard
          title="Break-Even Market Price"
          value={result ? `₹ ${formatNumber(bePriceKg, 2)}` : '—'}
          unit="/ kg"
          subtitle={result ? `₹ ${formatNumber(bePriceQuintal, 0)} / Quintal` : ''}
          icon={Coins}
          color="harvest"
          sourceType="calculated"
          sourceName="Total Cost C2 / Production"
        />

        <KPICard
          title="Break-Even Harvest"
          value={result ? `${formatNumber(beProdTonnes, 2)}` : '—'}
          unit="Tonnes"
          subtitle={result ? `${formatNumber(beYield, 3)} t/ha yield minimum` : ''}
          icon={Scale}
          color="harvest"
          sourceType="calculated"
          sourceName="Total Cost C2 / Price"
        />

        <KPICard
          title="Break-Even Revenue"
          value={result ? formatCurrency(result.break_even_revenue) : '—'}
          unit="Equals Total Investment"
          subtitle="Zero profit / zero loss baseline"
          icon={TrendingUp}
          color="harvest"
          sourceType="calculated"
          sourceName="Break-even Revenue"
        />

        <KPICard
          title="Safety Margin"
          value={result ? formatPercentage(safetyPct, 1) : '—'}
          unit="Above Break-Even"
          subtitle={result && safetyPct >= 0 ? "Safe buffer over cost" : "In loss zone"}
          icon={ShieldAlert}
          color={result && safetyPct >= 0 ? 'brand' : 'rose'}
          sourceType="calculated"
          sourceName="(Actual - BE) / Actual"
          isPositive={result ? safetyPct >= 0 : true}
        />
      </div>

      {/* Visual Break-Even Intersection Chart */}
      <ChartCard
        title="Break-Even Volume Curve (Cost Line vs Revenue Line)"
        subtitle="Visualizing Fixed & Variable Investment Cost against APMC Market Revenue"
        sourceType="calculated"
        sourceName="Analytical Simulation"
      >
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#243722" />
              <XAxis
                dataKey="production"
                stroke="#8fae88"
                tick={{ fontSize: 11 }}
                unit=" t"
                label={{ value: 'Crop Production (Tonnes)', position: 'insideBottom', offset: -10, fill: '#8fae88', fontSize: 11 }}
              />
              <YAxis stroke="#8fae88" tick={{ fontSize: 11 }} tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(val, name) => [formatCurrency(val), name]} />
              <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '10px' }} />

              {/* Total Cost Baseline */}
              <Line
                type="linear"
                dataKey="totalCost"
                name="Total Cost C2 (Investment)"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
              />

              {/* Revenue Trajectory */}
              <Line
                type="linear"
                dataKey="revenue"
                name="Gross Mandi Revenue"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#10b981' }}
              />

              {/* Break-even point marker line */}
              {result && beProdTonnes > 0 && (
                <ReferenceLine
                  x={beProdTonnes}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  label={{
                    value: `BE: ${beProdTonnes.toFixed(1)} t`,
                    fill: '#f59e0b',
                    fontSize: 11,
                    position: 'top'
                  }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 text-xs">
            Loading break even model...
          </div>
        )}
      </ChartCard>

      {/* Insight Explanatory Card */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-white mb-0.5">Managerial Agronomic Interpretation</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            At the break-even yield of <strong className="text-white">{formatNumber(beYield, 3)} t/ha</strong>, the farmer covers all direct operational costs (A2), family labor remuneration (FL), and imputed land rents (C2). When actual harvest yield exceeds this threshold, every additional kilogram harvested represents 100% net contribution to grower surplus.
          </p>
        </div>
      </div>
    </div>
  );
};
