import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createProject } from '../../api/projects';
import { FileText, DollarSign, MapPin, Calendar, Info, Sparkles } from 'lucide-react';

const tamilNaduDistricts = [
  'Chennai','Coimbatore','Madurai','Tiruchirappalli','Salem','Tirupur',
  'Erode','Vellore','Thoothukudi','Tirunelveli','Dindigul','Thanjavur',
  'Ranipet','Sivagangai','Namakkal','Kancheepuram','Cuddalore',
  'Krishnagiri','Dharmapuri','Villupuram','Tiruvarur','Nagapattinam',
  'Ariyalur','Perambalur','Karur','Nilgiris','Ramanathapuram','Virudhunagar',
];

const CATEGORY_SUGGESTIONS = [
  'Web Development', 'Mobile App', 'UI/UX Design', 'Content Writing',
  'Digital Marketing', 'Data Entry', 'Video Editing', 'Logo Design',
  'SEO Optimization', 'Social Media Management','Python Development','Java Development',
];

export default function ClientPostProject() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: '',
    district: '',
    category: '',
  });
  const [saving, setSaving] = useState(false);

  const onChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.budget || !form.district) {
      return toast.error('Please fill all required fields.');
    }
    setSaving(true);
    try {
      await createProject({ ...form, budget: Number(form.budget) });
      toast.success('Project posted successfully! 🎉');
      navigate('/client/my-projects');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setSaving(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div style={{ maxWidth: 760 }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #134e4a 100%)',
        borderRadius: 20, padding: '28px 32px', color: 'white', marginBottom: 28,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 80% 50%, rgba(20,184,166,0.25) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Sparkles size={22} color="#14b8a6" />
          <h1 style={{ fontSize: '1.55rem', fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>Post a New Project</h1>
        </div>
        <p style={{ color: 'rgba(148,163,184,0.85)', fontSize: '0.9rem', margin: 0 }}>
          Describe your project clearly to attract the best bids from Tamil Nadu's top freelancers.
        </p>
      </div>

      <form onSubmit={submit}>
        {/* Project Details */}
        <div className="gf-card" style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={17} color="#14b8a6" /> Project Details
          </h3>

          <div style={{ marginBottom: 14 }}>
            <label className="gf-label">
              Project Title <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              className="gf-input"
              name="title"
              value={form.title}
              onChange={onChange}
              placeholder="e.g. Build an e-commerce website for my garments store"
              required
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label className="gf-label">
              Category
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              {CATEGORY_SUGGESTIONS.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, category: cat, title: p.title || cat }))}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 20,
                    border: '1.5px solid',
                    borderColor: form.category === cat ? '#14b8a6' : '#e2e8f0',
                    background: form.category === cat ? '#f0fdfa' : 'white',
                    color: form.category === cat ? '#0d9488' : '#64748b',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
            <input
              className="gf-input"
              name="category"
              value={form.category}
              onChange={onChange}
              placeholder="Or type a custom category..."
            />
          </div>

          <div>
            <label className="gf-label">
              Project Description <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              className="gf-textarea"
              name="description"
              value={form.description}
              onChange={onChange}
              rows={6}
              placeholder="Describe the project scope, specific deliverables, technical requirements, and what a successful outcome looks like for you..."
              required
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Info size={12} /> Be specific — better descriptions attract better bids
              </span>
              <span style={{ fontSize: '0.78rem', color: form.description.length > 50 ? '#14b8a6' : '#94a3b8', fontWeight: 600 }}>
                {form.description.length} chars
              </span>
            </div>
          </div>
        </div>

        {/* Budget & Location */}
        <div className="gf-card" style={{ marginBottom: 16 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
            <DollarSign size={17} color="#14b8a6" /> Budget & Location
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 }}>
            <div>
              <label className="gf-label">
                Budget (₹) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontWeight: 600 }}>₹</span>
                <input
                  className="gf-input"
                  style={{ paddingLeft: 28 }}
                  name="budget"
                  type="number"
                  value={form.budget}
                  onChange={onChange}
                  placeholder="e.g. 10000"
                  min="100"
                  required
                />
              </div>
              {form.budget && (
                <p style={{ fontSize: '0.75rem', color: '#14b8a6', marginTop: 4, fontWeight: 600 }}>
                  ₹{Number(form.budget).toLocaleString('en-IN')} budget
                </p>
              )}
            </div>

            <div>
              <label className="gf-label">
                District / Location <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <MapPin size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <select
                  className="gf-input"
                  style={{ paddingLeft: 34, appearance: 'none' }}
                  name="district"
                  value={form.district}
                  onChange={onChange}
                  required
                >
                  <option value="">Select a district</option>
                  {tamilNaduDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="gf-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={14} /> Project Deadline
            </label>
            <input
              className="gf-input"
              name="deadline"
              type="date"
              value={form.deadline}
              onChange={onChange}
              min={minDate}
              style={{ colorScheme: 'light' }}
            />
          </div>
        </div>

        {/* Tips */}
        <div style={{
          background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: 14,
          padding: '16px 20px', marginBottom: 24, display: 'flex', gap: 14, alignItems: 'flex-start',
        }}>
          <Sparkles size={18} color="#14b8a6" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ fontWeight: 700, color: '#0d9488', marginBottom: 4, fontSize: '0.875rem' }}>Pro Tips for Better Bids</p>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: '0.8rem', color: '#475569', lineHeight: 2 }}>
              <li>Set a realistic budget — too low discourages quality bids</li>
              <li>Include your preferred tech stack or tools if you have any</li>
              <li>Mention if you need Tamil-speaking freelancers</li>
              <li>Specify the expected timeline clearly</li>
            </ul>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="gf-btn-ghost"
            onClick={() => navigate('/client/dashboard')}
          >
            Cancel
          </button>
          <button className="gf-btn" type="submit" disabled={saving} style={{ minWidth: 150, justifyContent: 'center' }}>
            {saving ? 'Posting...' : '🚀 Post Project'}
          </button>
        </div>
      </form>
    </div>
  );
}
