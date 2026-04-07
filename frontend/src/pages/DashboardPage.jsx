import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Briefcase, User, FolderOpen, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!');
    navigate('/');
  };

  return (
    <div className="dashboard-page">
      {/* Top Bar */}
      <header className="dash-header">
        <div className="dash-header-inner">
          <a href="/" className="dash-logo">
            <Briefcase size={18} /> gigforge
          </a>
          <div className="dash-user">
            <span className="dash-username">Hi, {user?.name}</span>
            <span className={`badge ${user?.role === 'client' ? 'badge-blue' : 'badge-teal'}`}>
              {user?.role}
            </span>
            <button className="btn btn-outline btn-sm logout-btn" onClick={handleLogout}>
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="dash-main container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="dash-title">Dashboard</h2>
          <p className="dash-sub">Welcome to GigForge, {user?.name}!</p>

          <div className="dash-cards">
            <div className="dash-card">
              <FolderOpen size={28} className="dash-card-icon" />
              <h3>Projects</h3>
              <p>{user?.role === 'client' ? 'Post and manage your projects' : 'Browse and bid on projects'}</p>
              <button className="btn btn-sm" onClick={() => navigate('/')}>Go to Projects</button>
            </div>
            <div className="dash-card">
              <MessageSquare size={28} className="dash-card-icon" />
              <h3>Messages</h3>
              <p>Chat with your {user?.role === 'client' ? 'freelancers' : 'clients'}</p>
              <button className="btn btn-sm" onClick={() => navigate('/')}>Open Messages</button>
            </div>
            <div className="dash-card">
              <User size={28} className="dash-card-icon" />
              <h3>Profile</h3>
              <p>View and update your profile information</p>
              <button className="btn btn-sm">Edit Profile</button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default DashboardPage;
