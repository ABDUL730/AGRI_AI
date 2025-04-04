import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { checkDatabaseConnection } from "./db/index";
import { seedDatabase } from "./db/seed";
import connectPgSimple from "connect-pg-simple";
import pg from "pg";

const { Pool } = pg;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Connection string for PostgreSQL
let connectionString = process.env.DATABASE_URL;
if (!connectionString && process.env.PGHOST) {
  connectionString = `postgres://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`;
}

// Set up session storage
const PgStore = connectPgSimple(session);
const sessionPool = new Pool({
  connectionString
});

// Configure session middleware
let sessionMiddleware;
if (connectionString) {
  // Use PostgreSQL session store if database is available
  log("Using PostgreSQL session store", "express");
  sessionMiddleware = session({
    store: new PgStore({
      pool: sessionPool,
      createTableIfMissing: true
    }),
    secret: "agri-ai-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  });
} else {
  // Fallback to memory store if no database connection
  log("Using memory session store (fallback)", "express");
  const MemoryStoreSession = MemoryStore(session);
  sessionMiddleware = session({
    secret: "agri-ai-secret-key",
    resave: false,
    saveUninitialized: false,
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    cookie: { 
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  });
}

app.use(sessionMiddleware);

// Initialize database
(async function initializeDatabase() {
  try {
    // Check database connection
    const dbStatus = await checkDatabaseConnection();
    if (dbStatus.success) {
      log("Database connection successful", "express");

      // Seed the database with initial data if needed
      await seedDatabase();
    } else {
      log(`Database connection failed: ${dbStatus.message}`, "express");
      log("Using in-memory storage as fallback", "express");
    }
  } catch (error: any) {
    log(`Database initialization error: ${error.message}`, "express");
    log("Using in-memory storage as fallback", "express");
  }
})();

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    if (!res.headersSent) {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
    }
    console.error(err);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();