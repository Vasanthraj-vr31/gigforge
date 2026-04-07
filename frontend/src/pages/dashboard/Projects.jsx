import { FolderOpen } from 'lucide-react';

export default function Projects() {
  return (
    <div className="dash-page">
      <div className="dash-page-head">
        <h2 className="dash-page-title"><FolderOpen size={18} /> Projects</h2>
        <p className="dash-page-sub">Browse gigs and submit bids (placeholder UI for now).</p>
      </div>

      <div className="dash-card">
        <div className="dash-card-title">No projects connected yet</div>
        <div className="dash-card-text">
          Next step: hook this page to the real Projects API.
        </div>
      </div>
    </div>
  );
}

