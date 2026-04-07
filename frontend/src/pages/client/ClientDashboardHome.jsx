import { useEffect, useState } from 'react';
import { getFreelancers } from '../../api/user';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/useAuth';

export default function ClientDashboardHome() {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getFreelancers();
        setFreelancers(data);
      } catch (err) {
        toast.error('Failed to load freelancers');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading freelancers...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-8 text-white shadow-lg">
        <h2 className="text-3xl font-bold mb-2">Browse Freelancers</h2>
        <p className="text-slate-300 text-lg">Find the best talent across Tamil Nadu for your next project.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {freelancers.map((f) => (
          <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 flex flex-col" key={f._id}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 border focus:ring-2 border-teal-500 shadow-sm shrink-0">
                {f.profileImage ? (
                  <img src={f.profileImage} alt={f.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Image</div>
                )}
              </div>
              <div className="overflow-hidden">
                <h3 className="text-xl font-bold text-slate-800 truncate">{f.name}</h3>
                <div className="flex items-center gap-1 text-amber-500 text-sm font-semibold">
                  <span>★</span> {f.avgRating > 0 ? f.avgRating.toFixed(1) : 'New'} 
                  <span className="text-slate-400 text-xs font-normal ml-1">({f.ratingCount || 0} reviews)</span>
                </div>
              </div>
            </div>

            <p className="text-slate-600 text-sm mb-4 line-clamp-2 min-h-10">{f.bio || 'No bio available.'}</p>

            <div className="flex flex-wrap gap-2 mb-4 mt-auto">
              {f.skills?.slice(0, 3).map((skill, i) => (
                <span key={i} className="px-2 py-1 bg-teal-50 text-teal-700 text-xs font-semibold rounded-md">
                  {skill}
                </span>
              ))}
              {f.skills?.length > 3 && (
                <span className="px-2 py-1 bg-slate-50 text-slate-500 text-xs font-semibold rounded-md">
                  +{f.skills.length - 3}
                </span>
              )}
            </div>

            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
              <span className="text-slate-500 text-sm">Completed Projects</span>
              <span className="text-teal-600 font-bold">{f.completedProjects || 0}</span>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-3 rounded-xl shadow-sm transition-colors text-sm">View Profile</button>
            </div>
          </div>
        ))}
        {freelancers.length === 0 && (
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center col-span-full">
            <h3 className="text-xl text-slate-600 font-medium mb-2">No Freelancers Found</h3>
            <p className="text-slate-500">Wait for talented freelancers to join the platform.</p>
          </div>
        )}
      </div>
    </div>
  );
}

