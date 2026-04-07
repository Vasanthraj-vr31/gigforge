import { motion } from 'framer-motion';
import { User, Clock, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import './BidCard.css';

const BidCard = ({ bid, index, isClient = false }) => {
  const { freelancerName, amount, deliveryDays, proposal, skills, status } = bid;

  const statusIcon = {
    pending: <span className="badge badge-orange">Pending</span>,
    accepted: <span className="badge badge-green">Accepted</span>,
    rejected: <span className="badge" style={{ background: '#fee2e2', color: '#991b1b' }}>Rejected</span>,
  };

  return (
    <motion.div
      className="bid-card"
      initial={{ opacity: 0, x: -15 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, delay: index * 0.08 }}
    >
      <div className="bid-header">
        <div className="bid-avatar">
          <User size={18} />
        </div>
        <div className="bid-info">
          <h4 className="bid-name">{freelancerName}</h4>
          <div className="bid-skills">
            {skills?.map(s => <span className="card-tag" key={s}>{s}</span>)}
          </div>
        </div>
        {statusIcon[status]}
      </div>

      <p className="bid-proposal">{proposal}</p>

      <div className="bid-footer">
        <div className="bid-meta">
          <span className="bid-amount">₹{amount?.toLocaleString()}</span>
          <span className="meta-item"><Clock size={13} /> {deliveryDays} days</span>
        </div>
        {isClient && status === 'pending' && (
          <div className="bid-actions">
            <motion.button
              className="bid-btn accept"
              whileTap={{ scale: 0.95 }}
              onClick={() => toast.success(`${freelancerName} hired!`)}
            >
              <CheckCircle size={15} /> Accept
            </motion.button>
            <motion.button
              className="bid-btn reject"
              whileTap={{ scale: 0.95 }}
              onClick={() => toast.error('Bid rejected.')}
            >
              <XCircle size={15} /> Reject
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default BidCard;
