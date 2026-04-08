import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFreelancers } from '../../api/user';
import { getProjects } from '../../api/projects';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/useAuth';
import { Search, Star, ChevronRight, Users, Briefcase, TrendingUp, Award } from 'lucide-react';

const tamilNaduDistricts = [
  'All Districts','Chennai','Coimbatore','Madurai','Tiruchirappalli',
  'Salem','Tirupur','Erode','Vellore','Thoothukudi','Tirunelveli',
  'Dindigul','Thanjavur','Ranipet','Sivagangai','Namakkal',
  'Kancheepuram','Cuddalore','Krishnagiri','Dharmapuri',
];

export default function ClientDashboardHome() {
  const { user } = useAuth();
  const [freelancers, setFreelancers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('All Districts');
  const [skillFilter, setSkillFilter] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [fData, pData] = await Promise.all([getFreelancers(), getProjects()]);
        setFreelancers(fData);
        setProjects(pData.filter(p => String(p.clientId?._id || p.clientId) === String(user?._id)));
      } catch {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    })();
  }, [user?._id]);

  const filtered = freelancers.filter(f => {
    const matchName = f.name.toLowerCase().includes(search.toLowerCase());
    const matchSkill = skillFilter
      ? f.skills?.some(s => s.toLowerCase().includes(skillFilter.toLowerCase()))
      : true;
    const matchDistrict = district === 'All Districts'
      ? true
      : (f.district || '').toLowerCase() === district.toLowerCase();
    return matchName && matchSkill && matchDistrict;
  });

  const avgRating = freelancers.length
    ? (freelancers.reduce((a, f) => a + (f.avgRating || 0), 0) / freelancers.length).toFixed(1)
    : 0;

  const stats = [
    { label: 'Total Freelancers', value: freelancers.length, icon: Users, color: '#14b8a6', bg: '#f0fdfa' },
    { label: 'My Projects', value: projects.length, icon: Briefcase, color: '#6366f1', bg: '#eef2ff' },
    { label: 'Avg Platform Rating', value: avgRating, icon: Star, color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Active Matching', value: filtered.length, icon: TrendingUp, color: '#0ea5e9', bg: '#f0f9ff' },
  ];

  return (
    <div style={{ maxWidth: 1100 }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #134e4a 100%)',
        borderRadius: 20,
        padding: '32px 36px',
        color: 'white',
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 75% 50%, rgba(20,184,166,0.25) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 6, letterSpacing: '-0.03em' }}>
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: 500 }}>
          Discover Tamil Nadu's top freelancers. Post projects and get things done.
        </p>
        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <Link to="/client/post-project" className="gf-btn" style={{ padding: '10px 22px', zIndex: 1 }}>
            + Post a Project
          </Link>
          <Link to="/client/my-projects" className="gf-btn-ghost" style={{ borderColor:'rgba(255,255,255,0.2)', color:'white', zIndex:1 }}>
            My Projects <ChevronRight size={16} />
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="dash-stats" style={{ marginBottom: 28 }}>
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>
              <s.icon size={20} color={s.color} />
            </div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="gf-card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 200px', gap: 14 }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              className="gf-input"
              style={{ paddingLeft: 38 }}
              placeholder="Search by name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <input
              className="gf-input"
              placeholder="Filter by skill (e.g. React, Java)..."
              value={skillFilter}
              onChange={e => setSkillFilter(e.target.value)}
            />
          </div>
          <select
            className="gf-input gf-select"
            value={district}
            onChange={e => setDistrict(e.target.value)}
          >
            {tamilNaduDistricts.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* Freelancers Grid */}
      <div className="section-header">
        <h2 className="section-title">Browse Freelancers</h2>
        <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>{filtered.length} freelancers found</span>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {[1,2,3].map(i => (
            <div key={i} className="gf-card" style={{ height: 240 }}>
              <div className="skeleton" style={{ height: 200, borderRadius: 12 }} />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {filtered.map(f => (
            <div className="fl-card" key={f._id}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
                  border: '3px solid #f0fdfa', background: '#f1f5f9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem', fontWeight: 800, color: '#14b8a6',
                }}>
                  {f.profileImage
                    ? <img src={f.profileImage} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : f.name[0].toUpperCase()
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>{f.name}</h3>
                  {f.title && <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0', fontWeight: 500 }}>{f.title}</p>}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    <Star size={13} style={{ fill: '#f59e0b', color: '#f59e0b' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f59e0b' }}>
                      {f.avgRating > 0 ? f.avgRating.toFixed(1) : 'New'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>({f.ratingCount || 0})</span>
                    {f.hourlyRate && (
                      <span style={{ marginLeft: 'auto', fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>
                        ₹{f.hourlyRate}/hr
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              <p style={{
                fontSize: '0.82rem', color: '#64748b', lineHeight: 1.55,
                marginBottom: 14,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                minHeight: '2.5em',
              }}>
                {f.bio || 'No bio provided.'}
              </p>

              {/* Skills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                {f.skills?.slice(0, 4).map((skill, i) => (
                  <span key={i} style={{
                    padding: '3px 10px',
                    background: '#f0fdfa',
                    color: '#0d9488',
                    borderRadius: 6,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}>
                    {skill}
                  </span>
                ))}
                {f.skills?.length > 4 && (
                  <span style={{ padding: '3px 8px', background: '#f8fafc', color: '#94a3b8', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600 }}>
                    +{f.skills.length - 4}
                  </span>
                )}
              </div>

              {/* Footer */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                paddingTop: 14, borderTop: '1px solid #f1f5f9',
              }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  <Award size={13} style={{ display: 'inline', marginRight: 4, color: '#14b8a6' }} />
                  {f.completedProjects || 0} completed
                </div>
                <Link
                  to={`/client/freelancers/${f._id}`}
                  style={{
                    background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
                    color: 'white',
                    padding: '7px 16px',
                    borderRadius: 8,
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    transition: 'all 0.2s',
                  }}
                >
                  View Profile <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px' }}>
              <Users size={48} style={{ color: '#cbd5e1', margin: '0 auto 16px' }} />
              <h3 style={{ color: '#64748b', fontWeight: 600, marginBottom: 8 }}>No Freelancers Found</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
