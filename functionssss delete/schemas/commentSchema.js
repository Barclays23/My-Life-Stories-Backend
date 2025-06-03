const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentsSchema = new Schema(
  {
    chapterRef: {                // Reference to the chapter the comment belongs to
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: true
    },
    userRef: {                  // Reference to the user who wrote the comment
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    commentText: {             // The text content of the comment
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    adminReply: {              // Optional reply added by admin
      type: String,
      trim: true,
      maxlength: 1000,
      default: "Thank you so much for taking the time to leave a comment. It truly means a lot to us to hear from readers like you!"
    }
  },
  {
    timestamps: true           // Automatically adds createdAt and updatedAt
  }
);

module.exports = mongoose.model('Comment', commentsSchema);
