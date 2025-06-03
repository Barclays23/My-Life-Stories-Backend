const { onDocumentCreated, onDocumentUpdated, onDocumentDeleted } = require('firebase-functions/v2/firestore');
const Review = require('../schemas/reviewSchema');
const { connectMongoDB } = require('../db/mongoose');
// const { db } = require('./firebase');






exports.syncReviewCreated = onDocumentCreated('reviews/{reviewId}', async (event) => {
  try {
    await connectMongoDB();

    const reviewData = event.data.data();
    const id = event.params.reviewId;

    const review = new Review({
      id: id,
      userId: reviewData.userId,
      bookId: reviewData.bookId,
      rating: reviewData.rating,
      reviewText: reviewData.reviewText,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await review.save();

    return { status: 'success', message: 'Review synced to MongoDB' };
  } catch (error) {
    console.error('Error syncing review (create):', error);
    throw new Error('Failed to sync review');
  }
});

exports.syncReviewUpdated = onDocumentUpdated('reviews/{reviewId}', async (event) => {
  try {
    await connectMongoDB();

    const reviewData = event.data.after.data();
    const id = event.params.reviewId;

    await Review.updateOne(
      { id },
      {
        userId: reviewData.userId,
        bookId: reviewData.bookId,
        rating: reviewData.rating,
        reviewText: reviewData.reviewText,
        updatedAt: new Date(),
      }
    );

    return { status: 'success', message: 'Review updated in MongoDB' };
  } catch (error) {
    console.error('Error syncing review (update):', error);
    throw new Error('Failed to sync review');
  }
});

exports.syncReviewDeleted = onDocumentDeleted('reviews/{reviewId}', async (event) => {
  try {
    await connectMongoDB();

    const id = event.params.reviewId;
    await Review.deleteOne({ id });

    return { status: 'success', message: 'Review deleted from MongoDB' };
  } catch (error) {
    console.error('Error syncing review (delete):', error);
    throw new Error('Failed to sync review');
  }
});