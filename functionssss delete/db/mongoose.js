const functions = require('firebase-functions');
const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });


const connectMongoDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  try {
    const mongooseConnection = await mongoose.connect(process.env.MONGODB_URI || functions.config().mongodb.uri);

    // mongooseConnection = mongoose.connection;
    console.log('Connected to MongoDB via Mongoose');
    return mongooseConnection;
    
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Failed to connect to MongoDB');
  }
};

// module.exports = { connectMongoDB };
module.exports = connectMongoDB;