import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 이미지 저장 디렉토리
const outputDir = path.join(__dirname, '..', 'client', 'public', 'images');

// 디렉토리가 없으면 생성
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// 와인병 데이터
const wineBottles = [
  { id: 1, name: 'bordeaux-red-black', bottleColor: '#3a1a1a', capsuleColor: '#1a1a1a' },
  { id: 2, name: 'white-gold', bottleColor: '#2d4a2b', capsuleColor: '#d4af37' },
  { id: 3, name: 'rose-copper', bottleColor: '#4a3a3a', capsuleColor: '#b87333' },
  { id: 4, name: 'white-black', bottleColor: '#3a4a2a', capsuleColor: '#1a1a1a' },
  { id: 5, name: 'red-gold', bottleColor: '#2a1a1a', capsuleColor: '#d4af37' },
  { id: 6, name: 'red-black-slim', bottleColor: '#1a0a0a', capsuleColor: '#0a0a0a' },
  { id: 7, name: 'red-gold-premium', bottleColor: '#1a0a0a', capsuleColor: '#d4af37' }
];

// SVG를 생성하는 함수
function createWineBottleSVG(bottleColor, capsuleColor, isSlim = false) {
  const width = isSlim ? 80 : 100;
  
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 300" width="${width}" height="300">
      <!-- 와인병 본체 -->
      <path d="M ${isSlim ? 28 : 25} 250 L ${isSlim ? 28 : 25} 100 Q ${isSlim ? 28 : 25} 80 ${isSlim ? 32 : 30} 60 L ${isSlim ? 32 : 30} 40 Q ${isSlim ? 32 : 30} 30 ${isSlim ? 36 : 35} 30 L ${isSlim ? 44 : 45} 30 Q ${isSlim ? 48 : 50} 30 ${isSlim ? 48 : 50} 40 L ${isSlim ? 48 : 50} 60 Q ${isSlim ? 52 : 55} 80 ${isSlim ? 52 : 55} 100 L ${isSlim ? 52 : 55} 250 Q ${isSlim ? 52 : 55} 270 ${width/2} 270 Q ${isSlim ? 28 : 25} 270 ${isSlim ? 28 : 25} 250 Z" fill="${bottleColor}"/>
      
      <!-- 병목 부분 -->
      <rect x="${isSlim ? 33 : 30}" y="20" width="${isSlim ? 14 : 20}" height="40" fill="${bottleColor}"/>
      
      <!-- 캡슐 -->
      <rect x="${isSlim ? 31 : 28}" y="10" width="${isSlim ? 18 : 24}" height="30" fill="${capsuleColor}"/>
      <rect x="${isSlim ? 29 : 26}" y="8" width="${isSlim ? 22 : 28}" height="5" rx="2" fill="${capsuleColor}"/>
      
      <!-- 라벨 -->
      <rect x="${isSlim ? 30 : 27}" y="120" width="${isSlim ? 20 : 26}" height="80" fill="#f5f5f5" opacity="0.9"/>
      
      <!-- 하이라이트 효과 -->
      <path d="M ${isSlim ? 32 : 30} 60 Q ${isSlim ? 35 : 35} 80 ${isSlim ? 35 : 35} 100 L ${isSlim ? 35 : 35} 200 Q ${isSlim ? 35 : 35} 220 ${isSlim ? 35 : 35} 240" stroke="white" stroke-width="2" fill="none" opacity="0.3"/>
    </svg>
  `;
}

// PNG 생성
async function generateWineBottleImages() {
  console.log('와인병 이미지 생성 시작...');
  
  for (const bottle of wineBottles) {
    const isSlim = bottle.id === 6;
    const svg = createWineBottleSVG(bottle.bottleColor, bottle.capsuleColor, isSlim);
    
    try {
      await sharp(Buffer.from(svg))
        .resize(200, 600) // 고품질 이미지로 리사이즈
        .png()
        .toFile(path.join(outputDir, `wine-bottle-${bottle.id}.png`));
      
      console.log(`✓ wine-bottle-${bottle.id}.png 생성 완료`);
    } catch (error) {
      console.error(`✗ wine-bottle-${bottle.id}.png 생성 실패:`, error);
    }
  }
  
  console.log('모든 와인병 이미지 생성 완료!');
}

// 실행
generateWineBottleImages(); 