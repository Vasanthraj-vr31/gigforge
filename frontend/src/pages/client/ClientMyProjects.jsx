import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getProjects } from '../../api/projects';
import { getProjectBids, acceptBid, rejectBid } from '../../api/bids';
import { getMyReviews } from '../../api/reviews';
import { getMe } from '../../api/user';
import { useAuth } from '../../context/useAuth';
import ReviewForm from '../../components/ReviewForm';
import { Link } from 'react-router-dom';
import { Briefcase, DollarSign, CheckCircle, Clock, User2, Star, ChevronDown, ChevronUp, PlusCircle, AlertCircle } from 'lucide-react';

const sameId = (a, b) => String(a || '') === String(b || '');

const statusConfig = (s) => {
  if (s === 'completed') return { label: 'Completed', bg: '#dcfce7', color: '#166534' };
  if (s === 'closed') return { label: 'In Progress', bg: '#fef3c7', color: '#92400e' };
  return { label: 'Open', bg: '#dbeafe', color: '#1e40af' };
};

export default function ClientMyProjects() {
  const { user, updateUser } = useAuth();
  const isClient = user?.role === 'client';
  const [projects, setProjects] = useState([]);
  const [bidsByProject, setBidsByProject] = useState({});
  const [reviewedProjectIds, setReviewedProjectIds] = useState({});
  const [reviewOpenByProject, setReviewOpenByProject] = useState({});
  const [expandedBids, setExpandedBids] = useState({});
  const [loading, setLoading] = useState(true);

  const loadProjectsAndBids = useCallback(async () => {
    try {
      const me = await getMe();
      updateUser(me);
      const data = await getProjects();
      const mine = data.filter(p => sameId(p.clientId?._id || p.clientId, me._id));
      setProjects(mine);
      const entries = await Promise.all(mine.map(async p => [p._id, await getProjectBids(p._id)]));
      setBidsByProject(Object.fromEntries(entries));
      if (me?._id) {
        const myReviews = await getMyReviews();
        const submitted = {};
        myReviews.forEach(r => { submitted[r.projectId?._id || r.projectId] = true; });
        setReviewedProjectIds(submitted);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [updateUser]);

  useEffect(() => { loadProjectsAndBids(); }, [loadProjectsAndBids, user?._id]);

  const updateBid = async (projectId, bidId, action) => {
    try {
      if (action === 'accept') await acceptBid(bidId);
      else await rejectBid(bidId);
      await loadProjectsAndBids();
      toast.success(`Bid ${action}ed successfully`);
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} bid`);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
      <div style={{ textAlign: 'center', color: '#94a3b8' }}>
        <div style={{ fontSize: '2rem', marginBottom: 12 }}>⏳</div>
        Loading your projects...
      </div>
    </div>
  );

  // Stats
  const open = projects.filter(p => p.status === 'open').length;
  const inProgress = projects.filter(p => p.status === 'closed').length;
  const completed = projects.filter(p => p.status === 'completed').length;
  const totalBids = Object.values(bidsByProject).flat().length;

  const stats = [
    { label: 'Open', value: open, icon: Briefcase, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'In Progress', value: inProgress, icon: Clock, color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Completed', value: completed, icon: CheckCircle, color: '#22c55e', bg: '#f0fdf4' },
    { label: 'Total Bids', value: totalBids, icon: DollarSign, color: '#14b8a6', bg: '#f0fdfa' },
  ];

  return (
    <div style={{ maxWidth: 1000 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 4 }}>My Projects</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Manage your active projects and review freelancer bids.</p>
        </div>
        <Link to="/client/post-project" className="gf-btn">
          <PlusCircle size={16} />
          Post New Project
        </Link>
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

      {/* Projects */}
      {projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 18, border: '1px solid #e9eef6' }}>
          <Briefcase size={48} style={{ color: '#cbd5e1', margin: '0 auto 14px' }} />
          <h3 style={{ color: '#64748b', fontWeight: 600, marginBottom: 8 }}>No Projects Posted Yet</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: 20 }}>Post your first project to start getting bids.</p>
          <Link to="/client/post-project" className="gf-btn" style={{ display: 'inline-flex' }}>
            <PlusCircle size={16} /> Post a Project
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {projects.map(p => {
            const bids = bidsByProject[p._id] || [];
            const acceptedBid = bids.find(b => b.status === 'accepted');
            const receiverId = p.assignedFreelancer?._id || p.assignedFreelancer || acceptedBid?.freelancerId?._id || acceptedBid?.freelancerId;
            const { label: statusLabel, bg: statusBg, color: statusColor } = statusConfig(p.status);
            const canRate = isClient && p.status === 'completed' && !!receiverId && !reviewedProjectIds[p._id];
            const bidsExpanded = expandedBids[p._id];
            const pendingBids = bids.filter(b => b.status === 'pending').length;

            return (
              <div key={p._id} className="gf-card">
                {/* Project Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em' }}>{p.title}</h3>
                      {pendingBids > 0 && (
                        <span style={{ padding: '2px 8px', background: '#fff7ed', color: '#c2410c', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700, border: '1px solid #fed7aa' }}>
                          {pendingBids} new bid{pendingBids > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: '0.8rem', color: '#64748b', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <DollarSign size={13} /> Budget: ₹{p.budget?.toLocaleString()}
                      </span>
                      {p.district && <span>📍 {p.district}</span>}
                      {p.deadline && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={13} />
                          {new Date(p.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                  <span style={{ padding: '5px 14px', background: statusBg, color: statusColor, borderRadius: 99, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 }}>
                    {statusLabel}
                  </span>
                </div>

                <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6, marginBottom: 16, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {p.description}
                </p>

                {/* Assigned Freelancer */}
                {p.assignedFreelancer && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: 10, padding: '8px 14px', marginBottom: 14, fontSize: '0.82rem' }}>
                    <User2 size={14} color="#14b8a6" />
                    <span style={{ color: '#64748b' }}>Assigned to:</span>
                    <span style={{ fontWeight: 700, color: '#0d9488' }}>{p.assignedFreelancer?.name || String(p.assignedFreelancer)}</span>
                  </div>
                )}

                {/* Review section */}
                {canRate && !reviewOpenByProject[p._id] && (
                  <button
                    onClick={() => setReviewOpenByProject(s => ({ ...s, [p._id]: true }))}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px', background: '#fffbeb', border: '1.5px solid #fcd34d', color: '#92400e', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem', marginBottom: 14 }}
                  >
                    <Star size={15} style={{ fill: '#fcd34d', color: '#fcd34d' }} />
                    Rate & Review Freelancer
                  </button>
                )}
                {p.status === 'completed' && reviewedProjectIds[p._id] && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#16a34a', fontWeight: 600, fontSize: '0.82rem', marginBottom: 14 }}>
                    <CheckCircle size={16} /> Review submitted
                  </div>
                )}
                {(p.status === 'closed') && acceptedBid && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '8px 14px', marginBottom: 14, fontSize: '0.8rem', color: '#1d4ed8' }}>
                    <AlertCircle size={14} /> Rating unlocks after the freelancer marks this project as completed.
                  </div>
                )}
                {canRate && reviewOpenByProject[p._id] && (
                  <div style={{ marginBottom: 16, padding: 18, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14 }}>
                    <ReviewForm
                      receiverId={receiverId}
                      projectId={p._id}
                      label="Submit Review"
                      onSubmitted={() => {
                        setReviewOpenByProject(s => ({ ...s, [p._id]: false }));
                        loadProjectsAndBids();
                      }}
                    />
                  </div>
                )}

                {/* Bids Toggle */}
                <button
                  onClick={() => setExpandedBids(s => ({ ...s, [p._id]: !s[p._id] }))}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontWeight: 700, fontSize: '0.875rem', padding: '8px 0', borderTop: '1px solid #f1f5f9', width: '100%', justifyContent: 'space-between' }}
                >
                  <span>Freelancer Bids ({bids.length})</span>
                  {bidsExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {bidsExpanded && (
                  <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
                    {bids.length === 0 && (
                      <p style={{ color: '#94a3b8', fontSize: '0.875rem', fontStyle: 'italic', gridColumn: '1 / -1' }}>No bids received yet.</p>
                    )}
                    {bids.map(b => {
                      const bidStatusConfig = {
                        accepted: { bg: '#dcfce7', color: '#166534' },
                        rejected: { bg: '#fee2e2', color: '#991b1b' },
                        pending: { bg: '#f0fdfa', color: '#0d9488' },
                      }[b.status] || {};
                      return (
                        <div key={b._id} style={{ background: '#f8fafc', border: '1px solid #e9eef6', borderRadius: 12, padding: 16 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{b.freelancerId?.name}</span>
                            <span style={{ padding: '2px 10px', background: bidStatusConfig.bg, color: bidStatusConfig.color, borderRadius: 99, fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>{b.status}</span>
                          </div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#14b8a6', marginBottom: 8 }}>₹{b.amount?.toLocaleString()}</div>
                          <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.55, marginBottom: 12, fontStyle: 'italic' }}>"{b.proposal}"</p>
                          {b.status === 'pending' && p.status === 'open' && (
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button onClick={() => updateBid(p._id, b._id, 'accept')} style={{ flex: 1, padding: '7px 0', background: 'linear-gradient(135deg,#14b8a6,#0d9488)', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>Accept</button>
                              <button onClick={() => updateBid(p._id, b._id, 'reject')} style={{ flex: 1, padding: '7px 0', background: 'white', color: '#ef4444', border: '1.5px solid #fca5a5', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>Reject</button>
                            </div>
                          )}
                        </div>
                      );
                    })}
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
