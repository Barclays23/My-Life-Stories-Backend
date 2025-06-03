
const mongoose = require('mongoose');
const { Schema } = mongoose;

const paymentsSchema = new Schema(
  {
    userId: {                      // Reference to the user who made the payment
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    bookId: {                      // Reference to the book being purchased
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true
    },
    amount: {                     // Payment amount in INR
      type: Number,
      required: true,
      min: 0
    },
    status: {                     // Payment status: 'pending', 'completed', 'failed'
      type: String,
      required: true,
      enum: ['Pending', 'Completed', 'Failed']
    },
    razorpayOrderId: {            // Razorpay order ID for transaction tracking
      type: String,
      required: true,
      trim: true
    },
    razorpayPaymentId: {          // Razorpay payment ID after successful payment
      type: String,
      trim: true
    }
  },
  {
    timestamps: true              // Adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model('Payment', paymentsSchema);
