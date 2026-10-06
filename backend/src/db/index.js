/**
 * Database Connection
 * MongoDB connection setup using Mongoose
 * @module db
 */

import mongoose from "mongoose";

/**
 * Connect to MongoDB database
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    const options = {
      // Set server selection timeout
      serverSelectionTimeoutMS: 5000,
      // Set socket timeout
      socketTimeoutMS: 45000,
    };

    const conn = await mongoose.connect(mongoURI, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    // Migration: drop legacy unique phone index if it exists
    try {
      const db = conn.connection.db;
      const collections = await db.listCollections({ name: 'users' }).toArray();
      if (collections.length > 0) {
        const indexes = await db.collection('users').indexes();
        const hasPhoneIndex = indexes.some(idx => idx.name === 'phone_1');
        if (hasPhoneIndex) {
          await db.collection('users').dropIndex('phone_1');
          console.log("✅ Dropped legacy 'phone_1' unique index from 'users' collection");
        }
      }
    } catch (err) {
      console.warn("⚠️ Failed to check/drop legacy phone index:", err.message);
    }

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️  MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("✅ MongoDB reconnected");
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("MongoDB connection closed through app termination");
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    console.error(
      "💡 Make sure MongoDB is running and the connection string is correct",
    );
    process.exit(1);
  }
};

export default connectDB;
