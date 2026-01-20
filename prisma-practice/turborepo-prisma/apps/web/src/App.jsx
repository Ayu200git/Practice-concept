import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import SubAdminDashboard from './pages/SubAdminDashboard';
import UserDashboard from './pages/UserDashboard';
import PostsFeed from './pages/PostsFeed';

import ProtectedRoute from './components/auth/ProtectedRoute';

const AppContent = () => {
  const { user } = useAuth();

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2500,
          success: {
            duration: 2500,
          },
          error: {
            duration: 4000,
          },
          style: {
            borderRadius: '12px',
            background: '#333',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
        }}
      />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                {user?.role === 'ADMIN' ? <AdminDashboard /> :
                  user?.role === 'SUB_ADMIN' ? <SubAdminDashboard /> :
                    <UserDashboard />}
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['USER']}>
              <DashboardLayout>
                <UserDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout>
                <AdminDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/sub-admin"
          element={
            <ProtectedRoute allowedRoles={['SUB_ADMIN']}>
              <DashboardLayout>
                <SubAdminDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/posts"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <PostsFeed />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes >
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
