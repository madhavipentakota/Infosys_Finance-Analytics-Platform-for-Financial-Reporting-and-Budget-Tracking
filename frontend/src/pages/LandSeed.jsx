import React, { useState, useEffect } from 'react';
import {
  Scale,
  Sprout,
  Layers,
  ArrowRight,
  Info,
  AlertCircle,
  BookOpen,
  Percent,
  Calculator,
  Compass,
  PieChart,
  CheckCircle2
} from 'lucide-react';
import { DataSourceBadge } from '../components/DataSourceBadge';
import { analyticsService } from '../services/analyticsService';
import { formatNumber } from '../utils/formatters';

export const LandSeed = () => {
  const [crops, setCrops] = useState([]);
  const [form, setForm] = useState({
    crop_name: 'Soybean',
    land_area: 10,
    unit: 'hectare',
    farm_total_area: 10,
    farm_total_unit: 'hectare'
  });

  const [yieldPctInput, setYieldPctInput] = useState(100);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const c = await analyticsService.getCrops();
        setCrops(c || []);
        if (c?.length > 0) setForm((prev) => ({ ...prev, crop_name: c[0].crop_name }));
      } catch (err) {
        console.error("Failed to load crops:", err);
      }
    };
    init();
  }, []);

  const handleCalculate = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await analyticsService.calculateSeed({
        crop_name: form.crop_name,
        land_area: Number(form.land_area),
        unit: form.unit,
        farm_total_area: form.unit === 'percentage' ? Number(form.farm_total_area) : undefined,
        farm_total_unit: form.unit === 'percentage' ? form.farm_total_unit : undefined
      });
      setResult(data);
    } catch (err) {
      console.error("Seed calculation error:", err);
      setError(err.response?.data?.detail || "Failed to calculate seed requirement.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (form.crop_name) {
      handleCalculate();
    }
  }, [form.crop_name, form.unit]);

  // Conversion calculations for live preview
  const areaVal = Number(form.land_area) || 0;
  const farmVal = Number(form.farm_total_area) || 10;

  const getHectaresPreview = () => {
    if (form.unit === 'hectare') return areaVal;
    if (form.unit === 'acre') return areaVal * 0.404686;
    if (form.unit === 'bigha') return areaVal * 0.252929;
    if (form.unit === 'guntha') return areaVal * 0.010117;
    if (form.unit === 'cent') return areaVal * 0.004047;
    if (form.unit === 'sq_m') return areaVal / 10000;
    if (form.unit === 'sq_ft') return areaVal / 107639;
    if (form.unit === 'percentage') {
      const farmHa = form.farm_total_unit === 'acre' ? farmVal * 0.404686 : farmVal;
      return (areaVal / 100) * farmHa;
    }
    return areaVal;
  };

  const ha = getHectaresPreview();
  const acres = ha * 2.47105;
  const bighas = ha * 3.95369;
  const gunthas = ha * 98.8422;
  const cents = ha * 247.105;
  const sqMeters = ha * 10000;
  const sqFeet = ha * 107639;
  const farmShare = form.unit === 'percentage' ? areaVal : (ha / (form.farm_total_unit === 'acre' ? farmVal * 0.404686 : farmVal)) * 100;

  return (
    <div className="space-y-6">
      {/* Header Title */}
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-white flex items-center gap-2">
          <Scale className="w-6 h-6 text-brand-400" />
          Land & Seed Requirement Calculator
        </h1>
        <p className="text-xs lg:text-sm text-slate-400 mt-1">
          Compute certified seed volume, multi-unit land conversions, and harvest projections with percentage metrics using ICAR-IIOR agronomy standards.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-card rounded-xl p-5 border border-slate-800">
            <h2 className="text-sm font-semibold text-slate-200 mb-4 pb-2 border-b border-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-brand-400" />
                Input Parameters
              </span>
              <span className="text-[11px] text-slate-500 font-normal">Agronomic Scope</span>
            </h2>

            <form onSubmit={handleCalculate} className="space-y-4">
              {/* Crop Selection */}
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
                      {c.crop_name} ({c.scientific_name || c.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Area & Measurement Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Land Area Input
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.land_area}
                    onChange={(e) => setForm({ ...form, land_area: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Measurement Unit
                  </label>
                  <select
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="hectare">Hectare (ha)</option>
                    <option value="acre">Acre</option>
                    <option value="bigha">Bigha (Standard)</option>
                    <option value="guntha">Guntha (1/40 Acre)</option>
                    <option value="cent">Cent / Decimal</option>
                    <option value="sq_m">Square Meters (m²)</option>
                    <option value="sq_ft">Square Feet (sq ft)</option>
                    <option value="percentage">Percentage (%) of Farm</option>
                  </select>
                </div>
              </div>

              {/* Yield Percentage Target Factor */}
              <div className="p-3 rounded-lg bg-harvest-950/20 border border-harvest-800/40 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-medium text-harvest-300 flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-harvest-400" />
                    Target Yield Percentage (%)
                  </label>
                  <span className="font-mono font-bold text-harvest-400 bg-harvest-950/60 px-2 py-0.5 rounded border border-harvest-800/60">
                    {yieldPctInput}%
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="160"
                  step="5"
                  value={yieldPctInput}
                  onChange={(e) => setYieldPctInput(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>50% (Drought / Deficit)</span>
                  <span className="text-emerald-400 font-semibold">100% (ICAR Benchmark)</span>
                  <span>160% (Optimal Irrigation)</span>
                </div>
              </div>

              {/* Conditional Total Farm Land Input when Percentage unit is chosen */}
              {form.unit === 'percentage' && (
                <div className="p-3 rounded-lg bg-brand-950/20 border border-brand-800/60 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs text-brand-300 font-semibold">
                    <Percent className="w-3.5 h-3.5 text-brand-400" />
                    <span>Total Farm Size Reference</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Total Farm Area
                      </label>
                      <input
                        type="number"
                        min="0.1"
                        step="0.5"
                        value={form.farm_total_area}
                        onChange={(e) => setForm({ ...form, farm_total_area: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">
                        Farm Unit
                      </label>
                      <select
                        value={form.farm_total_unit}
                        onChange={(e) => setForm({ ...form, farm_total_unit: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none"
                      >
                        <option value="hectare">Hectare</option>
                        <option value="acre">Acre</option>
                      </select>
                    </div>
                  </div>
                  <p className="text-[10px] text-brand-400/80">
                    Calculates {areaVal}% allocation of your {farmVal} {form.farm_total_unit} farm ({ha.toFixed(2)} ha).
                  </p>
                </div>
              )}

              {/* Real-time Multi-Unit Conversion Card */}
              <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] space-y-2">
                <div className="flex items-center justify-between font-semibold text-slate-300 pb-1.5 border-b border-slate-800">
                  <span className="flex items-center gap-1.5 text-brand-400">
                    <Compass className="w-3.5 h-3.5" />
                    Standardized Land Conversions
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">1 Ha = 2.471 Acres</span>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Hectares (ha):</span>
                    <span className="font-semibold text-white">{ha.toFixed(3)} ha</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Acres (ac):</span>
                    <span className="font-semibold text-white">{acres.toFixed(2)} ac</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bighas:</span>
                    <span className="text-white">{bighas.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gunthas:</span>
                    <span className="text-white">{gunthas.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Cents:</span>
                    <span className="text-white">{cents.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Square Meters:</span>
                    <span className="text-white">{formatNumber(sqMeters, 0)} m²</span>
                  </div>
                  <div className="flex justify-between col-span-2 pt-1 border-t border-slate-800/80">
                    <span className="text-slate-400 font-sans">Farm Land Share (%):</span>
                    <span className="text-emerald-400 font-semibold">{farmShare.toFixed(1)}% of farm</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-brand-900/30 transition-all flex items-center justify-center gap-2"
              >
                <span>{loading ? "Calculating..." : "Compute Seed & Harvest"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Output Results */}
        <div className="lg:col-span-7 space-y-4">
          {error && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div className="glass-card rounded-xl p-5 border border-slate-800 space-y-5">
              {/* Header Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                <div>
                  <h3 className="font-bold text-white text-base">
                    Agronomic Seed Requirement Results
                  </h3>
                  <p className="text-xs text-slate-400">
                    {result.crop_name} for {result.input_area} {result.input_unit} ({result.standard_area_ha} Hectares)
                  </p>
                </div>
                <DataSourceBadge
                  type={result.data_status === 'AVAILABLE' ? 'historical' : 'assumption'}
                  sourceName={result.data_source}
                  sourceUrl={result.source_url}
                />
              </div>

              {result.data_status === 'UNAVAILABLE' ? (
                <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800 text-amber-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block mb-1">Seed requirement data unavailable for this crop.</strong>
                    <p className="text-[11px] text-amber-400/80">
                      In strict compliance with verified agricultural records, arbitrary seed rates are not generated without official standards.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Dynamic Yield Factor Calculations */}
                  {(() => {
                    const yieldFactor = yieldPctInput / 100;
                    const effectiveYield = (result.historical_avg_yield_t_ha || 0) * yieldFactor;
                    const effectiveProd = (result.standard_area_ha || 0) * effectiveYield;
                    const yieldBenchmarkPercent = (result.yield_benchmark_pct ? (result.yield_benchmark_pct * yieldFactor) : (effectiveYield / 1.25) * 100);

                    return (
                      <>
                        {/* Primary Key Metric Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Seed Rate */}
                          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                              Recommended Seed Rate
                            </span>
                            <div className="text-2xl font-bold text-white mt-1">
                              {result.seed_rate_kg_ha} <span className="text-xs font-normal text-slate-400">kg / hectare</span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1">
                              ICAR-IIOR certified breeder standard per hectare
                            </p>
                          </div>

                          {/* Total Seed Required */}
                          <div className="p-4 rounded-xl bg-brand-950/30 border border-brand-800/80">
                            <span className="text-[11px] font-medium text-brand-300 uppercase tracking-wider block">
                              Total Seed Required
                            </span>
                            <div className="text-2xl font-bold text-brand-400 mt-1">
                              {formatNumber(result.total_seed_required_kg, 1)}{' '}
                              <span className="text-xs font-normal text-brand-300">kg</span>
                            </div>
                            <p className="text-[10px] text-brand-400/80 mt-1">
                              Equal to {(result.total_seed_required_kg / 100).toFixed(2)} Quintals ({formatNumber(result.total_seed_required_kg / 50, 1)} bags of 50kg)
                            </p>
                          </div>

                          {/* Expected Yield */}
                          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                              {yieldPctInput === 100 ? "Historical Average Yield" : "Projected Adjusted Yield"}
                            </span>
                            <div className="text-2xl font-bold text-white mt-1">
                              {effectiveYield.toFixed(2)}{' '}
                              <span className="text-xs font-normal text-slate-400">tonnes / ha</span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1">
                              Equal to {(effectiveYield * 10 / 2.47105).toFixed(2)} Quintals / acre {yieldPctInput !== 100 && `(${yieldPctInput}% target)`}
                            </p>
                          </div>

                          {/* Expected Production */}
                          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                              Expected Crop Harvest
                            </span>
                            <div className="text-2xl font-bold text-emerald-400 mt-1">
                              {formatNumber(effectiveProd, 2)}{' '}
                              <span className="text-xs font-normal text-slate-400">tonnes</span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1">
                              Formula: {result.standard_area_ha} ha × {effectiveYield.toFixed(2)} t/ha
                            </p>
                          </div>

                          {/* Dedicated Highlight: Yield Percentage (%) Card */}
                          <div className="p-4 rounded-xl bg-gradient-to-br from-harvest-950/40 via-slate-900/90 to-brand-950/30 border border-harvest-500/40 sm:col-span-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-harvest-300 uppercase tracking-wider flex items-center gap-2">
                                <Percent className="w-4 h-4 text-harvest-400" />
                                Agronomic Yield Percentage (%)
                              </span>
                              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${
                                yieldBenchmarkPercent >= 100
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                  : 'bg-harvest-500/20 text-harvest-300 border-harvest-500/40'
                              }`}>
                                {yieldBenchmarkPercent >= 100 ? 'Above National Benchmark' : 'Standard Baseline Range'}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3 pt-2 border-t border-slate-800/80">
                              <div>
                                <span className="text-[10px] text-slate-400 uppercase block">Yield vs Benchmark (1.25 t/ha)</span>
                                <div className="text-2xl font-extrabold text-harvest-400 font-mono mt-0.5">
                                  {yieldBenchmarkPercent.toFixed(1)}%
                                </div>
                                <span className="text-[10px] text-slate-500">Benchmark comparison index</span>
                              </div>

                              <div>
                                <span className="text-[10px] text-slate-400 uppercase block">Target Yield Efficiency</span>
                                <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-0.5">
                                  {yieldPctInput}%
                                </div>
                                <span className="text-[10px] text-slate-500">Scenario allocation factor</span>
                              </div>

                              <div>
                                <span className="text-[10px] text-slate-400 uppercase block">Seed-to-Harvest Return</span>
                                <div className="text-2xl font-extrabold text-brand-300 font-mono mt-0.5">
                                  {result.seed_to_harvest_pct ? (result.seed_to_harvest_pct * yieldFactor).toFixed(1) : "—"}%
                                </div>
                                <span className="text-[10px] text-slate-500">Output biomass vs seed sown</span>
                              </div>
                            </div>

                            {/* Visual Progress Bar */}
                            <div className="w-full bg-slate-800/80 rounded-full h-2 mt-3 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-emerald-500 via-harvest-400 to-amber-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, Math.max(15, yieldBenchmarkPercent))}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Percentage (%) Results & Agronomic Ratios Section */}
                        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                          <div className="flex items-center gap-2 text-xs font-semibold text-brand-400 uppercase tracking-wider">
                            <Percent className="w-4 h-4 text-emerald-400" />
                            <span>Percentage (%) Analysis & Agronomic Ratios</span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80">
                              <div className="text-[10px] text-slate-400 uppercase">Yield Percentage</div>
                              <div className="text-lg font-bold text-harvest-400 mt-0.5">
                                {yieldBenchmarkPercent.toFixed(1)}%
                              </div>
                              <div className="text-[9px] text-slate-500">Relative to 1.25 t/ha base</div>
                            </div>

                            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80">
                              <div className="text-[10px] text-slate-400 uppercase">Seed-to-Harvest %</div>
                              <div className="text-lg font-bold text-emerald-400 mt-0.5">
                                {(result.seed_to_harvest_pct * yieldFactor).toFixed(1)}%
                              </div>
                              <div className="text-[9px] text-slate-500">Seed weight vs harvest output</div>
                            </div>

                            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80">
                              <div className="text-[10px] text-slate-400 uppercase">Multiplication Factor</div>
                              <div className="text-lg font-bold text-brand-300 mt-0.5">
                                1 : {(result.seed_multiplication_factor * yieldFactor).toFixed(1)}
                              </div>
                              <div className="text-[9px] text-slate-500">Harvest output multiplier</div>
                            </div>

                            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/80">
                              <div className="text-[10px] text-slate-400 uppercase">Farm Allocation Share</div>
                              <div className="text-lg font-bold text-purple-400 mt-0.5">
                                {result.farm_land_share_pct}%
                              </div>
                              <div className="text-[9px] text-slate-500">% of farm holding</div>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}

                  {/* Multi-Measurement Units Breakdown Table */}
                  {result.unit_conversions && (
                    <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        <Layers className="w-4 h-4 text-purple-400" />
                        <span>Complete Measurement Units Breakdown</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                        {/* Seed Required Unit Breakdown */}
                        <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
                          <div className="text-[11px] font-bold text-brand-400 font-sans border-b border-slate-800 pb-1">
                            Total Seed Volume
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>Kilograms:</span>
                            <span className="font-semibold text-white">{formatNumber(result.unit_conversions.seed_required.kg, 1)} kg</span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>Quintals:</span>
                            <span className="text-white">{result.unit_conversions.seed_required.quintals} q</span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>Tonnes:</span>
                            <span className="text-white">{result.unit_conversions.seed_required.tonnes} t</span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>Bags (50kg):</span>
                            <span className="text-white">{result.unit_conversions.seed_required.bags_50kg} bags</span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>Pounds (lbs):</span>
                            <span className="text-white">{formatNumber(result.unit_conversions.seed_required.pounds_lbs, 1)} lbs</span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>Density (g/m²):</span>
                            <span className="text-emerald-400">{result.unit_conversions.seed_required.grams_per_sqm} g/m²</span>
                          </div>
                        </div>

                        {/* Expected Production Breakdown */}
                        <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
                          <div className="text-[11px] font-bold text-emerald-400 font-sans border-b border-slate-800 pb-1">
                            Expected Harvest Output
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>Tonnes:</span>
                            <span className="font-semibold text-white">{result.unit_conversions.expected_production.tonnes} t</span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>Quintals:</span>
                            <span className="text-white">{formatNumber(result.unit_conversions.expected_production.quintals, 1)} q</span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>Kilograms:</span>
                            <span className="text-white">{formatNumber(result.unit_conversions.expected_production.kg, 0)} kg</span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>Pounds (lbs):</span>
                            <span className="text-white">{formatNumber(result.unit_conversions.expected_production.pounds_lbs, 0)} lbs</span>
                          </div>
                        </div>

                        {/* Yield Rates Breakdown */}
                        <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
                          <div className="text-[11px] font-bold text-amber-400 font-sans border-b border-slate-800 pb-1">
                            Productivity Yield Rates
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>Tonnes / Ha:</span>
                            <span className="font-semibold text-white">{result.unit_conversions.yield_rates.t_per_ha} t/ha</span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>Quintals / Acre:</span>
                            <span className="text-white">{result.unit_conversions.yield_rates.q_per_acre} q/ac</span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>Kg / Acre:</span>
                            <span className="text-white">{result.unit_conversions.yield_rates.kg_per_acre} kg/ac</span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>Kg / Hectare:</span>
                            <span className="text-white">{result.unit_conversions.yield_rates.kg_per_ha} kg/ha</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Agronomic Guidance */}
              {result.notes && (
                <div className="p-3.5 rounded-lg bg-slate-900/40 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2">
                  <Info className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Agronomy Notes: </span>
                    <span className="text-slate-400">{result.notes}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Guidelines Reference Card */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-2 text-slate-200 font-semibold mb-2">
              <BookOpen className="w-4 h-4 text-brand-400" />
              <span>Official Seed Rate Reference Standards (ICAR-IIOR)</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
              <li><strong>Soybean:</strong> 65 - 75 kg/ha (Broadcasting vs Line sowing spacing 45cm x 5cm)</li>
              <li><strong>Groundnut (Bunch type):</strong> 100 - 110 kg/ha kernels; Spreading type: 80 - 90 kg/ha</li>
              <li><strong>Rapeseed & Mustard:</strong> 3.5 - 5.0 kg/ha (fine seed bed, 30cm spacing)</li>
              <li><strong>Sunflower:</strong> 5 - 7.5 kg/ha (Hybrids: 5 kg/ha, Varieties: 7-8 kg/ha)</li>
              <li><strong>Sesame (Til):</strong> 4 - 5 kg/ha</li>
              <li><strong>Safflower (Kardi):</strong> 10 - 12 kg/ha</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
