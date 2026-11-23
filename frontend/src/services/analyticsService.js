import api from './api';

export const analyticsService = {
  // Master data
  async getCrops() {
    const res = await api.get('/crops');
    return res.data;
  },

  async getRegions() {
    const res = await api.get('/production/regions');
    return res.data;
  },

  async getYears() {
    const res = await api.get('/production/years');
    return res.data;
  },

  // Dashboard & Production
  async getDashboardKPIs(params) {
    const res = await api.get('/production/summary-kpis', { params });
    return res.data;
  },

  async getProductionTrends(params) {
    const res = await api.get('/production/trends', { params });
    return res.data;
  },

  async getProductionByRegion(params) {
    const res = await api.get('/production/by-region', { params });
    return res.data;
  },

  async listProduction(params) {
    const res = await api.get('/production', { params });
    return res.data;
  },

  // Costs
  async getCostSummary(params) {
    const res = await api.get('/costs/summary', { params });
    return res.data;
  },

  async listCosts(params) {
    const res = await api.get('/costs', { params });
    return res.data;
  },

  // Market
  async getMarketTrends(params) {
    const res = await api.get('/market/trends', { params });
    return res.data;
  },

  async listMarketPrices(params) {
    const res = await api.get('/market/prices', { params });
    return res.data;
  },

  // Calculators & Analytics
  async calculateSeed(payload) {
    const res = await api.post('/analytics/seed-requirement', payload);
    return res.data;
  },

  async calculateOil(payload) {
    const res = await api.post('/analytics/oil-production', payload);
    return res.data;
  },

  async calculateProfitability(payload) {
    const res = await api.post('/analytics/profitability', payload);
    return res.data;
  },

  async calculateBreakEven(params) {
    const res = await api.post('/analytics/break-even', null, { params });
    return res.data;
  },

  async calculateSensitivity(payload) {
    const res = await api.post('/analytics/sensitivity', payload);
    return res.data;
  },

  async compareCrops(params) {
    const res = await api.get('/analytics/crop-comparison', { params });
    return res.data;
  },

  async getInsights() {
    const res = await api.get('/analytics/insights');
    return res.data;
  },

  // Scenarios
  async getScenarios() {
    const res = await api.get('/analytics/scenarios');
    return res.data;
  },

  async saveScenario(payload) {
    const res = await api.post('/analytics/scenarios', payload);
    return res.data;
  },

  async deleteScenario(id) {
    const res = await api.delete(`/analytics/scenarios/${id}`);
    return res.data;
  },

  // Machine Learning
  async predictYield(payload) {
    const res = await api.post('/ml/yield-prediction', payload);
    return res.data;
  },

  async predictPrice(payload) {
    const res = await api.post('/ml/price-prediction', payload);
    return res.data;
  },

  async getModelPerformance() {
    const res = await api.get('/ml/model-performance');
    return res.data;
  },

  // Datasets & Data Quality
  async getDatasets() {
    const res = await api.get('/datasets');
    return res.data;
  },

  async getDataQualityReport() {
    const res = await api.get('/datasets/quality-report');
    return res.data;
  },

  async uploadDataset(formData) {
    const res = await api.post('/datasets/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  async deleteDataset(id) {
    const res = await api.delete(`/datasets/${id}`);
    return res.data;
  },

  // Report Downloads
  async downloadPdf(payload) {
    const res = await api.post('/reports/pdf', payload, {
      responseType: 'blob'
    });
    return res.data;
  },

  async downloadExcel(payload) {
    const res = await api.post('/reports/excel', payload, {
      responseType: 'blob'
    });
    return res.data;
  }
};
