const reviewSchema = {
  bookRef: { type: 'string', required: true },
  userRef: { type: 'string', required: true },
  rating: { type: 'number', required: true },
  reviewText: { type: 'string', required: true },
  createdAt: { type: 'timestamp', required: true },
  updatedAt: { type: 'timestamp', required: true }
};

module.exports = reviewSchema;