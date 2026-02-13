import { createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 디렉토리 생성
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 디컴소프트 로고 생성 함수
function create디컴소프트Icon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // 배경색 (turquoise/teal)
  ctx.fillStyle = '#14b8a6';
  ctx.fillRect(0, 0, size, size);
  
  // 둥근 모서리 효과
  ctx.globalCompositeOperation = 'destination-in';
  ctx.beginPath();
  const radius = size * 0.15;
  ctx.roundRect(0, 0, size, size, radius);
  ctx.fill();
  
  ctx.globalCompositeOperation = 'source-over';
  
  // 박스 아이콘 그리기
  const padding = size * 0.2;
  const boxSize = size - (padding * 2);
  const boxX = padding;
  const boxY = padding;
  
  // 메인 박스 (흰색 배경)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(boxX, boxY, boxSize, boxSize * 0.7);
  
  // 박스 테두리
  ctx.strokeStyle = '#0f766e';
  ctx.lineWidth = size * 0.02;
  ctx.strokeRect(boxX, boxY, boxSize, boxSize * 0.7);
  
  // 박스 뚜껑
  ctx.fillStyle = '#f0fdfa';
  ctx.fillRect(boxX, boxY - size * 0.05, boxSize, size * 0.1);
  ctx.strokeRect(boxX, boxY - size * 0.05, boxSize, size * 0.1);
  
  // 'S' 문자 (디컴소프트의 S)
  ctx.fillStyle = '#14b8a6';
  ctx.font = `bold ${size * 0.3}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('S', boxX + boxSize/2, boxY + boxSize * 0.35);
  
  return canvas;
}

// Maskable 버전 생성 (더 큰 safe area)
function createMaskableIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // 전체 배경색
  ctx.fillStyle = '#14b8a6';
  ctx.fillRect(0, 0, size, size);
  
  // 중앙에 더 작은 아이콘
  const iconSize = size * 0.6; // safe area 고려
  const offset = (size - iconSize) / 2;
  
  const padding = iconSize * 0.2;
  const boxSize = iconSize - (padding * 2);
  const boxX = offset + padding;
  const boxY = offset + padding;
  
  // 메인 박스
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(boxX, boxY, boxSize, boxSize * 0.7);
  
  ctx.strokeStyle = '#0f766e';
  ctx.lineWidth = size * 0.015;
  ctx.strokeRect(boxX, boxY, boxSize, boxSize * 0.7);
  
  // 박스 뚜껑
  ctx.fillStyle = '#f0fdfa';
  ctx.fillRect(boxX, boxY - iconSize * 0.05, boxSize, iconSize * 0.1);
  ctx.strokeRect(boxX, boxY - iconSize * 0.05, boxSize, iconSize * 0.1);
  
  // 'S' 문자
  ctx.fillStyle = '#14b8a6';
  ctx.font = `bold ${iconSize * 0.25}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('S', boxX + boxSize/2, boxY + boxSize * 0.35);
  
  return canvas;
}

// 아이콘 크기별 생성
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(size => {
  // 일반 아이콘
  const canvas = create디컴소프트Icon(size);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}.png`), buffer);
  console.log(`Generated icon-${size}x${size}.png (${buffer.length} bytes)`);
  
  // Maskable 아이콘 (특정 크기만)
  if ([192, 512].includes(size)) {
    const maskableCanvas = createMaskableIcon(size);
    const maskableBuffer = maskableCanvas.toBuffer('image/png');
    fs.writeFileSync(path.join(iconsDir, `icon-${size}x${size}-maskable.png`), maskableBuffer);
    console.log(`Generated icon-${size}x${size}-maskable.png (${maskableBuffer.length} bytes)`);
  }
});

console.log('모든 아이콘 생성 완료!');