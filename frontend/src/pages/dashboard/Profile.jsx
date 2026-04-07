import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { User, Loader } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { updateMe } from '../../api/user';

const toCsv = (arr) => (Array.isArray(arr) ? arr.join(', ') : '');
const toLines = (arr) => (Array.isArray(arr) ? arr.join('\n') : '');

export default function Profile() {
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState(() => ({
    profileImage: user?.profileImage || '',
    skills: toCsv(user?.skills),
    experience: user?.experience || '',
    bio: user?.bio || '',
    portfolioLinks: toLines(user?.portfolioLinks),
  }));

  const [saving, setSaving] = useState(false);

  const missing = useMemo(() => {
    if (user?.role !== 'freelancer') return [];
    const m = [];
    if (!form.profileImage.trim()) m.push('Profile Image');
    if (!form.skills.trim()) m.push('Skills');
    if (!form.experience.trim()) m.push('Experience');
    if (!form.bio.trim()) m.push('Bio');
    if (!form.portfolioLinks.trim()) m.push('Portfolio links');
    return m;
  }, [form, user?.role]);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateMe({
        profileImage: form.profileImage,
        skills: form.skills,
        experience: form.experience,
        bio: form.bio,
        portfolioLinks: form.portfolioLinks,
      });
      updateUser(updated);
      toast.success(updated.profileCompleted ? 'Profile completed!' : 'Profile saved.');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save profile.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dash-page">
      <div className="dash-page-head">
        <h2 className="dash-page-title"><User size={18} /> Profile</h2>
        <p className="dash-page-sub">Complete your freelancer profile to unlock Projects and Messages.</p>
      </div>

      {user?.role === 'freelancer' && missing.length > 0 && (
        <div className="dash-alert">
          <div className="dash-alert-title">Complete your profile first</div>
          <div className="dash-alert-text">
            Missing: <strong>{missing.join(', ')}</strong>
          </div>
        </div>
      )}

      <form className="dash-form" onSubmit={handleSubmit}>
        <div className="dash-form-grid">
          <div className="dash-field">
            <label className="dash-label">Profile Image URL</label>
            <input
              className="dash-input"
              name="profileImage"
              value={form.profileImage}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>

          <div className="dash-field">
            <label className="dash-label">Skills (comma separated)</label>
            <input
              className="dash-input"
              name="skills"
              value={form.skills}
              onChange={handleChange}
              placeholder="React, Node.js, MongoDB"
            />
          </div>

          <div className="dash-field">
            <label className="dash-label">Experience</label>
            <input
              className="dash-input"
              name="experience"
              value={form.experience}
              onChange={handleChange}
              placeholder="e.g. 2 years"
            />
          </div>

          <div className="dash-field dash-field-full">
            <label className="dash-label">Bio</label>
            <textarea
              className="dash-textarea"
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={4}
              placeholder="Tell clients about yourself..."
            />
          </div>

          <div className="dash-field dash-field-full">
            <label className="dash-label">Portfolio links (one per line)</label>
            <textarea
              className="dash-textarea"
              name="portfolioLinks"
              value={form.portfolioLinks}
              onChange={handleChange}
              rows={4}
              placeholder="https://github.com/...\nhttps://behance.net/..."
            />
          </div>
        </div>

        <div className="dash-form-actions">
          <button className="btn" disabled={saving}>
            {saving ? <><Loader size={16} className="spin" /> Saving...</> : 'Save Profile'}
          </button>
          {user?.role === 'freelancer' && (
            <span className="dash-muted">
              Status: <strong>{user?.profileCompleted ? 'Completed' : 'Incomplete'}</strong>
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

