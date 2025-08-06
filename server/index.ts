import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { registerPaymentRoutes } from "./payment";
import { registerTranslationRoutes } from "./translate";
import "dotenv/config";

// Aggressive PORT management for deployment consistency
// Force PORT to 5000 regardless of environment for Replit deployment compatibility
const originalPort = process.env.PORT;
if (process.env.NODE_ENV === "production") {
  process.env.PORT = "5000";
  console.log(`[DEPLOYMENT] Force-setting PORT=5000 for production (was: ${originalPort || "undefined"})`);
} else if (!process.env.PORT) {
  process.env.PORT = "5000";
  console.log("[DEPLOYMENT] Setting default PORT=5000 for development");
}

const app = express();

// CORS 설정
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? [
            "https://winelabel.replit.app", 
            "https://끄레망--neon.replit.app",
            /\.replit\.app$/,
            /\.repl\.co$/
          ]
        : ["http://localhost:5000", "http://0.0.0.0:5000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

// Enhanced health check endpoint for deployment readiness
app.get("/health", async (_req, res) => {
  try {
    const healthStatus = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "unknown",
      port: process.env.PORT || "5000",
      memory: {
        used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
        total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100
      }
    };

    // Additional checks for production environment
    if (process.env.NODE_ENV === "production") {
      // Verify required environment variables
      const requiredEnvVars = ["DATABASE_URL"];
      const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
      
      if (missingVars.length > 0) {
        return res.status(503).json({
          status: "unhealthy",
          error: "Missing required environment variables",
          missingVars,
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          environment: process.env.NODE_ENV || "unknown",
          port: process.env.PORT || "5000",
          memory: {
            used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
            total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100
          }
        });
      }
    }

    res.status(200).json(healthStatus);
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    });
  }
});

// 요청 크기 제한 증가 (기본 100kb에서 50MB로 변경)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));

// PWA 정적 파일 서빙 (manifest.json, service worker 등)
app.use(
  "/manifest.json",
  express.static("public/manifest.json", {
    setHeaders: (res) => {
      res.setHeader("Content-Type", "application/manifest+json");
    },
  }),
);

app.use(
  "/sw.js",
  express.static("public/sw.js", {
    setHeaders: (res) => {
      res.setHeader("Content-Type", "application/javascript");
      res.setHeader("Service-Worker-Allowed", "/");
    },
  }),
);

app.use(
  "/icons",
  express.static("public/icons", {
    setHeaders: (res, path) => {
      if (path.endsWith(".png")) {
        res.setHeader("Content-Type", "image/png");
      } else if (path.endsWith(".svg")) {
        res.setHeader("Content-Type", "image/svg+xml");
      }
    },
  }),
);

// 이미지 파일들을 위한 정적 파일 서빙 추가

app.use(
  "/images",
  express.static("public/images", {
    setHeaders: (res, path) => {
      if (path.endsWith(".png")) {
        res.setHeader("Content-Type", "image/png");
      } else if (path.endsWith(".jpg") || path.endsWith(".jpeg")) {
        res.setHeader("Content-Type", "image/jpeg");
      } else if (path.endsWith(".gif")) {
        res.setHeader("Content-Type", "image/gif");
      } else if (path.endsWith(".webp")) {
        res.setHeader("Content-Type", "image/webp");
      }
      // 캐시 설정 (1일)
      res.setHeader("Cache-Control", "public, max-age=86400");
    },
  }),
);

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

  // 결제 라우트 등록
  registerPaymentRoutes(app);
  // DeepL 번역 프록시 라우트 등록
  registerTranslationRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  
  // Multi-fallback port resolution for maximum deployment compatibility
  const portFromEnv = process.env.PORT;
  let port = 5000; // Default to 5000 as per Replit configuration
  
  try {
    if (portFromEnv) {
      const parsedPort = parseInt(portFromEnv, 10);
      if (!isNaN(parsedPort) && parsedPort > 0 && parsedPort < 65536) {
        port = parsedPort;
      } else {
        console.warn(`[WARNING] Invalid PORT value "${portFromEnv}", using default 5000`);
      }
    }
  } catch (error) {
    console.warn(`[WARNING] Error parsing PORT "${portFromEnv}", using default 5000:`, error);
  }
  
  // Comprehensive deployment logging
  console.log(`[SERVER] ===== DEPLOYMENT DEBUG INFO =====`);
  console.log(`[SERVER] Raw PORT environment variable: "${portFromEnv || "undefined"}"`);
  console.log(`[SERVER] Final resolved port: ${port}`);
  console.log(`[SERVER] NODE_ENV: "${process.env.NODE_ENV || "undefined"}"`);
  console.log(`[SERVER] Target bind address: 0.0.0.0:${port}`);
  console.log(`[SERVER] Process arguments:`, process.argv);
  
  if (process.env.NODE_ENV === "production") {
    console.log(`[PRODUCTION] ===== PRODUCTION DEPLOYMENT =====`);
    console.log(`[PRODUCTION] All PORT-related environment variables:`);
    Object.keys(process.env)
      .filter(key => key.toLowerCase().includes('port'))
      .forEach(key => console.log(`[PRODUCTION] - ${key}: "${process.env[key]}"`));
    
    // Validate deployment requirements
    if (port !== 5000) {
      console.warn(`[PRODUCTION] WARNING: Port ${port} differs from expected 5000!`);
    }
    
    console.log(`[PRODUCTION] Server will start on: 0.0.0.0:${port}`);
  }
  
  server.listen(port, "0.0.0.0", () => {
    const message = `serving on port ${port}`;
    log(message);
    if (process.env.NODE_ENV === "production") {
      console.log(`[PRODUCTION] Server successfully started: ${message}`);
    }
  }).on('error', (err) => {
    console.error(`[ERROR] Failed to start server on port ${port}:`, err);
    if (process.env.NODE_ENV === "production") {
      console.error(`[PRODUCTION] Server startup failed. PORT=${process.env.PORT || "not set"}, resolved port=${port}`);
    }
    process.exit(1);
  });
})();
