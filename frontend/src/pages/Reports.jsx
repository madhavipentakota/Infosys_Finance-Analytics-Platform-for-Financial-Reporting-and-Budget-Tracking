import React, { useState, useEffect } from 'react';
import {
  FileDown,
  FileSpreadsheet,
  FileText,
  Sprout,
  MapPin,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  Database,
  Download
} from 'lucide-react';
import { DataSourceBadge } from '../components/DataSourceBadge';
import { analyticsService } from '../services/analyticsService';

export const Reports = () => {
  const [crops, setCrops] = useState([]);
  const [regions, setRegions] = useState([]);
  const [years, setYears] = useState([]);
  const [form, setForm] = useState({
    crop_name: 'Soybean',
    region: 'Madhya Pradesh',
    year: 2024,
    land_area: 10,
    unit: 'hectare',
    notes: 'Official Farm Enterprise Investment Feasibility Analysis'
  });

  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const [c, r, y] = await Promise.all([
          analyticsService.getCrops(),
          analyticsService.getRegions(),
          analyticsService.getYears()
        ]);
        setCrops(c || []);
        setRegions(r || []);
        setYears(y || []);
        if (c?.length > 0) setForm(prev => ({ ...prev, crop_name: c[0].crop_name }));
        if (r?.length > 0) setForm(prev => ({ ...prev, region: r[0] }));
        if (y?.length > 0) setForm(prev => ({ ...prev, year: y[y.length - 1] }));
      } catch (err) {
        console.error("Failed to load crops/regions for reports:", err);
      }
    };
    init();
  }, []);

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    setStatusMessage(null);
    try {
      const blob = await analyticsService.downloadPdf({
        crop_name: form.crop_name,
        region: form.region,
        year: Number(form.year),
        land_area: Number(form.land_area),
        unit: form.unit,
        notes: form.notes
      });
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `OilCrop_Dossier_${form.crop_name}_${form.region}_${form.year}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setStatusMessage({ type: 'success', text: "PDF Investment Dossier generated and downloaded successfully." });
    } catch (err) {
      console.error("PDF download failed:", err);
      setStatusMessage({ type: 'error', text: "Failed to generate PDF. Verify backend ReportLab status." });
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadExcel = async () => {
    setDownloadingExcel(true);
    setStatusMessage(null);
    try {
      const blob = await analyticsService.downloadExcel({
        crop_name: form.crop_name,
        region: form.region,
        year: Number(form.year),
        land_area: Number(form.land_area),
        unit: form.unit,
        notes: form.notes
      });
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `OilCrop_Model_${form.crop_name}_${form.region}_${form.year}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setStatusMessage({ type: 'success', text: "Excel Agronomic & Financial Workbook generated and downloaded successfully." });
    } catch (err) {
      console.error("Excel download failed:", err);
      setStatusMessage({ type: 'error', text: "Failed to generate Excel. Verify backend openpyxl status." });
    } finally {
      setDownloadingExcel(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-white flex items-center gap-2">
          <FileDown className="w-6 h-6 text-brand-400" />
          Executive Agronomic & Investment Report Generator
        </h1>
        <p className="text-xs lg:text-sm text-slate-400 mt-1">
          Export publication-grade PDF dossiers and multi-tab Excel financial workbooks parameterized by crop, region, and land acreage.
        </p>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-xl border text-xs flex items-center gap-2 ${
          statusMessage.type === 'success'
            ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
            : 'bg-rose-950/40 border-rose-800 text-rose-300'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Report Scope Selector */}
        <div className="lg:col-span-6 glass-card rounded-xl p-5 border border-slate-800">
          <h2 className="text-sm font-semibold text-slate-200 mb-4 pb-2 border-b border-slate-800">
            Report Scope Parameters
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Target Oilseed Crop
              </label>
              <select
                value={form.crop_name}
                onChange={(e) => setForm({ ...form, crop_name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              >
                {crops.map((c) => (
                  <option key={c.id || c.crop_name} value={c.crop_name}>{c.crop_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                State / Agro-Climatic Zone
              </label>
              <select
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              >
                {regions.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Reference Year
                </label>
                <select
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Cultivated Area (Hectares)
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={form.land_area}
                  onChange={(e) => setForm({ ...form, land_area: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Executive Notes & Comments
              </label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-white"
                placeholder="Include study rationale, loan applicant details, or scenario notes..."
              />
            </div>
          </div>
        </div>

        {/* Download Action Cards */}
        <div className="lg:col-span-6 space-y-4">
          {/* PDF Card */}
          <div className="glass-card rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                  <FileText className="w-6 h-6" />
                </div>
                <DataSourceBadge type="calculated" sourceName="ReportLab Engine" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                Executive PDF Investment Dossier
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Structured multi-page PDF briefing document comprising executive KPI cards, seed requirement specs, C2 cost composition, Mandi realization, Net Profitability, ROI, and official Government source citations.
              </p>
            </div>

            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="w-full py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-rose-900/30 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{downloadingPdf ? "Compiling PDF..." : "Generate & Download PDF"}</span>
            </button>
          </div>

          {/* Excel Card */}
          <div className="glass-card rounded-xl p-5 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <DataSourceBadge type="historical" sourceName="OpenPyXL Dynamic Workbook" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">
                Comprehensive Excel Financial Workbook (.xlsx)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Dynamic spreadsheet workbook featuring multi-sheet architecture: Raw filtered historical observations, agronomic unit conversions, cost breakdowns, and financial scenario models.
              </p>
            </div>

            <button
              onClick={handleDownloadExcel}
              disabled={downloadingExcel}
              className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{downloadingExcel ? "Generating Workbook..." : "Generate & Download Excel"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
