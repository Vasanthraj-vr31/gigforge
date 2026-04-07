import { motion } from 'framer-motion';
import { MapPin, Clock, DollarSign, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import './ProjectCard.css';

const ProjectCard = ({ project, index }) => {
  const { title, description, budget, deadline, district, status, tags } = project;

  const statusColors = {
    open: 'badge-green',
    'in-progress': 'badge-orange',
    completed: 'badge-blue',
  };

  return (
    <motion.div
      className="project-card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -5, boxShadow: '0 12px 40px rgba(20,184,166,0.15)' }}
    >
      <div className="card-header">
        <span className={`badge ${statusColors[status] || 'badge-teal'}`}>
          {status}
        </span>
        <span className="card-budget">
          <DollarSign size={14} />₹{budget?.toLocaleString()}
        </span>
      </div>

      <h3 className="card-title">{title}</h3>
      <p className="card-desc">{description}</p>

      <div className="card-tags">
        {tags?.map(tag => (
          <span className="card-tag" key={tag}>{tag}</span>
        ))}
      </div>

      <div className="card-footer">
        <div className="card-meta">
          <span className="meta-item">
            <MapPin size={13} /> {district}
          </span>
          <span className="meta-item">
            <Clock size={13} /> {deadline}
          </span>
        </div>
        <motion.button
          className="btn btn-sm card-bid-btn"
          whileTap={{ scale: 0.96 }}
          onClick={() => toast.success('Bid placed successfully!')}
        >
          Place Bid <ArrowRight size={14} />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
