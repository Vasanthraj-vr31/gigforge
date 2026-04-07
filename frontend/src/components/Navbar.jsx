import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Briefcase, LogOut, LayoutDashboard } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Projects', href: '#projects' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Messages', href: '#messages' },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out!');
    navigate('/');
  };

  return (
    <motion.nav
      className="navbar"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="container navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <Briefcase size={20} strokeWidth={2.5} />
          <span>gigforge</span>
        </Link>

        {/* Desktop Nav */}
        <ul className="nav-links">
          {navLinks.map(link => (
            <li key={link.label}>
              <a href={link.href} className="nav-link">{link.label}</a>
            </li>
          ))}
        </ul>

        {/* Auth Buttons */}
        <div className="navbar-actions">
          {user ? (
            <>
              <Link to="/dashboard" className="btn btn-outline btn-sm">
                <LayoutDashboard size={15} /> Dashboard
              </Link>
              <button className="btn btn-sm" onClick={handleLogout}>
                <LogOut size={15} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">Log In</Link>
              <Link to="/signup" className="btn btn-sm">Sign Up Free</Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {navLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                className="mobile-link"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="mobile-auth">
              {user ? (
                <>
                  <Link to="/dashboard" className="btn btn-outline btn-sm" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                  <button className="btn btn-sm" onClick={handleLogout}>Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-outline btn-sm" onClick={() => setMenuOpen(false)}>Log In</Link>
                  <Link to="/signup" className="btn btn-sm" onClick={() => setMenuOpen(false)}>Sign Up</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
