const functions = require('firebase-functions');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const { notificationSchema, toDate } = require('./schemas');

const db = getFirestore();

exports.fetchNotifications = functions.https.onRequest(async (req, res) => {
  try {
    const snapshot = await db.collection('notifications').get();
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: toDate(doc.data().createdAt)
    }));
    res.status(200).json({ status: 'success', data: notifications });
  } catch (error) {
    console.error('fetchNotifications - Error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

exports.getNotificationById = functions.https.onRequest(async (req, res) => {
  try {
    const notificationId = req.query.id;
    if (!notificationId) {
      return res.status(400).json({ error: 'Notification ID is required' });
    }
    const doc = await db.collection('notifications').doc(notificationId).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    const notificationData = {
      id: doc.id,
      ...doc.data(),
      createdAt: toDate(doc.data().createdAt)
    };
    res.status(200).json({ status: 'success', data: notificationData });
  } catch (error) {
    console.error('getNotificationById - Error:', error);
    res.status(500).json({ error: 'Failed to fetch notification' });
  }
});

exports.addNotification = functions.https.onRequest(async (req, res) => {
  try {
    const notificationData = req.body;
    if (!notificationData.receiverId || !notificationData.receiverType || !notificationData.type || !notificationData.message) {
      return res.status(400).json({ error: 'Receiver ID, receiver type, type, and message are required' });
    }
    const newNotification = {
      ...notificationSchema,
      receiverId: notificationData.receiverId,
      receiverType: notificationData.receiverType,
      type: notificationData.type,
      senderUserId: notificationData.senderUserId || '',
      bookId: notificationData.bookId || '',
      partId: notificationData.partId || '',
      storyId: notificationData.storyId || '',
      message: notificationData.message,
      link: notificationData.link || '',
      isRead: notificationData.isRead || false,
      createdAt: Timestamp.now()
    };
    const docRef = await db.collection('notifications').add(newNotification);
    res.status(201).json({ status: 'success', id: docRef.id });
  } catch (error) {
    console.error('addNotification - Error:', error);
    res.status(500).json({ error: 'Failed to add notification' });
  }
});

exports.updateNotification = functions.https.onRequest(async (req, res) => {
  try {
    const notificationId = req.body.id;
    const updates = req.body;
    if (!notificationId) {
      return res.status(400).json({ error: 'Notification ID is required' });
    }
    const notificationRef = db.collection('notifications').doc(notificationId);
    const doc = await notificationRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    const updatedData = { ...updates };
    delete updatedData.id;
    await notificationRef.update(updatedData);
    res.status(200).json({ status: 'success', message: 'Notification updated' });
  } catch (error) {
    console.error('updateNotification - Error:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

exports.deleteNotification = functions.https.onRequest(async (req, res) => {
  try {
    const notificationId = req.query.id;
    if (!notificationId) {
      return res.status(400).json({ error: 'Notification ID is required' });
    }
    const notificationRef = db.collection('notifications').doc(notificationId);
    const doc = await notificationRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    await notificationRef.delete();
    res.status(200).json({ status: 'success', message: 'Notification deleted' });
  } catch (error) {
    console.error('deleteNotification - Error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});