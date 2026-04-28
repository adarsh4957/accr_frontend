import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ProtectedLayout } from './components/Layout';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SubmitReport from './pages/SubmitReport';
import ReportDetail from './pages/ReportDetail';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminQueue from './pages/admin/AdminQueue';
import AdminReportDetail from './pages/admin/AdminReportDetail';
import CityRoster from './pages/admin/CityRoster';

const App = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <Routes>
      {/* Public / Auth Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected User Routes */}
      <Route element={<ProtectedLayout requireAdmin={false} />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/report" element={<SubmitReport />} />
        <Route path="/report/:id" element={<ReportDetail />} />
      </Route>

      {/* Protected Admin Routes */}
      <Route element={<ProtectedLayout requireAdmin={true} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/queue" element={<AdminQueue />} />
        <Route path="/admin/report/:id" element={<AdminReportDetail />} />
        <Route path="/admin/users" element={<CityRoster />} />
      </Route>
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
