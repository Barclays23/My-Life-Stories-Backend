const userSchema = {
  uid: { type: 'string', required: true },
  email: { type: 'string', required: true },
  password: { type: 'string', required: true },
  name: { type: 'string', required: true },
  isAdmin: { type: 'boolean', default: false },
  profilePicUrl: { type: 'string', default: '' },
  bio: { type: 'string', default: '' },
  readingRef: { type: 'string', default: '' },
  readCount: { type: 'number', default: 0 },
  reviewRef: { type: 'string', default: '' },
  notificationRef: { type: 'string', default: '' },
  isBlocked: { type: 'boolean', default: false },
  createdAt: { type: 'timestamp', required: true },
  updatedAt: { type: 'timestamp', required: true }
};

module.exports = userSchema;