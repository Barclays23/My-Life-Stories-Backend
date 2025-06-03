const commentSchema = {
  chapterRef: { type: 'string', required: true },
  userRef: { type: 'string', required: true },
  commentText: { type: 'string', required: true },
  adminReply: { type: 'string', default: '' },
  createdAt: { type: 'timestamp', required: true },
  updatedAt: { type: 'timestamp', required: true }
};

module.exports = commentSchema;