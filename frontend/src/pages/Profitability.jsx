import React, { useState, useEffect } from 'react';
import {
  LineChart as LineChartIcon,
  Coins,
  TrendingUp,
  Percent,
  Layers,
  ArrowRight,
  BookmarkPlus,
  Trash2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell, ReferenceLine
} from 'recharts';
import { KPICard } from '../components/KPIcard';
import { ChartCard } from '../components/ChartCard';
import { DataSourceBadge } from '../components/DataSourceBadge';
import { analyticsService } from '../services/analyticsService';
import { formatCurrency, formatNumber, formatPercentage } from '../utils/formatters';

export const Profitability = () => {
  const [crops, setCrops] = useState([]);
  const [regions, setRegions] = useState([]);
  const [axisLayout, setAxisLayout] = useState('horizontal'); // 'horizontal' | 'vertical' | 'dual'
  const [form, setForm] = useState({
    crop_name: 'Soybean',
    region: 'Madhya Pradesh',
    land_area: 10,
    unit: 'hectare',
    custom_yield: '',
    custom_price: '',
    custom_cost: ''
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scenarios, setScenarios] = useState([]);
  const [scenarioTitle, setScenarioTitle] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const [c, r, s] = await Promise.all([
          analyticsService.getCrops(),
          analyticsService.getRegions(),
          analyticsService.getScenarios().catch(() => [])
        ]);
        setCrops(c || []);
        setRegions(r || []);
        setScenarios(s || []);
        if (c?.length > 0) setForm(prev => ({ ...prev, crop_name: c[0].crop_name }));
        if (r?.length > 0) setForm(prev => ({ ...prev, region: r[0] }));
      } catch (err) {
        console.error("Initialization error:", err);
      }
    };
    init();
  }, []);

  const handleCalculate = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        crop_name: form.crop_name,
        region: form.region || 'Madhya Pradesh',
        land_area: Number(form.land_area),
        land_unit: form.unit || 'hectare',
        custom_yield_t_ha: form.custom_yield ? Number(form.custom_yield) : null,
        custom_price_per_kg: form.custom_price ? Number(form.custom_price) : null,
        custom_cost_per_ha: form.custom_cost ? Number(form.custom_cost) : null
      };

      const res = await analyticsService.calculateProfitability(payload);
      setResult(res);
    } catch (err) {
      console.error("Profit calculation error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (form.crop_name && form.region) {
      handleCalculate();
    }
  }, [form.crop_name, form.region, form.unit]);

  const handleSaveScenario = async () => {
    if (!result) return;
    try {
      const name = scenarioTitle.trim() || `${form.crop_name} - ${form.land_area} ${form.unit}`;
      const payload = {
        name,
        crop_name: form.crop_name,
        region: form.region || 'Madhya Pradesh',
        year: result.year || 2024,
        land_area: Number(form.land_area),
        land_unit: form.unit || 'hectare',
        notes: `Profit: ₹${result.net_profit} | ROI: ${result.roi_percentage}%`
      };
      const saved = await analyticsService.saveScenario(payload);
      setScenarios([saved, ...scenarios]);
      setScenarioTitle('');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save scenario:", err);
    }
  };

  const handleDeleteScenario = async (id) => {
    try {
      await analyticsService.deleteScenario(id);
      setScenarios(scenarios.filter(s => s.id !== id));
    } catch (err) {
      console.error("Failed to delete scenario:", err);
    }
  };

  const waterfallData = result ? [
    {
      name: 'Gross Revenue',
      amount: result.gross_revenue ?? result.revenue,
      per_ha: (result.gross_revenue ?? result.revenue) / (result.land_area || 1),
      fill: '#10b981'
    },
    {
      name: 'Total Cost (C2)',
      amount: -result.total_cost,
      per_ha: -result.cost_per_ha,
      fill: '#ef4444'
    },
    {
      name: 'Net Profit',
      amount: result.net_profit,
      per_ha: result.profit_per_ha,
      fill: result.net_profit >= 0 ? '#f5a623' : '#cf7209'
    }
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-white flex items-center gap-2">
          <LineChartIcon className="w-6 h-6 text-purple-400" />
          Profitability & Return on Investment (ROI) Intelligence
        </h1>
        <p className="text-xs lg:text-sm text-slate-400 mt-1">
          Full agronomic-economic synthesis: Land Area × Yield × APMC Price vs CACP Cost of Cultivation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs */}
        <div className="lg:col-span-5 glass-card rounded-xl p-5 border border-slate-800">
          <h2 className="text-sm font-semibold text-slate-200 mb-4 pb-2 border-b border-slate-800 flex items-center justify-between">
            <span>Enterprise Financial Inputs</span>
            <span className="text-[11px] text-slate-500 font-normal">Steps 5-9 of Journey</span>
          </h2>

          <form onSubmit={handleCalculate} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Oilseed Crop
              </label>
              <select
                value={form.crop_name}
                onChange={(e) => setForm({ ...form, crop_name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
              >
                {crops.map((c) => (
                  <option key={c.id || c.crop_name} value={c.crop_name}>
                    {c.crop_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Agro-Region / State
              </label>
              <select
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
              >
                {regions.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Land Area
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={form.land_area}
                  onChange={(e) => setForm({ ...form, land_area: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Unit
                </label>
                <select
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="hectare">Hectare (ha)</option>
                  <option value="acre">Acre</option>
                </select>
              </div>
            </div>

            {/* Custom Assumption Overrides */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Scenario Assumption Overrides (Optional)
              </span>

              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <div>
                  <label className="block text-slate-400 mb-1">Yield (t/ha)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Auto DES"
                    value={form.custom_yield}
                    onChange={(e) => setForm({ ...form, custom_yield: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Price (₹/kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="Auto APMC"
                    value={form.custom_price}
                    onChange={(e) => setForm({ ...form, custom_price: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Cost (₹/ha)</label>
                  <input
                    type="number"
                    step="1000"
                    placeholder="Auto CACP"
                    value={form.custom_cost}
                    onChange={(e) => setForm({ ...form, custom_cost: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/30 transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? "Synthesizing Financials..." : "Calculate Profitability & ROI"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Results Overview */}
        <div className="lg:col-span-7 space-y-4">
          {result && (
            <div className="glass-card rounded-xl p-5 border border-slate-800 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                <div>
                  <h3 className="font-bold text-white text-base">
                    Farm Enterprise Profitability Balance Sheet
                  </h3>
                  <p className="text-xs text-slate-400">
                    {result.crop_name} across {result.land_area} {result.unit} in {result.region}
                  </p>
                </div>
                <DataSourceBadge
                  type="calculated"
                  sourceName="DES Yield × APMC Price - CACP Cost"
                />
              </div>

              {/* Core Financial Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Total Harvest</span>
                  <div className="text-lg font-bold text-white mt-0.5">{formatNumber(result.crop_production_tonnes ?? result.production_tonnes, 2)} t</div>
                  <span className="text-[10px] text-slate-500">{result.yield_t_ha} t/ha yield</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Total Cost C2</span>
                  <div className="text-lg font-bold text-rose-400 mt-0.5">{formatCurrency(result.total_cost)}</div>
                  <span className="text-[10px] text-slate-500">{formatCurrency(result.cost_per_ha)} / ha</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Gross Revenue</span>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5">{formatCurrency(result.gross_revenue ?? result.revenue)}</div>
                  <span className="text-[10px] text-slate-500">₹ {formatNumber(result.market_price_per_kg ?? result.price_per_kg, 2)} / kg</span>
                </div>

                <div className={`p-3 rounded-lg border ${
                  result.net_profit >= 0 ? 'bg-purple-950/40 border-purple-800' : 'bg-rose-950/40 border-rose-800'
                }`}>
                  <span className="text-[10px] uppercase font-semibold text-purple-300 block">Net Profit</span>
                  <div className={`text-lg font-bold mt-0.5 ${result.net_profit >= 0 ? 'text-purple-300' : 'text-rose-400'}`}>
                    {formatCurrency(result.net_profit)}
                  </div>
                  <span className="text-[10px] font-semibold text-purple-200">
                    ROI: {formatPercentage(result.roi_percentage ?? result.roi_pct, 1)}
                  </span>
                </div>
              </div>

              {/* Per-Unit Economics Table */}
              <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 font-mono text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-sans">Profit / Hectare</span>
                    <div className="font-bold text-white mt-0.5">{formatCurrency(result.profit_per_ha)}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-sans">Profit / kg</span>
                    <div className="font-bold text-white mt-0.5">₹ {formatNumber(result.profit_per_kg, 2)}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-sans">Break-Even Price</span>
                    <div className="font-bold text-amber-400 mt-0.5">₹ {formatNumber(result.break_even_price_per_kg ?? result.break_even_price_kg, 2)} / kg</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-sans">Break-Even Harvest</span>
                    <div className="font-bold text-amber-400 mt-0.5">{formatNumber(result.break_even_production_tonnes, 2)} t</div>
                  </div>
                </div>
              </div>

              {/* Upgraded Graph with Customizable Axes */}
              <div className="pt-2 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-800/80">
                  <span className="text-xs font-semibold text-slate-300">
                    Financial Flow Axes Configuration:
                  </span>
                  <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setAxisLayout('horizontal')}
                      className={`px-2.5 py-1 rounded transition-all font-medium ${
                        axisLayout === 'horizontal'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Horizontal (Categories X, ₹ Y)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAxisLayout('vertical')}
                      className={`px-2.5 py-1 rounded transition-all font-medium ${
                        axisLayout === 'vertical'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Vertical (Categories Y, ₹ X)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAxisLayout('dual')}
                      className={`px-2.5 py-1 rounded transition-all font-medium ${
                        axisLayout === 'dual'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Dual-Axis (Total vs Per-Ha)
                    </button>
                  </div>
                </div>

                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    {axisLayout === 'horizontal' ? (
                      <BarChart data={waterfallData} margin={{ top: 15, right: 20, left: 20, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#243722" />
                        <XAxis
                          dataKey="name"
                          stroke="#8fae88"
                          tick={{ fontSize: 11 }}
                          label={{ value: 'Financial Flow Stage', position: 'insideBottom', offset: -15, fill: '#8fae88', fontSize: 11 }}
                        />
                        <YAxis
                          stroke="#8fae88"
                          tick={{ fontSize: 11 }}
                          tickFormatter={(val) => Math.abs(val) >= 100000 ? `₹${(val / 100000).toFixed(1)}L` : Math.abs(val) >= 1000 ? `₹${(val / 1000).toFixed(0)}k` : `₹${val}`}
                          label={{ value: 'Amount (₹ INR)', angle: -90, position: 'insideLeft', fill: '#8fae88', fontSize: 11, offset: -5 }}
                        />
                        <Tooltip formatter={(val) => [formatCurrency(val), 'Amount']} />
                        <ReferenceLine y={0} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: "Break-Even Baseline (₹0)", fill: "#f59e0b", fontSize: 10, position: "right" }} />
                        <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                          {waterfallData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    ) : axisLayout === 'vertical' ? (
                      <BarChart data={waterfallData} layout="vertical" margin={{ top: 10, right: 25, left: 15, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#243722" horizontal={false} />
                        <XAxis
                          type="number"
                          stroke="#8fae88"
                          tick={{ fontSize: 11 }}
                          tickFormatter={(val) => Math.abs(val) >= 100000 ? `₹${(val / 100000).toFixed(1)}L` : Math.abs(val) >= 1000 ? `₹${(val / 1000).toFixed(0)}k` : `₹${val}`}
                          label={{ value: 'Amount (₹ INR)', position: 'insideBottom', offset: -10, fill: '#8fae88', fontSize: 11 }}
                        />
                        <YAxis
                          dataKey="name"
                          type="category"
                          stroke="#94a3b8"
                          tick={{ fontSize: 11 }}
                          width={115}
                        />
                        <Tooltip formatter={(val) => [formatCurrency(val), 'Amount']} />
                        <ReferenceLine x={0} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: "Break-Even ₹0", fill: "#f59e0b", fontSize: 10, position: "top" }} />
                        <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                          {waterfallData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    ) : (
                      <BarChart data={waterfallData} margin={{ top: 15, right: 25, left: 15, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#243722" />
                        <XAxis
                          dataKey="name"
                          stroke="#8fae88"
                          tick={{ fontSize: 11 }}
                          label={{ value: 'Enterprise Financial Components', position: 'insideBottom', offset: -15, fill: '#8fae88', fontSize: 11 }}
                        />
                        <YAxis
                          yAxisId="left"
                          stroke="#f5a623"
                          tick={{ fontSize: 11 }}
                          tickFormatter={(val) => Math.abs(val) >= 100000 ? `₹${(val / 100000).toFixed(1)}L` : Math.abs(val) >= 1000 ? `₹${(val / 1000).toFixed(0)}k` : `₹${val}`}
                          label={{ value: 'Total Enterprise Amount (₹)', angle: -90, position: 'insideLeft', fill: '#f5a623', fontSize: 10, offset: -5 }}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          stroke="#f59e0b"
                          tick={{ fontSize: 11 }}
                          tickFormatter={(val) => Math.abs(val) >= 1000 ? `₹${(val / 1000).toFixed(0)}k` : `₹${val}`}
                          label={{ value: 'Per Hectare Intensity (₹/ha)', angle: 90, position: 'insideRight', fill: '#f59e0b', fontSize: 10, offset: 5 }}
                        />
                        <Tooltip formatter={(val, name) => [formatCurrency(val), name === 'amount' ? 'Total (₹)' : 'Per Hectare (₹/ha)']} />
                        <Legend />
                        <ReferenceLine yAxisId="left" y={0} stroke="#8fae88" strokeDasharray="3 3" />
                        <Bar yAxisId="left" dataKey="amount" name="Total Amount (₹)" fill="#ea8e0e" radius={[4, 4, 0, 0]} />
                        <Bar yAxisId="right" dataKey="per_ha" name="Per Hectare (₹/ha)" fill="#f5a623" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Scenario Save Tool */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="text"
                  placeholder="Label this scenario (e.g. 20ha High Tech Soybean)"
                  value={scenarioTitle}
                  onChange={(e) => setScenarioTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={handleSaveScenario}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 shrink-0 flex items-center gap-1.5"
                >
                  <BookmarkPlus className="w-3.5 h-3.5 text-brand-400" />
                  <span>Save Scenario</span>
                </button>
              </div>
              {saveSuccess && (
                <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Scenario saved to your profile workspace.</span>
                </div>
              )}
            </div>
          )}

          {/* Saved User Scenarios List */}
          {scenarios.length > 0 && (
            <div className="glass-card rounded-xl p-5 border border-slate-800">
              <h3 className="font-semibold text-sm text-slate-200 mb-3">
                Saved User Scenarios
              </h3>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {scenarios.map((sc) => (
                  <div
                    key={sc.id}
                    className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-white">{sc.title || sc.crop_name}</span>
                      <div className="text-[10px] text-slate-400">
                        {sc.crop_name} • {sc.land_area} {sc.unit} • Net Profit: {formatCurrency(sc.net_profit)} (ROI {formatPercentage(sc.roi_percentage, 1)})
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteScenario(sc.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete Scenario"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
