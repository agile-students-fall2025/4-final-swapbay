import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useReviews } from '../context/ReviewContext';
import toast from 'react-hot-toast';

export default function ReviewForm({ reviewedUserId, reviewedUserName, transactionId, transactionType, role, onSuccess }) {
  const { user } = useAuth();
  const { addReview, hasUserReviewed } = useReviews();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);

  // Check if user already reviewed
  if (!user || hasUserReviewed(user?.username, reviewedUserId, transactionId)) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
        You have already reviewed this user for this transaction.
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    addReview({
      reviewerId: user.username,
      reviewerName: user.name,
      reviewerPhoto: user.photo,
      reviewedUserId,
      reviewedUserName,
      rating,
      comment,
      transactionId,
      transactionType,
      role,
    });

    toast.success('Review submitted!');
    setRating(0);
    setComment('');
    if (onSuccess) onSuccess();
  };

  const renderStarInput = () => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            className={`text-3xl cursor-pointer transition ${
              star <= (hoveredStar || rating)
                ? 'text-yellow-400'
                : 'text-gray-300'
            }`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">
        Review {reviewedUserName}
      </h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating *
        </label>
        {renderStarInput()}
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Comment
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Share your experience..."
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
      >
        Submit Review
      </button>
    </form>
  );
}

