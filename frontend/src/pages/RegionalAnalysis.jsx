import React, { useState, useEffect } from 'react';
import {
  MapPin,
  TrendingUp,
  Scale,
  Layers,
  Sprout,
  Trophy,
  BarChart3,
  Globe
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import { ChartCard } from '../components/ChartCard';
import { KPICard } from '../components/KPIcard';
import { DataTable } from '../components/DataTable';
import { FilterPanel } from '../components/FilterPanel';
import { analyticsService } from '../services/analyticsService';
import { formatNumber } from '../utils/formatters';

export const RegionalAnalysis = () => {
  const [filters, setFilters] = useState({
    crop_name: 'All',
    region: 'All',
    year: ''
  });

  const [regionalData, setRegionalData] = useState([]);
  const [metric, setMetric] = useState('avg_yield_t_ha'); // or 'total_production_tonnes'
  const [loading, setLoading] = useState(true);

  const fetchRegionalData = async () => {
    setLoading(true);
    try {
      const queryParams = {};
      if (filters.crop_name !== 'All') queryParams.crop_name = filters.crop_name;
      if (filters.year) queryParams.year = filters.year;

      const rawReg = Array.isArray(res) ? res : [];
      const normalized = rawReg.map(r => ({
        ...r,
        yield_per_ha: r.yield_per_ha ?? r.avg_yield_t_ha ?? 0,
        avg_yield_t_ha: r.yield_per_ha ?? r.avg_yield_t_ha ?? 0,
        production: r.production ?? r.total_production_tonnes ?? 0,
        total_production_tonnes: r.production ?? r.total_production_tonnes ?? 0,
        cultivated_area: r.cultivated_area ?? r.total_area_ha ?? 0,
        total_area_ha: r.cultivated_area ?? r.total_area_ha ?? 0
      }));
      setRegionalData(normalized);
    } catch (err) {
      console.error("Regional data fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegionalData();
  }, [filters.crop_name, filters.year]);

  // Sort by selected metric
  const sortedRegions = [...regionalData].sort((a, b) => (b[metric] || 0) - (a[metric] || 0));
  const topRegion = sortedRegions[0];

  const tableColumns = [
    {
      key: 'rank',
      header: 'Rank',
      render: (_, r) => {
        const idx = sortedRegions.findIndex(item => item.region === r.region) + 1;
        return (
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
            idx === 1 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
            idx === 2 ? 'bg-slate-300/20 text-slate-200' :
            idx === 3 ? 'bg-amber-700/20 text-amber-500' : 'text-slate-400'
          }`}>
            #{idx}
          </span>
        );
      }
    },
    { key: 'region', header: 'State / Agro-Region', render: (val) => <span className="font-bold text-white">{val}</span> },
    {
      key: 'avg_yield_t_ha',
      header: 'Average Yield',
      unit: 't/ha',
      render: (val) => `${formatNumber(val, 3)} t/ha`
    },
    {
      key: 'total_production_tonnes',
      header: 'Total Production',
      unit: 'tonnes',
      render: (val) => `${formatNumber(val, 0)} t`
    },
    {
      key: 'total_area_ha',
      header: 'Total Cultivated Area',
      unit: 'ha',
      render: (val) => `${formatNumber(val, 0)} ha`
    },
    {
      key: 'record_count',
      header: 'Historical Observations',
      render: (val) => `${val} samples`
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-white flex items-center gap-2">
          <MapPin className="w-6 h-6 text-amber-400" />
          Regional Agronomic Intelligence
        </h1>
        <p className="text-xs lg:text-sm text-slate-400 mt-1">
          State-level oilseed productivity benchmarking and regional specialization mapping across India.
        </p>
      </div>

      <FilterPanel
        filters={filters}
        onFilterChange={setFilters}
        onReset={() => setFilters({ crop_name: 'All', region: 'All', year: '' })}
        showLandArea={false}
      />

      {/* Top Performing Region Banner */}
      {topRegion && (
        <div className="glass-card rounded-xl p-5 border border-amber-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Trophy className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                Top Performing Regional Agro-Cluster
              </span>
              <h2 className="text-lg font-extrabold text-white">{topRegion.region}</h2>
              <p className="text-xs text-slate-400">
                Leading benchmark for {filters.crop_name !== 'All' ? filters.crop_name : 'all analyzed oilseeds'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-sans">Realized Yield</span>
              <span className="text-sm font-bold text-emerald-400">{topRegion.avg_yield_t_ha} t/ha</span>
            </div>
            <div className="bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-sans">Total Output</span>
              <span className="text-sm font-bold text-white">{formatNumber(topRegion.total_production_tonnes, 0)} t</span>
            </div>
          </div>
        </div>
      )}

      {/* Chart: Regional Comparison */}
      <ChartCard
        title="State-Wise Productivity Comparison"
        subtitle="Ranked performance across Indian agricultural zones"
        sourceType="historical"
        sourceName="DES India"
        sourceUrl="https://eands.dacnet.nic.in/"
        action={
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 rounded-lg p-0.5 text-[11px]">
            <button
              onClick={() => setMetric('avg_yield_t_ha')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                metric === 'avg_yield_t_ha' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Yield (t/ha)
            </button>
            <button
              onClick={() => setMetric('total_production_tonnes')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                metric === 'total_production_tonnes' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Production (t)
            </button>
          </div>
        }
      >
        {sortedRegions.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={sortedRegions}>
              <CartesianGrid strokeDasharray="3 3" stroke="#243722" />
              <XAxis dataKey="region" stroke="#8fae88" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={60} />
              <YAxis stroke="#8fae88" tick={{ fontSize: 11 }} />
              <Tooltip formatter={(val) => [
                metric === 'avg_yield_t_ha' ? `${val} t/ha` : `${formatNumber(val, 0)} tonnes`,
                metric === 'avg_yield_t_ha' ? 'Average Yield' : 'Total Production'
              ]} />
              <Bar
                dataKey={metric}
                fill="#ea8e0e"
                radius={[4, 4, 0, 0]}
              >
                {sortedRegions.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 0 ? '#358525' : index === 1 ? '#f5a623' : '#cf7209'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 text-xs">
            No regional records matching criteria.
          </div>
        )}
      </ChartCard>

      {/* Regional Table */}
      <DataTable
        title="Regional Performance Audit"
        subtitle="Audited state-wise metrics from Ministry of Agriculture DES publications"
        columns={tableColumns}
        data={sortedRegions}
        itemsPerPage={10}
        exportFileName="regional_oilseed_performance.csv"
      />
    </div>
  );
};
