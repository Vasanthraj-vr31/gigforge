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
        setProjects(data.filter((p) => p.status === 'open'));
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

  if (loading) return <div className="panel">Loading projects...</div>;

  return (
    <div className="grid">
      <div className="panel">
        <h2>Browse Projects</h2>
        <p className="muted">Freelancers can place bids on open projects.</p>
      </div>
      {projects.map((p) => (
        <div className="card" key={p._id}>
          <div className="row">
            <h3>{p.title}</h3>
            <span className="badge badge-teal">{p.status}</span>
          </div>
          <p className="muted">{p.description}</p>
          <p><strong>Budget:</strong> Rs {p.budget}</p>
          <div className="grid grid-2">
            <input
              className="input"
              placeholder="Bid Amount"
              value={amount[p._id] || ''}
              onChange={(e) => setAmount((s) => ({ ...s, [p._id]: e.target.value }))}
            />
            <button className="btn" onClick={() => submitBid(p._id)}>Place Bid</button>
          </div>
          <textarea
            className="textarea"
            placeholder="Proposal message"
            value={proposal[p._id] || ''}
            onChange={(e) => setProposal((s) => ({ ...s, [p._id]: e.target.value }))}
          />
        </div>
      ))}

      <div className="panel">
        <h2>My Accepted Projects</h2>
        <p className="muted">Mark your project as completed when work is finished.</p>
      </div>
      {acceptedProjects.map((p) => (
        <div className="card" key={p._id}>
          <div className="row">
            <h3>{p.title}</h3>
            <span className={`badge ${p.status === 'completed' ? 'badge-green' : p.status === 'closed' ? 'badge-orange' : 'badge-blue'}`}>
              {p.status === 'closed' ? 'in-progress' : p.status}
            </span>
          </div>
          <p className="muted">{p.description}</p>
          <p><strong>Client:</strong> {p.clientId?.name}</p>
          {(p.status === 'in-progress' || p.status === 'closed') && (
            <button className="btn" onClick={() => handleComplete(p._id)}>
              Mark as Completed
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

