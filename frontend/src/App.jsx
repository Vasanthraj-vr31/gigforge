import { Navigate, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import './index.css';

// Layout components
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import Workflow from './components/Workflow';
import ProjectsSection from './components/ProjectsSection';
import Footer from './components/Footer';
import RoleRoute from './components/RoleRoute';
import FreelancerProfileGuard from './components/FreelancerProfileGuard';

// Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import FreelancerLayout from './pages/freelancer/FreelancerLayout';
import FreelancerHome from './pages/freelancer/FreelancerHome';
import FreelancerProjects from './pages/freelancer/FreelancerProjects';
import FreelancerMessages from './pages/freelancer/FreelancerMessages';
import FreelancerProfile from './pages/freelancer/FreelancerProfile';
import ClientLayout from './pages/client/ClientLayout';
import ClientDashboardHome from './pages/client/ClientDashboardHome';
import ClientPostProject from './pages/client/ClientPostProject';
import ClientMyProjects from './pages/client/ClientMyProjects';
import ClientMessages from './pages/client/ClientMessages';
import ClientProfile from './pages/client/ClientProfile';
import ViewFreelancerProfile from './pages/client/ViewFreelancerProfile';
import { useAuth } from './context/useAuth';
import { getRoleBase } from './utils/rolePath';

// Home layout
const HomePage = () => (
  <motion.div
    className="app-container"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <Navbar />
    <main className="main-content">
      <HeroSection />
      <Workflow />
    </main>
    <Footer />
  </motion.div>
);

function App() {
  const { user, token } = useAuth();
  const roleHome = token ? getRoleBase(user?.role) : '/login';

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { borderRadius: '10px', fontFamily: 'Inter, sans-serif', fontSize: '0.9rem' },
          success: { iconTheme: { primary: '#14B8A6', secondary: '#fff' } },
        }}
      />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<Navigate to={roleHome} replace />} />
        <Route
          path="/freelancer"
          element={
            <RoleRoute role="freelancer">
              <FreelancerLayout />
            </RoleRoute>
          }
        >
          <Route path="dashboard" element={<FreelancerHome />} />
          <Route path="projects" element={<FreelancerProfileGuard><FreelancerProjects /></FreelancerProfileGuard>} />
          <Route path="messages" element={<FreelancerProfileGuard><FreelancerMessages /></FreelancerProfileGuard>} />
          <Route path="profile" element={<FreelancerProfile />} />
        </Route>
        <Route
          path="/client"
          element={
            <RoleRoute role="client">
              <ClientLayout />
            </RoleRoute>
          }
        >
          <Route path="dashboard" element={<ClientDashboardHome />} />
          <Route path="post-project" element={<ClientPostProject />} />
          <Route path="my-projects" element={<ClientMyProjects />} />
          <Route path="messages" element={<ClientMessages />} />
          <Route path="profile" element={<ClientProfile />} />
          <Route path="freelancers/:id" element={<ViewFreelancerProfile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
