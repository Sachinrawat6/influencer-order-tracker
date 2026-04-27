import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Wrap admin-only routes. Assumes ProtectedRoute is the outer gate, so
 * here we only need to check the role. Non-admin authenticated users get
 * bounced to the dashboard.
 */
export default function AdminRoute({ children }) {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
}
