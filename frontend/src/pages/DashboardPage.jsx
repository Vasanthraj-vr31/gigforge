import { Navigate } from 'react-router-dom';

// Kept only for backward compatibility if anything still links to `/pages/DashboardPage`.
// The real dashboard now lives under nested routes in `/dashboard/*`.
export default function DashboardPage() {
  return <Navigate to="/dashboard" replace />;
}
