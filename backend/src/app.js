// Import core dependencies
import express from "express"; // Express framework for building backend APIs
import cors from "cors"; // Middleware to handle Cross-Origin Resource Sharing
import cookieParser from "cookie-parser"; // Middleware to parse cookies
import { rateLimiter } from "express-rate-shield";
import swaggerUi from "swagger-ui-express";
const app = express();

// -------------------- rate-limiting --------------------

// Create a rate limiter instance
// windowMs: time window in milliseconds (here 15 minute)
// max: maximum number of requests allowed per IP in the time window
// message: response sent when user exceeds the limit
const limiter = new rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { error: "Too many requests, please try again later." },
});

// Apply rate limiter middleware to all routes
app.use(limiter.handler());

// -------------------- Middleware --------------------

// Enable CORS (Cross-Origin Resource Sharing)
// - origin: [] => define allowed domains (empty array = no domains allowed yet)
// - credentials: true => allow cookies to be sent with requests
app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));

// Parse incoming JSON requests with a body limit of 16kb
app.use(express.json({ limit: "16kb" }));

// Parse URL-encoded form data with a body limit of 16kb
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Serve static files from the "public" folder (e.g., images, CSS, JS)
app.use(express.static("public"));

// Parse cookies attached to incoming requests
app.use(cookieParser());

// -------------------- Routes --------------------

// Import your route definitions
import indexRouter from "./routes/index.route.js";
import healthCheckRouter from "./routes/healthCheck.route.js";
import usersRouter from "./routes/users.route.js";
import adminRouter from "./routes/admin.route.js";
import orderRouter from "./routes/order.route.js";
import productRouter from "./routes/product.route.js";
import { swaggerSpec } from "./swagger.config.js";

// Use the imported routes
app.use(indexRouter);
app.use("/api", healthCheckRouter);
app.use("/api/users", usersRouter);
app.use("/api/admin", adminRouter);
app.use("/api/order", orderRouter);
app.use("/api/products", productRouter);

// -------------------- api docs --------------------

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// -------------------- Export app --------------------

// Export the app instance for server startup or testing
export { app };
