import { motion } from 'framer-motion';
import { LayoutDashboard, Briefcase, MessageSquare, Star, TrendingUp, Clock } from 'lucide-react';
import BidCard from './BidCard';
import './DashboardPanel.css';

const stats = [
  { icon: <Briefcase size={20} />, label: 'Active Projects', value: '3', color: 'teal' },
  { icon: <MessageSquare size={20} />, label: 'Unread Messages', value: '7', color: 'blue' },
  { icon: <Star size={20} />, label: 'Avg. Rating', value: '4.8', color: 'gold' },
  { icon: <TrendingUp size={20} />, label: 'Earnings (Month)', value: '₹22,000', color: 'green' },
];

const mockBids = [
  {
    id: 1, freelancerName: 'Karthik R.', amount: 12000, deliveryDays: 10,
    proposal: 'I have 3+ years in React. Built similar e-commerce systems. Will deliver clean and tested code.',
    skills: ['React', 'Node.js'], status: 'pending',
  },
  {
    id: 2, freelancerName: 'Priya M.', amount: 9000, deliveryDays: 7,
    proposal: 'Expert in frontend with attention to responsiveness. Worked with 15+ clients across TN.',
    skills: ['React', 'CSS'], status: 'accepted',
  },
  {
    id: 3, freelancerName: 'Sathish V.', amount: 15000, deliveryDays: 14,
    proposal: 'Full stack developer. Will handle both backend and frontend integration.',
    skills: ['React', 'MongoDB', 'Express'], status: 'pending',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const DashboardPanel = () => {
  return (
    <section className="dashboard-section" id="dashboard">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="section-title">
            <LayoutDashboard size={24} style={{ verticalAlign: 'middle', marginRight: 8, color: 'var(--teal)' }} />
            Dashboard
          </h2>
          <p className="section-sub">Your activity at a glance</p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          className="stats-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {stats.map((s, i) => (
            <motion.div key={i} className={`stat-card color-${s.color}`} variants={itemVariants}>
              <div className="stat-card-icon">{s.icon}</div>
              <div>
                <p className="stat-card-value">{s.value}</p>
                <p className="stat-card-label">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bids Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="panel">
            <div className="panel-header">
              <h3 className="panel-title">
                <Clock size={16} /> Recent Bids on "React Dev for E-Commerce"
              </h3>
            </div>
            <div className="bids-list">
              {mockBids.map((b, i) => (
                <BidCard key={b.id} bid={b} index={i} isClient={true} />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DashboardPanel;
