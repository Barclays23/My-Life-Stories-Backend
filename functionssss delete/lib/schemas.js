const { Timestamp } = require('firebase-admin/firestore');

// Helper function to convert Firestore Timestamp to Date
const toDate = (timestamp) => timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;

// Users Schema
const userSchema = {
  uid: String, // Firebase Auth UID or _id
  email: String,
  password: String,
  name: String,
  isAdmin: Boolean,
  profilePicUrl: String,
  bio: String,
  readingRef: String, // Firestore document ID (readingProgress collection)
  readCount: Number,
  reviewRef: String, // Firestore document ID (reviews collection)
  notificationRef: String, // Firestore document ID (notifications collection)
  isBlocked: Boolean,
  createdAt: Timestamp,
  updatedAt: Timestamp
};

// Books Schema
const bookSchema = {
  title: String,
  englishTitle: String,
  tagline: String,
  blurb: String,
  coverImage: String,
  genre: [String],
  language: String,  // English & Malayalam
  releaseStatus: String, // 'Coming Soon' if published in recent weeks/days, 'New Release', if long ago or certain period, change to 'Published', if not published, 'Draft' etc..
  publicationDate: Timestamp,
  accessType: String,    // 'Free', 'Paid', 'Premium', 'Subscription' (give the options now. lets decide user permissions later)
  price: Number,    // 0 if free
  isPublished: Boolean,
  viewCount: Number,
  ratingAverage: Number,    // out of 5
  ratingCount: Number,
  createdAt: Timestamp,
  updatedAt: Timestamp
};

// Chapters Schema
const chapterSchema = {
  bookRef: String, // Firestore document ID (books collection)
  chapterTitle: String,
  chapterNumber: Number,    // 1, 2, 3...
  isPublished: Boolean,
  createdAt: Timestamp,
  updatedAt: Timestamp
};

// Moments Schema
const momentSchema = {
  chapterRef: String, // Firestore document ID (chapters collection)
  momentTitle: String,
  momentNumber: Number,     // 1, 2, 3...
  content: String,
  isVisible: Boolean,   // to show or hide
  createdAt: Timestamp,
  updatedAt: Timestamp
};

// Heroes Schema
const heroSchema = {
  title: String,
  subtitle: String,
  description: String,
  imageUrl: String,
  buttonText: String,
  buttonLink: String,
  createdAt: Timestamp,
  updatedAt: Timestamp
};

// Reviews Schema
const reviewSchema = {
  bookRef: String, // Firestore document ID (books collection)
  userRef: String, // Firestore document ID (users collection)
  rating: Number,
  reviewText: String,
  createdAt: Timestamp,
  updatedAt: Timestamp
};

// Comments Schema
const commentSchema = {
  chapterRef: String, // Firestore document ID (chapters collection)
  userRef: String, // Firestore document ID (users collection)
  commentText: String,
  adminReply: String,
  createdAt: Timestamp,
  updatedAt: Timestamp
};

// Payments Schema
const paymentSchema = {
  userId: String, // Firestore document ID (users collection)
  bookId: String, // Firestore document ID (books collection)
  amount: Number,
  status: String,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  createdAt: Timestamp,
  updatedAt: Timestamp
};

// Notifications Schema
const notificationSchema = {
  receiverId: String, // Firestore document ID (users collection)
  receiverType: String,
  type: String,
  senderUserId: String, // Firestore document ID (users collection)
  bookId: String, // Firestore document ID (books collection)
  partId: String, // Firestore document ID (chapters collection)
  storyId: String, // Firestore document ID (moments collection)
  message: String,
  link: String,
  isRead: Boolean,
  createdAt: Timestamp
};

// ReadingProgress Schema
const readingProgressSchema = {
  userId: String, // Firestore document ID (users collection)
  bookId: String, // Firestore document ID (books collection)
  lastReadChapterId: String, // Firestore document ID (chapters collection)
  lastReadMomentId: String, // Firestore document ID (moments collection)
  completedMomentIds: [String], // Array of Firestore document IDs (moments collection)
  lastReadAt: Timestamp
};

// Views Schema
const viewSchema = {
  bookId: String, // Firestore document ID (books collection)
  userId: String, // Firestore document ID (users collection), optional for guests
  timestamp: Timestamp
};

module.exports = {
  userSchema,
  bookSchema,
  chapterSchema,
  momentSchema,
  heroSchema,
  reviewSchema,
  commentSchema,
  paymentSchema,
  notificationSchema,
  readingProgressSchema,
  viewSchema,
  toDate
};