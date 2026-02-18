import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { registerPaymentRoutes } from "./payment";
import { registerTranslationRoutes } from "./translate";
import "dotenv/config";

// Railway는 자체 PORT 환경변수를 제공하므로 강제 설정하지 않음
if (!process.env.PORT) {
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
            /\.railway\.app$/,
            /\.up\.railway\.app$/,
            ...(process.env.CORS_ORIGIN ? [process.env.CORS_ORIGIN] : [])
          ]
        : ["http://localhost:5000", "http://0.0.0.0:5000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

// 헬스체크 엔드포인트 (Railway 배포 확인용)
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
      const lower = path.toLowerCase();
      if (lower.endsWith(".png")) {
        res.setHeader("Content-Type", "image/png");
      } else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
        res.setHeader("Content-Type", "image/jpeg");
      } else if (lower.endsWith(".gif")) {
        res.setHeader("Content-Type", "image/gif");
      } else if (lower.endsWith(".webp")) {
        res.setHeader("Content-Type", "image/webp");
      } else if (lower.endsWith(".svg")) {
        res.setHeader("Content-Type", "image/svg+xml");
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

  // Railway는 자체 PORT 환경변수를 주입함 (기본값 5000)
  const port = parseInt(process.env.PORT || "5000", 10);
  
  console.log(`[SERVER] NODE_ENV: "${process.env.NODE_ENV || "undefined"}"`);
  console.log(`[SERVER] PORT: ${port}`);
  
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  }).on('error', (err) => {
    console.error(`[ERROR] Failed to start server on port ${port}:`, err);
    process.exit(1);
  });
})();
