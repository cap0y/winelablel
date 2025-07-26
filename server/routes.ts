import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { db } from "./db";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from 'url';
import { eq, desc, and, sql } from "drizzle-orm";
import { orders, labelComments, labelRatings, labelLikes } from "../shared/schema";
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

export async function registerRoutes(app: Express): Promise<Server> {
  // 라벨 이미지와 아이콘 저장 폴더 생성
  const labelDir = path.join(__dirname, '../client/public/images/label');
  const iconDir = path.join(__dirname, '../client/public/images/icon');
  const borderDir = path.join(__dirname, '../client/public/images/border'); // 테두리 이미지 폴더 추가
  
  if (!fs.existsSync(labelDir)) {
    fs.mkdirSync(labelDir, { recursive: true });
  }
  
  if (!fs.existsSync(iconDir)) {
    fs.mkdirSync(iconDir, { recursive: true });
  }
  
  if (!fs.existsSync(borderDir)) { // 테두리 폴더 생성
    fs.mkdirSync(borderDir, { recursive: true });
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
  
  const uploadLabel = multer({ storage: labelStorage });
  const uploadIcon = multer({ storage: iconStorage });
  const uploadBorder = multer({ storage: borderStorage }); // 테두리 업로드 객체 추가
  
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
      
      const backgrounds = files.map(filename => {
        const id = path.parse(filename).name; // 확장자 제외한 파일명
        return {
          id,
          name: id,
          filename,
          url: `/images/label/${filename}`,
          type: 'background',
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
  
  // 주문 목록 조회
  app.get("/api/admin/orders", async (_req, res) => {
    try {
      // 데이터베이스에서 주문 목록 조회
      const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
      
      res.json({
        success: true,
        orders: allOrders
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
      
      if (!['pending', 'processed', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "유효하지 않은 상태입니다. (pending, processed, completed, cancelled만 가능)"
        });
      }
      
      // 데이터베이스에서 주문 상태 업데이트
      const updatedOrder = await db.update(orders)
        .set({ 
          status,
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
        message: "주문 상태가 성공적으로 업데이트되었습니다.",
        order: updatedOrder[0]
      });
    } catch (error: any) {
      console.error("[ERROR] 주문 상태 업데이트 오류:", error);
      res.status(500).json({ 
        success: false, 
        message: "주문 상태 업데이트 중 오류가 발생했습니다: " + error.message 
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
      const userEmail = req.query.email as string;
      
      if (!userEmail) {
        return res.status(400).json({
          success: false,
          message: "이메일이 필요합니다."
        });
      }
      
      // 데이터베이스에서 사용자의 이메일로 주문 조회
      const userOrders = await db.select()
        .from(orders)
        .where(eq(orders.customerEmail, userEmail))
        .orderBy(desc(orders.createdAt));
      
      res.json({
        success: true,
        orders: userOrders
      });
    } catch (error: any) {
      console.error("[ERROR] 사용자 주문 목록 조회 오류:", error);
      res.status(500).json({ 
        success: false, 
        message: "사용자 주문 목록 조회 중 오류가 발생했습니다: " + error.message 
      });
    }
  });

  // 갤러리에 표시될 라벨 목록 API
  app.get("/api/gallery/labels", async (req, res) => {
    try {
      // 완료된(completed) 주문 중 갤러리 표시가 허용된(publishToGallery) 것만 가져옴
      const labels = await db.select({
        id: orders.id,
        title: orders.title,
        customerName: orders.customerName,
        bottleName: orders.bottleName,
        labelImage: orders.labelImage,
        createdAt: orders.createdAt,
        userId: orders.userId
      })
      .from(orders)
      .where(
        and(
          eq(orders.status, 'completed'),
          eq(orders.publishToGallery, true)
        )
      )
      .orderBy(desc(orders.createdAt));

      // 각 라벨에 대한 별점과 좋아요 수 계산
      const result = await Promise.all(labels.map(async (label) => {
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
        let designerName = label.customerName;
        if (label.userId) {
          const user = await db.select({
            username: users.username,
            displayName: users.displayName
          })
          .from(users)
          .where(eq(users.id, label.userId))
          .limit(1);

          if (user.length > 0) {
            designerName = user[0].displayName || user[0].username;
          }
        }

        return {
          ...label,
          rating: Number(ratingsResult[0]?.avgRating || 0).toFixed(1),
          ratingCount: Number(ratingsResult[0]?.count || 0),
          likes: Number(likesCount[0]?.count || 0),
          designer: designerName
        };
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
      
      // 완료된 주문 중 갤러리 표시가 허용된 것만 가져오고, 좋아요 수로 정렬
      const labels = await db.select({
        id: orders.id,
        title: orders.title,
        labelImage: orders.labelImage
      })
      .from(orders)
      .where(
        and(
          eq(orders.status, 'completed'),
          eq(orders.publishToGallery, true),
          sql`${orders.labelImage} IS NOT NULL`
        )
      )
      .limit(limit);
      
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

  const httpServer = createServer(app);
  return httpServer;
}
