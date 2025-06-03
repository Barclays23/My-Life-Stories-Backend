const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });

// Initialize Firebase Admin
initializeApp();
const db = getFirestore();




// Import CRUD functions for each collection
const userFunctions = require('./lib/users');
const bookFunctions = require('./lib/books');
const chapterFunctions = require('./lib/chapters');
const momentFunctions = require('./lib/moments');
const heroFunctions = require('./lib/heroes');
const reviewFunctions = require('./lib/reviews');
const commentFunctions = require('./lib/comments');
const paymentFunctions = require('./lib/payments');
const notificationFunctions = require('./lib/notifications');
const readingProgressFunctions = require('./lib/readingProgress');
const viewFunctions = require('./lib/views');

// Export all functions
module.exports = {
  // Users
  fetchUsers: userFunctions.fetchUsers,
  getUserById: userFunctions.getUserById,
  addUser: userFunctions.addUser,
  updateUser: userFunctions.updateUser,
  deleteUser: userFunctions.deleteUser,

  // Books
  fetchBooks: bookFunctions.fetchBooks,
  getBookById: bookFunctions.getBookById,
  addBook: bookFunctions.addBook,
  updateBook: bookFunctions.updateBook,
  deleteBook: bookFunctions.deleteBook,

  // Chapters
  fetchChapters: chapterFunctions.fetchChapters,
  getChapterById: chapterFunctions.getChapterById,
  fetchChaptersByBookId: chapterFunctions.fetchChaptersByBookId,
  addChapter: chapterFunctions.addChapter,
  updateChapter: chapterFunctions.updateChapter,
  deleteChapter: chapterFunctions.deleteChapter,

  // Moments
  fetchMoments: momentFunctions.fetchMoments,
  getMomentById: momentFunctions.getMomentById,
  fetchMomentsByChapterId: momentFunctions.fetchMomentsByChapterId,
  addMoment: momentFunctions.addMoment,
  updateMoment: momentFunctions.updateMoment,
  deleteMoment: momentFunctions.deleteMoment,

  // Heroes
  fetchHeroes: heroFunctions.fetchHeroes,
  getHeroById: heroFunctions.getHeroById,
  addHero: heroFunctions.addHero,
  updateHero: heroFunctions.updateHero,
  deleteHero: heroFunctions.deleteHero,

  // Reviews
  fetchReviews: reviewFunctions.fetchReviews,
  getReviewById: reviewFunctions.getReviewById,
  fetchReviewsByBookId: reviewFunctions.fetchReviewsByBookId,
  addReview: reviewFunctions.addReview,
  updateReview: reviewFunctions.updateReview,
  deleteReview: reviewFunctions.deleteReview,

  // Comments
  fetchComments: commentFunctions.fetchComments,
  getCommentById: commentFunctions.getCommentById,
  fetchCommentsByChapterId: commentFunctions.fetchCommentsByChapterId,
  addComment: commentFunctions.addComment,
  updateComment: commentFunctions.updateComment,
  deleteComment: commentFunctions.deleteComment,

  // Payments
  fetchPayments: paymentFunctions.fetchPayments,
  getPaymentById: paymentFunctions.getPaymentById,
  fetchPaymentsByUserId: paymentFunctions.fetchPaymentsByUserId,
  addPayment: paymentFunctions.addPayment,
  updatePayment: paymentFunctions.updatePayment,
  deletePayment: paymentFunctions.deletePayment,

  // Notifications
  fetchNotifications: notificationFunctions.fetchNotifications,
  getNotificationById: notificationFunctions.getNotificationById,
  addNotification: notificationFunctions.addNotification,
  updateNotification: notificationFunctions.updateNotification,
  deleteNotification: notificationFunctions.deleteNotification,

  // ReadingProgress
  fetchReadingProgress: readingProgressFunctions.fetchReadingProgress,
  getReadingProgressById: readingProgressFunctions.getReadingProgressById,
  addReadingProgress: readingProgressFunctions.addReadingProgress,
  updateReadingProgress: readingProgressFunctions.updateReadingProgress,
  deleteReadingProgress: readingProgressFunctions.deleteReadingProgress,

  // Views
  fetchViews: viewFunctions.fetchViews,
  getViewById: viewFunctions.getViewById,
  addView: viewFunctions.addView,
  updateView: viewFunctions.updateView,
  deleteView: viewFunctions.deleteView
};