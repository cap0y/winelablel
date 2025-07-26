import { useEffect, useRef } from "react";

interface Storage3DViewerProps {
  size: string;
  dimensions: string;
}

// 보관 사이즈별 치수 정보 (width, height, depth in cm)
const SIZE_DIMENSIONS: Record<string, number[]> = {
  "SB": [70, 100, 70],
  "0.5M": [90, 150, 90],
  "M": [120, 200, 120],
  "2M": [150, 200, 150],
  "3M": [180, 200, 180],
  "4M": [200, 200, 200],
  "XL": [250, 250, 250],
};

export default function Storage3DViewer({ size, dimensions }: Storage3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // CSS로 간단한 3D 효과 구현
    container.innerHTML = '';
    
    // 외부 컨테이너
    const viewerContainer = document.createElement('div');
    viewerContainer.className = 'relative w-full h-full flex items-center justify-center';
    
    // 크기에 맞는 치수 정보 가져오기
    const [width, height, depth] = SIZE_DIMENSIONS[size] || [100, 100, 100];
    
    // 3D 박스 생성
    const box = document.createElement('div');
    box.className = 'relative transform-gpu';
    box.style.width = '180px';
    box.style.height = '180px';
    box.style.transformStyle = 'preserve-3d';
    box.style.animation = 'rotate 20s infinite linear';
    
    // 애니메이션 스타일 추가
    const style = document.createElement('style');
    style.textContent = `
      @keyframes rotate {
        0% { transform: rotateY(0deg) rotateX(15deg); }
        100% { transform: rotateY(360deg) rotateX(15deg); }
      }
    `;
    document.head.appendChild(style);
    
    // 박스 면 생성
    const colors = {
      front: '#00e5c9',
      back: '#00e5c9',
      left: '#00b8a2',
      right: '#00b8a2',
      top: '#00c9b0',
      bottom: '#00c9b0',
    };
    
    const aspectRatio = {
      width: width / 100,
      height: height / 100,
      depth: depth / 100
    };
    
    // 박스 스케일 조정
    const maxDimension = Math.max(aspectRatio.width, aspectRatio.height, aspectRatio.depth);
    const scale = 1 / maxDimension;
    
    // 각 면 생성
    const faces = [
      { name: 'front', transform: `translateZ(${50 * aspectRatio.depth * scale}px)` },
      { name: 'back', transform: `rotateY(180deg) translateZ(${50 * aspectRatio.depth * scale}px)` },
      { name: 'left', transform: `rotateY(-90deg) translateZ(${50 * aspectRatio.width * scale}px)` },
      { name: 'right', transform: `rotateY(90deg) translateZ(${50 * aspectRatio.width * scale}px)` },
      { name: 'top', transform: `rotateX(90deg) translateZ(${50 * aspectRatio.height * scale}px)` },
      { name: 'bottom', transform: `rotateX(-90deg) translateZ(${50 * aspectRatio.height * scale}px)` },
    ];
    
    faces.forEach(face => {
      const element = document.createElement('div');
      element.className = 'absolute border border-white/40';
      element.style.width = `${100 * aspectRatio.width * scale}px`;
      element.style.height = `${100 * aspectRatio.height * scale}px`;
      
      if (face.name === 'left' || face.name === 'right') {
        element.style.width = `${100 * aspectRatio.depth * scale}px`;
        element.style.height = `${100 * aspectRatio.height * scale}px`;
      } else if (face.name === 'top' || face.name === 'bottom') {
        element.style.width = `${100 * aspectRatio.width * scale}px`;
        element.style.height = `${100 * aspectRatio.depth * scale}px`;
      }
      
      element.style.backgroundColor = colors[face.name as keyof typeof colors] || '#00e5c9';
      element.style.opacity = '0.3';
      element.style.transform = face.transform;
      element.style.transformOrigin = 'center';
      element.style.backfaceVisibility = 'hidden';
      box.appendChild(element);
    });
    
    // 몇 가지 샘플 아이템 추가
    if (size === 'M' || size === '2M' || size === '3M' || size === '4M' || size === 'XL') {
      const items = [
        { width: 30, height: 20, depth: 15, x: -20, y: 40, z: 10, color: '#3366cc' },
        { width: 25, height: 15, depth: 25, x: 20, y: 42.5, z: -10, color: '#66cc33' },
      ];
      
      if (size !== 'M') {
        items.push({ width: 20, height: 30, depth: 20, x: 0, y: 35, z: 0, color: '#ff6633' });
      }
      
      if (size === '4M' || size === 'XL') {
        items.push({ width: 15, height: 10, depth: 15, x: -15, y: 45, z: -15, color: '#cc33cc' });
      }
      
      items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'absolute';
        itemElement.style.width = `${item.width * scale}px`;
        itemElement.style.height = `${item.height * scale}px`;
        itemElement.style.backgroundColor = item.color;
        itemElement.style.transform = `translate3d(${item.x * scale}px, ${item.y * scale}px, ${item.z * scale}px)`;
        itemElement.style.opacity = '0.8';
        box.appendChild(itemElement);
      });
    }
    
    viewerContainer.appendChild(box);
    
    // 치수 정보 표시
    const infoContainer = document.createElement('div');
    infoContainer.className = 'absolute bottom-2 left-0 right-0 text-center';
    
    const sizeText = document.createElement('div');
    sizeText.className = 'text-xl font-bold text-primary';
    sizeText.textContent = size;
    
    const dimensionText = document.createElement('div');
    dimensionText.className = 'text-sm text-gray-300';
    dimensionText.textContent = dimensions;
    
    infoContainer.appendChild(sizeText);
    infoContainer.appendChild(dimensionText);
    viewerContainer.appendChild(infoContainer);
    
    container.appendChild(viewerContainer);
    
    return () => {
      document.head.removeChild(style);
    };
  }, [size, dimensions]);
  
  return (
    <div 
      ref={containerRef}
      className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center"
    />
  );
}
