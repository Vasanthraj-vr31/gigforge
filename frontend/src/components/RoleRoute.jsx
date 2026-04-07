import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { getRoleBase } from '../utils/rolePath';

export default function RoleRoute({ role, children }) {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (!user) return null;
  if (user.role !== role) return <Navigate to={getRoleBase(user.role)} replace />;
  return children;
}

