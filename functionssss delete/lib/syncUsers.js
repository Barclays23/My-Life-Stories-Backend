const { onDocumentCreated, onDocumentUpdated, onDocumentDeleted } = require('firebase-functions/v2/firestore');
const bcrypt = require('bcrypt');
const User = require('../schemas/userSchema');
const connectMongoDB = require('../db/mongoose');

exports.syncUserCreated = onDocumentCreated('users/{userId}', async (event) => {
  console.log('syncUserCreated - Received event:', JSON.stringify(event, null, 2));

  try {
    if (!event.data) {
      throw new Error('Event data is undefined');
    }

    const userData = event.data.data();
    const uid = event.params.userId;

    console.log('syncUserCreated - User ID:', uid);
    console.log('syncUserCreated - User Data:', userData);

    if (!uid || !userData) {
      throw new Error('Missing uid or user data');
    }

    const { email, name, photoURL, isAdmin, mobile } = userData;

    if (!email) {
      throw new Error('Missing email');
    }

    await connectMongoDB();

    let existingUser = await User.findOne({ uid });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('firebase_managed_' + uid, 10);

      const newUser = new User({
        _id: uid,
        uid: uid,
        email: email,
        password: hashedPassword,
        name: name || email.split('@')[0],
        profilePicUrl: photoURL || '',
        mobile: mobile || '',
        isAdmin: isAdmin || false,
        isBlocked: false,
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await newUser.save();
      console.log(`syncUserCreated - User ${uid} synced to MongoDB`);
    } else {
      console.log(`syncUserCreated - User ${uid} already exists in MongoDB`);
    }

    return { status: 'success', message: 'User synced to MongoDB' };
  } catch (error) {
    console.error('syncUserCreated - Error:', error);
    throw new Error(`Failed to sync user: ${error.message}`);
  }
});

exports.syncUserUpdated = onDocumentUpdated('users/{userId}', async (event) => {
  console.log('syncUserUpdated - Received event:', JSON.stringify(event, null, 2));

  try {
    const userData = event.data.after.data();
    const uid = event.params.userId;

    console.log('syncUserUpdated - User ID:', uid);
    console.log('syncUserUpdated - Updated User Data:', userData);

    if (!uid || !userData) {
      throw new Error('Missing uid or user data');
    }

    const { email, name, photoURL, isAdmin, mobile } = userData;

    if (!email) {
      throw new Error('Missing email');
    }

    await connectMongoDB();

    const user = await User.findOne({ uid });
    if (user) {
      user.email = email;
      user.name = name || user.name;
      user.profilePicUrl = photoURL || user.profilePicUrl;
      user.mobile = mobile || user.mobile;
      user.isAdmin = isAdmin !== undefined ? isAdmin : user.isAdmin;
      user.lastLogin = new Date();
      user.updatedAt = new Date();
      await user.save();
      console.log(`syncUserUpdated - User ${uid} updated in MongoDB`);
    } else {
      console.log(`syncUserUpdated - User ${uid} not found in MongoDB`);
    }

    return { status: 'success', message: 'User updated in MongoDB' };
  } catch (error) {
    console.error('syncUserUpdated - Error:', error);
    throw new Error(`Failed to sync user: ${error.message}`);
  }
});

exports.syncUserDeleted = onDocumentDeleted('users/{userId}', async (event) => {
  console.log('syncUserDeleted - Received event:', JSON.stringify(event, null, 2));

  try {
    const uid = event.params.userId;

    console.log('syncUserDeleted - User ID:', uid);

    if (!uid) {
      throw new Error('Missing uid');
    }

    await connectMongoDB();

    const result = await User.deleteOne({ uid });
    if (result.deletedCount > 0) {
      console.log(`syncUserDeleted - User ${uid} deleted from MongoDB`);
    } else {
      console.log(`syncUserDeleted - User ${uid} not found in MongoDB`);
    }

    return { status: 'success', message: 'User deleted from MongoDB' };
  } catch (error) {
    console.error('syncUserDeleted - Error:', error);
    throw new Error(`Failed to sync user: ${error.message}`);
  }
});