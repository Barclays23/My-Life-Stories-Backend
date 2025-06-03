
const mongoose = require('mongoose');
const { Schema } = mongoose;


const bookSchema = new Schema(
  {
    // Auto-generated _id (ObjectId) is created by MongoDB

    title: {
      type: String,
      required: true,
      trim: true
    },

    englishTitle: {         // converting the book title to English if it is Malayalam.
      type: String,
      trim: true,
      lowercase: true,
      unique: true
    },

    slug: {              // for friendly URL paths if using title as paths. eg: books/ente-katha
      type: String,
      // trim: true,
    },

    tagline: {              // Optional, e.g., "From Gold to Code", "A journey through coding adventures"
      type: String,
      trim: true,
      maxlength: 150
    },

    blurb: {               // Summary, e.g., "The summary of the book".
      type: String,
      trim: true,
      maxlength: 2000
    },

    coverImage: {
      type: String,
      trim: true
    },

    genre: [
      {
        type: String,
        enum: ['Memoir', 'Travel', 'Story', 'History', 'Poetry', 'Fiction', 'Non-Fiction', 'Sports', 'Romance', 'Spiritual', 'Articles']
      }
    ],

    language: {
      type: String,
      enum: ['English', 'Malayalam'],
      required: true
    },

    releaseStatus: {
      type: String,
      enum: ['Draft', 'Coming Soon', 'New Release', 'Published', 'Temporarily Unavailable'],
      // Temporarily Unavailable (if book isPublished & without any moments in it.)
      default: 'Draft'
    },

    publicationDate: {       // Set when publishing
      type: Date
    },

    accessType: {
      type: String,
      enum: ['Free', 'Paid'],
      default: 'Free'
    },

    price: {
      type: Number,
      default: 0,
      // min: 0,
      // If you want to force a price when Paid, uncomment the validator below
      // validate: {
      //   validator() { return this.accessType === 'Free' ? this.price === 0 : this.price > 0; },
      //   message: 'Paid books must have a price greater than 0'
      // }
    },

    isPublished: {
      type: Boolean,
      default: false
    },

    chapterCount: {               // Number of chapters in the book
      type: Number,
      default: 0,
      min: 0
    },

    momentCount: {               // Number of moments inside all chapters in the book
      type: Number,
      default: 0,
      min: 0
    },

    viewCount: {
      type: Number,
      default: 0,
      min: 0
    },

    ratingAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      set: v => Math.round(v * 10) / 10 // round to 1 decimal place
    },

    ratingCount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true // adds createdAt & updatedAt
  }
);

/**
 * Optional indexes
 * You already have a unique index on englishTitle via the field definition,
 * but you can add compound or text indexes as needed:
 */
// bookSchema.index({ title: 'text', tagline: 'text', blurb: 'text' });

module.exports = mongoose.model('Book', bookSchema);
