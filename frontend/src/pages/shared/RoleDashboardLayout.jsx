import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Briefcase, LogOut, Menu } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/useAuth';
import './roleDashboard.css';

export default function RoleDashboardLayout({ title, links }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <div className="rd-shell">
      {/* Top bar */}
      <header className="rd-topbar">
        <div className="rd-topbar-inner" style={{ paddingLeft: '24px' }}>
          <Link to="/" className="rd-brand">
            <Briefcase size={20} />
            GigForge
          </Link>

          <div className="rd-right">
            <div className="rd-user-pill">
              <div className="rd-avatar">
                {user?.profileImage
                  ? <img src={user.profileImage} alt={user.name} />
                  : <span>{initials}</span>
                }
              </div>
              <span className="rd-user-name">{user?.name}</span>
              <span className={`badge badge-${user?.role === 'client' ? 'blue' : 'teal'}`}>
                {user?.role}
              </span>
            </div>

            <button className="rd-logout-btn" onClick={handleLogout}>
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main body */}
      <div className="rd-body">
        {/* Sidebar */}
        <aside className="rd-sidebar">
          <p className="rd-sidebar-title">{title} Portal</p>
          <nav className="rd-nav">
            {links.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `rd-link ${isActive ? 'active' : ''}`}
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="rd-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
