import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { getMe, updateMe } from '../../api/user';
import { useAuth } from '../../context/useAuth';
import { getUserReviews } from '../../api/reviews';
import { useEffect } from 'react';
import { uploadImage } from '../../api/upload';

const toCsv = (arr) => (Array.isArray(arr) ? arr.join(', ') : '');
const toLines = (arr) => (Array.isArray(arr) ? arr.join('\n') : '');

export default function FreelancerProfile() {
  const { user, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({
    profileImage: user?.profileImage || '',
    skills: toCsv(user?.skills),
    experience: user?.experience || '',
    bio: user?.bio || '',
    portfolioLinks: toLines(user?.portfolioLinks),
  });

  const missing = useMemo(() => {
    const m = [];
    if (!form.profileImage.trim()) m.push('Profile Image');
    if (!form.skills.trim()) m.push('Skills');
    if (!form.experience.trim()) m.push('Experience');
    if (!form.bio.trim()) m.push('Bio');
    if (!form.portfolioLinks.trim()) m.push('Portfolio links');
    return m;
  }, [form]);

  const computedAvg = useMemo(() => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0);
    return Number((sum / reviews.length).toFixed(2));
  }, [reviews]);

  const ratingValue = Number(user?.avgRating || 0) > 0 ? Number(user.avgRating) : computedAvg;
  const ratingCount = Number(user?.ratingCount || 0) > 0 ? Number(user.ratingCount) : reviews.length;

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateMe(form);
      updateUser(updated);
      toast.success(updated.profileCompleted ? 'Profile completed' : 'Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadImage(file);
      setForm((prev) => ({ ...prev, profileImage: `http://localhost:5000${url}` }));
      toast.success('Image uploaded');
    } catch (err) {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    (async () => {
      if (!user?._id) return;
      try {
        const me = await getMe();
        updateUser(me);
        const data = await getUserReviews(user._id);
        setReviews(data);
      } catch {
        // keep profile usable even if reviews fail
      }
    })();
  }, [user?._id, updateUser]);

  return (
    <form className="panel grid" onSubmit={save}>
      <h2>Profile</h2>
      <p><strong>Average rating:</strong> ⭐ {ratingValue} / 5 ({ratingCount} reviews)</p>
      <p className="text-slate-500 mb-6">Complete your profile to unlock Projects and Messages.</p>
      {missing.length > 0 && <div className="bg-orange-50 text-orange-700 p-3 rounded-lg mb-6 border border-orange-200">Missing: {missing.join(', ')}</div>}
      
      <div className="flex items-center gap-6 mb-6">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-2 border-teal-500 shadow-sm">
          {form.profileImage ? (
            <img src={form.profileImage} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
          )}
        </div>
        <div>
          <label className="bg-teal-50 text-teal-600 hover:bg-teal-100 font-medium py-2 px-4 rounded-xl cursor-pointer transition-colors relative">
            <span>{uploading ? 'Uploading...' : 'Upload Photo'}</span>
            <input 
              type="file" 
              accept="image/*" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              onChange={handleFileChange} 
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Skills (comma separated)</label>
          <input className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Experience</label>
          <input className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
        <textarea className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all" rows="3" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-1">Portfolio links (one per line)</label>
        <textarea className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all" rows="3" value={form.portfolioLinks} onChange={(e) => setForm({ ...form, portfolioLinks: e.target.value })} />
      </div>

      <button className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-all hover:-translate-y-0.5" disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</button>

      <div className="mt-10">
        <h3 className="text-xl font-bold text-slate-800 border-b pb-2 mb-4">Reviews</h3>
        {reviews.length === 0 && <p className="text-slate-500">No reviews yet.</p>}
        {reviews.map((r) => (
          <div className="bg-slate-50 p-4 rounded-xl mb-3 border border-slate-100" key={r._id}>
            <p className="text-amber-500 font-bold mb-1">{'★'.repeat(r.rating)} <span className="text-slate-700 font-normal text-sm ml-2">by {r.reviewerId?.name || 'User'}</span></p>
            <p className="text-slate-600">{r.reviewText}</p>
          </div>
        ))}
      </div>
    </form>
  );
}

