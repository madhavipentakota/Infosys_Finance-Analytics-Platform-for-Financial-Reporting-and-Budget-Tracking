import React, { useState, useEffect } from 'react';
import {
  Coins,
  PieChart as PieChartIcon,
  TrendingUp,
  Layers,
  Info,
  DollarSign
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { KPICard } from '../components/KPIcard';
import { ChartCard } from '../components/ChartCard';
import { DataTable } from '../components/DataTable';
import { FilterPanel } from '../components/FilterPanel';
import { analyticsService } from '../services/analyticsService';
import { formatCurrency, formatNumber } from '../utils/formatters';

const COST_COLORS = ['#358525', '#f5a623', '#ea8e0e', '#cf7209', '#96cd7c', '#b45309', '#4fa43b'];

export const CostAnalysis = () => {
  const [filters, setFilters] = useState({
    crop_name: 'All',
    region: 'All',
    year: ''
  });

  const [summary, setSummary] = useState(null);
  const [costRecords, setCostRecords] = useState([]);
  const [cropCostComparison, setCropCostComparison] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCostData = async () => {
    setLoading(true);
    try {
      const queryParams = {};
      if (filters.crop_name !== 'All') queryParams.crop_name = filters.crop_name;
      if (filters.region !== 'All') queryParams.region = filters.region;
      if (filters.year) queryParams.year = filters.year;

      const [sumRes, recRes, cmpRes] = await Promise.all([
        analyticsService.getCostSummary(queryParams),
        analyticsService.listCosts({ ...queryParams, limit: 100 }),
        analyticsService.compareCrops(queryParams)
      ]);

      setSummary(sumRes);
      setCostRecords(Array.isArray(recRes) ? recRes : []);
      const rawCrops = cmpRes?.crops || [];
      const normalizedCrops = rawCrops.map(c => ({
        ...c,
        cost_per_ha: c.cost_per_ha ?? c.avg_cost_ha ?? 0,
        avg_cost_ha: c.cost_per_ha ?? c.avg_cost_ha ?? 0
      }));
      setCropCostComparison(normalizedCrops);
    } catch (err) {
      console.error("Cost analysis fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCostData();
  }, [filters.crop_name, filters.region, filters.year]);

  // Breakdown for Donut Chart
  const costBreakdownData = React.useMemo(() => {
    if (!summary?.breakdown) return [];
    if (Array.isArray(summary.breakdown)) {
      return summary.breakdown.map(b => ({
        name: b.category,
        value: b.amount_ha,
        percentage: b.percentage,
        unit: '₹/ha'
      })).filter(b => b.value > 0);
    }
    return [];
  }, [summary]);

  const tableColumns = [
    { key: 'crop_name', header: 'Crop', render: (val, r) => val || r.crop?.crop_name || filters.crop_name },
    { key: 'region', header: 'State / Region' },
    { key: 'year', header: 'Year' },
    {
      key: 'cost_a2_fl_ha',
      header: 'Cost A2+FL (Operational)',
      unit: '₹/ha',
      render: (val, r) => formatCurrency(val ?? (r.total_cost_ha * 0.72))
    },
    {
      key: 'total_cost_ha',
      header: 'Comprehensive Cost C2',
      unit: '₹/ha',
      render: (val) => (
        <span className="font-semibold text-rose-300">{formatCurrency(val)}</span>
      )
    },
    {
      key: 'cost_per_quintal',
      header: 'Cost / Quintal',
      unit: '₹/q',
      render: (val) => (val ? `₹ ${formatNumber(val, 0)}` : '—')
    }
  ];

  const totalCostHa = summary?.total_cost_ha ?? summary?.avg_total_cost_ha ?? 0;
  const costA2FL = summary?.cost_a2_fl_ha ?? summary?.avg_cost_a2_fl_ha ?? (totalCostHa * 0.72);
  const costKg = summary?.cost_per_kg ?? summary?.avg_cost_per_kg ?? 0;
  const costQtl = summary?.cost_per_quintal ?? summary?.avg_cost_per_quintal ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-white flex items-center gap-2">
          <Coins className="w-6 h-6 text-rose-400" />
          Production Cost Analysis (CACP Benchmark)
        </h1>
        <p className="text-xs lg:text-sm text-slate-400 mt-1">
          Detailed input breakdown based on official Commission for Agricultural Costs and Prices (CACP) Cost of Cultivation studies.
        </p>
      </div>

      <FilterPanel
        filters={filters}
        onFilterChange={setFilters}
        onReset={() => setFilters({ crop_name: 'All', region: 'All', year: '' })}
        showLandArea={false}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          title="Average Cost C2 (Comprehensive)"
          value={totalCostHa > 0 ? formatCurrency(totalCostHa) : '—'}
          unit="/ Hectare"
          subtitle="All paid-out expenses + imputed family labor & rent"
          icon={Coins}
          color="rose"
          sourceType="historical"
          sourceName="CACP Reports"
          sourceUrl="https://cacp.dacnet.nic.in/"
        />

        <KPICard
          title="Average Operational Cost A2+FL"
          value={costA2FL > 0 ? formatCurrency(costA2FL) : '—'}
          unit="/ Hectare"
          subtitle="Paid out operational inputs + family labor"
          icon={Layers}
          color="harvest"
          sourceType="historical"
          sourceName="CACP Reports"
          sourceUrl="https://cacp.dacnet.nic.in/"
        />

        <KPICard
          title="Unit Production Cost"
          value={costKg > 0 ? `₹ ${formatNumber(costKg, 2)}` : '—'}
          unit="/ kg harvest"
          subtitle={costQtl > 0 ? `₹ ${formatNumber(costQtl, 0)} / Quintal` : ''}
          icon={TrendingUp}
          color="harvest"
          sourceType="calculated"
          sourceName="Total Cost C2 / Production"
        />
      </div>

      {/* Charts Row: Donut Chart of Cost Composition + Bar Chart by Crop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Cost of Cultivation Composition (C2 Breakdown)"
          subtitle="Relative distribution of agronomic input and labor expenses"
          sourceType="historical"
          sourceName="CACP Studies"
          sourceUrl="https://cacp.dacnet.nic.in/"
        >
          {costBreakdownData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={costBreakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={105}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {costBreakdownData.map((_, idx) => (
                    <Cell key={idx} fill={COST_COLORS[idx % COST_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => [formatCurrency(val), 'Cost']} />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-xs">
              No cost breakdown data available for selected filter.
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Comprehensive Cost (C2) Across Oilseeds"
          subtitle="Comparison of production expenditure per hectare (₹/ha)"
          sourceType="historical"
          sourceName="CACP Benchmarks"
          sourceUrl="https://cacp.dacnet.nic.in/"
        >
          {cropCostComparison.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cropCostComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#243722" />
                <XAxis dataKey="crop_name" stroke="#8fae88" tick={{ fontSize: 10 }} />
                <YAxis stroke="#8fae88" tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val) => [formatCurrency(val), 'Cost C2 / ha']} />
                <Bar dataKey="avg_cost_ha" name="Cost C2 (₹/ha)" fill="#cf7209" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-xs">
              No comparative cost data available.
            </div>
          )}
        </ChartCard>
      </div>

      {/* CACP Explanatory Banner */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
        <Info className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-semibold text-white">CACP Cost Concepts Distinction:</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            <strong>Cost A2:</strong> Out-of-pocket expenses incurred by farmers on seeds, fertilizers, pesticides, hired labor, machine fuel, irrigation, etc.
            <br />
            <strong>Cost A2+FL:</strong> Cost A2 plus the imputed value of unpaid family labor. This forms the baseline for Indian Minimum Support Price (MSP) setting (MSP ≥ 1.5 × A2+FL).
            <br />
            <strong>Cost C2:</strong> Comprehensive cost including A2+FL plus imputed rental value of owned land and interest on owned fixed capital.
          </p>
        </div>
      </div>

      {/* Historical Data Table */}
      <DataTable
        title="Historical CACP Cost of Cultivation Records"
        subtitle="Audited state-wise agricultural economics survey series"
        columns={tableColumns}
        data={costRecords}
        itemsPerPage={10}
        exportFileName="cacp_cost_records.csv"
      />
    </div>
  );
};
