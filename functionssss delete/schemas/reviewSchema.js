const mongoose = require('mongoose');
const { Schema } = mongoose;

const reviewsSchema = new Schema(
  {
    bookRef: {                     // Reference to the book being reviewed
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true
    },
    userRef: {                     // Reference to the user who wrote the review
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {                      // Rating from 1 to 5
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    reviewText: {                 // Optional review content
      type: String,
      trim: true,
      maxlength: 1000
    }
  },
  {
    timestamps: true              // Adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model('Review', reviewsSchema);
