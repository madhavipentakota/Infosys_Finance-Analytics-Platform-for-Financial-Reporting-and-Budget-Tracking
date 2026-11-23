import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

// Pages
import { Dashboard } from './pages/Dashboard';
import { ProductionAnalysis } from './pages/ProductionAnalysis';
import { LandSeed } from './pages/LandSeed';
import { OilProduction } from './pages/OilProduction';
import { CostAnalysis } from './pages/CostAnalysis';
import { MarketAnalysis } from './pages/MarketAnalysis';
import { Profitability } from './pages/Profitability';
import { BreakEven } from './pages/BreakEven';
import { CropComparison } from './pages/CropComparison';
import { RiskAnalysis } from './pages/RiskAnalysis';
import { Reports } from './pages/Reports';
import { DatasetManagement } from './pages/DatasetManagement';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { LandingPage } from './pages/LandingPage';

// Protected route wrapper – redirects to /login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-slate-800 border-t-brand-400 animate-spin" />
          <span className="text-brand-300 text-sm font-semibold tracking-wide">Loading OilCrop Intelligence…</span>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// Full app shell (Navbar + Sidebar + main content) — only shown when authenticated
const AppShell = ({ children }) => (
  <div className="min-h-screen bg-navy-900 text-slate-100 flex flex-col font-sans relative selection:bg-brand-500 selection:text-navy-950">
    {/* Aqua & teal atmospheric orbs */}
    <div className="fixed top-0 left-1/4 w-[36rem] h-[36rem] bg-brand-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
    <div className="fixed top-20 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
    <div className="fixed bottom-0 right-1/4 w-[36rem] h-[36rem] bg-brand-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
    <Navbar />
    <div className="flex-1 flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes – NO shell */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes – with shell */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppShell><Dashboard /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/production" element={
        <ProtectedRoute>
          <AppShell><ProductionAnalysis /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/land-seed" element={
        <ProtectedRoute>
          <AppShell><LandSeed /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/oil-production" element={
        <ProtectedRoute>
          <AppShell><OilProduction /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/costs" element={
        <ProtectedRoute>
          <AppShell><CostAnalysis /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/market" element={
        <ProtectedRoute>
          <AppShell><MarketAnalysis /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/profitability" element={
        <ProtectedRoute>
          <AppShell><Profitability /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/break-even" element={
        <ProtectedRoute>
          <AppShell><BreakEven /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/crop-comparison" element={
        <ProtectedRoute>
          <AppShell><CropComparison /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/risk-analysis" element={
        <ProtectedRoute>
          <AppShell><RiskAnalysis /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute>
          <AppShell><Reports /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/datasets" element={
        <ProtectedRoute>
          <AppShell><DatasetManagement /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="/admin/datasets" element={
        <ProtectedRoute>
          <AppShell><DatasetManagement /></AppShell>
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;
