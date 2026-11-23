import React from 'react';
import { ExternalLink, Database, Cpu, Calculator, UserCheck } from 'lucide-react';

export const DataSourceBadge = ({ type = "historical", sourceName, sourceUrl, inline = false }) => {
  const config = {
    prediction: { bg: "bg-amber-900/40 border-amber-600/50 text-amber-300",   icon: <Cpu className="w-3 h-3 text-amber-400" />,   label: "ML Prediction" },
    calculated:  { bg: "bg-brand-900/40 border-brand-600/50 text-brand-300",   icon: <Calculator className="w-3 h-3 text-brand-400" />, label: "Calculated" },
    assumption:  { bg: "bg-teal-900/40 border-teal-600/50 text-teal-300",      icon: <UserCheck className="w-3 h-3 text-teal-400" />,  label: "User Assumption" },
    historical:  { bg: "bg-slate-800/60 border-slate-600/50 text-slate-300",   icon: <Database className="w-3 h-3 text-slate-400" />,  label: "Real-World Data" },
  }[type] ?? { bg: "bg-slate-800/60 border-slate-600/50 text-slate-300", icon: <Database className="w-3 h-3" />, label: "Data" };

  return (
    <div className={`flex items-center gap-1.5 text-[11px] font-medium border rounded-md px-2 py-0.5 w-fit ${config.bg}`}>
      {config.icon}
      <span>{config.label}</span>
      {sourceName && <span className="text-slate-500 text-[10px] pl-1 border-l border-slate-700">{sourceName}</span>}
      {sourceUrl && (
        <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:text-brand-300 transition-colors ml-0.5">
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      )}
    </div>
  );
};
