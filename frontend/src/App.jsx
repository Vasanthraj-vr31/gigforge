import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';

// Layout components
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import Workflow from './components/Workflow';
import ProjectsSection from './components/ProjectsSection';
import DashboardPanel from './components/DashboardPanel';
import ChatUI from './components/ChatUI';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';

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
      <ProjectsSection />
      <DashboardPanel />
      <ChatUI />
    </main>
    <Footer />
  </motion.div>
);

function App() {
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
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
