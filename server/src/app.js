import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

import publicRoutes from "./routes/public.js";
import adminRoutes from "./routes/admin.js";
import authRoutes from "./routes/auth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// =====================================================
// TRUST PROXY
// =====================================================

app.set("trust proxy", 1);

// =====================================================
// CORS CONFIGURATION
// =====================================================

const allowedOrigins = [
  "https://vasaloonsandofficials.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",

  ...(process.env.CLIENT_URL || "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean),
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests without an Origin header (e.g. server-to-server).
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.replace(/\/$/, "");

    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    console.error(`CORS blocked origin: ${origin}`);

    return callback(new Error("Not allowed by CORS"));
  },

  credentials: true,

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],

  optionsSuccessStatus: 204,
};

// =====================================================
// SECURITY MIDDLEWARE
// =====================================================

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  }),
);

// CORS must execute before API routes.
app.use(cors(corsOptions));

// Explicit preflight handling.
app.options(/.*/, cors(corsOptions));

// =====================================================
// GENERAL MIDDLEWARE
// =====================================================

app.use(compression());

app.use(
  express.json({
    limit: "200kb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "200kb",
  }),
);

app.use(cookieParser());

// MongoDB query sanitization.
app.use(mongoSanitize());

// =====================================================
// RATE LIMITING
// =====================================================

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests. Please try again later.",
  },
});

app.use("/api", apiLimiter);

// =====================================================
// STATIC UPLOADS
// =====================================================

app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"), {
    maxAge: "7d",
    etag: true,
  }),
);

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "VA Haircut & Officials API is running",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// =====================================================
// API ROUTES
// =====================================================

app.use("/api/auth", authRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api", publicRoutes);

// =====================================================
// 404 HANDLER
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    path: req.originalUrl,
  });
});

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use((err, _req, res, _next) => {
  console.error("Server Error:", err);

  // CORS errors.
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "Origin not allowed",
    });
  }

  // Validation errors.
  if (err.name === "ZodError") {
    return res.status(400).json({
      success: false,
      message: err.errors?.[0]?.message || "Invalid input",
    });
  }

  // Duplicate MongoDB records.
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "That slot is already booked. Please pick another.",
    });
  }

  // General server errors.
  return res.status(err.status || 500).json({
    success: false,
    message:
      err.status && err.status < 500 ? err.message : "Internal server error",
  });
});

export default app;
