import React, { useState, useEffect } from 'react';
import {
  Sprout,
  TrendingUp,
  MapPin,
  Calendar,
  Layers,
  Scale,
  ScatterChart as ScatterIcon,
  BarChart3
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ZAxis
} from 'recharts';
import { ChartCard } from '../components/ChartCard';
import { KPICard } from '../components/KPIcard';
import { DataTable } from '../components/DataTable';
import { FilterPanel } from '../components/FilterPanel';
import { analyticsService } from '../services/analyticsService';
import { formatNumber } from '../utils/formatters';

export const ProductionAnalysis = () => {
  const [filters, setFilters] = useState({
    crop_name: 'All',
    region: 'All',
    year: ''
  });

  const [records, setRecords] = useState([]);
  const [trends, setTrends] = useState([]);
  const [regionalYields, setRegionalYields] = useState([]);
  const [cropComparison, setCropComparison] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const queryParams = {};
      if (filters.crop_name !== 'All') queryParams.crop_name = filters.crop_name;
      if (filters.region !== 'All') queryParams.region = filters.region;
      if (filters.year) queryParams.year = filters.year;

      const [recData, trendsData, regData, cropData] = await Promise.all([
        analyticsService.listProduction({ ...queryParams, limit: 100 }),
        analyticsService.getProductionTrends(queryParams),
        analyticsService.getProductionByRegion(queryParams),
        analyticsService.compareCrops(queryParams)
      ]);

      setRecords(Array.isArray(recData) ? recData : []);
      const rawTrends = trendsData?.historical_series || (Array.isArray(trendsData) ? trendsData : []);
      setTrends(rawTrends);
      const rawReg = Array.isArray(regData) ? regData : [];
      const normalizedReg = rawReg.map(r => ({
        ...r,
        yield_per_ha: r.yield_per_ha ?? r.avg_yield_t_ha,
        avg_yield_t_ha: r.yield_per_ha ?? r.avg_yield_t_ha,
        production: r.production ?? r.total_production_tonnes,
        cultivated_area: r.cultivated_area ?? r.total_area_ha
      }));
      setRegionalYields(normalizedReg);
      setCropComparison(cropData?.crops || []);
    } catch (err) {
      console.error("Failed to load production data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters.crop_name, filters.region, filters.year]);

  const totalArea = records.reduce((acc, r) => acc + (r.cultivated_area || 0), 0);
  const totalProduction = records.reduce((acc, r) => acc + (r.production || 0), 0);
  const avgYield = totalArea > 0 ? (totalProduction / totalArea).toFixed(3) : 0;

  // Scatter plot data: area vs production
  const scatterData = records.map((r) => ({
    x: r.cultivated_area,
    y: r.production,
    crop: r.crop_name || r.crop?.crop_name || filters.crop_name,
    region: r.region,
    year: r.year,
    yield: r.yield_per_ha
  }));

  const tableColumns = [
    { key: 'crop_name', header: 'Crop', render: (val, r) => val || r.crop?.crop_name || filters.crop_name },
    { key: 'region', header: 'State / Region' },
    { key: 'year', header: 'Year' },
    {
      key: 'cultivated_area',
      header: 'Cultivated Area',
      unit: 'ha',
      render: (val) => `${formatNumber(val, 1)} ha`
    },
    {
      key: 'production',
      header: 'Production',
      unit: 'tonnes',
      render: (val) => `${formatNumber(val, 1)} t`
    },
    {
      key: 'yield_per_ha',
      header: 'Yield',
      unit: 't/ha',
      render: (val) => (
        <span className="font-semibold text-brand-300">
          {formatNumber(val, 3)} t/ha
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-white flex items-center gap-2">
          <Sprout className="w-6 h-6 text-brand-400" />
          Oilseed Production & Yield Analysis
        </h1>
        <p className="text-xs lg:text-sm text-slate-400 mt-1">
          Analysis of cultivated land area, total crop harvest, and yield realization per hectare across Indian agro-climatic zones.
        </p>
      </div>

      <FilterPanel
        filters={filters}
        onFilterChange={setFilters}
        onReset={() => setFilters({ crop_name: 'All', region: 'All', year: '' })}
        showLandArea={false}
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          title="Sampled Cultivated Area"
          value={formatNumber(totalArea, 0)}
          unit="Hectares"
          subtitle="Sum of matching historical records"
          icon={Layers}
          color="brand"
          sourceType="historical"
          sourceName="DES India"
          sourceUrl="https://eands.dacnet.nic.in/"
        />
        <KPICard
          title="Sampled Crop Production"
          value={formatNumber(totalProduction, 0)}
          unit="Tonnes"
          subtitle="Harvest yield across zones"
          icon={Scale}
          color="brand"
          sourceType="historical"
          sourceName="DES India"
          sourceUrl="https://eands.dacnet.nic.in/"
        />
        <KPICard
          title="Calculated Yield per Hectare"
          value={avgYield}
          unit="t / ha"
          subtitle={`Formula: Production / Area (${(avgYield * 10).toFixed(1)} q/ha)`}
          icon={TrendingUp}
          color="harvest"
          sourceType="calculated"
          sourceName="DES Data-Derived"
        />
      </div>

      {/* Row 1 Charts: Production over years + Regional Yield comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Production Growth Trend Over Years"
          subtitle="Annual production volume (Tonnes) by year"
          sourceType="historical"
          sourceName="DES India (2015-2024)"
          sourceUrl="https://eands.dacnet.nic.in/"
        >
          {trends.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#243722" />
                <XAxis dataKey="year" stroke="#8fae88" tick={{ fontSize: 11 }} />
                <YAxis stroke="#8fae88" tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val) => [`${formatNumber(val, 1)} tonnes`, 'Production']} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="production_tonnes"
                  name="Harvest Production (t)"
                  stroke="#358525"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#358525' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-xs">
              No trend data available.
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Regional Yield Realizations (t/ha)"
          subtitle="State-wise average yield per hectare"
          sourceType="historical"
          sourceName="DES India"
          sourceUrl="https://eands.dacnet.nic.in/"
        >
          {regionalYields.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionalYields.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#243722" />
                <XAxis dataKey="region" stroke="#8fae88" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" height={60} />
                <YAxis stroke="#8fae88" tick={{ fontSize: 11 }} unit=" t" />
                <Tooltip formatter={(val) => [`${val} tonnes / ha`, 'Yield']} />
                <Bar dataKey="avg_yield_t_ha" name="Yield (t/ha)" fill="#ea8e0e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-xs">
              No regional yield data available.
            </div>
          )}
        </ChartCard>
      </div>

      {/* Row 2 Charts: Cultivated Area Area Chart + Area vs Production Scatter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Cultivated Land Area Dynamics"
          subtitle="Historical land acreage allocation trend"
          sourceType="historical"
          sourceName="DES India"
          sourceUrl="https://eands.dacnet.nic.in/"
        >
          {trends.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f5a623" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f5a623" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#243722" />
                <XAxis dataKey="year" stroke="#8fae88" tick={{ fontSize: 11 }} />
                <YAxis stroke="#8fae88" tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val) => [`${formatNumber(val, 1)} ha`, 'Area']} />
                <Area type="monotone" dataKey="cultivated_area_ha" name="Cultivated Area (ha)" stroke="#f5a623" strokeWidth={2} fill="url(#areaColor)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-xs">
              No area trend data available.
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Cultivated Area vs Production Correlation"
          subtitle="Scatter distribution of area (X) vs harvest production (Y)"
          sourceType="historical"
          sourceName="DES India"
          sourceUrl="https://eands.dacnet.nic.in/"
        >
          {scatterData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#243722" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Cultivated Area"
                  stroke="#8fae88"
                  tick={{ fontSize: 11 }}
                  unit=" ha"
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Production"
                  stroke="#8fae88"
                  tick={{ fontSize: 11 }}
                  unit=" t"
                />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    if (!payload || !payload.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="glass-panel p-2.5 rounded-lg border border-slate-700 text-xs">
                        <div className="font-semibold text-white">{d.crop} ({d.region}, {d.year})</div>
                        <div className="text-slate-300">Area: {formatNumber(d.x, 1)} ha</div>
                        <div className="text-slate-300">Production: {formatNumber(d.y, 1)} t</div>
                        <div className="text-brand-400 font-semibold">Yield: {d.yield} t/ha</div>
                      </div>
                    );
                  }}
                />
                <Scatter name="Observations" data={scatterData} fill="#10b981" />
              </ScatterChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-xs">
              No scatter observations available.
            </div>
          )}
        </ChartCard>
      </div>

      {/* Historical Records Data Table */}
      <DataTable
        title="Historical Agricultural Field Observations"
        subtitle="Verified records with explicit units (hectare, tonnes, t/ha)"
        columns={tableColumns}
        data={records}
        itemsPerPage={10}
        exportFileName="oilseed_production_records.csv"
      />
    </div>
  );
};
