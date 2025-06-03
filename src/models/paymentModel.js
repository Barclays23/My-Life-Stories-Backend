const paymentSchema = {
  userId: { type: 'string', required: true },
  bookId: { type: 'string', required: true },
  amount: { type: 'number', required: true },
  status: { type: 'string', required: true },
  razorpayOrderId: { type: 'string', required: true },
  razorpayPaymentId: { type: 'string', required: true },
  createdAt: { type: 'timestamp', required: true },
  updatedAt: { type: 'timestamp', required: true }
};

module.exports = paymentSchema;