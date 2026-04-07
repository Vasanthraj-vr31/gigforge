import { Navigate } from 'react-router-dom';

export default function ClientDashboardHome() {
  return <Navigate to="/client/my-projects" replace />;
}

