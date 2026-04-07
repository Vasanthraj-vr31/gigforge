import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Briefcase, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/useAuth';
import './roleDashboard.css';

export default function RoleDashboardLayout({ title, links }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="rd-shell">
      <header className="rd-topbar">
        <div className="rd-topbar-inner">
          <Link to="/" className="rd-brand"><Briefcase size={18} /> gigforge</Link>
          <div className="rd-right">
            <span className="rd-user">{user?.name}</span>
            <span className={`badge ${user?.role === 'client' ? 'badge-blue' : 'badge-teal'}`}>{user?.role}</span>
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="rd-body">
        <aside className="rd-sidebar">
          <h3>{title}</h3>
          <nav className="rd-nav">
            {links.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `rd-link ${isActive ? 'active' : ''}`}>
                <item.icon size={17} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="rd-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

