import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Users, Briefcase } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { getRoleBase } from '../utils/rolePath';
import './HeroSection.css';

const stats = [
  { icon: <Briefcase size={18} />, label: 'Active Projects', value: '1,200+' },
  { icon: <Users size={18} />, label: 'Freelancers', value: '4,800+' },
  { icon: <MapPin size={18} />, label: 'Districts', value: '38' },
];

const HeroSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section className="hero-section" id="home">
      <div className="container hero-inner">
        <motion.div
          className="hero-text"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span className="hero-pill">
            <MapPin size={13} /> Tamil Nadu's #1 Freelance Hub
          </span>
          <h1 className="hero-title">
            Find Local Talent,<br />
            <span className="gradient-text">Get Work Done</span>
          </h1>
          <p className="hero-subtitle">
            GigForge connects clients with skilled freelancers across all 38 districts of Tamil Nadu. Post a project, get bids, and hire the best—locally.
          </p>
          <div className="hero-actions">
            <button
              className="btn hero-cta"
              onClick={() => {
                if (!user) navigate('/login');
                else if (user.role === 'client') navigate('/client/post-project');
                else navigate('/freelancer/dashboard');
              }}
            >
              Post a Project <ArrowRight size={16} />
            </button>
            <button 
              className="btn btn-outline hero-cta"
              onClick={() => {
                if (!user) navigate('/login');
                else if (user.role === 'freelancer') navigate('/freelancer/projects');
                else navigate('/client/dashboard');
              }}
            >
              Find Work
            </button>
          </div>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          className="stats-bar"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {stats.map((s, i) => (
            <div className="stat-item" key={i}>
              <span className="stat-icon">{s.icon}</span>
              <div>
                <p className="stat-value">{s.value}</p>
                <p className="stat-label">{s.label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
