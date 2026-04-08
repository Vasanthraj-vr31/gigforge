import { useMemo, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getMe, updateMe } from '../../api/user';
import { useAuth } from '../../context/useAuth';
import { getUserReviews } from '../../api/reviews';
import { uploadImage } from '../../api/upload';
import {
  Camera, Save, Star, AlertTriangle, Code2, Briefcase,
  BookOpen, Globe, MapPin, DollarSign, Languages, Link2,
  User2, CheckCircle2
} from 'lucide-react';

const toCsv = (arr) => (Array.isArray(arr) ? arr.join(', ') : '');
const toLines = (arr) => (Array.isArray(arr) ? arr.join('\n') : '');

export default function FreelancerProfile() {
  const { user, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [form, setForm] = useState({
    profileImage: user?.profileImage || '',
    title: user?.title || '',
    skills: toCsv(user?.skills),
    experience: user?.experience || '',
    bio: user?.bio || '',
    portfolioLinks: toLines(user?.portfolioLinks),
    hourlyRate: user?.hourlyRate || '',
    education: user?.education || '',
    languages: toCsv(user?.languages),
    location: user?.location || '',
  });

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const missing = useMemo(() => {
    const m = [];
    if (!form.profileImage.trim()) m.push('Profile Image');
    if (!form.skills.trim()) m.push('Skills');
    if (!form.experience.trim()) m.push('Experience');
    if (!form.bio.trim()) m.push('Bio');
    if (!form.portfolioLinks.trim()) m.push('Portfolio Links');
    return m;
  }, [form]);

  const computedAvg = useMemo(() => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0);
    return Number((sum / reviews.length).toFixed(1));
  }, [reviews]);

  const ratingValue = Number(user?.avgRating || 0) > 0 ? Number(user.avgRating) : computedAvg;
  const ratingCount = Number(user?.ratingCount || 0) > 0 ? Number(user.ratingCount) : reviews.length;

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateMe(form);
      updateUser(updated);
      toast.success(updated.profileCompleted ? '🎉 Profile completed!' : 'Profile updated!');
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
      setForm(prev => ({ ...prev, profileImage: `http://localhost:5000${url}` }));
      toast.success('Photo updated!');
    } catch {
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
        setForm({
          profileImage: me.profileImage || '',
          title: me.title || '',
          skills: toCsv(me.skills),
          experience: me.experience || '',
          bio: me.bio || '',
          portfolioLinks: toLines(me.portfolioLinks),
          hourlyRate: me.hourlyRate || '',
          education: me.education || '',
          languages: toCsv(me.languages),
          location: me.location || '',
        });
        const data = await getUserReviews(user._id);
        setReviews(data);
      } catch {
        // keep profile usable
      }
    })();
  }, [user?._id, updateUser]);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const profileCompletion = Math.round(((5 - missing.length) / 5) * 100);

  return (
    <div style={{ maxWidth: 820 }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: 24, letterSpacing: '-0.02em' }}>
        My Profile
      </h1>

      <form onSubmit={save}>
        {/* Hero */}
        <div className="profile-hero" style={{ marginBottom: 24 }}>
          <div className="profile-avatar-wrap">
            <div className="profile-avatar">
              {form.profileImage
                ? <img src={form.profileImage} alt={user?.name} />
                : <span style={{ fontSize: '2rem', fontWeight: 800 }}>{initials}</span>
              }
            </div>
            <label className="profile-upload-btn" title="Change photo">
              <Camera size={14} color="white" />
              <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
            </label>
          </div>

          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 2, letterSpacing: '-0.02em' }}>{user?.name}</h2>
            {form.title ? (
              <p style={{ color: '#14b8a6', fontWeight: 600, marginBottom: 4 }}>{form.title}</p>
            ) : (
              <p style={{ color: 'rgba(148,163,184,0.6)', fontStyle: 'italic', marginBottom: 4, fontSize: '0.875rem' }}>Add your professional title below</p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <Star size={15} style={{ fill: '#f59e0b', color: '#f59e0b' }} />
              <span style={{ color: 'white', fontWeight: 700 }}>{ratingValue} / 5</span>
              <span style={{ color: 'rgba(148,163,184,0.7)', fontSize: '0.8rem' }}>({ratingCount} reviews)</span>
            </div>
            {/* Completion bar */}
            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '0.75rem', color: 'rgba(148,163,184,0.8)', fontWeight: 600 }}>Profile Completion</span>
                <span style={{ fontSize: '0.75rem', color: profileCompletion === 100 ? '#4ade80' : '#14b8a6', fontWeight: 700 }}>{profileCompletion}%</span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${profileCompletion}%`,
                  background: profileCompletion === 100 ? 'linear-gradient(90deg,#4ade80,#22c55e)' : 'linear-gradient(90deg,#14b8a6,#0ea5e9)',
                  borderRadius: 99,
                  transition: 'width 0.5s ease',
                }} />
              </div>
            </div>
          </div>
        </div>

        {/* Missing alert */}
        {missing.length > 0 && (
          <div className="missing-alert" style={{ marginBottom: 20 }}>
            <AlertTriangle size={18} />
            <span><strong>Complete your profile</strong> — Missing: {missing.join(', ')}</span>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '2px solid #e9eef6' }}>
          {[
            { id: 'profile', label: 'Profile Info', icon: User2 },
            { id: 'skills', label: 'Skills & Work', icon: Code2 },
            { id: 'reviews', label: `Reviews (${reviews.length})`, icon: Star },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 20px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
                color: activeTab === tab.id ? '#14b8a6' : '#64748b',
                borderBottom: activeTab === tab.id ? '2px solid #14b8a6' : '2px solid transparent',
                marginBottom: -2,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.15s',
              }}
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Basic info */}
            <div className="gf-card">
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                <User2 size={17} color="#14b8a6" /> Basic Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="gf-label">Professional Title</label>
                  <input
                    className="gf-input"
                    value={form.title}
                    onChange={set('title')}
                    placeholder="e.g. Full-Stack Developer, UI/UX Designer"
                  />
                </div>
                <div>
                  <label className="gf-label">Location</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      className="gf-input"
                      style={{ paddingLeft: 36 }}
                      value={form.location}
                      onChange={set('location')}
                      placeholder="Chennai, Tamil Nadu"
                    />
                  </div>
                </div>
                <div>
                  <label className="gf-label">Hourly Rate (₹)</label>
                  <div style={{ position: 'relative' }}>
                    <DollarSign size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      className="gf-input"
                      style={{ paddingLeft: 36 }}
                      value={form.hourlyRate}
                      onChange={set('hourlyRate')}
                      placeholder="e.g. 500"
                      type="number"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="gf-card">
              <label className="gf-label" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Briefcase size={17} color="#14b8a6" /> Professional Bio
              </label>
              <textarea
                className="gf-textarea"
                rows={5}
                value={form.bio}
                onChange={set('bio')}
                placeholder="Describe your professional background, what you specialize in, and what makes you unique..."
              />
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 6 }}>{form.bio.length} characters</p>
            </div>

            {/* Education */}
            <div className="gf-card">
              <label className="gf-label" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <BookOpen size={17} color="#14b8a6" /> Education
              </label>
              <textarea
                className="gf-textarea"
                rows={3}
                value={form.education}
                onChange={set('education')}
                placeholder="e.g. B.E. Computer Science, Anna University, 2022"
              />
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Skills */}
            <div className="gf-card">
              <label className="gf-label" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Code2 size={17} color="#14b8a6" /> Skills
              </label>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 12 }}>Enter skills separated by commas</p>
              <input
                className="gf-input"
                value={form.skills}
                onChange={set('skills')}
                placeholder="React, Node.js, MongoDB, Python, Figma..."
              />
              {form.skills && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                  {form.skills.split(',').filter(s => s.trim()).map((s, i) => (
                    <span key={i} style={{ padding: '4px 12px', background: '#f0fdfa', color: '#0d9488', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600 }}>
                      {s.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Experience */}
            <div className="gf-card">
              <label className="gf-label" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Briefcase size={17} color="#14b8a6" /> Work Experience
              </label>
              <textarea
                className="gf-textarea"
                rows={5}
                value={form.experience}
                onChange={set('experience')}
                placeholder="Describe your work history, roles, and key projects..."
              />
            </div>

            {/* Languages */}
            <div className="gf-card">
              <label className="gf-label" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Languages size={17} color="#14b8a6" /> Languages
              </label>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 12 }}>Languages you speak (comma-separated)</p>
              <input
                className="gf-input"
                value={form.languages}
                onChange={set('languages')}
                placeholder="Tamil, English, Hindi..."
              />
            </div>

            {/* Portfolio */}
            <div className="gf-card">
              <label className="gf-label" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Link2 size={17} color="#14b8a6" /> Portfolio Links
              </label>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 12 }}>One link per line (GitHub, Behance, live projects, etc.)</p>
              <textarea
                className="gf-textarea"
                rows={4}
                value={form.portfolioLinks}
                onChange={set('portfolioLinks')}
                placeholder={"https://github.com/yourname\nhttps://yourproject.com"}
              />
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="gf-card">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: 20 }}>
              Client Reviews
            </h3>
            {reviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                <Star size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                <p>No reviews yet. Complete projects to earn reviews!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {reviews.map(r => (
                  <div key={r._id} style={{
                    background: '#f8fafc',
                    border: '1px solid #e9eef6',
                    borderRadius: 12,
                    padding: '16px 18px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div>
                        <span style={{ color: '#f59e0b', fontSize: '1rem', letterSpacing: 1 }}>
                          {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                        </span>
                        <span style={{ marginLeft: 8, fontSize: '0.82rem', color: '#64748b' }}>
                          by {r.reviewerId?.name || 'Client'}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {new Date(r.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <p style={{ color: '#475569', fontSize: '0.875rem', lineHeight: 1.55, margin: 0 }}>{r.reviewText}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Save Button */}
        {activeTab !== 'reviews' && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20, gap: 12 }}>
            {missing.length === 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#22c55e', fontSize: '0.875rem', fontWeight: 600 }}>
                <CheckCircle2 size={17} /> Profile complete
              </div>
            )}
            <button className="gf-btn" type="submit" disabled={saving}>
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
