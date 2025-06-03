const functions = require('firebase-functions');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const { reviewSchema, toDate } = require('./schemas');

const db = getFirestore();

exports.fetchReviews = functions.https.onRequest(async (req, res) => {
  try {
    const snapshot = await db.collection('reviews').get();
    const reviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: toDate(doc.data().createdAt),
      updatedAt: toDate(doc.data().updatedAt)
    }));
    res.status(200).json({ status: 'success', data: reviews });
  } catch (error) {
    console.error('fetchReviews - Error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

exports.getReviewById = functions.https.onRequest(async (req, res) => {
  try {
    const reviewId = req.query.id;
    if (!reviewId) {
      return res.status(400).json({ error: 'Review ID is required' });
    }
    const doc = await db.collection('reviews').doc(reviewId).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Review not found' });
    }
    const reviewData = {
      id: doc.id,
      ...doc.data(),
      createdAt: toDate(doc.data().createdAt),
      updatedAt: toDate(doc.data().updatedAt)
    };
    res.status(200).json({ status: 'success', data: reviewData });
  } catch (error) {
    console.error('getReviewById - Error:', error);
    res.status(500).json({ error: 'Failed to fetch review' });
  }
});

exports.fetchReviewsByBookId = functions.https.onRequest(async (req, res) => {
  try {
    const bookId = req.query.bookId;
    if (!bookId) {
      return res.status(400).json({ error: 'Book ID is required' });
    }
    const snapshot = await db.collection('reviews').where('bookRef', '==', bookId).get();
    const reviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: toDate(doc.data().createdAt),
      updatedAt: toDate(doc.data().updatedAt)
    }));
    res.status(200).json({ status: 'success', data: reviews });
  } catch (error) {
    console.error('fetchReviewsByBookId - Error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews by book ID' });
  }
});

exports.addReview = functions.https.onRequest(async (req, res) => {
  try {
    const reviewData = req.body;
    if (!reviewData.bookRef || !reviewData.userRef || !reviewData.rating) {
      return res.status(400).json({ error: 'Book reference, user reference, and rating are required' });
    }
    const newReview = {
      ...reviewSchema,
      bookRef: reviewData.bookRef,
      userRef: reviewData.userRef,
      rating: reviewData.rating,
      reviewText: reviewData.reviewText || '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await db.collection('reviews').add(newReview);
    res.status(201).json({ status: 'success', id: docRef.id });
  } catch (error) {
    console.error('addReview - Error:', error);
    res.status(500).json({ error: 'Failed to add review' });
  }
});

exports.updateReview = functions.https.onRequest(async (req, res) => {
  try {
    const reviewId = req.body.id;
    const updates = req.body;
    if (!reviewId) {
      return res.status(400).json({ error: 'Review ID is required' });
    }
    const reviewRef = db.collection('reviews').doc(reviewId);
    const doc = await reviewRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Review not found' });
    }
    const updatedData = {
      ...updates,
      updatedAt: Timestamp.now()
    };
    delete updatedData.id;
    await reviewRef.update(updatedData);
    res.status(200).json({ status: 'success', message: 'Review updated' });
  } catch (error) {
    console.error('updateReview - Error:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

exports.deleteReview = functions.https.onRequest(async (req, res) => {
  try {
    const reviewId = req.query.id;
    if (!reviewId) {
      return res.status(400).json({ error: 'Review ID is required' });
    }
    const reviewRef = db.collection('reviews').doc(reviewId);
    const doc = await reviewRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Review not found' });
    }
    await reviewRef.delete();
    res.status(200).json({ status: 'success', message: 'Review deleted' });
  } catch (error) {
    console.error('deleteReview - Error:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});