-- 와인병 테이블 생성
CREATE TABLE IF NOT EXISTS wine_bottles (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  image VARCHAR(255) NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('red', 'white', 'rose')),
  bottle_type VARCHAR(20) NOT NULL CHECK (bottle_type IN ('bordeaux', 'burgundy', 'custom')),
  dimensions VARCHAR(100),
  capacity VARCHAR(20),
  price INTEGER NOT NULL,
  label_width DECIMAL(10, 2) NOT NULL,
  label_height DECIMAL(10, 2) NOT NULL,
  label_position_top INTEGER NOT NULL,
  label_position_left INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 기본 와인병 데이터 삽입
INSERT INTO wine_bottles (
  id, name, image, type, bottle_type, 
  dimensions, capacity, price, 
  label_width, label_height, label_position_top, label_position_left
) VALUES 
  (
    'bordeaux-red', 
    '까베르네쇼비뇽 레드', 
    '/images/wine-bottle-1.png', 
    'red', 
    'bordeaux', 
    '높이 30cm x 지름 7.5cm', 
    '750ml', 
    5000, 
    17.62, 20.16, 70, 75
  ),
  (
    'bordeaux-white', 
    '쇼비뇽블랑 화이트', 
    '/images/wine-bottle-2.png', 
    'white', 
    'bordeaux', 
    '높이 30cm x 지름 7.5cm', 
    '750ml', 
    5200, 
    17.62, 20.16, 70, 75
  ),
  (
    'bordeaux-rose', 
    '쇼비뇽블랑 로제', 
    '/images/wine-bottle-3.png', 
    'rose', 
    'bordeaux', 
    '높이 30cm x 지름 7.5cm', 
    '750ml', 
    5500, 
    17.62, 20.16, 70, 75
  ),
  (
    'burgundy-red', 
    '샤도네이 레드', 
    '/images/wine-bottle-5.png', 
    'red', 
    'burgundy', 
    '높이 29cm x 지름 8cm', 
    '750ml', 
    5800, 
    20.16, 18.89, 75, 75
  ),
  (
    'burgundy-white', 
    '샤도네이 화이트', 
    '/images/wine-bottle-6.png', 
    'white', 
    'burgundy', 
    '높이 29cm x 지름 8cm', 
    '750ml', 
    5300, 
    20.16, 18.89, 75, 75
  ),
  (
    'burgundy-rose', 
    '샤도네이 로제', 
    '/images/wine-bottle-7.png', 
    'rose', 
    'burgundy', 
    '높이 29cm x 지름 8cm', 
    '750ml', 
    6000, 
    20.16, 18.89, 75, 75
  ); 