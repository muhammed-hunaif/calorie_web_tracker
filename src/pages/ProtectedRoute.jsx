import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import api from '../api/axios';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await api.get('/auth/verify');
        setIsAuthenticated(true);
      } catch (error) {
        console.log('error', error.response);
        setIsAuthenticated(false);
      }
    };

    verifyAuth();
  }, []);

  // Still checking auth — show loading
  if (isAuthenticated === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 gap-3 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <span className="text-sm font-medium">Checking session...</span>
      </div>
    );
  }

  // Not authenticated — redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/Login" replace />;
  }

  // Authenticated — render child routes
  return <Outlet />;
};

export default ProtectedRoute;
