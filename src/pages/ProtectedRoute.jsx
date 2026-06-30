import { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import api from '../api/axios';

const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await api.get('/auth/verify');
        setIsAuthenticated(true);
      } catch (error){
        console.log("error",error.response)
        setIsAuthenticated(false);
      }
    };

    verifyAuth();
  }, []);

  // Still checking auth — show loading
  if (isAuthenticated === null) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2rem', color: '#888' }}>
        Loading...
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
