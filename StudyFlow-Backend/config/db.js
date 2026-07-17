const mongoose = require('mongoose');

/**
 * Connects to MongoDB using the connection string in MONGO_URI.
 *
 * This runs once when the server starts (see server.js). If the URI is
 * missing or the connection fails, we log a clear message and exit —
 * there's no point running an API that has no database to talk to.
 */
async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error(
      'Missing MONGO_URI. Create a .env file in the project root (copy .env.example) ' +
      'and set MONGO_URI to your MongoDB Atlas connection string.'
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000 // fail fast instead of hanging for the 30s default
    });
    console.log('MongoDB connected successfully.');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;