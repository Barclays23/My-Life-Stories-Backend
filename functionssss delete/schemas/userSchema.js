const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userSchema = new Schema(
  {
    uid: {           // for firebase auth
      type: String,
      required: true,
      unique: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { 
        type: String, 
        // required: true 
    }, // Store hashed password
    name: { 
        type: String, 
        required: true, 
        trim: true 
    },
    isAdmin: { 
        type: Boolean, 
        default: false 
    },
    profilePicUrl: { 
        type: String, 
        trim: true 
    },
    bio: { 
        type: String, 
        trim: true, 
        maxlength: 500 
    },
    readingRef : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ReadingProgress',
    },
    readCount: { 
        type: Number, 
        default: 0, 
        min: 0 
    },
    reviewRef : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
    },
    notificationRef : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Notification',
    },
    isBlocked: { 
        type: Boolean, 
        default: false 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    },
  },
  {
    timestamps: true, // Automatically manages createdAt, updatedAt
  }
);


module.exports = mongoose.model('User', userSchema);