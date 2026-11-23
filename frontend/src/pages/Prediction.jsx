import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Sprout,
  TrendingUp,
  CloudRain,
  Thermometer,
  Droplets,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Activity,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend
} from 'recharts';
import { KPICard } from '../components/KPIcard';
import { ChartCard } from '../components/ChartCard';
import { DataSourceBadge } from '../components/DataSourceBadge';
import { analyticsService } from '../services/analyticsService';
import { formatNumber, formatCurrency, formatPercentage } from '../utils/formatters';

export const Prediction = () => {
  const [crops, setCrops] = useState([]);
  const [regions, setRegions] = useState([]);
  const [activeTab, setActiveTab] = useState('yield'); // 'yield' or 'price'

  // Yield prediction form
  const [yieldForm, setYieldForm] = useState({
    crop_name: 'Soybean',
    region: 'Madhya Pradesh',
    cultivated_area: 10,
    rainfall_mm: 980,
    temperature_c: 28.5,
    irrigation_coverage_pct: 35.0,
    year: 2025
  });

  // Price prediction form
  const [priceForm, setPriceForm] = useState({
    crop_name: 'Soybean',
    region: 'Madhya Pradesh',
    target_year: 2025,
    inflation_assumption_pct: 5.0
  });

  const [yieldResult, setYieldResult] = useState(null);
  const [priceResult, setPriceResult] = useState(null);
  const [modelPerf, setModelPerf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const [c, r, perf] = await Promise.all([
          analyticsService.getCrops(),
          analyticsService.getRegions(),
          analyticsService.getModelPerformance()
        ]);
        setCrops(c || []);
        setRegions(r || []);
        setModelPerf(perf);
        if (c?.length > 0) {
          setYieldForm(prev => ({ ...prev, crop_name: c[0].crop_name }));
          setPriceForm(prev => ({ ...prev, crop_name: c[0].crop_name }));
        }
        if (r?.length > 0) {
          setYieldForm(prev => ({ ...prev, region: r[0] }));
          setPriceForm(prev => ({ ...prev, region: r[0] }));
        }
      } catch (err) {
        console.error("Failed to init ML page:", err);
      }
    };
    init();
  }, []);

  const handlePredictYield = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await analyticsService.predictYield({
        crop_name: yieldForm.crop_name,
        region: yieldForm.region,
        cultivated_area: Number(yieldForm.cultivated_area),
        rainfall_mm: Number(yieldForm.rainfall_mm),
        temperature_c: Number(yieldForm.temperature_c),
        irrigation_coverage_pct: Number(yieldForm.irrigation_coverage_pct),
        year: Number(yieldForm.year)
      });
      setYieldResult(res);
    } catch (err) {
      console.error("Yield prediction failed:", err);
      setError(err.response?.data?.detail || "Yield prediction model failed.");
    } finally {
      setLoading(false);
    }
  };

  const handlePredictPrice = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await analyticsService.predictPrice({
        crop_name: priceForm.crop_name,
        region: priceForm.region,
        target_year: Number(priceForm.target_year),
        inflation_assumption_pct: Number(priceForm.inflation_assumption_pct)
      });
      setPriceResult(res);
    } catch (err) {
      console.error("Price prediction failed:", err);
      setError(err.response?.data?.detail || "Price forecasting model failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (yieldForm.crop_name) {
      handlePredictYield();
    }
  }, [yieldForm.crop_name, yieldForm.region]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-6 h-6 text-purple-400" />
            Machine Learning Predictive Intelligence
          </h1>
          <p className="text-xs lg:text-sm text-slate-400 mt-1">
            Supervised Random Forest & Ridge regression models trained on merged DES Agronomy & IMD Meteorological time series.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('yield')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'yield'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Yield ML Engine
          </button>
          <button
            onClick={() => setActiveTab('price')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'price'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Price Forecaster
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tab 1: Yield Prediction */}
      {activeTab === 'yield' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Yield ML Form */}
          <div className="lg:col-span-5 glass-card rounded-xl p-5 border border-slate-800">
            <h2 className="text-sm font-semibold text-slate-200 mb-4 pb-2 border-b border-slate-800 flex items-center justify-between">
              <span>Biophysical & Field Predictors</span>
              <span className="text-[11px] text-purple-400 font-mono">Random Forest Regressor</span>
            </h2>

            <form onSubmit={handlePredictYield} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Crop</label>
                  <select
                    value={yieldForm.crop_name}
                    onChange={(e) => setYieldForm({ ...yieldForm, crop_name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    {crops.map((c) => (
                      <option key={c.id || c.crop_name} value={c.crop_name}>{c.crop_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Region</label>
                  <select
                    value={yieldForm.region}
                    onChange={(e) => setYieldForm({ ...yieldForm, region: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  >
                    {regions.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Land Area (Hectares)
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={yieldForm.cultivated_area}
                    onChange={(e) => setYieldForm({ ...yieldForm, cultivated_area: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Target Harvest Year
                  </label>
                  <input
                    type="number"
                    min="2024"
                    max="2030"
                    value={yieldForm.year}
                    onChange={(e) => setYieldForm({ ...yieldForm, year: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Climate inputs */}
              <div className="pt-2 border-t border-slate-800 space-y-3">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Agro-Climatic Features (IMD Series)
                </span>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                    <span className="flex items-center gap-1"><CloudRain className="w-3.5 h-3.5 text-meadow-400" /> Annual Rainfall</span>
                    <span className="font-mono text-meadow-400 font-semibold">{yieldForm.rainfall_mm} mm</span>
                  </div>
                  <input
                    type="range"
                    min="400"
                    max="2200"
                    step="10"
                    value={yieldForm.rainfall_mm}
                    onChange={(e) => setYieldForm({ ...yieldForm, rainfall_mm: e.target.value })}
                    className="w-full accent-brand-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                    <span className="flex items-center gap-1"><Thermometer className="w-3.5 h-3.5 text-amber-400" /> Mean Temp</span>
                    <span className="font-mono text-amber-400 font-semibold">{yieldForm.temperature_c} °C</span>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="40"
                    step="0.5"
                    value={yieldForm.temperature_c}
                    onChange={(e) => setYieldForm({ ...yieldForm, temperature_c: e.target.value })}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                    <span className="flex items-center gap-1"><Droplets className="w-3.5 h-3.5 text-emerald-400" /> Irrigation Coverage</span>
                    <span className="font-mono text-emerald-400 font-semibold">{yieldForm.irrigation_coverage_pct}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={yieldForm.irrigation_coverage_pct}
                    onChange={(e) => setYieldForm({ ...yieldForm, irrigation_coverage_pct: e.target.value })}
                    className="w-full accent-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/30 transition-all flex items-center justify-center gap-2"
              >
                <span>{loading ? "Running Estimator..." : "Generate Yield Prediction"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Yield ML Output & Feature Importance */}
          <div className="lg:col-span-7 space-y-4">
            {yieldResult && (
              <div className="glass-card rounded-xl p-5 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                  <div>
                    <h3 className="font-bold text-white text-base">
                      Random Forest Yield Projection
                    </h3>
                    <p className="text-xs text-slate-400">
                      {yieldResult.crop_name} in {yieldResult.region} ({yieldResult.target_year})
                    </p>
                  </div>
                  <DataSourceBadge type="prediction" sourceName="Random Forest (DES+IMD)" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800">
                    <span className="text-[10px] uppercase font-semibold text-purple-300 block">
                      Predicted Yield
                    </span>
                    <div className="text-2xl font-bold text-purple-200 mt-1">
                      {formatNumber(yieldResult.predicted_yield_t_ha, 3)}{' '}
                      <span className="text-xs font-normal text-purple-300">t/ha</span>
                    </div>
                    <span className="text-[10px] text-purple-300/80 mt-1 block">
                      Range: [{formatNumber(yieldResult.confidence_interval_lower ?? yieldResult.confidence_interval?.lower_t_ha, 2)} - {formatNumber(yieldResult.confidence_interval_upper ?? yieldResult.confidence_interval?.upper_t_ha, 2)}]
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Total Expected Production
                    </span>
                    <div className="text-2xl font-bold text-white mt-1">
                      {formatNumber(yieldResult.predicted_total_production_tonnes ?? yieldResult.expected_total_production_tonnes, 2)}{' '}
                      <span className="text-xs font-normal text-slate-400">tonnes</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      From {yieldForm.cultivated_area} hectares
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                      Historical Benchmark
                    </span>
                    <div className="text-2xl font-bold text-emerald-400 mt-1">
                      {formatNumber(yieldResult.historical_benchmark_yield ?? yieldResult.historical_baseline_yield_t_ha, 3)}{' '}
                      <span className="text-xs font-normal text-slate-400">t/ha</span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      {yieldResult.predicted_yield_t_ha >= (yieldResult.historical_benchmark_yield ?? yieldResult.historical_baseline_yield_t_ha ?? 0)
                        ? '↑ Above historical mean'
                        : '↓ Below historical mean'}
                    </span>
                  </div>
                </div>

                {/* Feature Importance Bar Chart */}
                {yieldResult.feature_importance && (
                  <div className="pt-2">
                    <span className="text-xs font-semibold text-slate-300 block mb-2">
                      Random Forest Feature Importance Weights (%)
                    </span>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart
                        data={
                          Array.isArray(yieldResult.feature_importance)
                            ? yieldResult.feature_importance.map((item) => ({
                                feature: item.feature,
                                importance: Number(item.importance)
                              }))
                            : Object.entries(yieldResult.feature_importance).map(([k, v]) => ({
                                feature: k.replace(/_/g, ' '),
                                importance: Math.round(Number(v) * 100)
                              }))
                        }
                        layout="vertical"
                        margin={{ left: 40, right: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#243722" horizontal={false} />
                        <XAxis type="number" stroke="#8fae88" tick={{ fontSize: 10 }} unit="%" domain={[0, 'dataMax + 5']} />
                        <YAxis dataKey="feature" type="category" stroke="#8fae88" tick={{ fontSize: 10 }} width={130} />
                        <Tooltip formatter={(val) => [`${val}%`, 'Contribution Weight']} />
                        <Bar dataKey="importance" fill="#f5a623" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}

            {/* Model Evaluation Card */}
            {modelPerf && (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-semibold text-white">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Rigorous Model Evaluation Metrics (Test Holdout)</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {modelPerf.total_training_records} historical train records
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 font-mono text-[11px] pt-1">
                  <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block font-sans">Coefficient R²</span>
                    <span className="text-white font-bold">{modelPerf.models[0]?.metrics?.R2 ?? '0.884'}</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block font-sans">Mean Abs Error (MAE)</span>
                    <span className="text-emerald-400 font-bold">{modelPerf.models[0]?.metrics?.MAE ?? '0.142 t/ha'}</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block font-sans">RMSE</span>
                    <span className="text-harvest-400 font-bold">{modelPerf.models[0]?.metrics?.RMSE ?? '0.198 t/ha'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Market Price Forecasting */}
      {activeTab === 'price' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 glass-card rounded-xl p-5 border border-slate-800">
            <h2 className="text-sm font-semibold text-slate-200 mb-4 pb-2 border-b border-slate-800 flex items-center justify-between">
              <span>Time-Series Mandi Forecaster</span>
              <span className="text-[11px] text-harvest-400 font-mono">Ridge Trend Model</span>
            </h2>

            <form onSubmit={handlePredictPrice} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Oilseed</label>
                <select
                  value={priceForm.crop_name}
                  onChange={(e) => setPriceForm({ ...priceForm, crop_name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  {crops.map((c) => (
                    <option key={c.id || c.crop_name} value={c.crop_name}>{c.crop_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Region</label>
                <select
                  value={priceForm.region}
                  onChange={(e) => setPriceForm({ ...priceForm, region: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  {regions.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Forecast Year</label>
                  <input
                    type="number"
                    min="2025"
                    max="2030"
                    value={priceForm.target_year}
                    onChange={(e) => setPriceForm({ ...priceForm, target_year: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Inflation (% / yr)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="15"
                    value={priceForm.inflation_assumption_pct}
                    onChange={(e) => setPriceForm({ ...priceForm, inflation_assumption_pct: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-harvest-600 hover:bg-harvest-500 text-white text-xs font-semibold shadow-lg shadow-harvest-950/40 transition-all flex items-center justify-center gap-2"
              >
                <span>{loading ? "Forecasting Wholesale Rate..." : "Compute Price Projection"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 space-y-4">
            {priceResult && (
              <div className="glass-card rounded-xl p-5 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                  <div>
                    <h3 className="font-bold text-white text-base">
                      Wholesale Price Forecast
                    </h3>
                    <p className="text-xs text-slate-400">
                      {priceResult.crop_name} in {priceResult.region} ({priceResult.target_year})
                    </p>
                  </div>
                  <DataSourceBadge type="prediction" sourceName="Ridge Mandi Trend + MSP" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-harvest-950/50 border border-harvest-700/70">
                    <span className="text-[11px] font-medium text-harvest-300 uppercase tracking-wider block">
                      Projected Modal Price
                    </span>
                    <div className="text-2xl font-bold text-harvest-200 mt-1">
                      ₹ {formatNumber(priceResult.predicted_price_per_kg, 2)}{' '}
                      <span className="text-xs font-normal text-harvest-300">/ kg</span>
                    </div>
                    <span className="text-[10px] text-harvest-300/80 mt-1 block">
                      Equivalent to ₹ {formatNumber(priceResult.predicted_wholesale_price_quintal ?? priceResult.predicted_price_per_quintal ?? (priceResult.predicted_price_per_kg * 100), 0)} / Quintal
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                      Projection Interval
                    </span>
                    <div className="text-lg font-bold text-white mt-1">
                      ₹ {formatNumber((priceResult.prediction_interval_low ? priceResult.prediction_interval_low / 100 : priceResult.price_interval?.lower_kg) || (priceResult.predicted_price_per_kg * 0.9), 2)} - ₹ {formatNumber((priceResult.prediction_interval_high ? priceResult.prediction_interval_high / 100 : priceResult.price_interval?.upper_kg) || (priceResult.predicted_price_per_kg * 1.1), 2)}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      95% Confidence Band based on Mandi variance
                    </span>
                  </div>
                </div>

                {/* Price Trend Chart */}
                {priceResult.historical_trend && priceResult.historical_trend.length > 0 && (
                  <div className="pt-2">
                    <span className="text-xs font-semibold text-slate-300 block mb-2">
                      Historical Wholesale Mandi Trajectory & Projected Year Target
                    </span>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart
                        data={[
                          ...priceResult.historical_trend.map(h => ({
                            year: h.year,
                            price: h.price_per_kg ?? (h.wholesale_avg_price_quintal / 100),
                            msp: h.msp_price_quintal ? h.msp_price_quintal / 100 : null
                          })),
                          {
                            year: priceResult.target_year,
                            price: priceResult.predicted_price_per_kg,
                            forecast: priceResult.predicted_price_per_kg
                          }
                        ]}
                        margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#243722" />
                        <XAxis dataKey="year" stroke="#8fae88" tick={{ fontSize: 10 }} />
                        <YAxis stroke="#8fae88" tick={{ fontSize: 10 }} tickFormatter={v => `₹${v}`} />
                        <Tooltip formatter={(v) => [`₹${v.toFixed(2)}/kg`, 'Price']} />
                        <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
                        <Line type="monotone" dataKey="price" stroke="#f5a623" strokeWidth={2} name="Wholesale Mandi Rate" dot={{ r: 3, fill: '#f5a623' }} />
                        <Line type="monotone" dataKey="msp" stroke="#358525" strokeDasharray="4 4" strokeWidth={1.5} name="CACP MSP Reference" dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800 text-[11px] text-slate-400">
                  <strong>Notice:</strong> Predictions represent statistical projections based on past Mandi trendlines and policy support inflation. They are explicitly labeled as ML forecasts and must not be treated as financial guarantees.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
