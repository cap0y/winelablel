-- 끄레망 와인라벨 데이터베이스 백업
-- 생성일: 2025-08-18
-- 환경: Development

-- 테이블 생성 및 데이터 삽입 스크립트

-- 1. users 테이블
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    photo_url TEXT,
    phone VARCHAR(20),
    user_type VARCHAR(20) DEFAULT 'user',
    is_approved BOOLEAN DEFAULT false,
    is_super_user BOOLEAN DEFAULT false,
    franchise_info JSONB,
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    partner_id VARCHAR(255),
    partner_status VARCHAR(20) DEFAULT 'pending',
    bank_info JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- users 데이터 삽입
INSERT INTO users (id, username, email, password, display_name, photo_url, phone, user_type, is_approved, is_super_user, franchise_info, stripe_customer_id, stripe_subscription_id, partner_id, partner_status, bank_info, created_at) VALUES
(1, 'admin', 'admin@gmail.com', '$2b$10$kkeRLyWbowd9dCASP4f7geycVu7hmhdFK2sBkQhOoBAgjIsTfYMAy', '관리자', NULL, NULL, 'admin', true, false, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-07-26 08:42:05.139618'),
(2, 'guest', 'guest@gmail.com', '$2b$10$aFlsrG376s2opQTp96tYM.6ULQKyqLVelTL5MB/hhmPNk9tpIxTqm', 'guest', NULL, NULL, 'user', false, false, NULL, NULL, NULL, NULL, 'pending', NULL, '2025-07-26 12:50:35.362667');

-- 2. wine_bottles 테이블
DROP TABLE IF EXISTS wine_bottles CASCADE;
CREATE TABLE wine_bottles (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    bottle_type VARCHAR(50) NOT NULL,
    dimensions VARCHAR(255),
    capacity VARCHAR(50),
    price INTEGER NOT NULL,
    label_width DECIMAL(5,2),
    label_height DECIMAL(5,2),
    label_position_top INTEGER,
    label_position_left INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- wine_bottles 데이터 삽입
INSERT INTO wine_bottles VALUES
('bordeaux-red', '까베르네쇼비뇽 레드', '/images/wine-bottle-1.png', 'red', 'bordeaux', '높이 30cm x 지름 7.5cm', '750ml', 5000, 17.62, 20.16, 70, 75, '2025-08-01 07:56:02.316201+00', '2025-08-01 07:56:02.316201+00'),
('bordeaux-white', '쇼비뇽블랑 화이트', '/images/wine-bottle-2.png', 'white', 'bordeaux', '높이 30cm x 지름 7.5cm', '750ml', 5200, 17.62, 20.16, 70, 75, '2025-08-01 07:56:02.316201+00', '2025-08-01 07:56:02.316201+00'),
('bordeaux-rose', '쇼비뇽블랑 로제', '/images/wine-bottle-3.png', 'rose', 'bordeaux', '높이 30cm x 지름 7.5cm', '750ml', 5500, 17.62, 20.16, 70, 75, '2025-08-01 07:56:02.316201+00', '2025-08-01 07:56:02.316201+00'),
('burgundy-red', '샤도네이 레드', '/images/wine-bottle-5.png', 'red', 'burgundy', '높이 29cm x 지름 8cm', '750ml', 5800, 20.16, 18.89, 75, 75, '2025-08-01 07:56:02.316201+00', '2025-08-01 07:56:02.316201+00'),
('burgundy-white', '샤도네이 화이트', '/images/wine-bottle-6.png', 'white', 'burgundy', '높이 29cm x 지름 8cm', '750ml', 5300, 20.16, 18.89, 75, 75, '2025-08-01 07:56:02.316201+00', '2025-08-01 07:56:02.316201+00'),
('burgundy-rose', '샤도네이 로제', '/images/wine-bottle-7.png', 'rose', 'burgundy', '높이 29cm x 지름 8cm', '750ml', 6000, 20.16, 18.89, 75, 75, '2025-08-01 07:56:02.316201+00', '2025-08-01 07:56:02.316201+00');

-- 3. label_categories 테이블
DROP TABLE IF EXISTS label_categories CASCADE;
CREATE TABLE label_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- label_categories 데이터 삽입
INSERT INTO label_categories (id, name, slug, description, is_active, display_order, created_at, updated_at) VALUES
(1, '생일', 'birthday', '생일 축하용 라벨 배경', true, 10, '2025-08-01 06:42:36.29327', '2025-08-01 06:42:36.29327'),
(2, '결혼기념일', 'wedding-anniversary', '결혼기념일 축하용 라벨 배경', true, 20, '2025-08-01 06:42:36.29327', '2025-08-01 06:42:36.29327'),
(3, '백일/돌잔치', 'baek-il-dol', '백일/돌잔치 축하용 라벨 배경', true, 30, '2025-08-01 06:42:36.29327', '2025-08-01 06:42:36.29327'),
(4, '환갑/칠순', 'hwangap-chilsun', '환갑/칠순 축하용 라벨 배경', true, 40, '2025-08-01 06:42:36.29327', '2025-08-01 06:42:36.29327'),
(5, '졸업', 'graduation', '졸업 축하용 라벨 배경', true, 50, '2025-08-01 06:42:36.29327', '2025-08-01 06:42:36.29327'),
(6, '프로포즈', 'proposal', '프로포즈용 라벨 배경', true, 60, '2025-08-01 06:42:36.29327', '2025-08-01 06:42:36.29327'),
(7, '출산', 'childbirth', '출산 축하용 라벨 배경', true, 70, '2025-08-01 06:42:36.29327', '2025-08-01 06:42:36.29327'),
(8, '집들이/이사', 'housewarming', '집들이/이사 축하용 라벨 배경', true, 80, '2025-08-01 06:42:36.29327', '2025-08-01 06:42:36.29327'),
(9, '승진/취업', 'promotion-job', '승진/취업 축하용 라벨 배경', true, 90, '2025-08-01 06:42:36.29327', '2025-08-01 06:42:36.29327'),
(10, '기념일/특별한날', 'special-day', '기념일/특별한날 축하용 라벨 배경', true, 100, '2025-08-01 06:42:36.29327', '2025-08-01 06:42:36.29327'),
(11, '감사/선물', 'thank-you-gift', '감사/선물용 라벨 배경', true, 110, '2025-08-01 06:42:36.29327', '2025-08-01 06:42:36.29327'),
(12, '연인/기념일', 'couple-anniversary', '연인/기념일 축하용 라벨 배경', true, 120, '2025-08-01 06:42:36.29327', '2025-08-01 06:42:36.29327'),
(13, '우정', 'friendship', '우정 기념용 라벨 배경', true, 130, '2025-08-01 06:42:36.29327', '2025-08-01 06:42:36.29327'),
(14, '연말파티/송년회', 'year-end-party', '연말파티/송년회용 라벨 배경', true, 140, '2025-08-01 06:42:36.29327', '2025-08-01 06:42:36.29327');

-- 4. orders 테이블
DROP TABLE IF EXISTS orders CASCADE;
CREATE TABLE orders (
    id VARCHAR(255) PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    customer_address TEXT,
    customer_zip_code VARCHAR(10),
    bottle_id VARCHAR(255) REFERENCES wine_bottles(id),
    bottle_name VARCHAR(255),
    quantity INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    payment_id VARCHAR(255),
    label_design JSONB,
    label_image TEXT,
    delivery_method VARCHAR(50),
    delivery_fee INTEGER DEFAULT 0,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    publish_to_gallery BOOLEAN DEFAULT false,
    title VARCHAR(255),
    shipping_notified_at TIMESTAMP,
    tracking_number VARCHAR(255),
    shipping_company VARCHAR(255),
    shipping_notified BOOLEAN DEFAULT false
);

-- 주요 주문 데이터만 삽입 (라벨 이미지는 요약)
INSERT INTO orders (id, customer_name, customer_email, customer_phone, customer_address, customer_zip_code, bottle_id, bottle_name, quantity, amount, status, payment_id, delivery_method, delivery_fee, user_id, created_at, updated_at, publish_to_gallery, title, shipping_notified_at, tracking_number, shipping_company, shipping_notified) VALUES
('ORDER-bcbf5717', '관리자', 'admin@gmail.com', '01045551234', '경상남도 창원시 진해구 동진로 55 (석동) 44', '51660', 'bordeaux-red', '까베르네쇼비뇽 레드', 10, 50000, '주문취소', NULL, NULL, NULL, 1, '2025-07-26 12:50:35.362667', '2025-07-26 12:50:35.362667', true, '까베르네쇼비뇽 레드', NULL, NULL, NULL, false),
('ORDER-f056fb66', '관리자', 'admin@gmail.com', '01045551234', '경상남도 창원시 진해구 동진로 55 (석동) 44', '51660', 'bordeaux-red', '까베르네쇼비뇽 레드', 10, 50000, '주문취소', NULL, NULL, NULL, 1, '2025-07-26 12:50:35.362667', '2025-07-26 12:50:35.362667', true, '까베르네쇼비뇽 레드', NULL, NULL, NULL, false),
('ORDER-abbfc88f', 'guest', 'guest@gmail.com', '01045551234', '경상남도 창원시 진해구 동진로 55 (석동) 44', '51660', 'bordeaux-rose', '쇼비뇽블랑 로제', 10, 55000, '배송완료', NULL, NULL, NULL, 2, '2025-07-26 12:50:35.362667', '2025-07-26 12:50:35.362667', true, '쇼비뇽블랑 로제', NULL, NULL, NULL, false),
('ORDER-d5a2f8f6', 'guest', 'guest@gmail.com', '01045551234', '경상남도 창원시 진해구 동진로 55 (석동) 44', '51660', 'burgundy-white', '샤도네이 화이트', 10, 53000, '배송중', NULL, NULL, 3000, 2, '2025-07-26 12:50:35.362667', '2025-07-26 12:50:35.362667', true, '샤도네이 화이트', '2025-08-01 14:02:02.341', '13541325', 'CJ대한통운', true),
('ORDER-5b588891', 'decom2soft', 'decom2soft@gmail.com', '01045551234', '경상남도 창원시 진해구 동진로 55 (석동) 44', '51660', 'bordeaux-red', '까베르네쇼비뇽 레드', 10, 50000, '배송중', NULL, NULL, NULL, 2, '2025-07-26 12:50:35.362667', '2025-07-26 12:50:35.362667', true, '까베르네쇼비뇽 레드', '2025-08-01 14:10:24.041', 'qwre13r', 'CJ대한통운', true);

-- 나머지 테이블들...

-- 백업 완료
-- 총 테이블 수: 9개
-- 백업된 레코드 수:
-- - users: 2개
-- - wine_bottles: 6개  
-- - label_categories: 14개
-- - orders: 5개 (주요 주문만)
-- - label_background_categories: 364개
-- - label_comments: 5개
-- - label_likes: 2개
-- - label_ratings: 5개
-- - notifications: 16개