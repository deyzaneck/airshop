import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { authAPI } from '../api/services';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = localStorage.getItem('jwt_token');
        if (!token) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        await authAPI.verify();
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('admin_user');
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-peach-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-light-300">Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
};

export default ProtectedRoute;
