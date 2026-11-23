import React, { useState, useEffect } from 'react';
import {
  Droplets,
  Sprout,
  Scale,
  Layers,
  ArrowRight,
  Info,
  Sliders,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DataSourceBadge } from '../components/DataSourceBadge';
import { ChartCard } from '../components/ChartCard';
import { analyticsService } from '../services/analyticsService';
import { formatNumber } from '../utils/formatters';

export const OilProduction = () => {
  const [crops, setCrops] = useState([]);
  const [form, setForm] = useState({
    crop_name: 'Soybean',
    land_area: 10,
    land_unit: 'hectare',
    crop_production: '',
    custom_extraction_rate: ''
  });

  const [useCustomRate, setUseCustomRate] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Benchmarks list for visualization
  const [extractionBenchmarks, setExtractionBenchmarks] = useState([
    { crop: 'Sesame', rate: 48.0, oil: 'High Oil Content' },
    { crop: 'Groundnut', rate: 44.0, oil: 'High Oil Content' },
    { crop: 'Mustard', rate: 39.0, oil: 'Medium-High' },
    { crop: 'Sunflower', rate: 38.0, oil: 'Medium Oil' },
    { crop: 'Safflower', rate: 30.0, oil: 'Medium Oil' },
    { crop: 'Soybean', rate: 18.5, oil: 'High Protein / Low Oil' }
  ]);

  useEffect(() => {
    const init = async () => {
      try {
        const c = await analyticsService.getCrops();
        setCrops(c || []);
        if (c?.length > 0) {
          setForm((prev) => ({ ...prev, crop_name: c[0].crop_name }));
        }
      } catch (err) {
        console.error("Failed to load crops:", err);
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
        land_area: Number(form.land_area),
        land_unit: form.land_unit,
        crop_production: form.crop_production ? Number(form.crop_production) : null,
        custom_extraction_rate: useCustomRate && form.custom_extraction_rate ? Number(form.custom_extraction_rate) : null
      };

      const res = await analyticsService.calculateOil(payload);
      setResult(res);
    } catch (err) {
      console.error("Oil calculation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (form.crop_name) {
      handleCalculate();
    }
  }, [form.crop_name, form.land_unit, useCustomRate]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-white flex items-center gap-2">
          <Droplets className="w-6 h-6 text-amber-400" />
          Crop-to-Oil Production Calculator
        </h1>
        <p className="text-xs lg:text-sm text-slate-400 mt-1">
          Trace oil recovery and meal (de-oiled cake) byproduct yields from raw seed harvest using verifiable oil content baselines.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs */}
        <div className="lg:col-span-5 glass-card rounded-xl p-5 border border-slate-800">
          <h2 className="text-sm font-semibold text-slate-200 mb-4 pb-2 border-b border-slate-800 flex items-center justify-between">
            <span>Crush & Extraction Inputs</span>
            <span className="text-[11px] text-slate-500 font-normal">Step 4 of Journey</span>
          </h2>

          <form onSubmit={handleCalculate} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Select Oilseed Crop
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Cultivated Land Area
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={form.land_area}
                  onChange={(e) => setForm({ ...form, land_area: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Unit
                </label>
                <select
                  value={form.land_unit}
                  onChange={(e) => setForm({ ...form, land_unit: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="hectare">Hectare (ha)</option>
                  <option value="acre">Acre</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Expected Seed Production (Optional)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                placeholder="Leave blank for historical average"
                value={form.crop_production}
                onChange={(e) => setForm({ ...form, crop_production: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                If blank, automatically derived from historical DES yield for this crop.
              </p>
            </div>

            {/* Custom extraction rate toggle */}
            <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-300">
                  Custom Extraction Rate Override
                </span>
                <button
                  type="button"
                  onClick={() => setUseCustomRate(!useCustomRate)}
                  className={`text-[11px] px-2 py-0.5 rounded font-semibold transition-colors ${
                    useCustomRate
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {useCustomRate ? 'Custom (Assumption)' : 'Official Registry'}
                </button>
              </div>

              {useCustomRate && (
                <div className="mt-2.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      min="5"
                      max="75"
                      placeholder="e.g. 20.5"
                      value={form.custom_extraction_rate}
                      onChange={(e) => setForm({ ...form, custom_extraction_rate: e.target.value })}
                      className="w-full bg-slate-900 border border-amber-700/80 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                    />
                    <span className="text-xs text-amber-300 font-semibold">%</span>
                  </div>
                  <span className="text-[10px] text-amber-400/90 block mt-1">
                    * Clearly labeled as a User Assumption in downstream reporting.
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-900/30 transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? "Computing Recovery..." : "Calculate Oil Output"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Results Card */}
        <div className="lg:col-span-7 space-y-4">
          {result && (
            <div className="glass-card rounded-xl p-5 border border-slate-800 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                <div>
                  <h3 className="font-bold text-white text-base">
                    Estimated Oil Output & Recovery Realization
                  </h3>
                  <p className="text-xs text-slate-400">
                    {result.crop_name} across {result.land_area_ha || result.land_area || form.land_area} {result.land_unit || form.land_unit}
                  </p>
                </div>
                <DataSourceBadge
                  type={result.is_custom_assumption || result.is_custom_rate ? 'assumption' : 'historical'}
                  sourceName={result.data_source}
                  sourceUrl={result.source_url}
                />
              </div>

              {/* KPI metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Total Seed Harvest */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                    Raw Seed Harvest
                  </span>
                  <div className="text-2xl font-bold text-white mt-1">
                    {formatNumber(result.crop_production_tonnes, 2)}{' '}
                    <span className="text-xs font-normal text-slate-400">tonnes</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Feedstock entering oil expeller / solvent extraction
                  </p>
                </div>

                {/* Extraction Rate */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                    Oil Extraction Rate
                  </span>
                  <div className="text-2xl font-bold text-amber-400 mt-1">
                    {result.extraction_rate_pct}{' '}
                    <span className="text-xs font-normal text-amber-300">%</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {result.is_custom_assumption || result.is_custom_rate ? 'User assumption parameter' : 'Official ICAR-IIOR standard'}
                  </p>
                </div>

                {/* Oil Tonnes */}
                <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/80">
                  <span className="text-[11px] font-medium text-amber-300 uppercase tracking-wider block">
                    Estimated Pure Oil Yield
                  </span>
                  <div className="text-2xl font-bold text-amber-400 mt-1">
                    {formatNumber(result.estimated_oil_tonnes, 2)}{' '}
                    <span className="text-xs font-normal text-amber-200">tonnes</span>
                  </div>
                  <p className="text-[10px] text-amber-300/80 mt-1">
                    {formatNumber(result.estimated_oil_kg_per_ha ? result.estimated_oil_kg_per_ha / 1000 : result.estimated_oil_tonnes / (result.land_area_ha || form.land_area || 1), 3)} tonnes oil / hectare
                  </p>
                </div>

                {/* Volume in Litres */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                    Oil Liquid Volume
                  </span>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">
                    {formatNumber(result.estimated_oil_litres, 0)}{' '}
                    <span className="text-xs font-normal text-emerald-200">Litres</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Standard conversion at 0.92 kg / Litre vegetable oil density
                  </p>
                </div>
              </div>

              {/* Byproduct Note: De-oiled Cake / Meal */}
              <div className="p-3.5 rounded-lg bg-slate-900/40 border border-slate-800 text-xs text-slate-300">
                <div className="flex items-center gap-1.5 font-semibold text-white mb-1">
                  <Info className="w-4 h-4 text-amber-400" />
                  <span>Byproduct Output: De-Oiled Meal / Cake (DOC)</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Remaining crush mass (~{100 - result.extraction_rate_pct}%) produces approximately{' '}
                  <strong className="text-slate-200">
                    {formatNumber(result.estimated_cake_meal_tonnes || (result.crop_production_tonnes * (1 - result.extraction_rate_pct / 100)), 2)} tonnes
                  </strong>{' '}
                  of protein-rich meal (DOC), utilized for livestock and poultry feed or industrial protein extraction.
                </p>
              </div>

              {/* Scientific Notes */}
              {result.notes && (
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
                  <strong>Agronomy Reference:</strong> {result.notes}
                </div>
              )}
            </div>
          )}

          {/* Benchmark comparison chart */}
          <ChartCard
            title="Comparative Oil Content across Indian Oilseeds"
            subtitle="Benchmark extraction percentage (%) verified by ICAR-IIOR"
            sourceType="historical"
            sourceName="ICAR-IIOR Handbook"
            sourceUrl="https://icar-iior.org.in/"
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={extractionBenchmarks}>
                <CartesianGrid strokeDasharray="3 3" stroke="#243722" />
                <XAxis dataKey="crop" stroke="#8fae88" tick={{ fontSize: 11 }} />
                <YAxis stroke="#8fae88" tick={{ fontSize: 11 }} unit="%" domain={[0, 60]} />
                <Tooltip formatter={(val) => [`${val}%`, 'Extraction Rate']} />
                <Bar dataKey="rate" fill="#f5a623" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  );
};
