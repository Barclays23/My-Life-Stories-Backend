const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function connectMongoDB() {
  try {
    await client.connect();
    console.log('Connected to my-life-stories MongoDB');
    return client.db('my-life-stories');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

module.exports = { connectMongoDB };


// --------------------------------------------------------


// const mongoose = require("mongoose");

// for local connection
// const connectMongoDB = async () => {
//     try {
//         await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/glitz_jewellery');
//         // await mongoose.connect(process.env.MONGO_URI as string);
//         console.log("MongoDB Connected!");

//     } catch (err) {
//         console.error("Database connection error:", err);
//         process.exit(1);
//     }
// };


