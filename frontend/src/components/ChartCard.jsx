import React from 'react';
import { DataSourceBadge } from './DataSourceBadge';

export const ChartCard = ({
  title,
  subtitle,
  children,
  sourceType = "historical",
  sourceName,
  sourceUrl,
  action,
  className = ""
}) => {
  return (
    <div className={`glass-card rounded-xl p-5 flex flex-col justify-between ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800">
        <div>
          <h3 className="font-semibold text-white text-sm md:text-base">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {action}
          <DataSourceBadge type={sourceType} sourceName={sourceName} sourceUrl={sourceUrl} />
        </div>
      </div>
      <div className="flex-1 w-full min-h-[280px]">{children}</div>
    </div>
  );
};
