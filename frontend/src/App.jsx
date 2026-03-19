import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import WorkerDashboard from './pages/WorkerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Policies from './pages/Policies';
import ClaimPolicy from './pages/ClaimPolicy';
import ClaimRequests from './pages/ClaimRequests';

const ProtectedRoute = ({ children, roleRequired }) => {
  const { user, token, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium">Loading session...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Handle case where user state is not fully populated yet or invalid
  if (!user || !user.role) {
    return <Navigate to="/login" replace />;
  }

  if (roleRequired && user.role !== roleRequired) {
    const fallbackPath = user.role === 'admin' ? '/admin' : '/dashboard';
    
    // Prevent infinite redirect loops to the same page
    if (window.location.pathname === fallbackPath) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800 p-6">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-slate-500 mb-4">You do not have permission to view this page.</p>
          <Navigate to="/login" replace />
        </div>
      );
    }
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};

import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 5 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -5 }}
    transition={{ duration: 0.2, ease: 'easeInOut' }}
    className="w-full h-full flex-1"
  >
    {children}
  </motion.div>
);

function AppRoutes() {
  const { token, user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium">Loading GigShield...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<ProtectedRoute roleRequired="worker"><WorkerDashboard /></ProtectedRoute>} />
      <Route path="/policies" element={<ProtectedRoute roleRequired="worker"><Policies /></ProtectedRoute>} />
      <Route path="/claim" element={<ProtectedRoute roleRequired="worker"><ClaimPolicy /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute roleRequired="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/claims" element={<ProtectedRoute roleRequired="admin"><ClaimRequests /></ProtectedRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
