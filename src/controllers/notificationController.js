const { db, admin } = require('../config/firebaseAdmin');

exports.createNotification = async (req, res) => {
  const { receiverId, receiverType, type, bookId, partId, storyId, message, link } = req.body;
  try {
    const notificationRef = await db.collection('notifications').add({
      receiverId,
      receiverType,
      type,
      senderUserId: req.user.uid,
      bookId: bookId || '',
      partId: partId || '',
      storyId: storyId || '',
      message,
      link,
      isRead: false,
      createdAt: admin.firestore.Timestamp.now()
    });
    res.json({ id: notificationRef.id, message: 'Notification created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create notification' });
  }
};

exports.markAsRead = async (req, res) => {
  const { notificationId } = req.body;
  try {
    await db.collection('notifications').doc(notificationId).update({
      isRead: true
    });
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};