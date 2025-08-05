import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { registerPaymentRoutes } from "./payment";
import { registerTranslationRoutes } from "./translate";
import "dotenv/config";
import path from "path";
import fs from "fs";

const app = express();

// CORS 설정
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://winelabel.replit.app", "https://끄레망--neon.replit.app"]
        : ["http://localhost:3000", "http://localhost:5000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

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
const publicImagesPath = path.join(process.cwd(), "public", "images");
console.log("[DEBUG] Static images path:", publicImagesPath);
console.log(
  "[DEBUG] Static images path exists:",
  fs.existsSync(publicImagesPath),
);

app.use(
  "/images",
  express.static(publicImagesPath, {
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
  const port = parseInt(process.env.PORT || "3000", 10);
  server.listen(port, () => {
    log(`serving on port ${port}`);
  });
})();
