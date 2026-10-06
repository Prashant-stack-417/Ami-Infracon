import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";

const app = express();

// ── Security & Logging ──
app.use(helmet({ crossOriginResourcePolicy: false })); // Allow cross-origin images
if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

// ── Rate Limiting ──
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use(limiter);

// ── CORS ──
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(cors({ origin: allowedOrigins, credentials: true }));

// ── Body Parsing ──
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
// Serve uploaded files with nosniff to prevent MIME-type sniffing attacks
app.use("/uploads", (req, res, next) => {
  res.set("X-Content-Type-Options", "nosniff");
  next();
});
app.use(express.static("public", { maxAge: "1y" }));
app.use(cookieParser());

// ── Routes ──
import indexRouter from "./routes/index.route.js";
import healthCheckRouter from "./routes/healthCheck.route.js";
import usersRouter from "./routes/users.route.js";
import adminRouter from "./routes/admin.route.js";
import orderRouter from "./routes/order.route.js";
import productRouter from "./routes/product.route.js";
import analyticsRouter from "./routes/analytics.route.js";
import blogRouter from "./routes/blog.route.js";

app.use(indexRouter);
app.use("/api", healthCheckRouter);
app.use("/api/users", usersRouter);
app.use("/api/admin", adminRouter);
app.use("/api/order", orderRouter);
app.use("/api/products", productRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/blogs", blogRouter);

// ── 404 Catch-All ──
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ── Global Error Handler ──
app.use((err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production" && statusCode === 500
      ? "Internal server error"
      : err.message || "Internal server error";

  console.error(`[${req.method}] ${req.originalUrl} → ${statusCode}: ${err.message}`);
  if (process.env.NODE_ENV !== "production") {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(err.errors?.length && { errors: err.errors }),
  });
});

export { app };
