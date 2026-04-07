import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getProjects } from '../../api/projects';
import { getProjectBids, acceptBid, rejectBid } from '../../api/bids';
import { getMyReviews } from '../../api/reviews';
import { getMe } from '../../api/user';
import { useAuth } from '../../context/useAuth';
import ReviewForm from '../../components/ReviewForm';

const sameId = (a, b) => String(a || '') === String(b || '');

export default function ClientMyProjects() {
  const { user, updateUser } = useAuth();
  const isClient = user?.role === 'client';
  const [projects, setProjects] = useState([]);
  const [bidsByProject, setBidsByProject] = useState({});
  const [reviewedProjectIds, setReviewedProjectIds] = useState({});
  const [reviewOpenByProject, setReviewOpenByProject] = useState({});
  const [loading, setLoading] = useState(true);

  const loadProjectsAndBids = useCallback(async () => {
    try {
      const me = await getMe();
      updateUser(me);
      const data = await getProjects();
      const mine = data.filter((p) => sameId(p.clientId?._id || p.clientId, me._id));
      setProjects(mine);
      const entries = await Promise.all(mine.map(async (p) => [p._id, await getProjectBids(p._id)]));
      setBidsByProject(Object.fromEntries(entries));
      if (me?._id) {
        const myReviews = await getMyReviews();
        const submitted = {};
        myReviews.forEach((r) => {
          submitted[r.projectId?._id || r.projectId] = true;
        });
        setReviewedProjectIds(submitted);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load projects/bids');
    } finally {
      setLoading(false);
    }
  }, [updateUser]);

  useEffect(() => {
    loadProjectsAndBids();
  }, [loadProjectsAndBids, user?._id]);

  const updateBid = async (_projectId, bidId, action) => {
    try {
      if (action === 'accept') await acceptBid(bidId);
      else await rejectBid(bidId);
      await loadProjectsAndBids();
      toast.success(`Bid ${action}ed`);
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} bid`);
    }
  };

  if (loading) return <div className="panel">Loading your projects...</div>;

  return (
    <div className="grid">
      {projects.map((p) => (
        <div className="card" key={p._id}>
          {(() => {
            const bids = bidsByProject[p._id] || [];
            const acceptedBid = bids.find((b) => b.status === 'accepted');
            const receiverId = p.assignedFreelancer?._id || p.assignedFreelancer || acceptedBid?.freelancerId?._id || acceptedBid?.freelancerId;
            const displayStatus = p.status === 'closed' ? 'in-progress' : p.status;
            const canRate =
              isClient &&
              p.status === 'completed' &&
              !!receiverId &&
              !reviewedProjectIds[p._id];
            return (
              <>
          <div className="row">
            <h3>{p.title}</h3>
            <span
              className={`badge ${
                p.status === 'completed' ? 'badge-green' : p.status === 'closed' ? 'badge-orange' : 'badge-blue'
              }`}
            >
              {displayStatus}
            </span>
          </div>
          <p className="muted">{p.description}</p>
          {p.assignedFreelancer && (
            <p className="muted"><strong>Assigned Freelancer:</strong> {p.assignedFreelancer?.name || p.assignedFreelancer}</p>
          )}
          {canRate && !reviewOpenByProject[p._id] && (
            <button className="btn" onClick={() => setReviewOpenByProject((s) => ({ ...s, [p._id]: true }))}>
              Review & Rate Freelancer
            </button>
          )}
          {p.status === 'completed' && reviewedProjectIds[p._id] && (
            <p className="muted">You already rated this freelancer.</p>
          )}
          {canRate && reviewOpenByProject[p._id] && (
            <ReviewForm
              receiverId={receiverId}
              projectId={p._id}
              label="Rate Freelancer"
              onSubmitted={() => {
                setReviewOpenByProject((s) => ({ ...s, [p._id]: false }));
                loadProjectsAndBids();
              }}
            />
          )}
          {(p.status === 'closed' || p.status === 'in-progress') && acceptedBid && (
            <p className="muted" style={{ marginTop: 8 }}>
              Rating unlocks after the freelancer marks this project as completed.
            </p>
          )}
              </>
            );
          })()}
          <h4 style={{ marginTop: 10 }}>Bids</h4>
          {(bidsByProject[p._id] || []).map((b) => (
            <div className="card" key={b._id} style={{ marginTop: 8 }}>
              <div className="row">
                <strong>{b.freelancerId?.name}</strong>
                <span
                  className={`badge ${
                    b.status === 'accepted' ? 'badge-green' : b.status === 'rejected' ? 'badge-orange' : 'badge-teal'
                  }`}
                >
                  {b.status}
                </span>
              </div>
              <p>Amount: Rs {b.amount}</p>
              <p className="muted">{b.proposal}</p>
              {b.status === 'pending' && p.status === 'open' && (
                <div className="row">
                  <button className="btn" onClick={() => updateBid(p._id, b._id, 'accept')}>Accept</button>
                  <button className="btn btn-outline" onClick={() => updateBid(p._id, b._id, 'reject')}>Reject</button>
                </div>
              )}
              {p.status !== 'open' && b.status === 'pending' && (
                <p className="muted">Actions disabled because project is not open.</p>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

