const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chapterSchema = new Schema(
  {
    bookRef: {                               // Reference to Books
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true
    },

    chapterTitle: {             // e.g., "Chapter 1: The Beginning"
      type: String,
      required: true,
      trim: true
    },

    chapterNumber: {        // 1, 2, 3... (auto-managed)
      type: Number,
      required: true,
      min: 1
    },

    momentCount: {               // Number of moments in the chapter
      type: Number,
      default: 0,
      min: 0
    },

    isPublished: {         // to show or hide the chapter
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt
  }
);

module.exports = mongoose.model('Chapter', chapterSchema);
