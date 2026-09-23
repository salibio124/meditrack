import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import PatientProfile from './pages/PatientProfile';
import MedicalRecords from './pages/MedicalRecords';
import Appointments from './pages/Appointments';
import Immunization from './pages/Immunization';
import Medicines from './pages/Medicines';
import Inventory from './pages/Inventory';
import Reports from './pages/Reports';
import ResearchMetrics from './pages/ResearchMetrics';
import SMSLogs from './pages/SMSLogs';
import AuditLogs from './pages/AuditLogs';
import Users from './pages/Users';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* PROTECTED ROUTES */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/patients/:id" element={<PatientProfile />} />
        <Route path="/medicines" element={<Medicines />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/immunization" element={<Immunization />} />
        <Route path="/medical-records" element={<MedicalRecords />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/research" element={<ResearchMetrics />} />
        <Route path="/sms" element={<SMSLogs />} />
        <Route path="/audit" element={<AuditLogs />} />
        <Route path="/users" element={<Users />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}