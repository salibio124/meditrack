import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#f4f5f9]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#064e3b] border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f4f5f9] m-0 p-0 font-sans">
      <Sidebar />
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#f4f5f9]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}