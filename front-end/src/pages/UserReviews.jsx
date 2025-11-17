import { useParams } from 'react-router-dom';
import { useReviews } from '../context/ReviewContext';
import ReviewCard from '../components/ReviewCard';
import ReviewForm from '../components/ReviewForm';
import { useAuth } from '../context/AuthContext';

export default function UserReviews() {
  const { username } = useParams();
  const { user } = useAuth();
  const { getReviewsByUserId, getAverageRating } = useReviews();
  
  const userReviews = getReviewsByUserId(username);
  const averageRating = getAverageRating(username);
  const isOwnProfile = user?.username === username;

  const renderStars = (rating) => {
    const numRating = parseFloat(rating);
    return Array.from({ length: 5 }, (_, i) => {
      if (i < Math.floor(numRating)) {
        return <span key={i} className="text-yellow-400">★</span>;
      }
      if (i === Math.floor(numRating) && numRating % 1 >= 0.5) {
        return <span key={i} className="text-yellow-400">☆</span>;
      }
      return <span key={i} className="text-gray-300">★</span>;
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-md rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-4">Reviews for @{username}</h1>
        
        {userReviews.length > 0 && (
          <div className="flex items-center gap-2 mb-6">
            <span className="text-3xl font-bold">{averageRating}</span>
            <div className="flex">{renderStars(averageRating)}</div>
            <span className="text-gray-600">({userReviews.length} review{userReviews.length !== 1 ? 's' : ''})</span>
          </div>
        )}
      </div>

      {!isOwnProfile && user && (
        <ReviewForm
          reviewedUserId={username}
          reviewedUserName={username}
          transactionId={`mock-txn-${username}`}
          transactionType="sale"
          role="seller"
        />
      )}

      <div className="bg-white shadow-md rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">
          All Reviews ({userReviews.length})
        </h2>
        {userReviews.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No reviews yet.</p>
        ) : (
          <div>
            {userReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

