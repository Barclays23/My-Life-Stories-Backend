const functions = require('firebase-functions');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const { paymentSchema, toDate } = require('./schemas');

const db = getFirestore();

exports.fetchPayments = functions.https.onRequest(async (req, res) => {
  try {
    const snapshot = await db.collection('payments').get();
    const payments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: toDate(doc.data().createdAt),
      updatedAt: toDate(doc.data().updatedAt)
    }));
    res.status(200).json({ status: 'success', data: payments });
  } catch (error) {
    console.error('fetchPayments - Error:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

exports.getPaymentById = functions.https.onRequest(async (req, res) => {
  try {
    const paymentId = req.query.id;
    if (!paymentId) {
      return res.status(400).json({ error: 'Payment ID is required' });
    }
    const doc = await db.collection('payments').doc(paymentId).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    const paymentData = {
      id: doc.id,
      ...doc.data(),
      createdAt: toDate(doc.data().createdAt),
      updatedAt: toDate(doc.data().updatedAt)
    };
    res.status(200).json({ status: 'success', data: paymentData });
  } catch (error) {
    console.error('getPaymentById - Error:', error);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
});

exports.fetchPaymentsByUserId = functions.https.onRequest(async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    const snapshot = await db.collection('payments').where('userId', '==', userId).get();
    const payments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: toDate(doc.data().createdAt),
      updatedAt: toDate(doc.data().updatedAt)
    }));
    res.status(200).json({ status: 'success', data: payments });
  } catch (error) {
    console.error('fetchPaymentsByUserId - Error:', error);
    res.status(500).json({ error: 'Failed to fetch payments by user ID' });
  }
});

exports.addPayment = functions.https.onRequest(async (req, res) => {
  try {
    const paymentData = req.body;
    if (!paymentData.userId || !paymentData.bookId || !paymentData.amount || !paymentData.status || !paymentData.razorpayOrderId) {
      return res.status(400).json({ error: 'User ID, book ID, amount, status, and Razorpay order ID are required' });
    }
    const newPayment = {
      ...paymentSchema,
      userId: paymentData.userId,
      bookId: paymentData.bookId,
      amount: paymentData.amount,
      status: paymentData.status,
      razorpayOrderId: paymentData.razorpayOrderId,
      razorpayPaymentId: paymentData.razorpayPaymentId || '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await db.collection('payments').add(newPayment);
    res.status(201).json({ status: 'success', id: docRef.id });
  } catch (error) {
    console.error('addPayment - Error:', error);
    res.status(500).json({ error: 'Failed to add payment' });
  }
});

exports.updatePayment = functions.https.onRequest(async (req, res) => {
  try {
    const paymentId = req.body.id;
    const updates = req.body;
    if (!paymentId) {
      return res.status(400).json({ error: 'Payment ID is required' });
    }
    const paymentRef = db.collection('payments').doc(paymentId);
    const doc = await paymentRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    const updatedData = {
      ...updates,
      updatedAt: Timestamp.now()
    };
    delete updatedData.id;
    await paymentRef.update(updatedData);
    res.status(200).json({ status: 'success', message: 'Payment updated' });
  } catch (error) {
    console.error('updatePayment - Error:', error);
    res.status(500).json({ error: 'Failed to update payment' });
  }
});

exports.deletePayment = functions.https.onRequest(async (req, res) => {
  try {
    const paymentId = req.query.id;
    if (!paymentId) {
      return res.status(400).json({ error: 'Payment ID is required' });
    }
    const paymentRef = db.collection('payments').doc(paymentId);
    const doc = await paymentRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    await paymentRef.delete();
    res.status(200).json({ status: 'success', message: 'Payment deleted' });
  } catch (error) {
    console.error('deletePayment - Error:', error);
    res.status(500).json({ error: 'Failed to delete payment' });
  }
});