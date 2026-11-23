import React, { useState, useEffect } from 'react';
import {
  Database,
  ShieldCheck,
  ExternalLink,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  Trash2,
  Table,
  Layers,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { analyticsService } from '../services/analyticsService';
import { DataSourceBadge } from '../components/DataSourceBadge';
import { formatNumber } from '../utils/formatters';

export const DatasetManagement = () => {
  const { isAdmin } = useAuth();
  const [datasets, setDatasets] = useState([]);
  const [qualityReport, setQualityReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dsList, qReport] = await Promise.all([
        analyticsService.getDatasets(),
        analyticsService.getDataQualityReport()
      ]);
      setDatasets(dsList || []);
      setQualityReport(qReport);
    } catch (err) {
      console.error("Failed to load dataset metadata:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;

    setUploadLoading(true);
    setUploadMessage(null);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      const res = await analyticsService.uploadDataset(formData);
      setUploadMessage({ type: 'success', text: res.message || "Dataset uploaded and validated successfully!" });
      setUploadFile(null);
      fetchData();
    } catch (err) {
      console.error("Upload error:", err);
      setUploadMessage({
        type: 'error',
        text: err.response?.data?.detail || "Upload failed. Please check CSV format and required columns."
      });
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteDataset = async (id) => {
    if (!window.confirm("Are you sure you want to delete this dataset?")) return;
    try {
      await analyticsService.deleteDataset(id);
      fetchData();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-white flex items-center gap-2">
          <Database className="w-6 h-6 text-brand-400" />
          Real-World Agricultural Datasets & Data Quality Audit
        </h1>
        <p className="text-xs lg:text-sm text-slate-400 mt-1">
          Full provenance transparency of all public government datasets ingested into the OilCrop Intelligence repository.
        </p>
      </div>

      {/* Quality Health Banner */}
      {qualityReport && (
        <div className="glass-card rounded-xl p-5 border border-emerald-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                Audited System Quality Status
              </span>
              <h2 className="text-base font-bold text-white">{qualityReport.overall_health}</h2>
              <p className="text-xs text-slate-400">
                Zero synthetic mocking. Strict unit standardization across {qualityReport.total_datasets} validated tables.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-sans">Total Records Ingested</span>
              <span className="text-sm font-bold text-emerald-400">
                {formatNumber(qualityReport.total_records_ingested, 0)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Ingested Datasets Table */}
      <div className="glass-card rounded-xl p-5 border border-slate-800">
        <h3 className="font-semibold text-slate-100 text-sm mb-4 pb-2 border-b border-slate-800 flex items-center justify-between">
          <span>Official Public Agricultural Datasets</span>
          <span className="text-[11px] text-slate-400 font-normal">Active Ingestion Registry</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {datasets.map((ds) => (
            <div
              key={ds.id}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h4 className="font-bold text-white text-xs leading-snug">{ds.name}</h4>
                  {ds.source_url && ds.source_url.startsWith('http') && (
                    <a
                      href={ds.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded text-slate-400 hover:text-brand-400 hover:bg-slate-800 transition-colors shrink-0"
                      title="Open Official Repository"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                  {ds.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[10px] space-y-1 font-mono text-slate-400">
                <div className="flex justify-between">
                  <span>Source:</span>
                  <span className="text-slate-200 font-sans font-medium">{ds.source}</span>
                </div>
                <div className="flex justify-between">
                  <span>Coverage & Years:</span>
                  <span className="text-slate-200">{ds.country_region} ({ds.date_range})</span>
                </div>
                <div className="flex justify-between">
                  <span>Units:</span>
                  <span className="text-brand-300">{ds.units}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ingested Rows:</span>
                  <span className="text-emerald-400 font-bold">{formatNumber(ds.record_count, 0)}</span>
                </div>
              </div>

              {isAdmin && ds.source.includes("Uploaded by Admin") && (
                <div className="pt-2 border-t border-slate-800/60 flex justify-end">
                  <button
                    onClick={() => handleDeleteDataset(ds.id)}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Admin Dataset Ingestion Section */}
      {isAdmin && (
        <div className="glass-card rounded-xl p-5 border border-purple-800/40 bg-purple-950/10">
          <div className="flex items-center gap-2 mb-3">
            <Upload className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-slate-100 text-sm">
              Admin Dataset Ingestion & Validation Pipeline
            </h3>
          </div>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Upload custom agricultural or market price CSV files. The validation pipeline checks for mandatory columns (<code>crop_name</code>, <code>region</code>, <code>year</code>) and detects null values or malformed records prior to PostgreSQL/SQLite insertion.
          </p>

          <form onSubmit={handleFileUpload} className="space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setUploadFile(e.target.files[0])}
                className="w-full sm:w-auto text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer"
              />
              <button
                type="submit"
                disabled={!uploadFile || uploadLoading}
                className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-brand-900/30 transition-all flex items-center gap-2"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadLoading ? "Validating & Ingesting..." : "Upload & Validate CSV"}</span>
              </button>
            </div>
          </form>

          {uploadMessage && (
            <div className={`mt-3 p-3 rounded-lg border text-xs flex items-center gap-2 ${
              uploadMessage.type === 'success'
                ? 'bg-emerald-950/50 border-emerald-800 text-emerald-300'
                : 'bg-rose-950/50 border-rose-800 text-rose-300'
            }`}>
              {uploadMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{uploadMessage.text}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
