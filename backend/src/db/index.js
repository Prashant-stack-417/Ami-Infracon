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

    // Seed sample products if none exist
    try {
      const Product = (await import("../models/Product.model.js")).default;
      const count = await Product.countDocuments();
      if (count === 0) {
        await Product.create([
          {
            name: "Architect Chemical - Premium",
            description:
              "High-strength construction chemical for bonding and waterproofing.",
            price: 1499,
            currency: "INR",
            sku: "AC-PRE-001",
            image: "",
          },
          {
            name: "Architect Chemical - Standard",
            description:
              "Cost-effective chemical suitable for general construction use.",
            price: 999,
            currency: "INR",
            sku: "AC-STD-001",
            image: "",
          },
        ]);
        console.log("🛍️  Seeded sample products");
      }
    } catch (seedingError) {
      console.warn("Could not seed products:", seedingError.message);
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
