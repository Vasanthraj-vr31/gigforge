import { MessageSquare } from 'lucide-react';

export default function Messages() {
  return (
    <div className="dash-page">
      <div className="dash-page-head">
        <h2 className="dash-page-title"><MessageSquare size={18} /> Messages</h2>
        <p className="dash-page-sub">Your conversations will appear here (placeholder UI for now).</p>
      </div>

      <div className="dash-card">
        <div className="dash-card-title">No messages connected yet</div>
        <div className="dash-card-text">
          Next step: connect this page to Socket.IO / Messages API.
        </div>
      </div>
    </div>
  );
}

