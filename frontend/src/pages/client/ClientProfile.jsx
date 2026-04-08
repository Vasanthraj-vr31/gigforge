import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getMe, updateMe } from '../../api/user';
import { getProjects } from '../../api/projects';
import { useAuth } from '../../context/useAuth';
import { uploadImage } from '../../api/upload';
import { Camera, Save, Building2, Globe, Phone, MapPin, FileText, Briefcase } from 'lucide-react';

export default function ClientProfile() {
  const { user, updateUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [projectsCount, setProjectsCount] = useState(0);
  const [form, setForm] = useState({
    profileImage: user?.profileImage || '',
    bio: user?.bio || '',
    companyName: user?.companyName || '',
    website: user?.website || '',
    phone: user?.phone || '',
    location: user?.location || '',
  });

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateMe(form);
      updateUser(updated);
      toast.success('Profile saved successfully!');
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
          bio: me.bio || '',
          companyName: me.companyName || '',
          website: me.website || '',
          phone: me.phone || '',
          location: me.location || '',
        });
        const allProjects = await getProjects();
        const mine = allProjects.filter(
          p => String(p.clientId?._id || p.clientId) === String(user._id)
        );
        setProjectsCount(mine.length);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [user?._id, updateUser]);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <div style={{ maxWidth: 800 }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: 24, letterSpacing: '-0.02em' }}>
        My Profile
      </h1>

      <form onSubmit={save}>
        {/* Hero section */}
        <div className="profile-hero" style={{ marginBottom: 24 }}>
          <div className="profile-avatar-wrap">
            <div className="profile-avatar">
              {form.profileImage
                ? <img src={form.profileImage} alt={user?.name} />
                : <span style={{ fontSize: '2rem', fontWeight: 800 }}>{initials}</span>
              }
            </div>
            <label className="profile-upload-btn" title="Upload photo">
              <Camera size={14} color="white" />
              <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
            </label>
          </div>

          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 4 }}>{user?.name}</h2>
            <p style={{ color: 'rgba(148,163,184,0.9)', fontSize: '0.9rem' }}>{user?.email}</p>
            {form.companyName && (
              <p style={{ color: '#14b8a6', fontWeight: 600, marginTop: 6 }}>{form.companyName}</p>
            )}
            <p style={{ marginTop: 10, color: 'rgba(148,163,184,0.7)', fontSize: '0.8rem' }}>
              {uploading ? 'Uploading photo...' : 'Click the camera icon to change your photo'}
            </p>
          </div>

          {/* Stat bubble */}
          <div style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 14,
            padding: '16px 22px',
            textAlign: 'center',
            flexShrink: 0,
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#14b8a6' }}>{projectsCount}</div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(148,163,184,0.8)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Posted Projects
            </div>
          </div>
        </div>

        {/* Form Sections */}
        <div className="gf-card" style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building2 size={18} color="#14b8a6" /> Company Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label className="gf-label">Company / Client Name</label>
              <input
                className="gf-input"
                value={form.companyName}
                onChange={set('companyName')}
                placeholder="Your company or full name"
              />
            </div>
            <div>
              <label className="gf-label">Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  className="gf-input"
                  style={{ paddingLeft: 36 }}
                  value={form.phone}
                  onChange={set('phone')}
                  placeholder="+91 9876543210"
                  type="tel"
                />
              </div>
            </div>
            <div>
              <label className="gf-label">Website</label>
              <div style={{ position: 'relative' }}>
                <Globe size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  className="gf-input"
                  style={{ paddingLeft: 36 }}
                  value={form.website}
                  onChange={set('website')}
                  placeholder="https://yourcompany.com"
                  type="url"
                />
              </div>
            </div>
            <div>
              <label className="gf-label">Location / District</label>
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
          </div>
        </div>

        <div className="gf-card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={18} color="#14b8a6" /> About Your Company
          </h3>
          <label className="gf-label">Company Bio</label>
          <textarea
            className="gf-textarea"
            rows={5}
            placeholder="Tell freelancers about your company, the type of projects you run, and what kind of talent you're looking for..."
            value={form.bio}
            onChange={set('bio')}
          />
          <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 6 }}>
            {form.bio.length}/500 characters
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="gf-btn" type="submit" disabled={saving} style={{ gap: 8 }}>
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
