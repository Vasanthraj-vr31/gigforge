import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';

export default function FreelancerHome() {
  const { user } = useAuth();
  const mustComplete = user?.role === 'freelancer' && !user?.profileCompleted;
  return <Navigate to={mustComplete ? '/freelancer/profile' : '/freelancer/projects'} replace />;
}

