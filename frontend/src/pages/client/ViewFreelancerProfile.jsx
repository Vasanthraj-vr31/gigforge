import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserById } from '../../api/user';
import toast from 'react-hot-toast';

export default function ViewFreelancerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getUserById(id);
        setFreelancer(data);
      } catch (err) {
        toast.error('Failed to load freelancer profile');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium">Loading freelancer profile...</div>;
  if (!freelancer) return <div className="p-8 text-center text-slate-500 font-medium">Freelancer not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <button 
        onClick={() => navigate(-1)} 
        className="text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1 mb-4"
      >
        &larr; Back to Dashboard
      </button>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-start">
        <div className="w-32 h-32 rounded-full overflow-hidden shrink-0 bg-slate-100 border-4 border-teal-50">
          {freelancer.profileImage ? (
            <img src={freelancer.profileImage} alt={freelancer.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
          )}
        </div>
        
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">{freelancer.name}</h1>
          <h2 className="text-xl text-slate-500 mb-4">{freelancer.title || 'Freelancer'}</h2>
          
          <div className="flex flex-wrap gap-4 mb-6">
            {freelancer.location && (
              <div className="flex items-center gap-1 text-slate-600 bg-slate-50 px-3 py-1 rounded-lg">
                <span className="text-lg">📍</span> {freelancer.location}
              </div>
            )}
            {freelancer.hourlyRate && (
              <div className="flex items-center gap-1 text-slate-600 bg-slate-50 px-3 py-1 rounded-lg">
                <span className="text-lg">💰</span> ₹{freelancer.hourlyRate}/hr
              </div>
            )}
            <div className="flex items-center gap-1 text-slate-600 bg-slate-50 px-3 py-1 rounded-lg">
              <span className="text-lg">⭐</span> {freelancer.avgRating > 0 ? freelancer.avgRating.toFixed(1) : 'New'} ({freelancer.ratingCount || 0} reviews)
            </div>
            <div className="flex items-center gap-1 text-slate-600 bg-slate-50 px-3 py-1 rounded-lg">
              <span className="text-lg">✅</span> {freelancer.completedProjects || 0} Projects Completed
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <button 
              onClick={() => navigate('/client/messages')} 
              className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-6 rounded-xl shadow-sm transition-colors"
            >
              Message {freelancer.name}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-8">
        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">About Me</h3>
          <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{freelancer.bio || 'No bio provided.'}</p>
        </div>

        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {freelancer.skills?.length > 0 ? freelancer.skills.map((skill, i) => (
              <span key={i} className="px-3 py-1.5 bg-teal-50 text-teal-700 font-semibold rounded-lg text-sm">
                {skill}
              </span>
            )) : <span className="text-slate-500">No skills listed.</span>}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Languages</h3>
          <div className="flex flex-wrap gap-2">
            {freelancer.languages?.length > 0 ? freelancer.languages.map((lang, i) => (
              <span key={i} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 font-semibold rounded-lg text-sm">
                {lang}
              </span>
            )) : <span className="text-slate-500">No languages listed.</span>}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Experience</h3>
          <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{freelancer.experience || 'No experience listed.'}</p>
        </div>

        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Education</h3>
          <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{freelancer.education || 'No education listed.'}</p>
        </div>

        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Portfolio Links</h3>
          {freelancer.portfolioLinks?.length > 0 ? (
            <ul className="list-disc pl-5 space-y-2 text-teal-600">
              {freelancer.portfolioLinks.map((link, i) => (
                <li key={i}>
                  <a href={link} target="_blank" rel="noopener noreferrer" className="hover:underline break-all">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          ) : <span className="text-slate-500">No portfolio links provided.</span>}
        </div>
      </div>
    </div>
  );
}
