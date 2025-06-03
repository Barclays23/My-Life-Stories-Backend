const { onDocumentCreated, onDocumentUpdated, onDocumentDeleted } = require('firebase-functions/v2/firestore');
const Comment = require('../schemas/commentSchema');
const { connectMongoDB } = require('../db/mongoose');
// const { db } = require('./firebase');




exports.syncCommentCreated = onDocumentCreated('comments/{commentId}', async (event) => {
  try {
    await connectMongoDB();

    const commentData = event.data.data();
    const id = event.params.commentId;

    const comment = new Comment({
      id: id,
      userId: commentData.userId,
      chapterId: commentData.chapterId,
      commentText: commentData.commentText,
      adminReply: commentData.adminReply,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await comment.save();

    return { status: 'success', message: 'Comment synced to MongoDB' };
  } catch (error) {
    console.error('Error syncing comment (create):', error);
    throw new Error('Failed to sync comment');
  }
});

exports.syncCommentUpdated = onDocumentUpdated('comments/{commentId}', async (event) => {
  try {
    await connectMongoDB();

    const commentData = event.data.after.data();
    const id = event.params.commentId;

    await Comment.updateOne(
      { id },
      {
        userId: commentData.userId,
        chapterId: commentData.chapterId,
        commentText: commentData.commentText,
        adminReply: commentData.adminReply,
        updatedAt: new Date(),
      }
    );

    return { status: 'success', message: 'Comment updated in MongoDB' };
  } catch (error) {
    console.error('Error syncing comment (update):', error);
    throw new Error('Failed to sync comment');
  }
});

exports.syncCommentDeleted = onDocumentDeleted('comments/{commentId}', async (event) => {
  try {
    await connectMongoDB();

    const id = event.params.commentId;
    await Comment.deleteOne({ id });

    return { status: 'success', message: 'Comment deleted from MongoDB' };
  } catch (error) {
    console.error('Error syncing comment (delete):', error);
    throw new Error('Failed to sync comment');
  }
});