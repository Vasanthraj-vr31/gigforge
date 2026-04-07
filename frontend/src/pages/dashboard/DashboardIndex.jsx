import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';

export default function DashboardIndex() {
  const { user } = useAuth();
  const shouldGoProfile = user?.role === 'freelancer' && !user?.profileCompleted;
  return <Navigate to={shouldGoProfile ? '/dashboard/profile' : '/dashboard/projects'} replace />;
}

