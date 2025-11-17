export default function ReviewCard({ review }) {
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={i < rating ? 'text-yellow-400' : 'text-gray-300'}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-4">
        <img
          src={review.reviewerPhoto}
          alt={review.reviewerName}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-semibold text-gray-900">
                {review.reviewerName}
              </h4>
              <p className="text-sm text-gray-500">
                Reviewed as {review.role === 'seller' ? 'Buyer' : 'Seller'}
              </p>
            </div>
            <div className="text-right">
              <div className="flex gap-1 mb-1">{renderStars(review.rating)}</div>
              <p className="text-xs text-gray-500">{review.createdAt}</p>
            </div>
          </div>
          <p className="text-gray-700">{review.comment}</p>
          {review.transactionType && (
            <span className="inline-block mt-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              {review.transactionType === 'sale' ? 'Sale' : 'Swap'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

