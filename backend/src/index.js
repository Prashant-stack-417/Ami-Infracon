/**
 * Server Entry Point
 * Initializes database connection and starts the Express server
 */

import { app } from "./app.js";
import connectDB from "./db/index.js";

// Get the port number from environment variables (default 3802)
const port = process.env.PORT;

/**
 * Start the server
 * Connects to database first, then starts Express server
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start the Express server
    const server = app.listen(port, () => {
      console.log(`🚀 Server is running on http://localhost:${port}`);
      console.log(`📚 API Documentation: http://localhost:${port}/docs`);
      console.log(`🏥 Health Check: http://localhost:${port}/api/health`);
    });

    // Graceful handling for server errors (e.g., address in use)
    server.on("error", (err) => {
      if (err && err.code === "EADDRINUSE") {
        console.error(
          `❌ Port ${port} is already in use. Set a different PORT or stop the other process.`,
        );
        process.exit(1);
      }
      console.error("❌ Server error:", err);
      process.exit(1);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM signal received: closing HTTP server");
      server.close(() => {
        console.log("HTTP server closed");
      });
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
startServer();
