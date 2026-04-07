import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { getMe, updateMe } from '../../api/user';
import { useAuth } from '../../context/useAuth';
import { getUserReviews } from '../../api/reviews';
import { useEffect } from 'react';

const toCsv = (arr) => (Array.isArray(arr) ? arr.join(', ') : '');
const toLines = (arr) => (Array.isArray(arr) ? arr.join('\n') : '');

export default function FreelancerProfile() {
  const { user, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);
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
      <p className="muted">Complete your profile to unlock Projects and Messages.</p>
      {missing.length > 0 && <p className="muted">Missing: {missing.join(', ')}</p>}
      <input className="input" placeholder="Profile Image URL" value={form.profileImage} onChange={(e) => setForm({ ...form, profileImage: e.target.value })} />
      <input className="input" placeholder="Skills (comma separated)" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
      <input className="input" placeholder="Experience" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
      <textarea className="textarea" placeholder="Bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
      <textarea className="textarea" placeholder="Portfolio links (one per line)" value={form.portfolioLinks} onChange={(e) => setForm({ ...form, portfolioLinks: e.target.value })} />
      <button className="btn" disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</button>

      <div className="panel">
        <h3>Reviews</h3>
        {reviews.length === 0 && <p className="muted">No reviews yet.</p>}
        {reviews.map((r) => (
          <div className="card" key={r._id}>
            <p><strong>{'★'.repeat(r.rating)}</strong> by {r.reviewerId?.name || 'User'}</p>
            <p className="muted">{r.reviewText}</p>
          </div>
        ))}
      </div>
    </form>
  );
}

