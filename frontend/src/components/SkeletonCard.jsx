import './SkeletonCard.css';

const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skel-row">
      <div className="skeleton skel-badge" />
      <div className="skeleton skel-budget" />
    </div>
    <div className="skeleton skel-title" />
    <div className="skeleton skel-line" />
    <div className="skeleton skel-line short" />
    <div className="skel-tags">
      <div className="skeleton skel-tag" />
      <div className="skeleton skel-tag" />
    </div>
    <div className="skeleton skel-footer-line" />
  </div>
);

export default SkeletonCard;
