const { db, admin } = require('../config/firebaseAdmin');

exports.updateReadingProgress = async (req, res) => {
  const { bookId, lastReadChapterId, lastReadMomentId, completedMomentId } = req.body;
  try {
    const progressSnapshot = await db.collection('readingProgress')
      .where('userId', '==', req.user.uid)
      .where('bookId', '==', bookId)
      .get();

    let completedMomentIds = [];
    if (!progressSnapshot.empty) {
      const progressDoc = progressSnapshot.docs[0];
      completedMomentIds = progressDoc.data().completedMomentIds || [];
      if (completedMomentId && !completedMomentIds.includes(completedMomentId)) {
        completedMomentIds.push(completedMomentId);
      }
      await progressDoc.ref.update({
        lastReadChapterId,
        lastReadMomentId,
        completedMomentIds,
        lastReadAt: admin.firestore.Timestamp.now()
      });
    } else {
      if (completedMomentId) completedMomentIds = [completedMomentId];
      await db.collection('readingProgress').add({
        userId: req.user.uid,
        bookId,
        lastReadChapterId,
        lastReadMomentId,
        completedMomentIds,
        lastReadAt: admin.firestore.Timestamp.now()
      });
    }

    res.json({ message: 'Reading progress updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update reading progress' });
  }
};