
const mongoose = require('mongoose');
const { Schema } = mongoose;

const momentSchema = new Schema(
  {
    chapterRef: {                              // Reference to Chapters
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: true
    },

    momentTitle: {                        // e.g., "Moment 1: First Day"
      type: String,
      required: true,
      trim: true
    },
    
    momentNumber: {                      // 1, 2, 3... (auto-managed)
      type: Number,
      required: true,
      min: 1
    },
    
    momentContent: {                           // Story content (plain text or markdown)
      type: String,
      required: true,
      trim: true
    },

    momentImage: {
      type: String,
      required: false,
      trim: true
    },

    isVisible: {                        // toggle show or hide
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true // Automatically adds createdAt and updatedAt
  }
);

module.exports = mongoose.model('Moment', momentSchema);
