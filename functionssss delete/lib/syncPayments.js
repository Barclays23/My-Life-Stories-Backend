const { onDocumentCreated, onDocumentUpdated, onDocumentDeleted } = require('firebase-functions/v2/firestore');
const Payment = require('../schemas/paymentSchema');
const { connectMongoDB } = require('../db/mongoose');
// const { db } = require('./firebase');





exports.syncPaymentCreated = onDocumentCreated('payments/{paymentId}', async (event) => {
  try {
    await connectMongoDB();

    const paymentData = event.data.data();
    const id = event.params.paymentId;

    const payment = new Payment({
      id: id,
      userId: paymentData.userId,
      bookId: paymentData.bookId,
      status: paymentData.status,
      amount: paymentData.amount,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await payment.save();

    return { status: 'success', message: 'Payment synced to MongoDB' };
  } catch (error) {
    console.error('Error syncing payment (create):', error);
    throw new Error('Failed to sync payment');
  }
});

exports.syncPaymentUpdated = onDocumentUpdated('payments/{paymentId}', async (event) => {
  try {
    await connectMongoDB();

    const paymentData = event.data.after.data();
    const id = event.params.paymentId;

    await Payment.updateOne(
      { id },
      {
        userId: paymentData.userId,
        bookId: paymentData.bookId,
        status: paymentData.status,
        amount: paymentData.amount,
        updatedAt: new Date(),
      }
    );

    return { status: 'success', message: 'Payment updated in MongoDB' };
  } catch (error) {
    console.error('Error syncing payment (update):', error);
    throw new Error('Failed to sync payment');
  }
});

exports.syncPaymentDeleted = onDocumentDeleted('payments/{paymentId}', async (event) => {
  try {
    await connectMongoDB();

    const id = event.params.paymentId;
    await Payment.deleteOne({ id });

    return { status: 'success', message: 'Payment deleted from MongoDB' };
  } catch (error) {
    console.error('Error syncing payment (delete):', error);
    throw new Error('Failed to sync payment');
  }
});