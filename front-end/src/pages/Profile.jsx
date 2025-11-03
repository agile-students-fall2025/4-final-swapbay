import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useReviews } from '../context/ReviewContext';
import ReviewCard from '../components/ReviewCard';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, logout } = useAuth();
  const { getReviewsByUserId, getAverageRating } = useReviews();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const userReviews = getReviewsByUserId(user.username);
  const averageRating = getAverageRating(user.username);
  const ratingCount = userReviews.length;

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

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
      {/* Profile Header */}
      <div className="bg-white shadow-md rounded-xl p-8 text-center">
        <img
          src={user.photo}
          alt="Profile"
          className="w-32 h-32 mx-auto rounded-full border-4 border-blue-500 mb-4 object-cover"
        />
        <h1 className="text-2xl font-bold text-blue-700 mb-1">{user.name}</h1>
        <p className="text-gray-700">@{user.username}</p>
        <p className="text-gray-600 mb-4">{user.email}</p>

        {/* Rating Display */}
        {ratingCount > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl font-bold">{averageRating}</span>
              <div className="flex">{renderStars(averageRating)}</div>
              <span className="text-gray-600">({ratingCount} review{ratingCount !== 1 ? 's' : ''})</span>
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate('/edit-profile')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Edit Profile
          </button>
          <button
            onClick={handleLogout}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white shadow-md rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Reviews ({ratingCount})</h2>
          {ratingCount > 0 && (
            <button
              onClick={() => navigate(`/users/${user.username}/reviews`)}
              className="text-blue-600 hover:underline text-sm"
            >
              View All →
            </button>
          )}
        </div>
        {userReviews.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No reviews yet. Complete a transaction to get reviews!
          </p>
        ) : (
          <div>
            {userReviews.slice(0, 3).map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
            {userReviews.length > 3 && (
              <button
                onClick={() => navigate(`/users/${user.username}/reviews`)}
                className="w-full text-center text-blue-600 hover:underline py-2"
              >
                View {userReviews.length - 3} more review{userReviews.length - 3 !== 1 ? 's' : ''} →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
