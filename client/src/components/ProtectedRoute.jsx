import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Route guard — redirects to /login when there is no active session
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null; // Wait for session restore

  if (!user) return <Navigate to="/login" replace />;

  return children;
}
