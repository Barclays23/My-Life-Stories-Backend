const { db, admin } = require('../config/firebaseAdmin');

exports.createReview = async (req, res) => {
  const { bookId, rating, reviewText } = req.body;
  try {
    const reviewRef = await db.collection('reviews').add({
      bookRef: bookId,
      userRef: req.user.uid,
      rating,
      reviewText,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    });

    // Update book's ratingAverage and ratingCount
    const reviewsSnapshot = await db.collection('reviews')
      .where('bookRef', '==', bookId)
      .get();
    const reviews = reviewsSnapshot.docs.map(doc => doc.data());
    const ratingAverage = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    await db.collection('books').doc(bookId).update({
      ratingAverage,
      ratingCount: reviews.length,
      updatedAt: admin.firestore.Timestamp.now()
    });

    res.json({ id: reviewRef.id, message: 'Review created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create review' });
  }
};

exports.deleteReview = async (req, res) => {
  const { reviewId, bookId } = req.body;
  try {
    await db.collection('reviews').doc(reviewId).delete();

    // Update book's ratingAverage and ratingCount
    const reviewsSnapshot = await db.collection('reviews')
      .where('bookRef', '==', bookId)
      .get();
    const reviews = reviewsSnapshot.docs.map(doc => doc.data());
    const ratingAverage = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;
    await db.collection('books').doc(bookId).update({
      ratingAverage,
      ratingCount: reviews.length,
      updatedAt: admin.firestore.Timestamp.now()
    });

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
};