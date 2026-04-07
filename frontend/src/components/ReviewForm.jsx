import { useState } from 'react';
import toast from 'react-hot-toast';
import { submitReview } from '../api/reviews';

export default function ReviewForm({ receiverId, projectId, onSubmitted, label = 'Submit Review' }) {
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitReview({ receiverId, projectId, rating, reviewText });
      toast.success('Review submitted');
      setReviewText('');
      onSubmitted?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <div className="row">
        <strong>{label}</strong>
        <select className="select" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
          {[5, 4, 3, 2, 1].map((v) => (
            <option key={v} value={v}>{'★'.repeat(v)} ({v})</option>
          ))}
        </select>
      </div>
      <textarea
        className="textarea"
        placeholder="Write your review"
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
      />
      <button className="btn" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
    </form>
  );
}

