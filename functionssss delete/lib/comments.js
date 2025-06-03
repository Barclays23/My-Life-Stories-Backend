const functions = require('firebase-functions');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const { commentSchema, toDate } = require('./schemas');

const db = getFirestore();

exports.fetchComments = functions.https.onRequest(async (req, res) => {
  try {
    const snapshot = await db.collection('comments').get();
    const comments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: toDate(doc.data().createdAt),
      updatedAt: toDate(doc.data().updatedAt)
    }));
    res.status(200).json({ status: 'success', data: comments });
  } catch (error) {
    console.error('fetchComments - Error:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

exports.getCommentById = functions.https.onRequest(async (req, res) => {
  try {
    const commentId = req.query.id;
    if (!commentId) {
      return res.status(400).json({ error: 'Comment ID is required' });
    }
    const doc = await db.collection('comments').doc(commentId).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    const commentData = {
      id: doc.id,
      ...doc.data(),
      createdAt: toDate(doc.data().createdAt),
      updatedAt: toDate(doc.data().updatedAt)
    };
    res.status(200).json({ status: 'success', data: commentData });
  } catch (error) {
    console.error('getCommentById - Error:', error);
    res.status(500).json({ error: 'Failed to fetch comment' });
  }
});

exports.fetchCommentsByChapterId = functions.https.onRequest(async (req, res) => {
  try {
    const chapterId = req.query.chapterId;
    if (!chapterId) {
      return res.status(400).json({ error: 'Chapter ID is required' });
    }
    const snapshot = await db.collection('comments').where('chapterRef', '==', chapterId).get();
    const comments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: toDate(doc.data().createdAt),
      updatedAt: toDate(doc.data().updatedAt)
    }));
    res.status(200).json({ status: 'success', data: comments });
  } catch (error) {
    console.error('fetchCommentsByChapterId - Error:', error);
    res.status(500).json({ error: 'Failed to fetch comments by chapter ID' });
  }
});

exports.addComment = functions.https.onRequest(async (req, res) => {
  try {
    const commentData = req.body;
    if (!commentData.chapterRef || !commentData.userRef || !commentData.commentText) {
      return res.status(400).json({ error: 'Chapter reference, user reference, and comment text are required' });
    }
    const newComment = {
      ...commentSchema,
      chapterRef: commentData.chapterRef,
      userRef: commentData.userRef,
      commentText: commentData.commentText,
      adminReply: commentData.adminReply || 'Thank you so much for taking the time to leave a comment. It truly means a lot to us to hear from readers like you!',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    const docRef = await db.collection('comments').add(newComment);
    res.status(201).json({ status: 'success', id: docRef.id });
  } catch (error) {
    console.error('addComment - Error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

exports.updateComment = functions.https.onRequest(async (req, res) => {
  try {
    const commentId = req.body.id;
    const updates = req.body;
    if (!commentId) {
      return res.status(400).json({ error: 'Comment ID is required' });
    }
    const commentRef = db.collection('comments').doc(commentId);
    const doc = await commentRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    const updatedData = {
      ...updates,
      updatedAt: Timestamp.now()
    };
    delete updatedData.id;
    await commentRef.update(updatedData);
    res.status(200).json({ status: 'success', message: 'Comment updated' });
  } catch (error) {
    console.error('updateComment - Error:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
});

exports.deleteComment = functions.https.onRequest(async (req, res) => {
  try {
    const commentId = req.query.id;
    if (!commentId) {
      return res.status(400).json({ error: 'Comment ID is required' });
    }
    const commentRef = db.collection('comments').doc(commentId);
    const doc = await commentRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    await commentRef.delete();
    res.status(200).json({ status: 'success', message: 'Comment deleted' });
  } catch (error) {
    console.error('deleteComment - Error:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});