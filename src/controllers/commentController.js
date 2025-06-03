const { db, admin } = require('../config/firebaseAdmin');

exports.createComment = async (req, res) => {
  const { chapterId, commentText } = req.body;
  try {
    const commentRef = await db.collection('comments').add({
      chapterRef: chapterId,
      userRef: req.user.uid,
      commentText,
      adminReply: '',
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    });
    res.json({ id: commentRef.id, message: 'Comment created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create comment' });
  }
};

exports.addAdminReply = async (req, res) => {
  const { commentId, adminReply } = req.body;
  try {
    await db.collection('comments').doc(commentId).update({
      adminReply,
      updatedAt: admin.firestore.Timestamp.now()
    });
    res.json({ message: 'Admin reply added successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add admin reply' });
  }
};