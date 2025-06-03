const functions = require('firebase-functions');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const { viewSchema, toDate } = require('./schemas');

const db = getFirestore();

exports.fetchViews = functions.https.onRequest(async (req, res) => {
  try {
    const snapshot = await db.collection('views').get();
    const views = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: toDate(doc.data().timestamp)
    }));
    res.status(200).json({ status: 'success', data: views });
  } catch (error) {
    console.error('fetchViews - Error:', error);
    res.status(500).json({ error: 'Failed to fetch views' });
  }
});

exports.getViewById = functions.https.onRequest(async (req, res) => {
  try {
    const viewId = req.query.id;
    if (!viewId) {
      return res.status(400).json({ error: 'View ID is required' });
    }
    const doc = await db.collection('views').doc(viewId).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'View not found' });
    }
    const viewData = {
      id: doc.id,
      ...doc.data(),
      timestamp: toDate(doc.data().timestamp)
    };
    res.status(200).json({ status: 'success', data: viewData });
  } catch (error) {
    console.error('getViewById - Error:', error);
    res.status(500).json({ error: 'Failed to fetch view' });
  }
});

exports.addView = functions.https.onRequest(async (req, res) => {
  try {
    const viewData = req.body;
    if (!viewData.bookId) {
      return res.status(400).json({ error: 'Book ID is required' });
    }
    const newView = {
      ...viewSchema,
      bookId: viewData.bookId,
      userId: viewData.userId || '',
      timestamp: Timestamp.now()
    };
    const docRef = await db.collection('views').add(newView);
    res.status(201).json({ status: 'success', id: docRef.id });
  } catch (error) {
    console.error('addView - Error:', error);
    res.status(500).json({ error: 'Failed to add view' });
  }
});

exports.updateView = functions.https.onRequest(async (req, res) => {
  try {
    const viewId = req.body.id;
    const updates = req.body;
    if (!viewId) {
      return res.status(400).json({ error: 'View ID is required' });
    }
    const viewRef = db.collection('views').doc(viewId);
    const doc = await viewRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'View not found' });
    }
    const updatedData = {
      ...updates,
      timestamp: Timestamp.now()
    };
    delete updatedData.id;
    await viewRef.update(updatedData);
    res.status(200).json({ status: 'success', message: 'View updated' });
  } catch (error) {
    console.error('updateView - Error:', error);
    res.status(500).json({ error: 'Failed to update view' });
  }
});

exports.deleteView = functions.https.onRequest(async (req, res) => {
  try {
    const viewPersistentId = req.query.id;
    if (!viewId) {
      return res.status(400).json({ error: 'View ID is required' });
    }
    const viewRef = db.collection('views').doc(viewId);
    const doc = await viewRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'View not found' });
    }
    await viewRef.delete();
    res.status(200).json({ status: 'success', message: 'View deleted' });
  } catch (error) {
    console.error('deleteView - Error:', error);
    res.status(500).json({ error: 'Failed to delete view' });
  }
});