import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { completeProject, getProjects } from '../../api/projects';
import { createBid, getMyBids } from '../../api/bids';
import { useAuth } from '../../context/useAuth';

export default function FreelancerProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [acceptedProjects, setAcceptedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState({});
  const [proposal, setProposal] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const data = await getProjects();
        setProjects(data.filter((p) => p.status === 'open' && p.clientId?.role === 'client'));
        const myBids = await getMyBids();
        const accepted = myBids
          .filter((b) => b.status === 'accepted' && b.projectId)
          .map((b) => b.projectId);
        setAcceptedProjects(accepted);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const submitBid = async (projectId) => {
    if (user?.role !== 'freelancer') return;
    if (!user?.profileCompleted) return toast.error('Complete your profile first.');
    try {
      await createBid({
        projectId,
        amount: Number(amount[projectId]),
        proposal: proposal[projectId],
      });
      toast.success('Bid placed successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place bid');
    }
  };

  const handleComplete = async (projectId) => {
    try {
      await completeProject(projectId);
      toast.success('Project marked as completed');
      const data = await getProjects();
      setProjects(data.filter((p) => p.status === 'open'));
      const myBids = await getMyBids();
      setAcceptedProjects(
        myBids
          .filter((b) => b.status === 'accepted' && b.projectId)
          .map((b) => b.projectId)
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark project completed');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading projects...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-12">
      <section>
        <div className="bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl p-8 text-white shadow-lg mb-8">
          <h2 className="text-3xl font-bold mb-2">Browse Projects</h2>
          <p className="text-teal-50 text-lg">Discover the latest gigs and submit your best proposals.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((p) => (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group flex flex-col items-start" key={p._id}>
              <div className="flex justify-between items-start w-full mb-3">
                <h3 className="text-xl font-bold text-slate-800 group-hover:text-teal-600 transition-colors">{p.title}</h3>
                <span className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-bold rounded-full uppercase tracking-wide">{p.status}</span>
              </div>
              <p className="text-slate-600 mb-4 line-clamp-3 flex-grow">{p.description}</p>
              
              <div className="w-full bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-500 text-sm">Client</span>
                  <span className="font-semibold text-slate-700">{p.clientId?.name || 'Client'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-sm">Budget</span>
                  <span className="text-teal-600 font-bold">Rs {p.budget}</span>
                </div>
              </div>

              <div className="w-full space-y-3">
                <input
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all placeholder:text-slate-400"
                  placeholder="Your Bid Amount (Rs)"
                  type="number"
                  value={amount[p._id] || ''}
                  onChange={(e) => setAmount((s) => ({ ...s, [p._id]: e.target.value }))}
                />
                <textarea
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all placeholder:text-slate-400"
                  placeholder="Why are you the perfect fit?"
                  rows="3"
                  value={proposal[p._id] || ''}
                  onChange={(e) => setProposal((s) => ({ ...s, [p._id]: e.target.value }))}
                />
                <button 
                  className="w-full bg-slate-800 hover:bg-teal-500 text-white font-semibold py-3 px-4 rounded-xl shadow-sm transition-all" 
                  onClick={() => submitBid(p._id)}
                >
                  Place Bid
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {acceptedProjects.length > 0 && (
        <section>
          <div className="bg-slate-800 rounded-2xl p-8 text-white shadow-lg mb-8">
            <h2 className="text-2xl font-bold mb-2">My Active Gigs</h2>
            <p className="text-slate-300">Projects where your bid was accepted.</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {acceptedProjects.map((p) => (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200" key={p._id}>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-slate-800">{p.title}</h3>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide ${p.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : p.status === 'closed' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                    {p.status === 'closed' ? 'in-progress' : p.status}
                  </span>
                </div>
                <p className="text-slate-600 mb-4">{p.description}</p>
                <div className="bg-slate-50 p-3 rounded-lg mb-4 text-sm">
                  <span className="text-slate-500">Client:</span> <span className="font-semibold text-slate-700">{p.clientId?.name}</span>
                </div>
                {(p.status === 'in-progress' || p.status === 'closed') && (
                  <button 
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-xl shadow-md transition-all hover:-translate-y-0.5" 
                    onClick={() => handleComplete(p._id)}
                  >
                    Mark as Completed
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

