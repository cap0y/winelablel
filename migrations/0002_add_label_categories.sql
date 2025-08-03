-- 라벨 배경 카테고리 테이블 생성
CREATE TABLE IF NOT EXISTS "label_categories" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "is_active" BOOLEAN DEFAULT TRUE,
  "display_order" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 배경 이미지와 카테고리 관계 테이블 생성
CREATE TABLE IF NOT EXISTS "label_background_categories" (
  "id" SERIAL PRIMARY KEY,
  "background_id" TEXT NOT NULL,
  "category_id" INTEGER NOT NULL REFERENCES "label_categories"("id") ON DELETE CASCADE,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 초기 카테고리 데이터 삽입
INSERT INTO "label_categories" ("name", "slug", "description", "display_order") VALUES
('생일', 'birthday', '생일 축하용 라벨 배경', 10),
('결혼기념일', 'wedding-anniversary', '결혼기념일 축하용 라벨 배경', 20),
('백일/돌잔치', 'baek-il-dol', '백일/돌잔치 축하용 라벨 배경', 30),
('환갑/칠순', 'hwangap-chilsun', '환갑/칠순 축하용 라벨 배경', 40),
('졸업', 'graduation', '졸업 축하용 라벨 배경', 50),
('프로포즈', 'proposal', '프로포즈용 라벨 배경', 60),
('출산', 'childbirth', '출산 축하용 라벨 배경', 70),
('집들이/이사', 'housewarming', '집들이/이사 축하용 라벨 배경', 80),
('승진/취업', 'promotion-job', '승진/취업 축하용 라벨 배경', 90),
('기념일/특별한날', 'special-day', '기념일/특별한날 축하용 라벨 배경', 100),
('감사/선물', 'thank-you-gift', '감사/선물용 라벨 배경', 110),
('연인/기념일', 'couple-anniversary', '연인/기념일 축하용 라벨 배경', 120),
('우정', 'friendship', '우정 기념용 라벨 배경', 130),
('연말파티/송년회', 'year-end-party', '연말파티/송년회용 라벨 배경', 140); 