
const mongoose = require('mongoose');
const { Schema } = mongoose;

const heroSchema = new Schema(
  {
    title: {                     // e.g., "From Gold to Code"
      type: String,
      required: true,
      trim: true
    },
    subtitle: {                 // My Journey to the IT Field
      type: String,
      trim: true
    },
    description: {             // Any detail or description in the banner
      type: String, 
      required: false
    },
    imageUrl: {                 // URL of the hero image
      type: String,
      required: true,
      trim: true
    },
    buttonText: {               // e.g., "Explore Stories"
      type: String,
      trim: true
    },
    buttonLink: {               // e.g., "/stories"
      type: String,
      trim: true
    }
  },
  {
    timestamps: true // Adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model('Hero', heroSchema);
