import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { clearAuthState, isTokenExpired } from '../../utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

function GoBack() {
  const navigate = useNavigate();
  useEffect(() => {
    toast.error('Bạn không có quyền truy cập vào trang này!');
    // If there is history, go back. Otherwise go to home.
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/', { replace: true });
    }
  }, [navigate]);
  
  return null;
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  const userRole = sessionStorage.getItem('userRole') || localStorage.getItem('userRole');
  const location = useLocation();

  if (!token || !userRole || isTokenExpired(token)) {
    if (token && isTokenExpired(token)) {
      clearAuthState();
      toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
    }
    // Redirect to login if not authenticated or token expired
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(userRole.toLowerCase())) {
    return <GoBack />;
  }

  return <>{children}</>;
}
