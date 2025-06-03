const { db, admin } = require('../config/firebaseAdmin');



exports.createMoment = async (req, res) => {
  const { chapterId, momentTitle, content } = req.body;
  try {
    const momentsSnapshot = await db.collection('moments')
      .where('chapterRef', '==', chapterId)
      .get();
    const momentNumber = momentsSnapshot.size + 1;

    const momentRef = await db.collection('moments').add({
      chapterRef: chapterId,
      momentTitle,
      momentNumber,
      content,
      isVisible: true,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now()
    });
    res.json({ id: momentRef.id, message: 'Moment created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create moment' });
  }
};

exports.deleteMoment = async (req, res) => {
  const { momentId, chapterId, momentNumber } = req.body;
  try {
    await db.collection('moments').doc(momentId).delete();
    const remainingMomentsSnapshot = await db.collection('moments')
      .where('chapterRef', '==', chapterId)
      .get();
    const batch = db.batch();
    remainingMomentsSnapshot.forEach(doc => {
      const moment = doc.data();
      if (moment.momentNumber > momentNumber) {
        batch.update(doc.ref, { momentNumber: moment.momentNumber - 1 });
      }
    });
    await batch.commit();

    res.json({ message: 'Moment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete moment' });
  }
};