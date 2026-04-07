import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function FreelancerProfileGuard({ children }) {
  const { user } = useAuth();
  if (user?.role === 'freelancer' && !user?.profileCompleted) {
    return <Navigate to="/freelancer/profile" replace />;
  }
  return children;
}

