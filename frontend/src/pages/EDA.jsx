import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  ScatterChart as ScatterIcon,
  Layers,
  Activity,
  Calculator,
  Sliders,
  Sparkles
} from 'lucide-react';
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import { ChartCard } from '../components/ChartCard';
import { KPICard } from '../components/KPIcard';
import { FilterPanel } from '../components/FilterPanel';
import { DataSourceBadge } from '../components/DataSourceBadge';
import { analyticsService } from '../services/analyticsService';
import { formatNumber, formatCurrency } from '../utils/formatters';

export const EDA = () => {
  const [filters, setFilters] = useState({
    crop_name: 'All',
    region: 'All',
    year: ''
  });

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected variables for bivariate EDA
  const [xVar, setXVar] = useState('cultivated_area');
  const [yVar, setYVar] = useState('production');

  const variableOptions = [
    { key: 'cultivated_area', label: 'Cultivated Area', unit: 'ha' },
    { key: 'production', label: 'Crop Production', unit: 'tonnes' },
    { key: 'yield_per_ha', label: 'Yield Realization', unit: 't/ha' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const queryParams = {};
        if (filters.crop_name !== 'All') queryParams.crop_name = filters.crop_name;
        if (filters.region !== 'All') queryParams.region = filters.region;
        if (filters.year) queryParams.year = filters.year;

        const data = await analyticsService.listProduction({ ...queryParams, limit: 300 });
        setRecords(Array.isArray(data) ? data : data?.records || []);
      } catch (err) {
        console.error("EDA data fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters.crop_name, filters.region, filters.year]);

  // Compute Univariate Statistics for a given key
  const computeStats = (data, key) => {
    const vals = data
      .map(d => Number(d[key]))
      .filter(v => v !== null && v !== undefined && !isNaN(v))
      .sort((a, b) => a - b);
    if (!vals.length) return null;

    const n = vals.length;
    const sum = vals.reduce((a, b) => a + b, 0);
    const mean = sum / n;
    const median = n % 2 === 0 ? (vals[n / 2 - 1] + vals[n / 2]) / 2 : vals[Math.floor(n / 2)];
    const min = vals[0];
    const max = vals[n - 1];
    const q1 = vals[Math.floor(n * 0.25)];
    const q3 = vals[Math.floor(n * 0.75)];

    const variance = vals.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);

    return { n, mean, median, min, max, q1, q3, stdDev };
  };

  const yieldStats = useMemo(() => computeStats(records, 'yield_per_ha'), [records]);
  const areaStats = useMemo(() => computeStats(records, 'cultivated_area'), [records]);
  const prodStats = useMemo(() => computeStats(records, 'production'), [records]);

  // Compute Pearson Correlation between xVar and yVar
  const correlation = useMemo(() => {
    const validPairs = records
      .map(r => ({ x: Number(r[xVar]), y: Number(r[yVar]) }))
      .filter(p => !isNaN(p.x) && !isNaN(p.y));

    if (validPairs.length < 2) return 0;
    const n = validPairs.length;
    const sumX = validPairs.reduce((a, p) => a + p.x, 0);
    const sumY = validPairs.reduce((a, p) => a + p.y, 0);
    const sumXY = validPairs.reduce((a, p) => a + p.x * p.y, 0);
    const sumX2 = validPairs.reduce((a, p) => a + p.x * p.x, 0);
    const sumY2 = validPairs.reduce((a, p) => a + p.y * p.y, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - Math.pow(sumX, 2)) * (n * sumY2 - Math.pow(sumY, 2)));
    if (denominator === 0) return 0;
    return (numerator / denominator).toFixed(3);
  }, [records, xVar, yVar]);

  // Scatter data points
  const scatterData = useMemo(() => {
    return records
      .map(r => ({
        x: Number(r[xVar]),
        y: Number(r[yVar]),
        crop: r.crop_name || r.crop?.crop_name || filters.crop_name,
        region: r.region,
        year: r.year
      }))
      .filter(p => !isNaN(p.x) && !isNaN(p.y));
  }, [records, xVar, yVar, filters.crop_name]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-brand-400" />
          Exploratory Data Analysis (EDA) & Statistical Profiling
        </h1>
        <p className="text-xs lg:text-sm text-slate-400 mt-1">
          Automated descriptive statistics, variance distributions, quartile spreads, and bivariate correlation matrices from real records.
        </p>
      </div>

      <FilterPanel
        filters={filters}
        onFilterChange={setFilters}
        onReset={() => setFilters({ crop_name: 'All', region: 'All', year: '' })}
        showLandArea={false}
      />

      {/* Univariate Statistical Profiles Table */}
      <div className="glass-card rounded-xl p-5 border border-slate-800">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <h3 className="font-semibold text-slate-100 text-sm">
            Agronomic Variable Summary Statistics
          </h3>
          <DataSourceBadge type="calculated" sourceName="Pandas/NumPy Descriptive Statistics" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/60 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Variable</th>
                <th className="py-2.5 px-3">Unit</th>
                <th className="py-2.5 px-3">N Obs</th>
                <th className="py-2.5 px-3">Mean</th>
                <th className="py-2.5 px-3">Median</th>
                <th className="py-2.5 px-3">Std Dev</th>
                <th className="py-2.5 px-3">Min</th>
                <th className="py-2.5 px-3">Q1 (25%)</th>
                <th className="py-2.5 px-3">Q3 (75%)</th>
                <th className="py-2.5 px-3">Max</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {yieldStats && (
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-sans font-semibold text-white">Yield Realization</td>
                  <td className="py-2.5 px-3 text-slate-400">t/ha</td>
                  <td className="py-2.5 px-3">{yieldStats.n}</td>
                  <td className="py-2.5 px-3 text-emerald-400 font-bold">{formatNumber(yieldStats.mean, 3)}</td>
                  <td className="py-2.5 px-3">{formatNumber(yieldStats.median, 3)}</td>
                  <td className="py-2.5 px-3">{formatNumber(yieldStats.stdDev, 3)}</td>
                  <td className="py-2.5 px-3">{formatNumber(yieldStats.min, 3)}</td>
                  <td className="py-2.5 px-3">{formatNumber(yieldStats.q1, 3)}</td>
                  <td className="py-2.5 px-3">{formatNumber(yieldStats.q3, 3)}</td>
                  <td className="py-2.5 px-3 text-brand-300">{formatNumber(yieldStats.max, 3)}</td>
                </tr>
              )}
              {areaStats && (
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-sans font-semibold text-white">Cultivated Area</td>
                  <td className="py-2.5 px-3 text-slate-400">ha</td>
                  <td className="py-2.5 px-3">{areaStats.n}</td>
                  <td className="py-2.5 px-3 text-harvest-400 font-bold">{formatNumber(areaStats.mean, 0)}</td>
                  <td className="py-2.5 px-3">{formatNumber(areaStats.median, 0)}</td>
                  <td className="py-2.5 px-3">{formatNumber(areaStats.stdDev, 0)}</td>
                  <td className="py-2.5 px-3">{formatNumber(areaStats.min, 0)}</td>
                  <td className="py-2.5 px-3">{formatNumber(areaStats.q1, 0)}</td>
                  <td className="py-2.5 px-3">{formatNumber(areaStats.q3, 0)}</td>
                  <td className="py-2.5 px-3 text-harvest-300">{formatNumber(areaStats.max, 0)}</td>
                </tr>
              )}
              {prodStats && (
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-sans font-semibold text-white">Crop Production</td>
                  <td className="py-2.5 px-3 text-slate-400">tonnes</td>
                  <td className="py-2.5 px-3">{prodStats.n}</td>
                  <td className="py-2.5 px-3 text-amber-400 font-bold">{formatNumber(prodStats.mean, 0)}</td>
                  <td className="py-2.5 px-3">{formatNumber(prodStats.median, 0)}</td>
                  <td className="py-2.5 px-3">{formatNumber(prodStats.stdDev, 0)}</td>
                  <td className="py-2.5 px-3">{formatNumber(prodStats.min, 0)}</td>
                  <td className="py-2.5 px-3">{formatNumber(prodStats.q1, 0)}</td>
                  <td className="py-2.5 px-3">{formatNumber(prodStats.q3, 0)}</td>
                  <td className="py-2.5 px-3 text-amber-300">{formatNumber(prodStats.max, 0)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bivariate Scatter Plot & Correlation */}
      <div className="glass-card rounded-xl p-5 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
          <div>
            <h3 className="font-semibold text-slate-100 text-sm">
              Bivariate Scatter Correlation Engine
            </h3>
            <p className="text-xs text-slate-400">
              Select two continuous agricultural features to assess linear correlation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400">X-Axis:</span>
              <select
                value={xVar}
                onChange={(e) => setXVar(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-medium"
              >
                {variableOptions.map(o => (
                  <option key={o.key} value={o.key}>{o.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400">Y-Axis:</span>
              <select
                value={yVar}
                onChange={(e) => setYVar(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white font-medium"
              >
                {variableOptions.map(o => (
                  <option key={o.key} value={o.key}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Correlation Badge */}
        <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <Activity className="w-4 h-4 text-purple-400" />
            <span className="text-slate-300">
              Pearson Correlation Coefficient (r) between <strong>{xVar}</strong> and <strong>{yVar}</strong>:
            </span>
          </div>
          <div className="font-mono text-sm font-bold text-brand-400">
            r = {correlation}{' '}
            <span className="text-[10px] font-normal text-slate-400">
              ({Math.abs(Number(correlation)) > 0.7 ? 'Strong' : Math.abs(Number(correlation)) > 0.4 ? 'Moderate' : 'Weak'} Linear Association)
            </span>
          </div>
        </div>

        {/* Scatter Chart */}
        <div className="w-full h-80">
          {scatterData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#243722" />
                <XAxis
                  type="number"
                  dataKey="x"
                  stroke="#8fae88"
                  tick={{ fontSize: 11 }}
                  name={xVar}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  stroke="#8fae88"
                  tick={{ fontSize: 11 }}
                  name={yVar}
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    if (!payload || !payload.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="glass-panel p-2.5 rounded-lg border border-slate-700 text-xs">
                        <div className="font-bold text-white">{d.crop}</div>
                        <div className="text-slate-400">{d.region} ({d.year})</div>
                        <div className="text-brand-300 mt-1 font-mono">{xVar}: {formatNumber(d.x, 2)}</div>
                        <div className="text-harvest-300 font-mono">{yVar}: {formatNumber(d.y, 2)}</div>
                      </div>
                    );
                  }}
                />
                <Scatter name="Observations" data={scatterData} fill="#10b981" />
              </ScatterChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-xs">
              No matching data for scatter plot.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
