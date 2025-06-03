const NotificationSchema = {
  _id: ObjectId,
  receiverId: ObjectId,           // ID of user or admin receiving this notification
  receiverType: String,           // ['user', 'admin'],
  type: String,                   // 'new_comment', 'new_review', 'new_story', etc.
  senderUserId: ObjectId,         // Who triggered this (e.g., the commenter)
  bookId: ObjectId,               // Optional: related book
  partId: ObjectId,               // Optional: related part
  storyId: ObjectId,              // Optional: specific story
  message: String,                // Human-readable text
  link: String,                   // URL to go when clicked
  isRead: Boolean,                // Has the recipient read this?
  createdAt: Date
}
