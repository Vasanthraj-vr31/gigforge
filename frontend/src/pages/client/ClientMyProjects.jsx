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

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading your projects...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-12">
      <div className="bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl p-8 text-white shadow-lg mb-8">
        <h2 className="text-3xl font-bold mb-2">My Projects</h2>
        <p className="text-teal-50 text-lg">Manage your active projects and review freelancer bids.</p>
      </div>

      <div className="space-y-8">
        {projects.map((p) => (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200" key={p._id}>
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
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-2xl font-bold text-slate-800">{p.title}</h3>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${
                      p.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : p.status === 'closed' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {displayStatus}
                    </span>
                  </div>
                  <p className="text-slate-600 mb-4">{p.description}</p>
                  
                  {p.assignedFreelancer && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4 inline-flex items-center gap-2">
                      <span className="text-slate-500 font-medium text-sm">Assigned Freelancer:</span>
                      <span className="font-bold text-slate-700">{p.assignedFreelancer?.name || p.assignedFreelancer}</span>
                    </div>
                  )}

                  {canRate && !reviewOpenByProject[p._id] && (
                    <button className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-5 rounded-xl shadow-md transition-all mt-2" onClick={() => setReviewOpenByProject((s) => ({ ...s, [p._id]: true }))}>
                      Review & Rate Freelancer
                    </button>
                  )}
                  {p.status === 'completed' && reviewedProjectIds[p._id] && (
                    <p className="text-emerald-600 font-semibold mt-2">✨ You already rated this freelancer.</p>
                  )}
                  {canRate && reviewOpenByProject[p._id] && (
                    <div className="mt-4 p-4 border border-slate-200 rounded-xl bg-slate-50">
                      <ReviewForm
                        receiverId={receiverId}
                        projectId={p._id}
                        label="Rate Freelancer"
                        onSubmitted={() => {
                          setReviewOpenByProject((s) => ({ ...s, [p._id]: false }));
                          loadProjectsAndBids();
                        }}
                      />
                    </div>
                  )}
                  {(p.status === 'closed' || p.status === 'in-progress') && acceptedBid && (
                    <div className="mt-4 bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-center">
                      <span className="text-blue-700 text-sm">ⓘ Rating unlocks after the freelancer marks this project as completed.</span>
                    </div>
                  )}
                </>
              );
            })()}

            <div className="mt-8">
              <h4 className="text-xl font-bold text-slate-800 mb-4 pb-2 border-b">Freelancer Bids</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(bidsByProject[p._id] || []).map((b) => (
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 hover:shadow-md transition-all flex flex-col" key={b._id}>
                    <div className="flex justify-between items-start mb-2">
                      <strong className="text-lg text-slate-800">{b.freelancerId?.name}</strong>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wide ${
                        b.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' : b.status === 'rejected' ? 'bg-orange-100 text-orange-800' : 'bg-teal-100 text-teal-800'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <span className="text-slate-500 text-sm">Amount:</span> <span className="font-bold text-teal-600 ml-1">Rs {b.amount}</span>
                    </div>
                    
                    <p className="text-slate-600 italic text-sm bg-white p-3 border border-slate-100 rounded-lg flex-grow mb-4">"{b.proposal}"</p>
                    
                    {b.status === 'pending' && p.status === 'open' && (
                      <div className="flex gap-2 mt-auto">
                        <button className="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-3 rounded-lg shadow-sm transition-colors text-sm" onClick={() => updateBid(p._id, b._id, 'accept')}>Accept</button>
                        <button className="flex-1 bg-white hover:bg-rose-50 text-rose-500 border border-rose-200 font-semibold py-2 px-3 rounded-lg transition-colors text-sm" onClick={() => updateBid(p._id, b._id, 'reject')}>Reject</button>
                      </div>
                    )}
                    
                    {p.status !== 'open' && b.status === 'pending' && (
                      <p className="text-slate-400 text-xs text-center mt-auto">Actions disabled (Project closed)</p>
                    )}
                  </div>
                ))}
                {(bidsByProject[p._id] || []).length === 0 && (
                  <p className="text-slate-500 italic col-span-2">No bids yet.</p>
                )}
              </div>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center">
            <h3 className="text-xl text-slate-600 font-medium mb-2">No Projects Posted</h3>
            <p className="text-slate-500 mb-6">You haven't posted any projects yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

