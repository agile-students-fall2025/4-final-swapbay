import { createContext, useContext, useState } from 'react';

const ReviewContext = createContext();

export function ReviewProvider({ children }) {
  // Mock reviews data - replace with API calls later
  const [reviews, setReviews] = useState([
    {
      id: 1,
      reviewerId: 'user1',
      reviewerName: 'John Doe',
      reviewerPhoto: 'https://picsum.photos/80?random=1',
      reviewedUserId: 'hailemariam',
      reviewedUserName: 'Hailemariam',
      rating: 5,
      comment: 'Great seller! Item was exactly as described.',
      transactionId: 'txn1',
      transactionType: 'sale', // 'sale' or 'swap'
      role: 'seller', // 'seller' or 'buyer'
      createdAt: '2025-01-15',
    },
    {
      id: 2,
      reviewerId: 'user2',
      reviewerName: 'Jane Smith',
      reviewerPhoto: 'https://picsum.photos/80?random=2',
      reviewedUserId: 'sebahadin',
      reviewedUserName: 'Sebahadin',
      rating: 4,
      comment: 'Fast communication and smooth transaction. Would trade again!',
      transactionId: 'txn2',
      transactionType: 'swap',
      role: 'buyer',
      createdAt: '2025-01-14',
    },
    {
      id: 3,
      reviewerId: 'hailemariam',
      reviewerName: 'Hailemariam',
      reviewerPhoto: 'https://picsum.photos/80?random=3',
      reviewedUserId: 'user1',
      reviewedUserName: 'John Doe',
      rating: 5,
      comment: 'Excellent buyer, quick payment and easy to work with.',
      transactionId: 'txn1',
      transactionType: 'sale',
      role: 'buyer',
      createdAt: '2025-01-15',
    },
  ]);

  // Add a new review
  const addReview = (reviewData) => {
    const newReview = {
      id: Date.now(),
      ...reviewData,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setReviews((prev) => [newReview, ...prev]);
    return newReview;
  };

  // Get reviews for a specific user
  const getReviewsByUserId = (userId) => {
    return reviews.filter((r) => r.reviewedUserId === userId);
  };

  // Get reviews written by a specific user
  const getReviewsByReviewerId = (reviewerId) => {
    return reviews.filter((r) => r.reviewerId === reviewerId);
  };

  // Calculate average rating for a user
  const getAverageRating = (userId) => {
    const userReviews = getReviewsByUserId(userId);
    if (userReviews.length === 0) return 0;
    const sum = userReviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / userReviews.length).toFixed(1);
  };

  // Check if user has already reviewed another user for a transaction
  const hasUserReviewed = (reviewerId, reviewedUserId, transactionId) => {
    return reviews.some(
      (r) =>
        r.reviewerId === reviewerId &&
        r.reviewedUserId === reviewedUserId &&
        r.transactionId === transactionId
    );
  };

  return (
    <ReviewContext.Provider
      value={{
        reviews,
        addReview,
        getReviewsByUserId,
        getReviewsByReviewerId,
        getAverageRating,
        hasUserReviewed,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
}

export function useReviews() {
  return useContext(ReviewContext);
}

