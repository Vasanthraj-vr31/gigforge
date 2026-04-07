import { motion } from 'framer-motion';
import './Workflow.css';

const steps = [
  { id: 1, emoji: '📝', title: 'Registration & Login', description: 'Create your account as a client or freelancer.' },
  { id: 2, emoji: '👤', title: 'Profile Creation', description: 'Set up your skills, district, and portfolio.' },
  { id: 3, emoji: '📋', title: 'Project Posting', description: 'Clients describe the work, budget, and deadline.' },
  { id: 4, emoji: '🔍', title: 'Project Browsing', description: 'Freelancers discover gigs that match their skills.' },
  { id: 5, emoji: '💼', title: 'Bidding System', description: 'Submit proposals with your price and timeline.' },
  { id: 6, emoji: '✅', title: 'Bid Selection', description: 'Clients review all bids and accept the best fit.' },
  { id: 7, emoji: '💬', title: 'Messaging', description: 'Chat directly to align on project requirements.' },
  { id: 8, emoji: '🎯', title: 'Milestone Creation', description: 'Break down the work into trackable milestones.' },
  { id: 9, emoji: '📤', title: 'Work Submission', description: 'Freelancer delivers the completed work.' },
  { id: 10, emoji: '💳', title: 'Payment Process', description: 'Secure, milestone-based payments via Razorpay.' },
  { id: 11, emoji: '⭐', title: 'Rating & Review', description: 'Rate the experience and build your reputation.' },
  { id: 12, emoji: '🏁', title: 'Project Completion', description: 'Project closed. Both parties benefit!' },
];

const Workflow = () => {
  return (
    <section className="workflow-section" id="how-it-works">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="section-title">How GigForge Works</h2>
          <p className="section-sub">12 simple steps from posting to project completion</p>
        </motion.div>

        <div className="steps-grid">
          {steps.map((step, i) => (
            <motion.div
              className="step-card"
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              whileHover={{ y: -4, boxShadow: '0 8px 30px rgba(20,184,166,0.12)' }}
            >
              <div className="step-top">
                <span className="step-emoji">{step.emoji}</span>
                <span className="step-num">0{step.id > 9 ? '' : ''}{step.id}</span>
              </div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Workflow;
