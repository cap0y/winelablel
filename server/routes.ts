import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { db, pool } from "./db"; // pool을 import
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from 'url';
import { eq, desc, and, sql, asc, or, like } from "drizzle-orm";
import { orders, labelComments, labelRatings, labelLikes, labelCategories, labelBackgroundCategories, wineBottles, notifications } from "../shared/schema";
import { PortOneClient } from "@portone/server-sdk";
import { users } from "../shared/schema";

// ESM 모듈에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 사용자 등록 스키마 
const userSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().optional(),
  photoURL: z.string().optional(),
  userType: z.enum(['user', 'admin']),
  isApproved: z.boolean().optional()
});

// 와인병 이미지 업로드를 위한 multer 설정
const publicDir = path.join(__dirname, '../client/public');
const bottleUploadStorage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => {
    cb(null, publicDir);
  },
  filename: (_req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const bottleUpload = multer({
  storage: bottleUploadStorage,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB
  },
  fileFilter: (_req: any, file: any, cb: any) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and GIF images are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // 라벨 이미지와 아이콘 저장 폴더 생성
  const labelDir = path.join(__dirname, '../client/public/images/label');
  const iconDir = path.join(__dirname, '../client/public/images/icon');
  const borderDir = path.join(__dirname, '../client/public/images/border'); // 테두리 이미지 폴더 추가
  const uploadDir = path.join(__dirname, '../client/public/images/upload'); // 사용자 업로드 이미지 폴더 추가
  
  if (!fs.existsSync(labelDir)) {
    fs.mkdirSync(labelDir, { recursive: true });
  }
  
  if (!fs.existsSync(iconDir)) {
    fs.mkdirSync(iconDir, { recursive: true });
  }
  
  if (!fs.existsSync(borderDir)) { // 테두리 폴더 생성
    fs.mkdirSync(borderDir, { recursive: true });
  }
  
  if (!fs.existsSync(uploadDir)) { // 업로드 폴더 생성
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  // 파일 저장 설정 (multer)
  const labelStorage = multer.diskStorage({
    destination: (_req: any, _file: any, cb: any) => {
      cb(null, labelDir);
    },
    filename: (_req: any, file: any, cb: any) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
  });
  
  const iconStorage = multer.diskStorage({
    destination: (_req: any, _file: any, cb: any) => {
      cb(null, iconDir);
    },
    filename: (_req: any, file: any, cb: any) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
  });
  
  // 테두리 이미지 저장 설정 추가
  const borderStorage = multer.diskStorage({
    destination: (_req: any, _file: any, cb: any) => {
      cb(null, borderDir);
    },
    filename: (_req: any, file: any, cb: any) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
  });
  
  // 사용자 업로드 이미지 저장 설정 추가
  const uploadStorage = multer.diskStorage({
    destination: (_req: any, _file: any, cb: any) => {
      cb(null, uploadDir);
    },
    filename: (_req: any, file: any, cb: any) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
  });
  
  const uploadLabel = multer({ 
    storage: labelStorage,
    limits: {
      fileSize: 1024 * 1024 * 5 // 5MB
    },
    fileFilter: (_req: any, file: any, cb: any) => {
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('지원하지 않는 파일 형식입니다. JPEG, PNG, GIF, WEBP 형식만 업로드 가능합니다.'));
      }
    }
  });
  
  const uploadIcon = multer({ 
    storage: iconStorage,
    limits: {
      fileSize: 1024 * 1024 * 5 // 5MB
    },
    fileFilter: (_req: any, file: any, cb: any) => {
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('지원하지 않는 파일 형식입니다. JPEG, PNG, GIF, WEBP 형식만 업로드 가능합니다.'));
      }
    }
  });
  
  const uploadBorder = multer({ 
    storage: borderStorage,
    limits: {
      fileSize: 1024 * 1024 * 5 // 5MB
    },
    fileFilter: (_req: any, file: any, cb: any) => {
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('지원하지 않는 파일 형식입니다. JPEG, PNG, GIF, WEBP 형식만 업로드 가능합니다.'));
      }
    }
  });
  
  const uploadImage = multer({ 
    storage: uploadStorage,
    limits: {
      fileSize: 1024 * 1024 * 5 // 5MB
    },
    fileFilter: (_req: any, file: any, cb: any) => {
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('지원하지 않는 파일 형식입니다. JPEG, PNG, GIF, WEBP 형식만 업로드 가능합니다.'));
      }
    }
  });
  
  // 주문 정보를 데이터베이스에서 관리할 예정이므로 인메모리 배열 제거
  
  // 슈퍼관리자 계정 생성 (초기화 시)
  try {
    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'a12345';
    
    // 먼저 이미 존재하는지 확인
    const existingAdmin = await storage.getUserByEmail(adminEmail);
    
    if (!existingAdmin) {
      console.log('슈퍼관리자 계정이 없습니다. 생성을 시도합니다...');
      
      try {
        // 비밀번호 해시 생성
        const passwordHash = await bcrypt.hash(adminPassword, 10);
        
        // DB에 관리자 정보 저장
        const adminUser = await storage.createUser({
          username: 'admin',
          email: adminEmail,
          password: passwordHash,
          displayName: '관리자',
          userType: 'admin',
          isApproved: true
        });
        
        console.log('슈퍼관리자 계정 생성 성공:', adminUser);
      } catch (error) {
        console.error('슈퍼관리자 계정 생성 실패:', error);
      }
    } else {
      console.log('슈퍼관리자 계정이 이미 존재합니다:', existingAdmin);
    }
  } catch (e) {
    console.error('슈퍼관리자 계정 확인/생성 중 오류:', e);
  }

  // 이메일로 사용자 조회
  app.get("/api/users/by-email/:email", async (req, res) => {
    console.log(`[DEBUG] 이메일 조회 요청: ${req.params.email}`);
    try {
      const email = req.params.email;
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(404).json({ 
            success: false, 
          message: "User not found" 
        });
      }
      
      // 비밀번호는 응답에서 제외
      const { password, ...safeUserData } = user;
      
      res.json({ success: true, user: safeUserData });
    } catch (error: any) {
      console.error(`[ERROR] 이메일 ${req.params.email} 조회 오류:`, error);
      res.status(500).json({ success: false, message: "Error fetching user: " + error.message });
    }
  });
  
  // 로그인 API
  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: "이메일과 비밀번호를 모두 입력해주세요." 
        });
      }
      
      // 사용자 조회
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: "이메일 또는 비밀번호가 올바르지 않습니다." 
        });
      }
      
      // 비밀번호 검증
      const passwordMatch = await bcrypt.compare(password, user.password);
      
      if (!passwordMatch) {
        return res.status(401).json({ 
          success: false, 
          message: "이메일 또는 비밀번호가 올바르지 않습니다." 
        });
      }
      
      // 비밀번호는 응답에서 제외
      const { password: _, ...safeUserData } = user;
      
      res.json({
        success: true,
        message: "로그인 성공", 
        user: safeUserData 
      });
    } catch (error: any) {
      console.error('[ERROR] 로그인 오류:', error);
      res.status(500).json({ 
        success: false, 
        message: "로그인 처리 중 오류가 발생했습니다: " + error.message 
      });
    }
  });

  // 회원가입
  app.post("/api/register", async (req, res) => {
    try {
      const userData = userSchema.parse(req.body);
      
      // 비밀번호 해싱
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // 해시된 비밀번호로 대체
      const userToCreate = {
        ...userData,
        password: hashedPassword
      };
      
      const user = await storage.createUser(userToCreate);
      
      // 비밀번호는 응답에서 제외
      const { password: _, ...safeUserData } = user;
      
      res.json({
        success: true,
        message: "회원가입 성공", 
        user: safeUserData 
      });
    } catch (error: any) {
      console.error('[ERROR] 회원가입 오류:', error);
      res.status(400).json({ 
        success: false, 
        message: "회원가입 중 오류가 발생했습니다: " + error.message 
      });
    }
  });

  // 라벨 배경 이미지 목록 조회
  app.get("/api/admin/labels/backgrounds", async (_req, res) => {
    try {
      // 디렉토리에서 파일 목록 읽기
      const files = fs.readdirSync(labelDir);
      
      // 모든 배경-카테고리 관계를 한 번에 조회 (성능 최적화)
      const allCategoryRelations = await db
        .select({
          backgroundId: labelBackgroundCategories.backgroundId,
          categoryId: labelBackgroundCategories.categoryId,
          categoryName: labelCategories.name,
          categorySlug: labelCategories.slug,
          categoryDescription: labelCategories.description
        })
        .from(labelBackgroundCategories)
        .leftJoin(labelCategories, eq(labelBackgroundCategories.categoryId, labelCategories.id));
      
      // 배경 ID별로 카테고리 그룹화
      const categoryMap = new Map<string, any[]>();
      allCategoryRelations.forEach(rel => {
        if (!categoryMap.has(rel.backgroundId)) {
          categoryMap.set(rel.backgroundId, []);
        }
        categoryMap.get(rel.backgroundId)!.push({
          id: rel.categoryId,
          name: rel.categoryName,
          slug: rel.categorySlug,
          description: rel.categoryDescription
        });
      });
      
      // 각 배경 이미지에 대한 기본 정보 생성
      const backgrounds = files.map((filename) => {
        const id = path.parse(filename).name; // 확장자 제외한 파일명
        const categories = categoryMap.get(id) || []; // 미리 조회한 카테고리 정보 사용
        
        return {
          id,
          name: id,
          filename,
          url: `/images/label/${filename}`,
          type: 'background',
          categories, // 카테고리 정보 추가
          createdAt: fs.statSync(path.join(labelDir, filename)).birthtime.toISOString()
        };
      });
      
      res.json({ success: true, backgrounds });
    } catch (error: any) {
      console.error("[ERROR] 라벨 배경 이미지 조회 오류:", error);
      res.status(500).json({ 
        success: false, 
        message: "라벨 배경 이미지 조회 중 오류가 발생했습니다: " + error.message 
      });
    }
  });
  
  // 아이콘/장식 목록 조회
  app.get("/api/admin/labels/icons", async (_req, res) => {
    try {
      // 디렉토리에서 파일 목록 읽기
      const files = fs.readdirSync(iconDir);
      
      const icons = files.map(filename => {
        const id = path.parse(filename).name; // 확장자 제외한 파일명
        return {
          id,
          name: id,
          filename,
          url: `/images/icon/${filename}`,
          type: 'icon',
          createdAt: fs.statSync(path.join(iconDir, filename)).birthtime.toISOString()
        };
      });
      
      res.json({ success: true, icons });
    } catch (error: any) {
      console.error("[ERROR] 아이콘/장식 이미지 조회 오류:", error);
      res.status(500).json({ 
        success: false, 
        message: "아이콘/장식 이미지 조회 중 오류가 발생했습니다: " + error.message 
      });
    }
  });
  
  // 테두리 이미지 목록 조회 API 추가
  app.get("/api/admin/labels/borders", async (_req, res) => {
    try {
      // 디렉토리에서 파일 목록 읽기
      const files = fs.readdirSync(borderDir);
      
      const borders = files.map(filename => {
        const id = path.parse(filename).name; // 확장자 제외한 파일명
        return {
          id,
          name: id,
          filename,
          url: `/images/border/${filename}`,
          type: 'border',
          createdAt: fs.statSync(path.join(borderDir, filename)).birthtime.toISOString()
        };
      });
      
      res.json({ success: true, borders });
    } catch (error: any) {
      console.error("[ERROR] 테두리 이미지 조회 오류:", error);
      res.status(500).json({ 
        success: false, 
        message: "테두리 이미지 조회 중 오류가 발생했습니다: " + error.message 
      });
    }
  });
  
  // 라벨 배경 이미지 업로드
  app.post("/api/admin/labels/backgrounds/upload", uploadLabel.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: "업로드할 파일이 없습니다." 
        });
      }
      
      const file = req.file;
      
      res.json({
        success: true,
        message: "라벨 배경 이미지가 성공적으로 업로드되었습니다.",
        file: {
          id: path.parse(file.filename).name,
          name: file.originalname,
          filename: file.filename,
          url: `/images/label/${file.filename}`,
          size: file.size,
          mimetype: file.mimetype
        }
      });
    } catch (error: any) {
      console.error("[ERROR] 라벨 배경 이미지 업로드 오류:", error);
      res.status(500).json({ 
        success: false, 
        message: "라벨 배경 이미지 업로드 중 오류가 발생했습니다: " + error.message 
      });
    }
  });
  
  // 아이콘/장식 이미지 업로드
  app.post("/api/admin/labels/icons/upload", uploadIcon.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: "업로드할 파일이 없습니다." 
        });
      }
      
      const file = req.file;
      
      res.json({
        success: true,
        message: "아이콘/장식 이미지가 성공적으로 업로드되었습니다.",
        file: {
          id: path.parse(file.filename).name,
          name: file.originalname,
          filename: file.filename,
          url: `/images/icon/${file.filename}`,
          size: file.size,
          mimetype: file.mimetype
        }
      });
    } catch (error: any) {
      console.error("[ERROR] 아이콘/장식 이미지 업로드 오류:", error);
      res.status(500).json({ 
        success: false, 
        message: "아이콘/장식 이미지 업로드 중 오류가 발생했습니다: " + error.message 
      });
    }
  });
  
  // 테두리 이미지 업로드 API 추가
  app.post("/api/admin/labels/borders/upload", uploadBorder.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: "업로드할 파일이 없습니다." 
        });
      }
      
      const file = req.file;
      
      res.json({
        success: true,
        message: "테두리 이미지가 성공적으로 업로드되었습니다.",
        file: {
          id: path.parse(file.filename).name,
          name: file.originalname,
          filename: file.filename,
          url: `/images/border/${file.filename}`,
          size: file.size,
          mimetype: file.mimetype
        }
      });
    } catch (error: any) {
      console.error("[ERROR] 테두리 이미지 업로드 오류:", error);
      res.status(500).json({ 
        success: false, 
        message: "테두리 이미지 업로드 중 오류가 발생했습니다: " + error.message 
      });
    }
  });
  
  // 라벨 배경 이미지 삭제
  app.delete("/api/admin/labels/backgrounds/:filename", async (req, res) => {
    try {
      const filename = req.params.filename;
      const filePath = path.join(labelDir, filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({
          success: true,
          message: "라벨 배경 이미지가 성공적으로 삭제되었습니다."
        });
      } else {
        res.status(404).json({
          success: false,
          message: "해당 파일을 찾을 수 없습니다."
        });
      }
    } catch (error: any) {
      console.error("[ERROR] 라벨 배경 이미지 삭제 오류:", error);
      res.status(500).json({ 
        success: false, 
        message: "라벨 배경 이미지 삭제 중 오류가 발생했습니다: " + error.message 
      });
    }
  });
  
  // 아이콘/장식 이미지 삭제
  app.delete("/api/admin/labels/icons/:filename", async (req, res) => {
    try {
      const filename = req.params.filename;
      const filePath = path.join(iconDir, filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({
          success: true,
          message: "아이콘/장식 이미지가 성공적으로 삭제되었습니다."
        });
      } else {
        res.status(404).json({
          success: false,
          message: "해당 파일을 찾을 수 없습니다."
        });
      }
    } catch (error: any) {
      console.error("[ERROR] 아이콘/장식 이미지 삭제 오류:", error);
      res.status(500).json({ 
        success: false, 
        message: "아이콘/장식 이미지 삭제 중 오류가 발생했습니다: " + error.message 
      });
    }
  });
  
  // 테두리 이미지 삭제 API 추가
  app.delete("/api/admin/labels/borders/:filename", async (req, res) => {
    try {
      const filename = req.params.filename;
      const filePath = path.join(borderDir, filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({
          success: true,
          message: "테두리 이미지가 성공적으로 삭제되었습니다."
        });
      } else {
        res.status(404).json({
          success: false,
          message: "해당 파일을 찾을 수 없습니다."
        });
      }
    } catch (error: any) {
      console.error("[ERROR] 테두리 이미지 삭제 오류:", error);
      res.status(500).json({ 
        success: false, 
        message: "테두리 이미지 삭제 중 오류가 발생했습니다: " + error.message 
      });
    }
  });
  
  // 주문 생성 (체크아웃 시)
  app.post("/api/orders", async (req, res) => {
    try {
      const { customerName, customerEmail, customerPhone, customerAddress, customerZipCode, bottleId, bottleName, labelDesign, labelImage, amount, quantity = 1, deliveryMethod = 'standard', deliveryFee = 3000 } = req.body;
      
      // 유효성 검사
      if (!customerName || !customerEmail || !bottleId || !labelDesign) {
        return res.status(400).json({
          success: false,
          message: "필수 정보가 누락되었습니다."
        });
      }
      
      // 주문 ID 생성
      const orderId = `ORDER-${uuidv4().substring(0, 8)}`;
      
      // 데이터베이스에 주문 저장
      const newOrder = await db.insert(orders).values({
        id: orderId,
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        customerZipCode,
        bottleId,
        bottleName,
        labelDesign: labelDesign as any, // JSON 데이터
        labelImage, // base64 이미지 데이터
        quantity,
        amount: amount || 0,
        status: 'pending',
        deliveryMethod,
        deliveryFee,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      res.status(201).json({
        success: true,
        message: "주문이 성공적으로 생성되었습니다.",
        order: newOrder[0]
      });
    } catch (error: any) {
      console.error("[ERROR] 주문 생성 오류:", error);
      res.status(500).json({ 
        success: false, 
        message: "주문 생성 중 오류가 발생했습니다: " + error.message 
      });
    }
  });
  
  // 주문 목록 조회 - 최적화 및 페이지네이션
  app.get("/api/admin/orders", async (req, res) => {
    try {
      // 쿼리 파라미터에서 페이지네이션 정보 추출
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 100; // 기본 100개
      const offset = (page - 1) * limit;
      
      console.log(`[INFO] 주문 목록 조회 시작 - 페이지: ${page}, 제한: ${limit}`);
      const startTime = Date.now();
      
      // 기본 쿼리 - 최신순 정렬, 제한
      const allOrders = await db
        .select()
        .from(orders)
        .orderBy(desc(orders.createdAt))
        .limit(limit)
        .offset(offset);
      
      // 전체 개수 조회 (간단한 버전)
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(orders);
      
      const totalCount = countResult[0]?.count || 0;
      
      const endTime = Date.now();
      console.log(`[INFO] 주문 목록 조회 완료 - ${endTime - startTime}ms, ${allOrders.length}건 조회`);
      
      res.json({
        success: true,
        orders: allOrders,
        pagination: {
          page,
          limit,
          total: totalCount,
          pages: Math.ceil(totalCount / limit),
          hasNext: page * limit < totalCount,
          hasPrev: page > 1
        }
      });
    } catch (error: any) {
      console.error("[ERROR] 주문 목록 조회 오류:", error);
      res.status(500).json({ 
        success: false, 
        message: "주문 목록 조회 중 오류가 발생했습니다: " + error.message 
      });
    }
  });
  
  // 주문 상세 조회
  app.get("/api/admin/orders/:orderId", async (req, res) => {
    try {
      const orderId = req.params.orderId;
      
      // 데이터베이스에서 주문 상세 조회
      const order = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
      
      if (!order || order.length === 0) {
        return res.status(404).json({
          success: false,
          message: "해당 주문을 찾을 수 없습니다."
        });
      }
      
      res.json({
        success: true,
        order: order[0]
      });
    } catch (error: any) {
      console.error("[ERROR] 주문 상세 조회 오류:", error);
      res.status(500).json({ 
        success: false, 
        message: "주문 상세 조회 중 오류가 발생했습니다: " + error.message 
      });
    }
  });
  
  // 주문 상태 업데이트
  app.patch("/api/admin/orders/:orderId/status", async (req, res) => {
    try {
      const orderId = req.params.orderId;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({
          success: false,
          message: "주문 상태가 제공되지 않았습니다."
        });
      }
      
      // 데이터베이스에서 주문 상태 업데이트
      await db.update(orders).set({ status }).where(eq(orders.id, orderId));
      
      res.json({
        success: true,
        message: "주문 상태가 업데이트되었습니다."
      });
    } catch (error: any) {
      console.error("[ERROR] 주문 상태 업데이트 오류:", error);
      res.status(500).json({ 
        success: false, 
        message: "주문 상태 업데이트 중 오류가 발생했습니다: " + error.message 
      });
    }
  });
  
  // 배송 정보 업데이트 (운송장 번호 및 배송사)
  app.patch("/api/admin/orders/:orderId/shipping", async (req, res) => {
    try {
      const orderId = req.params.orderId;
      const { trackingNumber, shippingCompany } = req.body;
      
      if (!trackingNumber) {
        return res.status(400).json({
          success: false,
          message: "운송장 번호가 제공되지 않았습니다."
        });
      }
      
      // 데이터베이스에서 주문 배송 정보 업데이트
      // ORM 방식으로 다시 변경하되, 필드 이름을 snake_case로 지정
      await db.update(orders)
        .set({
          status: '배송중',
          updatedAt: new Date()
        })
        .where(eq(orders.id, orderId));
      
      // 직접 SQL 쿼리 실행 (Drizzle에 없는 필드를 위함)
      await pool.query(
        `UPDATE "orders" 
         SET "tracking_number" = $1, "shipping_company" = $2
         WHERE "id" = $3`,
        [trackingNumber, shippingCompany || 'cj', orderId]
      );
      
      res.json({
        success: true,
        message: "배송 정보가 성공적으로 업데이트되었습니다."
      });
    } catch (error: any) {
      console.error("[ERROR] 배송 정보 업데이트 오류:", error);
      res.status(500).json({ 
        success: false, 
        message: "배송 정보 업데이트 중 오류가 발생했습니다: " + error.message 
      });
    }
  });
  
  // 배송 알림 전송
  app.post("/api/admin/orders/:orderId/notify-shipping", async (req, res) => {
    try {
      const orderId = req.params.orderId;
      
      // 주문 정보 조회
      const order = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
      
      if (!order || order.length === 0) {
        return res.status(404).json({
          success: false,
          message: "주문을 찾을 수 없습니다."
        });
      }
      
      const orderData = order[0];
      
      // 운송장 번호 확인을 직접 SQL 쿼리로 처리
      const trackingResult = await pool.query(
        `SELECT "tracking_number" FROM "orders" WHERE "id" = $1`,
        [orderId]
      );
      
      const trackingNumber = trackingResult.rows[0]?.tracking_number;
      
      if (!trackingNumber) {
        return res.status(400).json({
          success: false,
          message: "운송장 번호가 등록되지 않은 주문입니다."
        });
      }
      
      // 여기에 실제 알림 전송 로직 (이메일, SMS 등) 구현
      // 예: 이메일 서비스 호출, SMS API 호출 등
      
      // 이메일로 배송 알림 전송 (간단한 로그 출력으로 대체)
      const customerEmail = orderData.customerEmail;
      const customerName = orderData.customerName;
      const shippingCompany = orderData.shippingCompany || 'cj';
      
      // 배송사 이름 매핑
      const shippingCompanyNames: Record<string, string> = {
        'cj': 'CJ대한통운',
        'lotte': '롯데택배',
        'hanjin': '한진택배',
        'logen': '로젠택배',
        'post': '우체국택배'
      };
      
      const shippingCompanyName = shippingCompanyNames[shippingCompany] || '택배사';
      
      // 운송장 추적 URL 생성
      const trackingUrl = getTrackingUrl(shippingCompany, trackingNumber);
      
      console.log(`[배송알림 전송] 수신자: ${customerName}(${customerEmail})`);
      console.log(`[배송알림 내용] 주문번호: ${orderId}, 배송사: ${shippingCompanyName}, 운송장: ${trackingNumber}`);
      console.log(`[배송알림 추적] 배송조회 URL: ${trackingUrl}`);
      
      // TODO: 실제 이메일/SMS 발송 서비스 연동 코드 추가
      
      // 알림 전송 기록 저장 (직접 SQL 쿼리 사용)
      await pool.query(
        `UPDATE "orders" 
         SET "shipping_notified" = $1, "shipping_notified_at" = $2
         WHERE "id" = $3`,
        [true, new Date(), orderId]
      );
      
      res.json({
        success: true,
        message: "배송 알림이 성공적으로 전송되었습니다."
      });
    } catch (error: any) {
      console.error("[ERROR] 배송 알림 전송 오류:", error);
      res.status(500).json({ 
        success: false, 
        message: "배송 알림 전송 중 오류가 발생했습니다: " + error.message 
      });
    }
  });

  // 주문 취소 API
  app.patch("/api/orders/:orderId/cancel", async (req, res) => {
    try {
      const orderId = req.params.orderId;
      
      // 데이터베이스에서 주문 상태를 취소로 업데이트
      const updatedOrder = await db.update(orders)
        .set({ 
          status: 'cancelled',
          updatedAt: new Date()
        })
        .where(eq(orders.id, orderId))
        .returning();
      
      if (!updatedOrder || updatedOrder.length === 0) {
        return res.status(404).json({
          success: false,
          message: "해당 주문을 찾을 수 없습니다."
        });
      }
      
      res.json({
        success: true,
        message: "주문이 성공적으로 취소되었습니다.",
        order: updatedOrder[0]
      });
    } catch (error: any) {
      console.error("[ERROR] 주문 취소 오류:", error);
      res.status(500).json({ 
        success: false, 
        message: "주문 취소 중 오류가 발생했습니다: " + error.message 
      });
    }
  });

  // 결제 검증
  app.post("/api/verify-payment", async (req, res) => {
    try {
      const { orderId, paymentId, amount } = req.body;
      
      if (!orderId || !paymentId) {
        return res.status(400).json({
          success: false,
          message: "주문 ID와 결제 ID가 필요합니다."
        });
      }
      
      // 실제 결제 정보 확인을 위한 포트원 API 호출
      let paymentInfo;
      try {
        const portone = PortOneClient({
          secret: process.env.V2_API_SECRET || "XlhNElclPwzu6HRvmgjGV17ZLsnyzFPXa0R0NkXSymPgTPt8C8AeeytLDMqVAoHO7H2fD0b9QXD1e21S"
        });
        
        // 포트원 API로 결제 정보 조회
        console.log(`포트원 API 결제 정보 조회: ${paymentId}`);
        paymentInfo = await portone.payment.getPayment({ paymentId });
        console.log('포트원 결제 정보 응답:', paymentInfo);
        
        // 결제 상태 확인 
        if (paymentInfo.status === 'PAID') {
          // 결제 완료 상태
          await db.update(orders)
            .set({ 
              status: 'completed',
              paymentId: paymentId,
              updatedAt: new Date()
            })
            .where(eq(orders.id, orderId))
            .returning();
          
          return res.json({
            success: true,
            orderId,
            paymentId,
            amount,
            status: 'verified'
          });
        } else if (String(paymentInfo.status) === 'CANCELLED' || String(paymentInfo.status) === 'FAILED') {
          // 결제 취소 또는 실패 상태
          await db.update(orders)
            .set({ 
              status: 'cancelled',
              paymentId: paymentId,
              updatedAt: new Date()
            })
            .where(eq(orders.id, orderId))
            .returning();
          
          return res.json({
            success: false,
            message: "결제가 취소되었거나 실패했습니다.",
            orderId,
            paymentId,
            status: String(paymentInfo.status)
          });
        } else {
          // 기타 상태(READY, PENDING 등)
          return res.json({
            success: false,
            message: `결제 상태가 완료되지 않았습니다: ${String(paymentInfo.status)}`,
            orderId,
            paymentId,
            status: String(paymentInfo.status)
          });
        }
      } catch (error) {
        console.error('포트원 결제 정보 조회 오류:', error);
        
        // 결제 정보를 찾을 수 없는 경우 - 결제 취소로 간주
        await db.update(orders)
          .set({ 
            status: 'cancelled',
            updatedAt: new Date()
          })
          .where(eq(orders.id, orderId))
          .returning();
        
        return res.status(400).json({
          success: false,
          message: "결제 정보를 찾을 수 없습니다. 결제가 취소되었을 수 있습니다.",
          orderId
        });
      }
    } catch (error: any) {
      console.error('결제 검증 오류:', error);
      res.status(500).json({ 
        success: false,
        message: "결제 검증 중 오류가 발생했습니다: " + error.message 
      });
    }
  });

  // 매출 통계 API - 일별 매출
  app.get("/api/admin/stats/daily", async (req, res) => {
    try {
      // 오늘 날짜
      const today = new Date();
      // 30일 전 날짜
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      // 일별 매출 계산
      const dailySales: Record<string, { date: string, sales: number, count: number }> = {};
      
      // 최근 30일 날짜를 미리 생성
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD 형식
        dailySales[dateStr] = { date: dateStr, sales: 0, count: 0 };
      }
      
      // 주문 데이터로부터 일별 매출 집계
      const ordersList = await db.select().from(orders);
      
      ordersList.forEach((order: any) => {
        const orderDate = new Date(order.createdAt);
        if (orderDate >= thirtyDaysAgo) {
          const dateStr = orderDate.toISOString().split('T')[0];
          if (!dailySales[dateStr]) {
            dailySales[dateStr] = { date: dateStr, sales: 0, count: 0 };
          }
          dailySales[dateStr].sales += order.amount;
          dailySales[dateStr].count += 1;
        }
      });
      
      // 날짜순으로 정렬
      const result = Object.values(dailySales).sort((a, b) => a.date.localeCompare(b.date));
      
      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error("[ERROR] 일별 매출 통계 조회 오류:", error);
      res.status(500).json({ 
        success: false, 
        message: "일별 매출 통계 조회 중 오류가 발생했습니다: " + error.message 
      });
    }
  });
  
  // 매출 통계 API - 월별 매출
  app.get("/api/admin/stats/monthly", async (req, res) => {
    try {
      // 월별 매출 계산
      const monthlySales: Record<string, { month: string, sales: number, count: number }> = {};
      
      // 최근 12개월 데이터 초기화
      const today = new Date();
      for (let i = 0; i < 12; i++) {
        const d = new Date();
        d.setMonth(today.getMonth() - i);
        const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthlySales[monthStr] = { month: monthStr, sales: 0, count: 0 };
      }
      
      // 주문 데이터로부터 월별 매출 집계
      const ordersList = await db.select().from(orders);
      
      ordersList.forEach((order: any) => {
        const orderDate = new Date(order.createdAt);
        const monthStr = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlySales[monthStr]) {
          monthlySales[monthStr] = { month: monthStr, sales: 0, count: 0 };
        }
        monthlySales[monthStr].sales += order.amount;
        monthlySales[monthStr].count += 1;
      });
      
      // 날짜순으로 정렬
      const result = Object.values(monthlySales).sort((a, b) => a.month.localeCompare(b.month));
      
      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error("[ERROR] 월별 매출 통계 조회 오류:", error);
      res.status(500).json({ 
        success: false, 
        message: "월별 매출 통계 조회 중 오류가 발생했습니다: " + error.message 
      });
    }
  });
  
  // 매출 통계 API - 와인별 매출
  app.get("/api/admin/stats/bottles", async (req, res) => {
    try {
      // 와인별 매출 계산
      const bottleSales: Record<string, { id: string, name: string, sales: number, count: number }> = {};
      
      // 주문 데이터로부터 와인별 매출 집계
      const ordersList = await db.select().from(orders);
      
      ordersList.forEach((order: any) => {
        const { bottleId, bottleName, amount, quantity = 1 } = order;
        
        if (!bottleSales[bottleId]) {
          bottleSales[bottleId] = { id: bottleId, name: bottleName, sales: 0, count: 0 };
        }
        bottleSales[bottleId].sales += amount;
        bottleSales[bottleId].count += quantity;
      });
      
      // 매출 기준 내림차순 정렬
      const result = Object.values(bottleSales).sort((a, b) => b.sales - a.sales);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error("[ERROR] 와인별 매출 통계 조회 오류:", error);
      res.status(500).json({ 
        success: false, 
        message: "와인별 매출 통계 조회 중 오류가 발생했습니다: " + error.message 
      });
    }
  });
  
  // 매출 통계 API - 요약 통계 (대시보드용)
  app.get("/api/admin/stats/summary", async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // 오늘 00:00:00
      
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1); // 어제 00:00:00
      
      const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1); // 이번 달 1일
      
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1); // 지난 달 1일
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0); // 지난 달 마지막 날
      
      // 모든 주문 데이터 조회
      const allOrders = await db.select().from(orders);
      
      // 오늘 매출
      const todayOrders = allOrders.filter((order: any) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= today && orderDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
      });
      const todaySales = todayOrders.reduce((sum: number, order: any) => sum + order.amount, 0);
      
      // 어제 매출
      const yesterdayOrders = allOrders.filter((order: any) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= yesterday && orderDate < today;
      });
      const yesterdaySales = yesterdayOrders.reduce((sum: number, order: any) => sum + order.amount, 0);
      
      // 이번 달 매출
      const thisMonthOrders = allOrders.filter((order: any) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= thisMonth && orderDate <= today;
      });
      const thisMonthSales = thisMonthOrders.reduce((sum: number, order: any) => sum + order.amount, 0);
      
      // 지난 달 매출
      const lastMonthOrders = allOrders.filter((order: any) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= lastMonth && orderDate <= lastMonthEnd;
      });
      const lastMonthSales = lastMonthOrders.reduce((sum: number, order: any) => sum + order.amount, 0);
      
      // 총 매출
      const totalSales = allOrders.reduce((sum: number, order: any) => sum + order.amount, 0);
      
      // 총 주문 수
      const totalOrdersCount = allOrders.length;
      
      // 평균 주문 금액
      const averageOrderValue = totalOrdersCount ? Math.round(totalSales / totalOrdersCount) : 0;
      
      res.json({
        success: true,
        data: {
          todaySales,
          todayOrders: todayOrders.length,
          yesterdaySales,
          thisMonthSales,
          lastMonthSales,
          totalSales,
          totalOrders: totalOrdersCount,
          averageOrderValue
        }
      });
    } catch (error: any) {
      console.error("[ERROR] 요약 통계 조회 오류:", error);
      res.status(500).json({ 
        success: false, 
        message: "요약 통계 조회 중 오류가 발생했습니다: " + error.message 
      });
    }
  });

  // 사용자의 주문 목록 조회
  app.get("/api/user-orders", async (req, res) => {
    try {
      const { email } = req.query;
      
      if (!email) {
        return res.status(400).json({ success: false, message: "이메일이 필요합니다." });
      }
      
      const userOrders = await db.select({
        id: orders.id,
        customerName: orders.customerName,
        customerEmail: orders.customerEmail,
        customerPhone: orders.customerPhone,
        customerAddress: orders.customerAddress,
        customerZipCode: orders.customerZipCode,
        bottleId: orders.bottleId,
        bottleName: orders.bottleName,
        amount: orders.amount,
        quantity: orders.quantity,
        status: orders.status,
        paymentId: orders.paymentId,
        deliveryMethod: orders.deliveryMethod,
        deliveryFee: orders.deliveryFee,
        labelDesign: orders.labelDesign,
        labelImage: orders.labelImage,
        publishToGallery: orders.publishToGallery,
        title: orders.title,
        trackingNumber: orders.trackingNumber,
        shippingCompany: orders.shippingCompany,
        createdAt: orders.createdAt
      })
      .from(orders)
      .where(eq(orders.customerEmail, email as string))
      .orderBy(desc(orders.createdAt));
      
      res.json({
        success: true,
        orders: userOrders
      });
    } catch (error: any) {
      console.error("사용자 주문 목록 조회 오류:", error);
      res.status(500).json({
        success: false,
        message: "사용자 주문 목록을 불러오는데 실패했습니다.",
        error: error.message
      });
    }
  });
  
  // 사용자 주문 통계 조회
  app.get("/api/user-stats", async (req, res) => {
    try {
      const { email } = req.query;
      
      if (!email) {
        return res.status(400).json({ success: false, message: "이메일이 필요합니다." });
      }
      
      // 주문 목록 조회
      const userOrders = await db.select({
        id: orders.id,
        bottleName: orders.bottleName,
        amount: orders.amount,
        status: orders.status,
        createdAt: orders.createdAt
      })
      .from(orders)
      .where(eq(orders.customerEmail, email as string))
      .orderBy(desc(orders.createdAt));
      
      // 총 주문 수와 지출액
      const totalOrders = userOrders.length;
      const totalSpent = userOrders.reduce((sum, order) => sum + Number(order.amount || 0), 0);
      
      // 최근 주문
      const recentOrder = userOrders.length > 0 ? userOrders[0] : null;
      
      // 상태별 주문 수
      const statusCounts = {
        pending: 0,
        processed: 0,
        completed: 0,
        cancelled: 0
      };
      
      userOrders.forEach(order => {
        if (order.status === 'pending') statusCounts.pending++;
        else if (order.status === 'processed') statusCounts.processed++;
        else if (order.status === 'completed') statusCounts.completed++;
        else if (order.status === 'cancelled') statusCounts.cancelled++;
      });
      
      // 월별 주문 통계
      const monthlyStats: Record<string, { month: string, count: number, amount: number }> = {};
      
      userOrders.forEach(order => {
        if (!order.createdAt) return;
        
        const date = new Date(order.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyStats[monthKey]) {
          monthlyStats[monthKey] = {
            month: monthKey,
            count: 0,
            amount: 0
          };
        }
        
        monthlyStats[monthKey].count++;
        monthlyStats[monthKey].amount += Number(order.amount || 0);
      });
      
      const monthlyOrders = Object.values(monthlyStats)
        .sort((a, b) => a.month.localeCompare(b.month));
      
      res.json({
        success: true,
        stats: {
          totalOrders,
          totalSpent,
          recentOrder,
          statusCounts,
          monthlyOrders
        }
      });
    } catch (error: any) {
      console.error("사용자 주문 통계 조회 오류:", error);
      res.status(500).json({
        success: false,
        message: "사용자 주문 통계를 불러오는데 실패했습니다.",
        error: error.message
      });
    }
  });

  // 갤러리에 표시될 라벨 목록 API
  app.get("/api/gallery/labels", async (req, res) => {
    try {
      console.log("[DEBUG] 갤러리 라벨 목록 조회 요청");
      
      // 완료된(completed) 주문 중 갤러리 표시가 허용된(publishToGallery) 것만 가져옴
      const labels = await db.select({
        id: orders.id,
        title: orders.title,
        customerName: orders.customerName,
        bottleName: orders.bottleName,
        labelImage: orders.labelImage,
        createdAt: orders.createdAt,
        userId: orders.userId,
        publishToGallery: orders.publishToGallery
      })
      .from(orders)
      .where(
        and(
          // status가 completed 또는 배송완료인 주문 대신, publishToGallery가 true인 모든 주문 표시
          eq(orders.publishToGallery, true),
          sql`${orders.labelImage} IS NOT NULL`
        )
      )
      .orderBy(desc(orders.createdAt));
      
      console.log(`[DEBUG] 조회된 라벨 수: ${labels.length}`);
      
      // publishToGallery 값 로깅
      labels.forEach((label, index) => {
        console.log(`[DEBUG] 라벨 ${index + 1}: ID=${label.id}, publishToGallery=${label.publishToGallery}, title=${label.title || 'none'}`);
      });

      // 각 라벨에 대한 별점과 좋아요 수 계산
      const result = await Promise.all(labels.map(async (label) => {
        try {
          // 평균 별점 계산
          const ratingsResult = await db.select({
            avgRating: sql<number>`avg(${labelRatings.rating})`,
            count: sql<number>`count(*)`
          })
          .from(labelRatings)
          .where(eq(labelRatings.orderId, label.id));

          // 좋아요 수 계산
          const likesCount = await db.select({
            count: sql<number>`count(*)`
          })
          .from(labelLikes)
          .where(eq(labelLikes.orderId, label.id));

          // 디자이너 정보 가져오기
          let designerName = label.customerName || '알 수 없음';
          if (label.userId) {
            const user = await db.select({
              username: users.username,
              displayName: users.displayName
            })
            .from(users)
            .where(eq(users.id, label.userId))
            .limit(1);

            if (user.length > 0) {
              designerName = user[0].displayName || user[0].username || '알 수 없음';
            }
          }

          return {
            ...label,
            title: label.title || label.bottleName || '무제',
            bottleName: label.bottleName || '알 수 없음',
            rating: Number(ratingsResult[0]?.avgRating || 0).toFixed(1),
            ratingCount: Number(ratingsResult[0]?.count || 0),
            likes: Number(likesCount[0]?.count || 0),
            designer: designerName
          };
        } catch (itemError) {
          console.error(`[ERROR] 라벨 ${label.id} 상세 정보 처리 오류:`, itemError);
          // 에러가 발생해도 기본 정보는 반환
          return {
            ...label,
            title: label.title || label.bottleName || '무제',
            bottleName: label.bottleName || '알 수 없음',
            rating: "0.0",
            ratingCount: 0,
            likes: 0,
            designer: label.customerName || '알 수 없음'
          };
        }
      }));

      res.json({
        success: true,
        labels: result
      });
    } catch (error: any) {
      console.error("[ERROR] 라벨 갤러리 목록 조회 오류:", error);
      res.status(500).json({
        success: false,
        message: "라벨 갤러리 목록 조회 중 오류가 발생했습니다: " + error.message
      });
    }
  });

  // 인기 라벨 이미지를 가져오는 API (슬라이더용)
  app.get("/api/gallery/labels/popular", async (req, res) => {
    try {
      // 쿼리 파라미터에서 제한 수 가져오기
      const limit = parseInt(req.query.limit as string) || 5;
      
      // 갤러리 표시가 허용된 라벨만 가져옴
      const labels = await db.select({
        id: orders.id,
        title: orders.title,
        labelImage: orders.labelImage
      })
      .from(orders)
      .where(
        and(
          // 갤러리 표시가 허용된 주문만 조회
          eq(orders.publishToGallery, true),
          sql`${orders.labelImage} IS NOT NULL`
        )
      )
      .limit(limit);
      
      console.log(`[DEBUG] 인기 라벨 조회: ${labels.length}개 결과`);
      
      // 인기순으로 정렬하기 위해 좋아요 수 계산
      const result = await Promise.all(labels.map(async (label) => {
        // 좋아요 수 계산
        const likesCount = await db.select({
          count: sql<number>`count(*)`
        })
        .from(labelLikes)
        .where(eq(labelLikes.orderId, label.id));
        
        return {
          ...label,
          likes: Number(likesCount[0]?.count || 0)
        };
      }));
      
      // 좋아요 수 기준으로 내림차순 정렬
      result.sort((a, b) => b.likes - a.likes);
      
      res.json({
        success: true,
        labels: result
      });
    } catch (error: any) {
      console.error("[ERROR] 인기 라벨 이미지 조회 오류:", error);
      res.status(500).json({
        success: false,
        message: "인기 라벨 이미지 조회 중 오류가 발생했습니다: " + error.message
      });
    }
  });

  // 라벨 상세 정보 API
  app.get("/api/gallery/labels/:labelId", async (req, res) => {
    try {
      const labelId = req.params.labelId;

      const label = await db.select()
        .from(orders)
        .where(
          and(
            eq(orders.id, labelId),
            eq(orders.publishToGallery, true)
          )
        )
        .limit(1);

      if (!label || label.length === 0) {
        return res.status(404).json({
          success: false,
          message: "해당 라벨을 찾을 수 없습니다."
        });
      }

      // 별점 정보
      const ratings = await db.select({
        avgRating: sql<number>`avg(${labelRatings.rating})`,
        count: sql<number>`count(*)`
      })
      .from(labelRatings)
      .where(eq(labelRatings.orderId, labelId));

      // 좋아요 수
      const likes = await db.select({
        count: sql<number>`count(*)`
      })
      .from(labelLikes)
      .where(eq(labelLikes.orderId, labelId));

      // 댓글 목록
      const comments = await db.select({
        id: labelComments.id,
        content: labelComments.content,
        userId: labelComments.userId,
        createdAt: labelComments.createdAt,
        username: users.username,
        displayName: users.displayName,
        photoURL: users.photoURL
      })
      .from(labelComments)
      .innerJoin(users, eq(labelComments.userId, sql`${users.id}::text`))
      .where(eq(labelComments.orderId, labelId))
      .orderBy(desc(labelComments.createdAt));

      // 디자이너 정보
      let designerName = label[0].customerName;
      let designerId = null;
      if (label[0].userId) {
        const user = await db.select({
          id: users.id,
          username: users.username,
          displayName: users.displayName
        })
        .from(users)
        .where(eq(users.id, label[0].userId))
        .limit(1);

        if (user.length > 0) {
          designerName = user[0].displayName || user[0].username;
          designerId = user[0].id;
        }
      }

      res.json({
        success: true,
        label: {
          ...label[0],
          rating: Number(ratings[0]?.avgRating || 0).toFixed(1),
          ratingCount: Number(ratings[0]?.count || 0),
          likes: Number(likes[0]?.count || 0),
          comments,
          designer: designerName,
          designerId
        }
      });
    } catch (error: any) {
      console.error("[ERROR] 라벨 상세 정보 조회 오류:", error);
      res.status(500).json({
        success: false,
        message: "라벨 상세 정보 조회 중 오류가 발생했습니다: " + error.message
      });
    }
  });

  // 댓글 작성 API
  app.post("/api/gallery/labels/:labelId/comments", async (req, res) => {
    try {
      const labelId = req.params.labelId;
      const { content, userId } = req.body;

      if (!content || !userId) {
        return res.status(400).json({
          success: false,
          message: "댓글 내용과 사용자 ID가 필요합니다."
        });
      }

      // 라벨 존재 여부 확인
      const label = await db.select()
        .from(orders)
        .where(
          and(
            eq(orders.id, labelId),
            eq(orders.publishToGallery, true)
          )
        )
        .limit(1);

      if (!label || label.length === 0) {
        return res.status(404).json({
          success: false,
          message: "해당 라벨을 찾을 수 없습니다."
        });
      }

      // 댓글 저장
      const result = await db.insert(labelComments)
        .values({
          orderId: labelId,
          userId,
          content,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      // 사용자 정보 추가
      const user = await db.select({
        username: users.username,
        displayName: users.displayName,
        photoURL: users.photoURL
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

      res.status(201).json({
        success: true,
        comment: {
          ...result[0],
          username: user[0]?.username,
          displayName: user[0]?.displayName,
          photoURL: user[0]?.photoURL
        }
      });
    } catch (error: any) {
      console.error("[ERROR] 댓글 작성 오류:", error);
      res.status(500).json({
        success: false,
        message: "댓글 작성 중 오류가 발생했습니다: " + error.message
      });
    }
  });

  // 별점 등록/수정 API
  app.post("/api/gallery/labels/:labelId/ratings", async (req, res) => {
    try {
      const labelId = req.params.labelId;
      const { rating, userId } = req.body;

      if (!rating || !userId) {
        return res.status(400).json({
          success: false,
          message: "별점과 사용자 ID가 필요합니다."
        });
      }

      // 별점 범위 확인 (0.5 ~ 5.0)
      const ratingValue = parseFloat(rating);
      if (isNaN(ratingValue) || ratingValue < 0.5 || ratingValue > 5.0) {
        return res.status(400).json({
          success: false,
          message: "별점은 0.5에서 5.0 사이여야 합니다."
        });
      }

      // 라벨 존재 여부 확인
      const label = await db.select()
        .from(orders)
        .where(
          and(
            eq(orders.id, labelId),
            eq(orders.publishToGallery, true)
          )
        )
        .limit(1);

      if (!label || label.length === 0) {
        return res.status(404).json({
          success: false,
          message: "해당 라벨을 찾을 수 없습니다."
        });
      }

      // 이미 평가한 적이 있는지 확인
      const existingRating = await db.select()
        .from(labelRatings)
        .where(
          and(
            eq(labelRatings.orderId, labelId),
            eq(labelRatings.userId, userId)
          )
        )
        .limit(1);

      let result;
      if (existingRating && existingRating.length > 0) {
        // 기존 별점 수정
        result = await db.update(labelRatings)
          .set({
            rating: String(ratingValue),
            updatedAt: new Date()
          })
          .where(
            and(
              eq(labelRatings.orderId, labelId),
              eq(labelRatings.userId, userId)
            )
          )
          .returning();
      } else {
        // 새 별점 추가
        result = await db.insert(labelRatings)
          .values({
            orderId: labelId,
            userId,
            rating: String(ratingValue),
            createdAt: new Date(),
            updatedAt: new Date()
          })
          .returning();
      }

      // 평균 별점 계산
      const avgRating = await db.select({
        avg: sql<number>`avg(${labelRatings.rating})`,
        count: sql<number>`count(*)`
      })
      .from(labelRatings)
      .where(eq(labelRatings.orderId, labelId));

      res.json({
        success: true,
        rating: result[0],
        averageRating: Number(avgRating[0]?.avg || 0).toFixed(1),
        ratingCount: Number(avgRating[0]?.count || 0)
      });
    } catch (error: any) {
      console.error("[ERROR] 별점 등록 오류:", error);
      res.status(500).json({
        success: false,
        message: "별점 등록 중 오류가 발생했습니다: " + error.message
      });
    }
  });

  // 좋아요 토글 API
  app.post("/api/gallery/labels/:labelId/likes/toggle", async (req, res) => {
    try {
      const labelId = req.params.labelId;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: "사용자 ID가 필요합니다."
        });
      }

      // 라벨 존재 여부 확인
      const label = await db.select()
        .from(orders)
        .where(
          and(
            eq(orders.id, labelId),
            eq(orders.publishToGallery, true)
          )
        )
        .limit(1);

      if (!label || label.length === 0) {
        return res.status(404).json({
          success: false,
          message: "해당 라벨을 찾을 수 없습니다."
        });
      }

      // 이미 좋아요를 눌렀는지 확인
      const existingLike = await db.select()
        .from(labelLikes)
        .where(
          and(
            eq(labelLikes.orderId, labelId),
            eq(labelLikes.userId, userId)
          )
        )
        .limit(1);

      let liked = false;
      if (existingLike && existingLike.length > 0) {
        // 좋아요 취소
        await db.delete(labelLikes)
          .where(
            and(
              eq(labelLikes.orderId, labelId),
              eq(labelLikes.userId, userId)
            )
          );
      } else {
        // 좋아요 추가
        await db.insert(labelLikes)
          .values({
            orderId: labelId,
            userId,
            createdAt: new Date()
          });
        liked = true;
      }

      // 좋아요 수 계산
      const likesCount = await db.select({
        count: sql<number>`count(*)`
      })
      .from(labelLikes)
      .where(eq(labelLikes.orderId, labelId));

      res.json({
        success: true,
        liked,
        likesCount: Number(likesCount[0]?.count || 0)
      });
    } catch (error: any) {
      console.error("[ERROR] 좋아요 토글 오류:", error);
      res.status(500).json({
        success: false,
        message: "좋아요 토글 중 오류가 발생했습니다: " + error.message
      });
    }
  });

  // 주문 갤러리 공개 설정 API
  app.patch("/api/orders/:orderId/publish", async (req, res) => {
    try {
      const orderId = req.params.orderId;
      const { publish, title } = req.body;
      
      // 유효성 검사
      if (publish === true && !title) {
        return res.status(400).json({
          success: false,
          message: "갤러리에 공개하려면 제목이 필요합니다."
        });
      }
      
      // 데이터베이스에서 주문 갤러리 공개 설정 업데이트
      const updateData: any = { 
        publishToGallery: publish, 
        updatedAt: new Date() 
      };
      
      if (title) {
        updateData.title = title;
      }
      
      const updatedOrder = await db.update(orders)
        .set(updateData)
        .where(eq(orders.id, orderId))
        .returning();
      
      if (!updatedOrder || updatedOrder.length === 0) {
        return res.status(404).json({
          success: false,
          message: "해당 주문을 찾을 수 없습니다."
        });
      }
      
      res.json({
        success: true,
        message: publish ? "라벨이 갤러리에 공개되었습니다." : "라벨이 갤러리에서 숨김처리 되었습니다.",
        order: updatedOrder[0]
      });
    } catch (error: any) {
      console.error("[ERROR] 주문 갤러리 공개 설정 오류:", error);
      res.status(500).json({ 
        success: false, 
        message: "주문 갤러리 공개 설정 중 오류가 발생했습니다: " + error.message 
      });
    }
  });

  // 사용자 업로드 이미지 목록 조회 API 추가
  app.get("/api/labels/uploads", async (_req, res) => {
    try {
      // 디렉토리에서 파일 목록 읽기
      const files = fs.readdirSync(uploadDir);
      
      const uploads = files.map(filename => {
        const id = path.parse(filename).name; // 확장자 제외한 파일명
        return {
          id,
          name: id,
          filename,
          url: `/images/upload/${filename}`,
          type: 'upload',
          createdAt: fs.statSync(path.join(uploadDir, filename)).birthtime.toISOString()
        };
      });
      
      res.json({ success: true, uploads });
    } catch (error: any) {
      console.error("[ERROR] 사용자 업로드 이미지 조회 오류:", error);
      res.status(500).json({ 
        success: false, 
        message: "사용자 업로드 이미지 조회 중 오류가 발생했습니다: " + error.message 
      });
    }
  });
  
  // 사용자 이미지 업로드 API 추가
  app.post("/api/labels/uploads", uploadImage.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: "업로드할 파일이 없습니다." 
        });
      }
      
      const file = req.file;
      
      res.json({
        success: true,
        message: "이미지가 성공적으로 업로드되었습니다.",
        file: {
          id: path.parse(file.filename).name,
          name: file.originalname,
          filename: file.filename,
          url: `/images/upload/${file.filename}`,
          size: file.size,
          mimetype: file.mimetype
        }
      });
    } catch (error: any) {
      console.error("[ERROR] 사용자 이미지 업로드 오류:", error);
      res.status(500).json({ 
        success: false, 
        message: "사용자 이미지 업로드 중 오류가 발생했습니다: " + error.message 
      });
    }
  });
  
  // 사용자 업로드 이미지 삭제 API 추가
  app.delete("/api/labels/uploads/:filename", async (req, res) => {
    try {
      const filename = req.params.filename;
      const filePath = path.join(uploadDir, filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({
          success: true,
          message: "업로드된 이미지가 성공적으로 삭제되었습니다."
        });
      } else {
        res.status(404).json({
          success: false,
          message: "해당 파일을 찾을 수 없습니다."
        });
      }
    } catch (error: any) {
      console.error("[ERROR] 사용자 업로드 이미지 삭제 오류:", error);
      res.status(500).json({ 
        success: false, 
        message: "사용자 업로드 이미지 삭제 중 오류가 발생했습니다: " + error.message 
      });
    }
  });

  // 라벨 배경 카테고리 목록 조회 API
  app.get("/api/admin/labels/categories", async (req, res) => {
    try {
      // 데이터베이스에서 카테고리 목록 조회
      const categories = await db.select()
        .from(labelCategories)
        .orderBy(asc(labelCategories.displayOrder), asc(labelCategories.name));
      
      res.json({
        success: true,
        categories
      });
    } catch (error: any) {
      console.error("[ERROR] 라벨 배경 카테고리 목록 조회 오류:", error);
      res.status(500).json({ 
        success: false, 
        message: "라벨 배경 카테고리 목록 조회 중 오류가 발생했습니다: " + error.message 
      });
    }
  });
  
  // 라벨 배경 카테고리 생성 API
  app.post("/api/admin/labels/categories", async (req, res) => {
    try {
      const { name, description = "", displayOrder = 0 } = req.body;
      
      if (!name) {
        return res.status(400).json({
          success: false,
          message: "카테고리 이름은 필수입니다."
        });
      }
      
      // 슬러그 생성 (이름에서 공백 제거하고 소문자로 변환)
      const slug = name.toLowerCase().replace(/\s+/g, '-');
      
      // 이미 동일한 슬러그가 있는지 확인
      const existingCategory = await db.select()
        .from(labelCategories)
        .where(eq(labelCategories.slug, slug))
        .limit(1);
      
      if (existingCategory.length > 0) {
        return res.status(400).json({
          success: false,
          message: "이미 동일한 이름의 카테고리가 존재합니다."
        });
      }
      
      // 데이터베이스에 카테고리 저장
      const newCategory = await db.insert(labelCategories)
        .values({
          name,
          slug,
          description,
          displayOrder,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      res.status(201).json({
        success: true,
        message: "카테고리가 성공적으로 생성되었습니다.",
        category: newCategory[0]
      });
    } catch (error: any) {
      console.error("[ERROR] 라벨 배경 카테고리 생성 오류:", error);
      res.status(500).json({ 
        success: false, 
        message: "라벨 배경 카테고리 생성 중 오류가 발생했습니다: " + error.message 
      });
    }
  });
  
  // 라벨 배경 카테고리 수정 API
  app.patch("/api/admin/labels/categories/:categoryId", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      const { name, description, displayOrder, isActive } = req.body;
      
      // 카테고리 존재 여부 확인
      const existingCategory = await db.select()
        .from(labelCategories)
        .where(eq(labelCategories.id, categoryId))
        .limit(1);
      
      if (!existingCategory.length) {
        return res.status(404).json({
          success: false,
          message: "해당 카테고리를 찾을 수 없습니다."
        });
      }
      
      // 업데이트할 데이터 객체 생성
      const updateData: Record<string, any> = {
        updatedAt: new Date()
      };
      
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (displayOrder !== undefined) updateData.displayOrder = displayOrder;
      if (isActive !== undefined) updateData.isActive = isActive;
      
      // 이름이 변경된 경우 슬러그도 업데이트
      if (name !== undefined && name !== existingCategory[0].name) {
        updateData.slug = name.toLowerCase().replace(/\s+/g, '-');
        
        // 슬러그 중복 체크
        const slugExists = await db.select()
          .from(labelCategories)
          .where(
            and(
              eq(labelCategories.slug, updateData.slug),
              sql`${labelCategories.id} != ${categoryId}`
            )
          )
          .limit(1);
        
        if (slugExists.length) {
          return res.status(400).json({
            success: false,
            message: "이미 동일한 이름의 카테고리가 존재합니다."
          });
        }
      }
      
      // 데이터베이스에서 카테고리 업데이트
      const updatedCategory = await db.update(labelCategories)
        .set(updateData)
        .where(eq(labelCategories.id, categoryId))
        .returning();
      
      res.json({
        success: true,
        message: "카테고리가 성공적으로 수정되었습니다.",
        category: updatedCategory[0]
      });
    } catch (error: any) {
      console.error("[ERROR] 라벨 배경 카테고리 수정 오류:", error);
      res.status(500).json({ 
        success: false, 
        message: "라벨 배경 카테고리 수정 중 오류가 발생했습니다: " + error.message 
      });
    }
  });
  
  // 라벨 배경 카테고리 삭제 API
  app.delete("/api/admin/labels/categories/:categoryId", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      
      // 카테고리 존재 여부 확인
      const existingCategory = await db.select()
        .from(labelCategories)
        .where(eq(labelCategories.id, categoryId))
        .limit(1);
      
      if (!existingCategory.length) {
        return res.status(404).json({
          success: false,
          message: "해당 카테고리를 찾을 수 없습니다."
        });
      }
      
      // 해당 카테고리에 연결된 배경 이미지 관계 삭제
      await db.delete(labelBackgroundCategories)
        .where(eq(labelBackgroundCategories.categoryId, categoryId));
      
      // 카테고리 삭제
      await db.delete(labelCategories)
        .where(eq(labelCategories.id, categoryId));
      
      res.json({
        success: true,
        message: "카테고리가 성공적으로 삭제되었습니다."
      });
    } catch (error: any) {
      console.error("[ERROR] 라벨 배경 카테고리 삭제 오류:", error);
      res.status(500).json({ 
        success: false, 
        message: "라벨 배경 카테고리 삭제 중 오류가 발생했습니다: " + error.message 
      });
    }
  });
  
  // 라벨 배경 이미지에 카테고리 할당 API
  app.post("/api/admin/labels/backgrounds/:backgroundId/categories", async (req, res) => {
    try {
      const backgroundId = req.params.backgroundId;
      const { categoryIds } = req.body;
      
      if (!Array.isArray(categoryIds)) {
        return res.status(400).json({
          success: false,
          message: "카테고리 ID 배열이 필요합니다."
        });
      }
      
      // 배경 이미지 존재 여부 확인 (파일 시스템)
      const filePath = path.join(labelDir, `${backgroundId}.png`); // 확장자 가정
      const jpgFilePath = path.join(labelDir, `${backgroundId}.jpg`);
      
      if (!fs.existsSync(filePath) && !fs.existsSync(jpgFilePath)) {
        return res.status(404).json({
          success: false,
          message: "해당 배경 이미지를 찾을 수 없습니다."
        });
      }
      
      // 기존 연결 삭제
      await db.delete(labelBackgroundCategories)
        .where(eq(labelBackgroundCategories.backgroundId, backgroundId));
      
      // 새 연결 추가
      const newRelations = [];
      for (const categoryId of categoryIds) {
        // 카테고리 존재 여부 확인
        const categoryExists = await db.select()
          .from(labelCategories)
          .where(eq(labelCategories.id, parseInt(categoryId)))
          .limit(1);
        
        if (categoryExists.length) {
          const relation = await db.insert(labelBackgroundCategories)
            .values({
              backgroundId,
              categoryId: parseInt(categoryId),
              createdAt: new Date()
            })
            .returning();
          
          newRelations.push(relation[0]);
        }
      }
      
      res.json({
        success: true,
        message: "배경 이미지에 카테고리가 성공적으로 할당되었습니다.",
        relations: newRelations
      });
    } catch (error: any) {
      console.error("[ERROR] 배경 이미지 카테고리 할당 오류:", error);
      res.status(500).json({ 
        success: false, 
        message: "배경 이미지 카테고리 할당 중 오류가 발생했습니다: " + error.message 
      });
    }
  });
  
  // 특정 카테고리에 속한 배경 이미지 목록 조회 API
  app.get("/api/labels/backgrounds/category/:categorySlug", async (req, res) => {
    try {
      const categorySlug = req.params.categorySlug;
      
      // 카테고리 정보 조회
      const category = await db.select()
        .from(labelCategories)
        .where(
          and(
            eq(labelCategories.slug, categorySlug),
            eq(labelCategories.isActive, true)
          )
        )
        .limit(1);
      
      if (!category.length) {
        return res.status(404).json({
          success: false,
          message: "해당 카테고리를 찾을 수 없습니다."
        });
      }
      
      // 카테고리에 연결된 배경 이미지 ID 목록 조회
      const backgroundRelations = await db.select({
        backgroundId: labelBackgroundCategories.backgroundId
      })
      .from(labelBackgroundCategories)
      .where(eq(labelBackgroundCategories.categoryId, category[0].id));
      
      const backgroundIds = backgroundRelations.map(relation => relation.backgroundId);
      
      // 디렉토리에서 파일 목록 읽기
      const files = fs.readdirSync(labelDir);
      
      // 해당 카테고리에 연결된 배경 이미지만 필터링
      const backgrounds = files
        .filter(filename => {
          const id = path.parse(filename).name;
          return backgroundIds.includes(id);
        })
        .map(filename => {
          const id = path.parse(filename).name;
          return {
            id,
            name: id,
            filename,
            url: `/images/label/${filename}`,
            type: 'background',
            categoryId: category[0].id,
            categoryName: category[0].name,
            createdAt: fs.statSync(path.join(labelDir, filename)).birthtime.toISOString()
          };
        });
      
      res.json({
        success: true,
        category: category[0],
        backgrounds
      });
    } catch (error: any) {
      console.error("[ERROR] 카테고리별 배경 이미지 목록 조회 오류:", error);
      res.status(500).json({ 
        success: false, 
        message: "카테고리별 배경 이미지 목록 조회 중 오류가 발생했습니다: " + error.message 
      });
    }
  });
  
  // 활성화된 모든 카테고리 목록 조회 API (클라이언트용)
  app.get("/api/labels/categories", async (_req, res) => {
    try {
      // 데이터베이스에서 활성화된 카테고리 목록만 조회
      const categories = await db.select()
        .from(labelCategories)
        .where(eq(labelCategories.isActive, true))
        .orderBy(asc(labelCategories.displayOrder), asc(labelCategories.name));
      
      res.json({
        success: true,
        categories
      });
    } catch (error: any) {
      console.error("[ERROR] 라벨 카테고리 목록 조회 오류:", error);
      res.status(500).json({ 
        success: false, 
        message: "라벨 카테고리 목록 조회 중 오류가 발생했습니다: " + error.message 
      });
    }
  });

  // 주소 검색 API 프록시 엔드포인트 추가
  app.post("/api/address/search", async (req, res) => {
    try {
      const { keyword } = req.body;
      if (!keyword) {
        return res.status(400).json({
          success: false,
          message: "검색어가 필요합니다."
        });
      }
      
      // 도로명주소 API 키
      const API_KEY = "U01TX0FVVEgyMDI1MDczMTE3NDkxOTExNjAxMTE=";
      
      // 도로명주소 API 호출
      const url = `https://www.juso.go.kr/addrlink/addrLinkApi.do`;
      const params = new URLSearchParams({
        confmKey: API_KEY,
        keyword: keyword,
        resultType: 'json',
        countPerPage: '10'
      });
      
      const response = await fetch(`${url}?${params.toString()}`);
      const data = await response.json();
      
      res.json(data);
    } catch (error: any) {
      console.error("[ERROR] 주소 검색 오류:", error);
      res.status(500).json({
        success: false,
        message: "주소 검색 중 오류가 발생했습니다: " + error.message
      });
    }
  });
  
  // 와인병 관련 API 엔드포인트
  app.get("/api/admin/bottles", async (_req, res) => {
    try {
      const bottles = await db.select().from(wineBottles).orderBy(asc(wineBottles.name));
      
      // 개별 컬럼들을 labelSize 객체로 변환
      const formattedBottles = bottles.map(bottle => ({
        ...bottle,
        labelSize: {
          width: parseFloat(bottle.labelWidth || "17.62"),
          height: parseFloat(bottle.labelHeight || "20.16"),
          position: {
            top: bottle.labelPositionTop || 70,
            left: bottle.labelPositionLeft || 75
          }
        }
      }));
      
      res.json({ success: true, bottles: formattedBottles });
    } catch (error: any) {
      console.error("[ERROR] 와인병 목록 조회 오류:", error);
      res.status(500).json({ success: false, message: "와인병 목록을 불러오는데 실패했습니다: " + error.message });
    }
  });

  app.get("/api/admin/bottles/:bottleId", async (req, res) => {
    try {
      const { bottleId } = req.params;
      const bottle = await db.select().from(wineBottles).where(eq(wineBottles.id, bottleId)).limit(1);
      
      if (bottle.length === 0) {
        return res.status(404).json({ success: false, message: "해당 와인병을 찾을 수 없습니다." });
      }
      
      // 개별 컬럼들을 labelSize 객체로 변환
      const formattedBottle = {
        ...bottle[0],
        labelSize: {
          width: parseFloat(bottle[0].labelWidth || "17.62"),
          height: parseFloat(bottle[0].labelHeight || "20.16"),
          position: {
            top: bottle[0].labelPositionTop || 70,
            left: bottle[0].labelPositionLeft || 75
          }
        }
      };
      
      res.json({ success: true, bottle: formattedBottle });
    } catch (error: any) {
      console.error("[ERROR] 와인병 조회 오류:", error);
      res.status(500).json({ success: false, message: "와인병을 불러오는데 실패했습니다: " + error.message });
    }
  });

  app.post("/api/admin/bottles", async (req, res) => {
    try {
      const bottleData = req.body;
      
      // ID 중복 확인
      const existingBottle = await db.select({ id: wineBottles.id })
        .from(wineBottles)
        .where(eq(wineBottles.id, bottleData.id))
        .limit(1);
      
      if (existingBottle.length > 0) {
        return res.status(409).json({ 
          success: false, 
          message: "이미 사용 중인 ID입니다. 다른 ID를 사용해주세요." 
        });
      }
      
      // 와인병 추가
      await db.insert(wineBottles).values(bottleData);
      
      res.status(201).json({ success: true, message: "와인병이 성공적으로 추가되었습니다." });
    } catch (error: any) {
      console.error("[ERROR] 와인병 추가 오류:", error);
      res.status(500).json({ success: false, message: "와인병 추가 중 오류가 발생했습니다: " + error.message });
    }
  });

  app.put("/api/admin/bottles/:bottleId", async (req, res) => {
    try {
      const { bottleId } = req.params;
      const bottleData = req.body;
      
      // 해당 와인병이 존재하는지 확인
      const existingBottle = await db.select({ id: wineBottles.id, image: wineBottles.image })
        .from(wineBottles)
        .where(eq(wineBottles.id, bottleId))
        .limit(1);
      
      if (existingBottle.length === 0) {
        return res.status(404).json({ success: false, message: "해당 와인병을 찾을 수 없습니다." });
      }
      
      // 와인병 정보 업데이트
      await db.update(wineBottles)
        .set({
          ...bottleData,
          updatedAt: new Date()
        })
        .where(eq(wineBottles.id, bottleId));
      
      res.json({ success: true, message: "와인병 정보가 성공적으로 업데이트되었습니다." });
    } catch (error: any) {
      console.error("[ERROR] 와인병 수정 오류:", error);
      res.status(500).json({ success: false, message: "와인병 수정 중 오류가 발생했습니다: " + error.message });
    }
  });

  app.delete("/api/admin/bottles/:bottleId", async (req, res) => {
    try {
      const { bottleId } = req.params;
      
      // 해당 와인병이 존재하는지 확인
      const existingBottle = await db.select({ id: wineBottles.id, image: wineBottles.image })
        .from(wineBottles)
        .where(eq(wineBottles.id, bottleId))
        .limit(1);
      
      if (existingBottle.length === 0) {
        return res.status(404).json({ success: false, message: "해당 와인병을 찾을 수 없습니다." });
      }
      
      // 와인병 삭제
      await db.delete(wineBottles).where(eq(wineBottles.id, bottleId));
      
      res.json({ success: true, message: "와인병이 성공적으로 삭제되었습니다." });
    } catch (error: any) {
      console.error("[ERROR] 와인병 삭제 오류:", error);
      res.status(500).json({ success: false, message: "와인병 삭제 중 오류가 발생했습니다: " + error.message });
    }
  });

  // 와인병 이미지 업로드 API
  app.post("/api/admin/bottles/upload", bottleUpload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "업로드된 파일이 없습니다." });
      }

      // 파일 정보
      const { originalname, filename } = req.file;
      
      // 이미지 URL 생성`
      const imageUrl = `/uploads/bottles/${filename}`;
      
      return res.json({
        success: true,
        message: "와인병 이미지가 성공적으로 업로드되었습니다.",
        url: imageUrl,
        filename
      });
    } catch (error: any) {
      console.error("[ERROR] 와인병 이미지 업로드 오류:", error);
      res.status(500).json({ 
        success: false, 
        message: "와인병 이미지 업로드 중 오류가 발생했습니다: " + error.message 
      });
    }
  });
  
  // 운송장 추적 URL 생성
  const getTrackingUrl = (company: string, trackingNumber: string) => {
    switch(company) {
      case 'cj':
        return `https://www.cjlogistics.com/ko/tool/parcel/tracking?gnbInvcNo=${trackingNumber}`;
      case 'lotte':
        return `https://www.lotteglogis.com/home/reservation/tracking/index?InvNo=${trackingNumber}`;
      case 'hanjin':
        return `https://www.hanjin.co.kr/kor/CMS/DeliveryMgr/WaybillResult.do?mCode=MN038&schLhblNo=${trackingNumber}`;
      case 'logen':
        return `https://www.ilogen.com/web/personal/trace/${trackingNumber}`;
      case 'post':
        return `https://service.epost.go.kr/trace.RetrieveDomRigiTraceList.comm?sid1=${trackingNumber}`;
      default:
        return `#`;
    }
  };
  
  // =================
  // 알림 관리 API
  // =================
  
  // 알림 생성
  app.post("/api/notifications", async (req, res) => {
    try {
      const { customerEmail, type, title, message, orderId } = req.body;
      
      if (!customerEmail || !type || !title || !message) {
        return res.status(400).json({ 
          success: false, 
          message: '필수 필드가 누락되었습니다.' 
        });
      }
      
      const notification = await db.insert(notifications).values({
        customerEmail,
        type,
        title,
        message,
        orderId: orderId || null,
        isRead: false,
        createdAt: new Date()
      }).returning();
      
      res.json({ 
        success: true, 
        notification: notification[0] 
      });
    } catch (error) {
      console.error('알림 생성 오류:', error);
      res.status(500).json({ 
        success: false, 
        message: '알림 생성 중 오류가 발생했습니다.' 
      });
    }
  });
  
  // 사용자별 알림 조회
  app.get("/api/notifications", async (req, res) => {
    try {
      const { email } = req.query;
      
      if (!email) {
        return res.status(400).json({ 
          success: false, 
          message: '이메일이 필요합니다.' 
        });
      }
      
      const userNotifications = await db
        .select()
        .from(notifications)
        .where(eq(notifications.customerEmail, email as string))
        .orderBy(desc(notifications.createdAt));
      
      res.json({ 
        success: true, 
        notifications: userNotifications 
      });
    } catch (error) {
      console.error('알림 조회 오류:', error);
      res.status(500).json({ 
        success: false, 
        message: '알림 조회 중 오류가 발생했습니다.' 
      });
    }
  });
  
  // 개별 알림 읽음 처리
  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      const { id } = req.params;
      
      const updatedNotification = await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, id))
        .returning();
      
      if (updatedNotification.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: '알림을 찾을 수 없습니다.' 
        });
      }
      
      res.json({ 
        success: true, 
        notification: updatedNotification[0] 
      });
    } catch (error) {
      console.error('알림 읽음 처리 오류:', error);
      res.status(500).json({ 
        success: false, 
        message: '알림 읽음 처리 중 오류가 발생했습니다.' 
      });
    }
  });
  
  // 모든 알림 읽음 처리
  app.patch("/api/notifications/read-all", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ 
          success: false, 
          message: '이메일이 필요합니다.' 
        });
      }
      
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(and(
          eq(notifications.customerEmail, email),
          eq(notifications.isRead, false)
        ));
      
      res.json({ 
        success: true, 
        message: '모든 알림이 읽음 처리되었습니다.' 
      });
    } catch (error) {
      console.error('전체 알림 읽음 처리 오류:', error);
      res.status(500).json({ 
        success: false, 
        message: '전체 알림 읽음 처리 중 오류가 발생했습니다.' 
      });
    }
  });
  
  // =================
  // 관리자용 알림 API
  // =================
  
  // 관리자용 모든 알림 조회
  app.get("/api/admin/notifications", async (req, res) => {
    try {
      // 관리자는 모든 알림을 볼 수 있음 (최근 100개로 제한)
      const allNotifications = await db
        .select()
        .from(notifications)
        .orderBy(desc(notifications.createdAt))
        .limit(100);
      
      res.json({ 
        success: true, 
        notifications: allNotifications 
      });
    } catch (error) {
      console.error('관리자 알림 조회 오류:', error);
      res.status(500).json({ 
        success: false, 
        message: '관리자 알림 조회 중 오류가 발생했습니다.' 
      });
    }
  });
  
  // 관리자용 모든 알림 읽음 처리
  app.patch("/api/admin/notifications/read-all", async (req, res) => {
    try {
      // 모든 읽지 않은 알림을 읽음 처리
      await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.isRead, false));
      
      res.json({ 
        success: true, 
        message: '모든 알림이 읽음 처리되었습니다.' 
      });
    } catch (error) {
      console.error('관리자 전체 알림 읽음 처리 오류:', error);
      res.status(500).json({ 
        success: false, 
        message: '관리자 전체 알림 읽음 처리 중 오류가 발생했습니다.' 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
