import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { completeProject, getProjects } from '../../api/projects';
import { createBid, getMyBids } from '../../api/bids';
import { useAuth } from '../../context/useAuth';
import { Search, Briefcase, DollarSign, User2, CheckCircle, Clock, TrendingUp, Filter } from 'lucide-react';

const statusStyle = (s) => {
  if (s === 'completed') return { bg: '#dcfce7', color: '#166534' };
  if (s === 'closed' || s === 'in-progress') return { bg: '#fef3c7', color: '#92400e' };
  return { bg: '#dbeafe', color: '#1e40af' };
};

export default function FreelancerProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [acceptedProjects, setAcceptedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState({});
  const [proposal, setProposal] = useState({});
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState({});
  const [activeTab, setActiveTab] = useState('browse');

  const loadData = async () => {
    try {
      const data = await getProjects();
      setProjects(data.filter(p => p.status === 'open' && p.clientId?.role === 'client'));
      const myBids = await getMyBids();
      const accepted = myBids
        .filter(b => b.status === 'accepted' && b.projectId)
        .map(b => b.projectId);
      setAcceptedProjects(accepted);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const submitBid = async (projectId) => {
    if (user?.role !== 'freelancer') return;
    if (!user?.profileCompleted) return toast.error('Complete your profile first.');
    if (!amount[projectId] || !proposal[projectId]) return toast.error('Please fill amount and proposal.');
    setSubmitting(s => ({ ...s, [projectId]: true }));
    try {
      await createBid({ projectId, amount: Number(amount[projectId]), proposal: proposal[projectId] });
      toast.success('Bid placed successfully! 🎉');
      setAmount(s => ({ ...s, [projectId]: '' }));
      setProposal(s => ({ ...s, [projectId]: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place bid');
    } finally {
      setSubmitting(s => ({ ...s, [projectId]: false }));
    }
  };

  const handleComplete = async (projectId) => {
    try {
      await completeProject(projectId);
      toast.success('Project marked as completed! 🎉');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark project completed');
    }
  };

  const filtered = projects.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
      <div style={{ textAlign: 'center', color: '#94a3b8' }}>
        <div style={{ fontSize: '2rem', marginBottom: 12 }}>⏳</div>
        Loading projects...
      </div>
    </div>
  );

  const stats = [
    { label: 'Open Projects', value: projects.length, icon: Briefcase, color: '#6366f1', bg: '#eef2ff' },
    { label: 'Active Gigs', value: acceptedProjects.length, icon: TrendingUp, color: '#14b8a6', bg: '#f0fdfa' },
    { label: 'My Matches', value: filtered.length, icon: Filter, color: '#f59e0b', bg: '#fffbeb' },
  ];

  return (
    <div style={{ maxWidth: 1000 }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 50%, #0f172a 100%)',
        borderRadius: 20, padding: '28px 32px', color: 'white', marginBottom: 24,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 80% 50%, rgba(255,255,255,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <h1 style={{ fontSize: '1.7rem', fontWeight: 800, marginBottom: 4, letterSpacing: '-0.03em' }}>
          Find Your Next Gig 🚀
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.95rem' }}>
          Browse open projects, place competitive bids, and grow your freelance career.
        </p>
      </div>

      {/* Stats */}
      <div className="dash-stats" style={{ marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}><s.icon size={20} color={s.color} /></div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '2px solid #e9eef6' }}>
        {[
          { id: 'browse', label: `Browse Projects (${filtered.length})` },
          { id: 'active', label: `Active Gigs (${acceptedProjects.length})` },
        ].map(tab => (
          <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} style={{
            padding: '10px 22px', border: 'none', background: 'transparent', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.875rem',
            color: activeTab === tab.id ? '#14b8a6' : '#64748b',
            borderBottom: activeTab === tab.id ? '2px solid #14b8a6' : '2px solid transparent',
            marginBottom: -2, transition: 'all 0.15s',
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'browse' && (
        <>
          {/* Search */}
          <div className="gf-card" style={{ marginBottom: 20 }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                className="gf-input"
                style={{ paddingLeft: 42 }}
                placeholder="Search projects by title or description..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filtered.map(p => (
              <div key={p._id} className="gf-card" style={{ transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(20,184,166,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                {/* Project header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: 4, letterSpacing: '-0.01em' }}>{p.title}</h3>
                    <div style={{ display: 'flex', gap: 16, fontSize: '0.8rem', color: '#64748b' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <User2 size={13} /> {p.clientId?.name || 'Client'}
                      </span>
                      {p.deadline && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={13} /> Deadline: {new Date(p.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                      {p.district && (
                        <span>📍 {p.district}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#14b8a6' }}>₹{p.budget?.toLocaleString()}</div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>BUDGET</div>
                  </div>
                </div>

                <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {p.description}
                </p>

                {/* Bid inputs */}
                <div style={{ background: '#f8fafc', borderRadius: 12, padding: 16, border: '1px solid #f1f5f9' }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Place Your Bid
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 10, marginBottom: 10 }}>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.875rem', fontWeight: 600 }}>₹</span>
                      <input
                        className="gf-input"
                        style={{ paddingLeft: 28 }}
                        placeholder="Your amount"
                        type="number"
                        value={amount[p._id] || ''}
                        onChange={e => setAmount(s => ({ ...s, [p._id]: e.target.value }))}
                      />
                    </div>
                    <input
                      className="gf-input"
                      placeholder="Brief proposal headline..."
                      value={proposal[p._id] || ''}
                      onChange={e => setProposal(s => ({ ...s, [p._id]: e.target.value }))}
                    />
                  </div>
                  <button
                    className="gf-btn"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => submitBid(p._id)}
                    disabled={submitting[p._id]}
                  >
                    <DollarSign size={15} />
                    {submitting[p._id] ? 'Placing Bid...' : 'Place Bid'}
                  </button>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 18, border: '1px solid #e9eef6' }}>
                <Briefcase size={48} style={{ color: '#cbd5e1', margin: '0 auto 14px' }} />
                <h3 style={{ color: '#64748b', fontWeight: 600, marginBottom: 6 }}>No Open Projects</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Check back later for new projects.</p>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'active' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {acceptedProjects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 18, border: '1px solid #e9eef6' }}>
              <TrendingUp size={48} style={{ color: '#cbd5e1', margin: '0 auto 14px' }} />
              <h3 style={{ color: '#64748b', fontWeight: 600, marginBottom: 6 }}>No Active Gigs</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Browse projects and place bids to get started.</p>
            </div>
          ) : acceptedProjects.map(p => {
            const displayStatus = p.status === 'closed' ? 'in-progress' : p.status;
            const { bg, color } = statusStyle(p.status);
            return (
              <div key={p._id} className="gf-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>{p.title}</h3>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: '#64748b' }}>
                      <User2 size={12} /> Client: {p.clientId?.name || 'Client'}
                    </span>
                  </div>
                  <span style={{ padding: '4px 12px', background: bg, color, borderRadius: 99, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {displayStatus}
                  </span>
                </div>

                <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6, marginBottom: 16 }}>{p.description}</p>

                {(p.status === 'in-progress' || p.status === 'closed') && (
                  <button
                    className="gf-btn"
                    style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)', justifyContent: 'center', gap: 8 }}
                    onClick={() => handleComplete(p._id)}
                  >
                    <CheckCircle size={16} />
                    Mark as Completed
                  </button>
                )}
                {p.status === 'completed' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16a34a', fontWeight: 600, fontSize: '0.875rem' }}>
                    <CheckCircle size={18} style={{ fill: '#dcfce7' }} />
                    Project Completed
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
