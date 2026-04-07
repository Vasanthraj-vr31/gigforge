import { Briefcase, GitBranch, Globe, Mail } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo">
              <Briefcase size={18} />
              <span>gigforge</span>
            </div>
            <p className="footer-tagline">
              Tamil Nadu's hyperlocal freelance marketplace. Connecting skilled freelancers with local clients.
            </p>
            <div className="footer-socials">
              <a href="#" className="social-link"><GitBranch size={18} /></a>
              <a href="#" className="social-link"><Globe size={18} /></a>
              <a href="#" className="social-link"><Mail size={18} /></a>
            </div>
          </div>

          {/* Links */}
          <div className="footer-col">
            <h4 className="footer-col-title">Platform</h4>
            <ul>
              <li><a href="#projects" className="footer-link">Browse Projects</a></li>
              <li><a href="#how-it-works" className="footer-link">How It Works</a></li>
              <li><a href="#dashboard" className="footer-link">Dashboard</a></li>
              <li><a href="#messages" className="footer-link">Messages</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Districts</h4>
            <ul>
              {['Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem'].map(d => (
                <li key={d}><a href="#projects" className="footer-link">{d}</a></li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Company</h4>
            <ul>
              <li><a href="#" className="footer-link">About Us</a></li>
              <li><a href="#" className="footer-link">Privacy Policy</a></li>
              <li><a href="#" className="footer-link">Terms of Service</a></li>
              <li><a href="#" className="footer-link">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} GigForge. All rights reserved.</p>
          <p className="footer-built">Built for Tamil Nadu 🌿</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
