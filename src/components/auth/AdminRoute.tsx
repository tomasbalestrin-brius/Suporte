import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * AdminRoute component - Protects routes that require admin role
 * Redirects non-admin users to dashboard with error message
 */
export function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading } = useAuthStore();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to dashboard if not admin
  if (user.role !== 'admin') {
    console.warn('Access denied: User is not an admin');
    return <Navigate to="/dashboard" replace />;
  }

  // User is authenticated and is admin - render children
  return <>{children}</>;
}
