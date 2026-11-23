import React, { useEffect, useState } from 'react';
import { Filter, RotateCcw, Sprout, MapPin, Calendar, Layers } from 'lucide-react';
import { analyticsService } from '../services/analyticsService';

export const FilterPanel = ({
  filters,
  onFilterChange,
  onReset,
  showLandArea = true,
  cropsList = null,
  regionsList = null,
  yearsList = null
}) => {
  const [crops, setCrops] = useState([]);
  const [regions, setRegions] = useState([]);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDropdowns = async () => {
      setLoading(true);
      try {
        if (!cropsList) {
          const c = await analyticsService.getCrops();
          setCrops(c || []);
        } else {
          setCrops(cropsList);
        }

        if (!regionsList) {
          const r = await analyticsService.getRegions();
          setRegions(r || []);
        } else {
          setRegions(regionsList);
        }

        if (!yearsList) {
          const y = await analyticsService.getYears();
          setYears(y || []);
        } else {
          setYears(yearsList);
        }
      } catch (err) {
        console.error("Error fetching filter dropdowns:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDropdowns();
  }, [cropsList, regionsList, yearsList]);

  return (
    <div className="bg-navy-950 rounded-2xl p-4 sm:p-5 mb-6 border border-slate-700 shadow-xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-white text-xs font-bold uppercase tracking-wider">
          <Filter className="w-4 h-4 text-brand-400" />
          <span>Agricultural Scope Filters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:flex lg:items-center gap-3 flex-wrap">
          {/* Crop Selector */}
          <div className="flex items-center gap-2 bg-navy-900 border border-slate-600 rounded-xl px-3 py-2 shadow-inner">
            <Sprout className="w-4 h-4 text-brand-400 shrink-0" />
            <select
              value={filters.crop_name || 'All'}
              onChange={(e) => onFilterChange({ ...filters, crop_name: e.target.value })}
              className="bg-navy-900 text-white font-semibold text-xs focus:outline-none cursor-pointer w-full border-none"
              style={{ color: '#ffffff', backgroundColor: '#0d1b2a' }}
            >
              <option value="All" style={{ color: '#ffffff', backgroundColor: '#0d1b2a' }}>All Oilseeds</option>
              {crops.map((c) => (
                <option key={c.id || c.crop_name} value={c.crop_name} style={{ color: '#ffffff', backgroundColor: '#0d1b2a' }}>
                  {c.crop_name}
                </option>
              ))}
            </select>
          </div>

          {/* Region Selector */}
          <div className="flex items-center gap-2 bg-navy-900 border border-slate-600 rounded-xl px-3 py-2 shadow-inner">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <select
              value={filters.region || 'All'}
              onChange={(e) => onFilterChange({ ...filters, region: e.target.value })}
              className="bg-navy-900 text-white font-semibold text-xs focus:outline-none cursor-pointer w-full border-none"
              style={{ color: '#ffffff', backgroundColor: '#0d1b2a' }}
            >
              <option value="All" style={{ color: '#ffffff', backgroundColor: '#0d1b2a' }}>All States/Regions</option>
              {regions.map((r) => (
                <option key={r} value={r} style={{ color: '#ffffff', backgroundColor: '#0d1b2a' }}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Year Selector */}
          <div className="flex items-center gap-2 bg-navy-900 border border-slate-600 rounded-xl px-3 py-2 shadow-inner">
            <Calendar className="w-4 h-4 text-teal-400 shrink-0" />
            <select
              value={filters.year || ''}
              onChange={(e) => onFilterChange({ ...filters, year: e.target.value ? Number(e.target.value) : '' })}
              className="bg-navy-900 text-white font-semibold text-xs focus:outline-none cursor-pointer w-full border-none"
              style={{ color: '#ffffff', backgroundColor: '#0d1b2a' }}
            >
              <option value="" style={{ color: '#ffffff', backgroundColor: '#0d1b2a' }}>All Years (2015-2024)</option>
              {years.map((y) => (
                <option key={y} value={y} style={{ color: '#ffffff', backgroundColor: '#0d1b2a' }}>
                  Year {y}
                </option>
              ))}
            </select>
          </div>

          {/* Land Area Input (if enabled) */}
          {showLandArea && (
            <div className="flex items-center gap-2 bg-navy-900 border border-slate-600 rounded-xl px-3 py-2 shadow-inner">
              <Layers className="w-4 h-4 text-amber-400 shrink-0" />
              <input
                type="number"
                min="0.1"
                step="0.5"
                value={filters.land_area ?? 10}
                onChange={(e) => onFilterChange({ ...filters, land_area: parseFloat(e.target.value) || 1 })}
                className="bg-navy-900 text-white font-bold text-xs focus:outline-none w-16"
                style={{ color: '#ffffff', backgroundColor: '#0d1b2a' }}
                title="Land Area"
              />
              <select
                value={filters.unit || 'hectare'}
                onChange={(e) => onFilterChange({ ...filters, unit: e.target.value })}
                className="bg-navy-900 text-cyan-300 font-semibold text-xs focus:outline-none cursor-pointer border-none"
                style={{ color: '#00d4ff', backgroundColor: '#0d1b2a' }}
              >
                <option value="hectare" style={{ color: '#ffffff', backgroundColor: '#0d1b2a' }}>ha</option>
                <option value="acre" style={{ color: '#ffffff', backgroundColor: '#0d1b2a' }}>acre</option>
              </select>
            </div>
          )}

          {/* Reset Filters */}
          <button
            onClick={onReset}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600 transition-colors shadow-sm"
            title="Reset to default filters"
          >
            <RotateCcw className="w-3.5 h-3.5 text-brand-400" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
