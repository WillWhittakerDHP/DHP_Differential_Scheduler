import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes/index.js";
import { notFound, errorHandler } from "./middlewares/index.js";
import { initializeDatabase } from "./config/app.js";

const app = express();

/* Initialize Database */
const startServer = async () => {
  try {
    await initializeDatabase();
    console.log("✅ Database initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize database:", error);
    process.exit(1);
  }
};

// Start database initialization
startServer();

/* Middleware */
app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Routes */
app.use("/api", routes);

// WHY: This is an API-only server - the Vue client runs separately
// PATTERN: Return a helpful message for non-API routes instead of redirecting
app.get("/", (req, res) => {
  res.json({
    message: "API Server",
    version: "1.0.0",
    endpoints: {
      api: "/api",
      docs: "See API documentation for available endpoints"
    }
  });
});

/* Custom Error Handling Middlewares */
app.use(notFound);
app.use(errorHandler);

export default app;
