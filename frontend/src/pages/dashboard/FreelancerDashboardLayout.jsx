import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Briefcase, FolderOpen, MessageSquare, User, LogOut, Loader } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { getMe } from '../../api/user';
import './dashboard.css';

const SidebarLink = ({ to, icon, label }) => {
  const Icon = icon;
  return (
    <NavLink
      to={to}
      end={false}
      className={({ isActive }) => `dash-nav-link ${isActive ? 'active' : ''}`}
    >
      <Icon size={18} />
      {label}
    </NavLink>
  );
};

export default function FreelancerDashboardLayout() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loadingMe, setLoadingMe] = useState(true);

  const isFreelancer = user?.role === 'freelancer';
  const profileCompleted = Boolean(user?.profileCompleted);

  const blockedByProfile = useMemo(() => {
    if (!isFreelancer) return false;
    if (profileCompleted) return false;
    return location.pathname.startsWith('/dashboard/projects') || location.pathname.startsWith('/dashboard/messages');
  }, [isFreelancer, profileCompleted, location.pathname]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const me = await getMe();
        if (!alive) return;
        updateUser(me);
      } catch {
        // If token is stale, force logout.
        logout();
        navigate('/login', { replace: true });
      } finally {
        if (alive) setLoadingMe(false);
      }
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loadingMe) return;
    if (blockedByProfile) {
      toast.error('Complete your profile first to access Projects and Messages.');
      navigate('/dashboard/profile', { replace: true });
    }
  }, [blockedByProfile, loadingMe, navigate]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out!');
    navigate('/login');
  };

  return (
    <div className="dash-shell">
      <header className="dash-topbar">
        <div className="dash-topbar-inner">
          <Link to="/dashboard/projects" className="dash-brand">
            <Briefcase size={18} /> gigforge
          </Link>
          <div className="dash-topbar-right">
            <span className="dash-hello">Hi, {user?.name}</span>
            <span className={`badge ${user?.role === 'client' ? 'badge-blue' : 'badge-teal'}`}>
              {user?.role}
            </span>
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="dash-body">
        <aside className="dash-sidebar">
          <div className="dash-sidebar-title">Dashboard</div>
          <nav className="dash-nav">
            <SidebarLink to="/dashboard/projects" icon={FolderOpen} label="Projects" />
            <SidebarLink to="/dashboard/messages" icon={MessageSquare} label="Messages" />
            <SidebarLink to="/dashboard/profile" icon={User} label="Profile" />
          </nav>

          {isFreelancer && !profileCompleted && !loadingMe && (
            <div className="dash-profile-warning">
              <div className="dash-warning-title">Complete your profile</div>
              <div className="dash-warning-text">
                You must finish your profile before accessing Projects and Messages.
              </div>
              <Link className="btn btn-sm" to="/dashboard/profile">Go to Profile</Link>
            </div>
          )}
        </aside>

        <main className="dash-content">
          {loadingMe ? (
            <div className="dash-loading">
              <Loader size={18} className="spin" />
              Loading dashboard...
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}

