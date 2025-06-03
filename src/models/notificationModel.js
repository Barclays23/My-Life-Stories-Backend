const notificationSchema = {
  receiverId: { type: 'string', required: true },
  receiverType: { type: 'string', required: true },
  type: { type: 'string', required: true },
  senderUserId: { type: 'string', required: true },
  bookId: { type: 'string', default: '' },
  partId: { type: 'string', default: '' },
  storyId: { type: 'string', default: '' },
  message: { type: 'string', required: true },
  link: { type: 'string', required: true },
  isRead: { type: 'boolean', default: false },
  createdAt: { type: 'timestamp', required: true }
};

module.exports = notificationSchema;