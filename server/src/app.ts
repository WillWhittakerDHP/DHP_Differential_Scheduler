import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes/index.js";
import { notFound, errorHandler } from "./middlewares/index.js";
import { initializeDatabase } from "./config/app.js";
import { getTokens, setCredentials } from "./config/googleOAuth.js";

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

startServer();

/* Middleware */
app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Routes */
app.use("/api", routes);

/**
 * OAuth Callback Route (Root Level)
 * LEARNING: Handles Google OAuth callback at simpler path for compatibility
 * WHY: Google OAuth requires simpler redirect URI paths
 * PATTERN: Root-level route for OAuth callback
 */
app.get("/oauth2callback", async (req, res) => {
  console.log('[OAuthCallback] Callback route hit');
  console.log('[OAuthCallback] Query params:', JSON.stringify(req.query));
  console.log('[OAuthCallback] Full URL:', req.url);
  console.log('[OAuthCallback] Request headers:', JSON.stringify(req.headers));
  console.log('[OAuthCallback] Raw query string:', req.url.split('?')[1] || 'none');
  
  try {
    const { code, error, error_description } = req.query;
    
    // Handle authorization errors
    if (error) {
      console.error('[OAuthCallback] OAuth error:', error);
      console.error('[OAuthCallback] Error description:', error_description);
      res.status(400).json({
        error: 'Authorization failed',
        message: `Google returned error: ${error}`,
        error_description: error_description || null
      });
      return;
    }
    
    // Validate authorization code
    if (!code || typeof code !== 'string') {
      console.warn('[OAuthCallback] No authorization code received');
      console.log('[OAuthCallback] Query keys:', Object.keys(req.query));
      res.status(400).json({
        error: 'Invalid request',
        message: 'Authorization code is required',
        received_params: Object.keys(req.query)
      });
      return;
    }
    
    console.log('[OAuthCallback] Authorization code received, exchanging for tokens...');
    
    // Exchange code for tokens
    const tokens = await getTokens(code);
    
    // Set credentials on OAuth client (stored in-memory for now)
    setCredentials(tokens);
    
    console.log('[OAuthCallback] OAuth authentication successful');
    console.log('[OAuthCallback] Has access token:', !!tokens.access_token);
    console.log('[OAuthCallback] Has refresh token:', !!tokens.refresh_token);
    
    // Return success response
    res.json({
      success: true,
      message: 'Authentication successful',
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token
    });
    
  } catch (error: any) {
    console.error('[OAuthCallback] Error in callback:', error);
    console.error('[OAuthCallback] Error stack:', error.stack);
    res.status(500).json({
      error: 'Authentication failed',
      message: error.message || 'An unexpected error occurred during authentication'
    });
  }
});

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
