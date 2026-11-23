import React from 'react';
import { DataSourceBadge } from './DataSourceBadge';

export const KPICard = ({
  title, value, unit, subtitle,
  icon: Icon, color = "brand",
  sourceType = "historical", sourceName, sourceUrl,
  trendValue, isPositive = true
}) => {
  const iconStyles = {
    brand:   "text-brand-400  bg-brand-900/50  border-brand-700/50",
    harvest: "text-amber-400  bg-amber-900/40  border-amber-700/40",
    blue:    "text-blue-400   bg-blue-900/40   border-blue-700/40",
    purple:  "text-violet-400 bg-violet-900/40 border-violet-700/40",
    rose:    "text-rose-400   bg-rose-900/40   border-rose-700/40",
    teal:    "text-teal-400   bg-teal-900/40   border-teal-700/40",
    emerald: "text-emerald-400 bg-emerald-900/40 border-emerald-700/40",
  };

  return (
    <div className="glass-card p-4 rounded-xl flex flex-col justify-between">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider leading-tight">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-lg border shrink-0 ${iconStyles[color] || iconStyles.brand}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="my-1">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-2xl font-black tracking-tight text-white">{value}</span>
          {unit && <span className="text-xs font-semibold text-slate-400">{unit}</span>}
        </div>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{subtitle}</p>}
      </div>
      <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between gap-1 flex-wrap">
        <DataSourceBadge type={sourceType} sourceName={sourceName} sourceUrl={sourceUrl} />
        {trendValue && (
          <span className={`text-[11px] font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPositive ? '↑' : '↓'} {trendValue}
          </span>
        )}
      </div>
    </div>
  );
};
