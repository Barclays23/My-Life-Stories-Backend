const { onDocumentCreated, onDocumentUpdated, onDocumentDeleted } = require('firebase-functions/v2/firestore');
const Moment = require('../schemas/momentSchema');
const { connectMongoDB } = require('../db/mongoose');
// const { db } = require('./firebase');





exports.syncMomentCreated = onDocumentCreated('moments/{momentId}', async (event) => {
  try {
    await connectMongoDB();

    const momentData = event.data.data();
    const id = event.params.momentId;

    const moment = new Moment({
      id: id,
      chapterId: momentData.chapterId,
      content: momentData.content,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await moment.save();

    return { status: 'success', message: 'Moment synced to MongoDB' };
  } catch (error) {
    console.error('Error syncing moment (create):', error);
    throw new Error('Failed to sync moment');
  }
});

exports.syncMomentUpdated = onDocumentUpdated('moments/{momentId}', async (event) => {
  try {
    await connectMongoDB();

    const momentData = event.data.after.data();
    const id = event.params.momentId;

    await Moment.updateOne(
      { id },
      {
        chapterId: momentData.chapterId,
        content: momentData.content,
        updatedAt: new Date(),
      }
    );

    return { status: 'success', message: 'Moment updated in MongoDB' };
  } catch (error) {
    console.error('Error syncing moment (update):', error);
    throw new Error('Failed to sync moment');
  }
});

exports.syncMomentDeleted = onDocumentDeleted('moments/{momentId}', async (event) => {
  try {
    await connectMongoDB();

    const id = event.params.momentId;
    await Moment.deleteOne({ id });

    return { status: 'success', message: 'Moment deleted from MongoDB' };
  } catch (error) {
    console.error('Error syncing moment (delete):', error);
    throw new Error('Failed to sync moment');
  }
});