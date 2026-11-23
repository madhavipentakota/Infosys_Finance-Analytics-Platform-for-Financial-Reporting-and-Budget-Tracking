import React, { useState, useEffect } from 'react';
import {
  Sprout,
  Scale,
  Droplets,
  Coins,
  TrendingUp,
  LineChart as LineChartIcon,
  Percent,
  Sparkles,
  ArrowRight,
  Info,
  Layers,
  Database
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, AreaChart, Area
} from 'recharts';
import { Link } from 'react-router-dom';
import { KPICard } from '../components/KPIcard';
import { ChartCard } from '../components/ChartCard';
import { FilterPanel } from '../components/FilterPanel';
import { DataSourceBadge } from '../components/DataSourceBadge';
import { analyticsService } from '../services/analyticsService';
import { formatCurrency, formatNumber, formatPercentage } from '../utils/formatters';

export const Dashboard = () => {
  const [filters, setFilters] = useState({
    crop_name: 'All',
    region: 'All',
    year: '',
    land_area: 10,
    unit: 'hectare'
  });

  const [kpis, setKpis] = useState(null);
  const [trends, setTrends] = useState([]);
  const [regionalData, setRegionalData] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const queryParams = {};
      if (filters.crop_name !== 'All') queryParams.crop_name = filters.crop_name;
      if (filters.region !== 'All') queryParams.region = filters.region;
      if (filters.year) queryParams.year = filters.year;
      queryParams.land_area = filters.land_area;

      const [kpiRes, trendsRes, regRes, insightRes] = await Promise.all([
        analyticsService.getDashboardKPIs(queryParams),
        analyticsService.getProductionTrends(queryParams),
        analyticsService.getProductionByRegion(queryParams),
        analyticsService.getInsights()
      ]);

      setKpis(kpiRes);
      const rawTrends = trendsRes?.historical_series || (Array.isArray(trendsRes) ? trendsRes : []);
      setTrends(rawTrends);
      const rawReg = Array.isArray(regRes) ? regRes : [];
      const normalizedReg = rawReg.map(r => ({
        ...r,
        yield_per_ha: r.yield_per_ha ?? r.avg_yield_t_ha,
        avg_yield_t_ha: r.yield_per_ha ?? r.avg_yield_t_ha,
        production: r.production ?? r.total_production_tonnes,
        cultivated_area: r.cultivated_area ?? r.total_area_ha
      }));
      setRegionalData(normalizedReg.slice(0, 10));
      setInsights(Array.isArray(insightRes) ? insightRes : []);
    } catch (err) {
      console.error("Dashboard fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [filters.crop_name, filters.region, filters.year, filters.land_area]);

  const handleReset = () => {
    setFilters({
      crop_name: 'All',
      region: 'All',
      year: '',
      land_area: 10,
      unit: 'hectare'
    });
  };

  return (
    <div className="space-y-6">
      {/* Platform Journey Header */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-brand-950/40 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-brand-500/15 text-brand-300 border border-brand-500/30">
                  Data-Driven Decision Engine
                </span>
                <span className="text-xs text-slate-400">
                  Official India DES & CACP Historical Datasets
                </span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                OilCrop Intelligence Platform
              </h1>
              <p className="text-xs lg:text-sm text-slate-400 max-w-3xl mt-1">
                Transparent end-to-end oilseed agronomy & financial analytics pipeline.
                Explore verified yield, input costs, extraction rates, mandi wholesale prices, and predictive returns.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/reports"
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-950/40 flex items-center gap-2 transition-colors border border-brand-500/30"
              >
                <span>Export Dossier</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Visual Journey Flow: Land -> Seed -> Crop -> Oil -> Cost -> Market -> Revenue -> Profit -> ROI */}
          <div className="pt-4 border-t border-slate-800/80">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>Agri-Value Journey</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2 text-center text-[11px]">
              {[
                { step: "1. Land", desc: "Hectares/Acres", link: "/land-seed", color: "text-brand-300" },
                { step: "2. Seed", desc: "Seed Rate (kg/ha)", link: "/land-seed", color: "text-meadow-300" },
                { step: "3. Crop", desc: "Harvest (Tonnes)", link: "/production", color: "text-brand-400" },
                { step: "4. Oil", desc: "Crush Output (t/L)", link: "/oil-production", color: "text-harvest-400" },
                { step: "5. Cost", desc: "CACP A2+FL & C2", link: "/costs", color: "text-harvest-600" },
                { step: "6. Market", desc: "APMC Wholesale", link: "/market", color: "text-harvest-400" },
                { step: "7. Revenue", desc: "Realization", link: "/profitability", color: "text-meadow-300" },
                { step: "8. Profit", desc: "Net Margins", link: "/profitability", color: "text-brand-300" },
                { step: "9. ROI", desc: "Capital Return", link: "/profitability", color: "text-harvest-300" }
              ].map((item, idx) => (
                <Link
                  key={idx}
                  to={item.link}
                  className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-brand-700/60 hover:bg-slate-800/60 transition-all flex flex-col justify-between"
                >
                  <div className={`font-bold ${item.color}`}>{item.step}</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{item.desc}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterPanel
        filters={filters}
        onFilterChange={setFilters}
        onReset={handleReset}
        showLandArea={true}
      />

      {/* KPI Cards Grid (9 Core Metrics from Spec) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
        <KPICard
          title="Total Crops Analyzed"
          value={kpis ? kpis.total_crops_analyzed : '—'}
          unit="Major Oilseeds"
          subtitle="Soybean, Groundnut, Mustard, Sunflower, etc."
          icon={Sprout}
          color="brand"
          sourceType="historical"
          sourceName="DES India"
          sourceUrl="https://eands.dacnet.nic.in/"
        />

        <KPICard
          title="Total Cultivated Area"
          value={kpis ? formatNumber(kpis.total_cultivated_area_ha, 0) : '—'}
          unit="Hectares"
          subtitle="Cumulated area for filter parameters"
          icon={Layers}
          color="brand"
          sourceType="historical"
          sourceName="DES India"
          sourceUrl="https://eands.dacnet.nic.in/"
        />

        <KPICard
          title="Total Production"
          value={kpis ? formatNumber(kpis.total_production_tonnes, 0) : '—'}
          unit="Tonnes"
          subtitle="Raw oilseed crop harvest output"
          icon={Scale}
          color="brand"
          sourceType="historical"
          sourceName="DES India"
          sourceUrl="https://eands.dacnet.nic.in/"
        />

        <KPICard
          title="Average Yield"
          value={kpis ? formatNumber(kpis.average_yield_t_ha, 2) : '—'}
          unit="Tonnes / Hectare"
          subtitle={kpis ? `Equivalent to ${formatNumber(kpis.average_yield_t_ha * 10, 1)} Quintals / ha` : ''}
          icon={TrendingUp}
          color="brand"
          sourceType="calculated"
          sourceName="Production / Area"
        />

        <KPICard
          title="Estimated Oil Production"
          value={kpis ? formatNumber(kpis.estimated_oil_tonnes, 0) : '—'}
          unit="Tonnes Oil"
          subtitle="Based on verified oil content benchmarks"
          icon={Droplets}
          color="harvest"
          sourceType="calculated"
          sourceName="ICAR-IIOR Extraction Rates"
          sourceUrl="https://icar-iior.org.in/"
        />

        <KPICard
          title="Average Production Cost"
          value={kpis ? formatCurrency(kpis.average_production_cost_ha) : '—'}
          unit="/ Hectare"
          subtitle="Comprehensive Cost of Cultivation (C2)"
          icon={Coins}
          color="rose"
          sourceType="historical"
          sourceName="CACP Reports"
          sourceUrl="https://cacp.dacnet.nic.in/"
        />

        <KPICard
          title="Average Market Price"
          value={kpis ? `₹ ${formatNumber(kpis.average_market_price_kg, 2)}` : '—'}
          unit="/ kg"
          subtitle={kpis ? `₹ ${formatNumber(kpis.average_market_price_kg * 100, 0)} / Quintal` : ''}
          icon={Coins}
          color="harvest"
          sourceType="historical"
          sourceName="Agmarknet APMC"
          sourceUrl="https://agmarknet.gov.in/"
        />

        <KPICard
          title="Average Net Profit"
          value={kpis ? formatCurrency(kpis.average_profit_ha) : '—'}
          unit="/ Hectare"
          subtitle="Net Margins (Revenue - Cost C2)"
          icon={LineChartIcon}
          color="brand"
          sourceType="calculated"
          sourceName="Revenue - Total Cost"
        />

        <KPICard
          title="Average ROI"
          value={kpis ? formatPercentage(kpis.average_roi_pct, 1) : '—'}
          unit="Return on Inv."
          subtitle={kpis && kpis.average_roi_pct >= 0 ? "Profitable return baseline" : "Margin pressure"}
          icon={Percent}
          color="harvest"
          sourceType="calculated"
          sourceName="(Net Profit / Total Cost) × 100"
          isPositive={kpis ? kpis.average_roi_pct >= 0 : true}
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend of Cultivated Area & Production */}
        <ChartCard
          title="Historical Production & Area Trends"
          subtitle="Area (Thousand ha) and Harvest Production (Thousand tonnes) across years"
          sourceType="historical"
          sourceName="DES India (2015-2024)"
          sourceUrl="https://eands.dacnet.nic.in/"
        >
          {trends.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="prodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" />
                <XAxis dataKey="year" stroke="#94afc8" tick={{ fontSize: 11, fill: '#94afc8' }} />
                <YAxis stroke="#94afc8" tick={{ fontSize: 11, fill: '#94afc8' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f2240', border: '1px solid #00d4ff', borderRadius: '10px', color: '#f0f9ff' }}
                  formatter={(val, name) => [
                    `${formatNumber(val, 1)} ${name.includes('Area') ? 'ha' : 't'}`,
                    name
                  ]}
                />
                <Legend wrapperStyle={{ color: '#f0f9ff', fontSize: 12 }} />
                <Area type="monotone" dataKey="production_tonnes" name="Production (t)" stroke="#00d4ff" strokeWidth={2.5} fillOpacity={1} fill="url(#prodGrad)" />
                <Area type="monotone" dataKey="cultivated_area_ha" name="Cultivated Area (ha)" stroke="#14b8a6" strokeWidth={2} fillOpacity={1} fill="url(#areaGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-xs">
              No trend observations matching filter criteria.
            </div>
          )}
        </ChartCard>

        {/* Regional Yield Benchmark */}
        <ChartCard
          title="Top Regional Yield Realizations"
          subtitle="Average yield per hectare by State / Agricultural Region (Tonnes/ha)"
          sourceType="historical"
          sourceName="DES India"
          sourceUrl="https://eands.dacnet.nic.in/"
        >
          {regionalData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionalData} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f" horizontal={false} />
                <XAxis type="number" stroke="#94afc8" tick={{ fontSize: 11, fill: '#94afc8' }} unit=" t/ha" />
                <YAxis dataKey="region" type="category" stroke="#94afc8" tick={{ fontSize: 10, fill: '#94afc8' }} width={90} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f2240', border: '1px solid #00d4ff', borderRadius: '10px', color: '#f0f9ff' }}
                  formatter={(val) => [`${val} tonnes / hectare`, 'Avg Yield']}
                />
                <Bar dataKey="avg_yield_t_ha" name="Yield (t/ha)" fill="#00d4ff" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-400 text-xs">
              No regional observations matching filter criteria.
            </div>
          )}
        </ChartCard>
      </div>

      {/* Automated Data-Driven Insights Engine */}
      <div className="glass-card rounded-xl p-5 border border-slate-800">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="font-semibold text-slate-100 text-sm">
              Intelligent Agronomic & Financial Insights
            </h3>
          </div>
          <DataSourceBadge type="calculated" sourceName="Automated Statistical Engine" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {insights.length > 0 ? (
            insights.map((ins, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">
                      {ins.category || 'Agronomy'}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      Confidence: {ins.confidence || 'High'}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200 mb-1">{ins.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{ins.message}</p>
                </div>
                {ins.metric && (
                  <div className="mt-2 pt-2 border-t border-slate-800/60 text-[10px] text-amber-400/90 font-mono">
                    Observed Metric: {ins.metric}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-4 text-slate-400 text-xs">
              Generating insights from current data filters...
            </div>
          )}
        </div>
      </div>

      {/* Official Data Source Transparency Footer */}
      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-brand-400 shrink-0" />
          <span>
            <strong>Official Repositories:</strong> Directorate of Economics & Statistics (DES), Commission for Agricultural Costs & Prices (CACP), Agmarknet APMC Mandi, ICAR-IIOR Oilseed Handbooks.
          </span>
        </div>
        <Link
          to="/datasets"
          className="text-brand-400 hover:text-brand-300 font-medium shrink-0 flex items-center gap-1"
        >
          <span>View Source Metadata & Quality Audit</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
};
