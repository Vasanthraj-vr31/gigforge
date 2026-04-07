import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import ProjectCard from './ProjectCard';
import SkeletonCard from './SkeletonCard';
import './ProjectsSection.css';

const mockProjects = [
  {
    id: 1, title: 'Logo Design for Bakery in Coimbatore',
    description: 'Need a professional logo for a traditional bakery. Should reflect warmth and authenticity.',
    budget: 4000, deadline: 'May 15', district: 'Coimbatore', status: 'open',
    tags: ['Logo Design', 'Branding', 'Illustrator'],
  },
  {
    id: 2, title: 'React Developer for E-Commerce App',
    description: 'Build a mobile-friendly e-commerce frontend using React and Tailwind CSS.',
    budget: 25000, deadline: 'Jun 1', district: 'Chennai', status: 'open',
    tags: ['React', 'JavaScript', 'CSS'],
  },
  {
    id: 3, title: 'Tamil Content Writer for YouTube Channel',
    description: 'Write engaging video scripts in Tamil for a tech education channel.',
    budget: 3500, deadline: 'Apr 30', district: 'Madurai', status: 'in-progress',
    tags: ['Tamil Writing', 'Scriptwriting', 'YouTube'],
  },
  {
    id: 4, title: 'Instagram Reels Editor – Fashion Brand',
    description: 'Short video editing for instagram reels. Trendy transitions, branding elements included.',
    budget: 8000, deadline: 'May 10', district: 'Tiruppur', status: 'open',
    tags: ['Video Editing', 'Instagram', 'Reels'],
  },
  {
    id: 5, title: 'WordPress Website for School',
    description: 'Build and deploy a complete WordPress site for a private school in Trichy.',
    budget: 12000, deadline: 'May 25', district: 'Trichy', status: 'open',
    tags: ['WordPress', 'Web Design', 'PHP'],
  },
  {
    id: 6, title: 'Mobile App UI/UX Design',
    description: 'Design Figma prototypes for a food delivery app targeting local restaurants.',
    budget: 18000, deadline: 'Jun 15', district: 'Salem', status: 'open',
    tags: ['Figma', 'UI/UX', 'Mobile'],
  },
];

const districts = ['All', 'Chennai', 'Coimbatore', 'Madurai', 'Trichy', 'Salem', 'Tiruppur'];

const ProjectsSection = () => {
  const [loading] = useState(false);
  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('All');

  const filtered = mockProjects.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchDistrict = district === 'All' || p.district === district;
    return matchSearch && matchDistrict;
  });

  return (
    <section className="projects-section" id="projects">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="section-title">Browse Projects</h2>
          <p className="section-sub">Find the right gig from across Tamil Nadu</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="filters-bar"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="district-filters">
            <Filter size={15} style={{ color: 'var(--text-light)', flexShrink: 0 }} />
            {districts.map(d => (
              <button
                key={d}
                className={`district-btn ${district === d ? 'active' : ''}`}
                onClick={() => setDistrict(d)}
              >
                {d}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div className="project-grid">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="project-grid">
            {filtered.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
          </div>
        )}
      </div>
    </section>
  );
};

const EmptyState = () => (
  <div className="empty-state">
    <div className="empty-icon">🔍</div>
    <h3>No Projects Found</h3>
    <p>Try adjusting the search or district filter.</p>
  </div>
);

export default ProjectsSection;
