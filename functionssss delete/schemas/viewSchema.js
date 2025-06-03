const ViewsSchema = {
  _id: ObjectId,
  bookId: ObjectId,
  userId: ObjectId,                 // Optional for guests
  timestamp: Date
};