import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loader from './Loader';

/**
 * Wrap routes that require any authenticated user. Renders children once
 * auth state has hydrated; until then shows a centred spinner so we don't
 * flash to /login on a refresh.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, bootstrapping } = useAuth();
  const location = useLocation();

  if (bootstrapping) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader label="Checking session..." />
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
