import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Wine, Type, ImageIcon, Grid, ShoppingCart, Save, Undo, Redo, Download, Palette, ArrowLeft, Upload, Plus, Minus, Edit, Crop, Sliders, RotateCcw, FlipHorizontal, FlipVertical, Contrast, Sun, Droplets, Circle, Square, Triangle, Star, Heart, Diamond, Hexagon, Trash2, RotateCw, Zap, Crown, Gift } from "lucide-react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { isMobile, useIsMobile } from "@/hooks/use-mobile";
import { adminApi } from "@/services/api";
import { uploadApi } from "@/services/api";
import html2canvas from "html2canvas";
import { labelApi } from "@/services/api";

// 텍스트 효과 스타일 생성 함수
const getTextEffectStyles = (design: any) => {
  const styles: React.CSSProperties = {};
  
  // 그림자 효과
  if (design.textShadow !== "none") {
    switch (design.textShadow) {
      case "soft":
        styles.textShadow = "2px 2px 4px rgba(0,0,0,0.3)";
        break;
      case "hard":
        styles.textShadow = "3px 3px 0px rgba(0,0,0,0.8)";
        break;
      case "colored":
        styles.textShadow = "2px 2px 4px rgba(255,0,0,0.5), 4px 4px 8px rgba(0,255,0,0.3)";
        break;
      case "glow":
        styles.textShadow = "0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor";
        break;
    }
  }
  
  // 테두리 효과
  if (design.textStroke !== "none") {
    const strokeWidth = design.textStroke === "thin" ? "1px" : "2px";
    styles.WebkitTextStroke = `${strokeWidth} ${design.textStrokeColor}`;
  }
  
  // 대소문자 변환
  if (design.textTransform !== "none") {
    styles.textTransform = design.textTransform;
  }
  
  // 기울임
  if (design.fontStyle === "italic") {
    styles.fontStyle = "italic";
  }
  
  // 밑줄/취소선
  if (design.textDecoration !== "none") {
    styles.textDecoration = design.textDecoration;
  }
  
  // 글자 간격
  if (design.letterSpacing !== 0) {
    styles.letterSpacing = `${design.letterSpacing}rem`;
  }
  
  // 그라데이션 효과
  if (design.textGradient !== "none") {
    let gradientColors = "";
    switch (design.textGradient) {
      case "rainbow":
        gradientColors = "linear-gradient(45deg, #ff0000, #ff8800, #ffff00, #88ff00, #00ff88, #0088ff, #8800ff)";
        break;
      case "sunset":
        gradientColors = "linear-gradient(45deg, #ff6b35, #f7931e, #ffce00)";
        break;
      case "ocean":
        gradientColors = "linear-gradient(45deg, #0077be, #00b4db, #0083b0)";
        break;
      case "forest":
        gradientColors = "linear-gradient(45deg, #134e5e, #71b280)";
        break;
      case "fire":
        gradientColors = "linear-gradient(45deg, #ff4757, #ff6b35, #ffa726)";
        break;
    }
    if (gradientColors) {
      styles.backgroundImage = gradientColors;
      styles.WebkitBackgroundClip = "text";
      styles.backgroundClip = "text";
      styles.WebkitTextFillColor = "transparent";
      styles.color = "transparent";
    }
  }
  
  return styles;
};

// 제품(와인병/박스) 정보 가져오는 함수
const getProductModel = (id: string) => {
  const bottles = [
    {
      id: "bordeaux-red",
      name: "까베르네쇼비뇽 레드",
      image: "/images/wine-bottle-1.png",
      type: "red",
      bottleType: "bordeaux",
      dimensions: "높이 30cm x 지름 7.5cm",
      capacity: "750ml",
      price: 5000,
      labelSize: {
        width: 17.62, // rem 단위
        height: 20.16, // rem 단위
        position: { top: 70, left: 75 } // % 단위
      }
    },
    {
      id: "bordeaux-white",
      name: "쇼비뇽블랑 화이트",
      image: "/images/wine-bottle-2.png",
      type: "white",
      bottleType: "bordeaux",
      dimensions: "높이 30cm x 지름 7.5cm",
      capacity: "750ml",
      price: 5200,
      labelSize: {
        width: 17.62, // rem 단위
        height: 20.16, // rem 단위
        position: { top: 70, left: 75 }
      }
    },
    {
      id: "bordeaux-rose",
      name: "쇼비뇽블랑 로제",
      image: "/images/wine-bottle-3.png",
      type: "rose",
      bottleType: "bordeaux",
      dimensions: "높이 30cm x 지름 7.5cm",
      capacity: "750ml",
      price: 5500,
      labelSize: {
        width: 17.62, // rem 단위
        height: 20.16, // rem 단위
        position: { top: 70, left: 75 }
      }
    },
    {
      id: "burgundy-red",
      name: "샤도네이 레드",
      image: "/images/wine-bottle-5.png",
      type: "red",
      bottleType: "burgundy",
      dimensions: "높이 29cm x 지름 8cm",
      capacity: "750ml",
      price: 5800,
      labelSize: {
        width: 20.16, // 정사각형 라벨: 
        height: 18.89, // 정사각형 라벨
        position: { top: 75, left: 75 } // % 단위
      }
    },
    {
      id: "burgundy-white",
      name: "샤도네이 화이트",
      image: "/images/wine-bottle-6.png",
      type: "white",
      bottleType: "burgundy",
      dimensions: "높이 29cm x 지름 8cm",
      capacity: "750ml",
      price: 5300,
      labelSize: {
        width: 20.16, // 정사각형 라벨: 
        height: 18.89, // 정사각형 라벨
        position: { top: 75, left: 75 }
      }
    },
    {
      id: "burgundy-rose",
      name: "샤도네이 로제",
      image: "/images/wine-bottle-7.png",
      type: "rose",
      bottleType: "burgundy",
      dimensions: "높이 29cm x 지름 8cm",
      capacity: "750ml",
      price: 6000,
      labelSize: {
        width: 20.16, // 정사각형 라벨: 
        height: 18.89, // 정사각형 라벨
        position: { top: 75, left: 75 }
      }
    },
    // 제품 박스(소/중/대)
    {
      id: "box-small",
      name: "소형 박스",
      image: "",
      type: "box",
      bottleType: "box",
      dimensions: "가로 15cm x 세로 20cm x 폭 5cm",
      capacity: "패키지 소형",
      price: 3000,
      labelSize: {
        width: 16,
        height: 14,
        position: { top: 52, left: 50 }
      }
    },
    {
      id: "box-medium",
      name: "중형 박스",
      image: "",
      type: "box",
      bottleType: "box",
      dimensions: "가로 20cm x 세로 25cm x 폭 8cm",
      capacity: "패키지 중형",
      price: 5000,
      labelSize: {
        width: 18,
        height: 16,
        position: { top: 52, left: 50 }
      }
    },
    {
      id: "box-large",
      name: "대형 박스",
      image: "",
      type: "box",
      bottleType: "box",
      dimensions: "가로 25cm x 세로 32cm x 폭 10cm",
      capacity: "패키지 대형",
      price: 8000,
      labelSize: {
        width: 20,
        height: 18,
        position: { top: 52, left: 50 }
      }
    }
  ];
  
  return bottles.find(model => model.id === id);
};

// 폰트 데이터
const fonts = [
  // 기본 폰트
  { id: "font1", name: "세리프", family: "Georgia, serif" },
  { id: "font2", name: "산세리프", family: "'Noto Sans KR', sans-serif" },
  { id: "font7", name: "명조", family: "'Nanum Myeongjo', serif" },
  { id: "font20", name: "굵은명조", family: "'Noto Serif KR', serif" },
  { id: "font5", name: "고딕", family: "'Gothic A1', sans-serif" },
  { id: "font45", name: "고딕체", family: "'Nanum Gothic', sans-serif" },
  
  // 붓글씨 & 서예체
  { id: "font46", name: "동해독도체", family: "'East Sea Dokdo', cursive" },
  { id: "font47", name: "감자꽃체", family: "'Gamja Flower', cursive" },
  { id: "font10", name: "나눔펜체", family: "'Nanum Pen Script', cursive" },
  { id: "font51", name: "궁서체", family: "'Gungsuh', serif" },
  { id: "font52", name: "휴먼매직체", family: "'Hanna', sans-serif" },
  { id: "font53", name: "나눔손글씨펜", family: "'Nanum Pen Script', cursive" },
  { id: "font54", name: "배민주아", family: "'Jua', sans-serif" },
  { id: "font55", name: "나눔바른펜", family: "'Nanum Brush Script', cursive" },
  { id: "font56", name: "송명체", family: "'Song Myung', serif" },
  { id: "font57", name: "검은고딕", family: "'Black Han Sans', sans-serif" },
  { id: "font58", name: "한나체", family: "'Hanna', sans-serif" },
  { id: "font59", name: "나눔고딕코딩", family: "'Nanum Gothic Coding', monospace" },
  
  // 세로쓰기 지원 폰트
  { id: "font60", name: "세로명조", family: "'Nanum Myeongjo', serif", vertical: true },
  { id: "font61", name: "세로고딕", family: "'Nanum Gothic', sans-serif", vertical: true },
  { id: "font62", name: "세로바탕", family: "'Batang', serif", vertical: true },
  { id: "font63", name: "세로궁서", family: "'Gungsuh', serif", vertical: true },
  { id: "font64", name: "세로붓글씨", family: "'East Sea Dokdo', cursive", vertical: true },
  
  // 장식적 폰트
  { id: "font9", name: "둥근체", family: "'Gaegu', cursive" },
  { id: "font48", name: "도톰한", family: "'Jua', sans-serif" },
  { id: "font11", name: "브러시", family: "'Black Han Sans', sans-serif" },
  
  // 영문 폰트
  { id: "font3", name: "스크립트", family: "'Dancing Script', cursive" },
  { id: "font4", name: "모던", family: "'Montserrat', sans-serif" },
  { id: "font6", name: "클래식", family: "'Playfair Display', serif" },
  { id: "font12", name: "영문필기", family: "'Pacifico', cursive" },
  { id: "font19", name: "캘리그라피", family: "'Great Vibes', cursive" },
  { id: "font26", name: "로맨틱", family: "'Sacramento', cursive" },
  { id: "font35", name: "고급스러운", family: "'Cinzel', serif" },
  { id: "font50", name: "장식적", family: "'Lobster', cursive" },
  
  // 기타
  { id: "font13", name: "헤드라인", family: "'Oswald', sans-serif" },
  { id: "font17", name: "미니멀", family: "'Roboto', sans-serif" },
  { id: "font31", name: "세련된", family: "'Poppins', sans-serif" },
  { id: "font33", name: "현대적", family: "'Inter', sans-serif" },
  { id: "font36", name: "캐주얼", family: "'Open Sans', sans-serif" },
  { id: "font37", name: "테크닉", family: "'Orbitron', monospace" }
];

// 요소 아이콘 렌더링 함수
const renderElementIcon = (type: string, size: number, color: string) => {
  const iconProps = {
    size: size,
    color: color,
    style: { width: `${size}px`, height: `${size}px` }
  };

  switch (type) {
    case 'circle':
      return <Circle {...iconProps} fill={color} />;
    case 'square':
      return <Square {...iconProps} fill={color} />;
    case 'triangle':
      return <Triangle {...iconProps} fill={color} />;
    case 'star':
      return <Star {...iconProps} fill={color} />;
    case 'heart':
      return <Heart {...iconProps} fill={color} />;
    case 'diamond':
      return <Diamond {...iconProps} fill={color} />;
    case 'hexagon':
      return <Hexagon {...iconProps} fill={color} />;
    case 'zap':
      return <Zap {...iconProps} fill={color} />;
    case 'crown':
      return <Crown {...iconProps} fill={color} />;
    case 'gift':
      return <Gift {...iconProps} fill={color} />;
    default:
      return <Circle {...iconProps} fill={color} />;
  }
};

// 드래그 가능한 요소 (새로운 구현)
function DraggableElement({
  children,
  position,
  onPositionChange,
  type
}: {
  children: React.ReactNode;
  position: { x: number; y: number };
  onPositionChange: (newPosition: { x: number; y: number }) => void;
  type: string;
}) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  
  // 이동 속도 조절 계수 (값을 키워 반응성을 높임)
  const moveFactor = isMobile ? 0.35 : 0.35;

  // 마우스 이벤트 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragging) return;
      
      const deltaX = (e.clientX - startPos.x) * moveFactor;
      const deltaY = (e.clientY - startPos.y) * moveFactor;
      
      // 위치 제약 완화 - 라벨지 경계를 벗어날 수 있도록 확장
      const newX = Math.min(Math.max(position.x + deltaX, -50), 150);
      const newY = Math.min(Math.max(position.y + deltaY, -50), 150);
      
      onPositionChange({ x: newX, y: newY });
      setStartPos({ x: e.clientX, y: e.clientY });
      
      e.preventDefault();
      e.stopPropagation();
    },
    [dragging, startPos, position, onPositionChange, moveFactor]
  );

  const handleMouseUp = useCallback(() => {
    setDragging(false);
  }, []);

  // 터치 이벤트 핸들러
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setDragging(true);
    setStartPos({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!dragging || !e.touches[0]) return;
      
      const touch = e.touches[0];
      const deltaX = (touch.clientX - startPos.x) * moveFactor;
      const deltaY = (touch.clientY - startPos.y) * moveFactor;
      
      // 위치 제약 완화 - 라벨지 경계를 벗어날 수 있도록 확장
      const newX = Math.min(Math.max(position.x + deltaX, -50), 150);
      const newY = Math.min(Math.max(position.y + deltaY, -50), 150);
      
      onPositionChange({ x: newX, y: newY });
      setStartPos({ x: touch.clientX, y: touch.clientY });
      
      e.preventDefault();
    },
    [dragging, startPos, position, onPositionChange, moveFactor]
  );

  const handleTouchEnd = useCallback(() => {
    setDragging(false);
  }, []);

  // 이벤트 리스너 등록/해제
  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [dragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  return (
    <div
      ref={elementRef}
      style={{
        position: 'absolute',
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
        cursor: dragging ? 'grabbing' : 'grab',
        opacity: dragging ? 0.7 : 1,
        userSelect: 'none',
        touchAction: 'none',
        zIndex: dragging ? 1000 : 1
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      data-draggable="true"
      data-type={type}
    >
      {children}
    </div>
  );
}

// 미리보기 컴포넌트 (새로운 세로 레이아웃용)
function LabelPreview({ 
  labelDesign, 
  wineBottle, 
  decorationToAdd,
  elements = [],
  onUpdatePositions,
  onElementPositionUpdate,
  onDeleteElement,
  labelBackgrounds = [],
  labelDecorations = [],
  labelBorders = [],
  uploadedImages = []
}: { 
  labelDesign: any, 
  wineBottle: any,
  decorationToAdd: string | null,
  elements?: Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    size: number;
    color: string;
    rotation: number;
  }>,
  onUpdatePositions?: (data: {
    decorations: any[],
    textPosition: { x: number, y: number },
    subtextPosition: { x: number, y: number }
  }) => void,
  onElementPositionUpdate?: (elementId: string, newPosition: { x: number; y: number }) => void,
  onDeleteElement?: (elementId: string) => void,
  labelBackgrounds?: any[],
  labelDecorations?: any[],
  labelBorders?: any[],
  uploadedImages?: any[]
}) {
  const { 
    template, 
    text, 
    subtext, 
    font, 
    textColor, 
    backgroundColor, 
    borderStyle, 
    textSize = 1.25,  // 기본값 설정
    subtextSize = 1,   // 기본값 설정
    imageFilter = "none",
    imageBrightness = 100,
    imageContrast = 100,
    imageSaturation = 100,
    imageHue = 0,
    imageFlipH = false,
    imageFlipV = false,
    imageCrop = { x: 0, y: 0, width: 100, height: 100 }
  } = labelDesign;

  // 제품(박스/와인) 라벨 프레임 크기 설정 (기본값)
  const baseLabelWidth = wineBottle?.labelSize?.width || 18; // rem 단위
  const baseLabelHeight = wineBottle?.labelSize?.height || 18; // 박스 기본 높이 rem
  
  // 모바일에서 라벨 크기를 화면에 맞게 확대
  const labelWidth = isMobile ? baseLabelWidth * 1.2 : baseLabelWidth;
  const labelHeight = isMobile ? baseLabelHeight * 1.2 : baseLabelHeight;

  const templateImage = labelBackgrounds.find((t: { id: string }) => t.id === template)?.image || '';
  
  // Fallback: labelBackgrounds에서 찾지 못하면 uploadedImages에서 직접 찾기
  let finalTemplateImage = templateImage;
  if (!templateImage && template && uploadedImages.length > 0) {
    const uploadedImage = uploadedImages.find((img: any) => img.id === template);
    if (uploadedImage) {
      finalTemplateImage = uploadedImage.image;
    }
  }
  
  const selectedFontObj = fonts.find(f => f.id === font);
  const selectedFont = selectedFontObj?.family || "'Noto Sans KR', sans-serif";
  const isVerticalFont = selectedFontObj?.vertical || false;
  
  // 선택된 테두리 정보 찾기
  const selectedBorder = labelBorders.find((b: { id: string }) => b.id === borderStyle);
  const borderType = selectedBorder?.type || 'basic';
  const borderImage = selectedBorder?.image || '';
  const isImageBorder = borderType === 'image';
  
  // 기본 테두리 스타일 결정
  const getBasicBorderClass = () => {
    if (borderStyle === 'all') return 'border-2 border-solid border-primary';
    if (borderStyle === 'horizontal') return 'border-t-2 border-b-2 border-solid border-primary';
    if (borderStyle === 'vertical') return 'border-l-2 border-r-2 border-solid border-primary';
    return 'border-2 border-dashed border-gray-400'; // none이거나 기본값
  };
  
  // 테두리 이미지 위치에 따른 스타일 결정
  const getBorderImageStyle = () => {
    if (!isImageBorder || !borderImage) return {};
    
    const { borderPosition } = labelDesign;
    
    if (borderPosition === 'horizontal') {
      // 상하에만 표시
      return {
        background: `
          url(${borderImage}) top center / 100% 20px no-repeat,
          url(${borderImage}) bottom center / 100% 20px no-repeat
        `,
      };
    } else if (borderPosition === 'vertical') {
      // 좌우에만 표시
      return {
        background: `
          url(${borderImage}) left center / 20px 100% no-repeat,
          url(${borderImage}) right center / 20px 100% no-repeat
        `,
      };
    } else {
      // 상하좌우 전체
      return {
        backgroundImage: `url(${borderImage})`,
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }
  };

  // 위치 상태
  const [textPosition, setTextPosition] = useState({ x: 50, y: 40 });
  const [subtextPosition, setSubtextPosition] = useState({ x: 50, y: 60 });
  
  // 다중 장식 관리를 위한 상태 (각각 고유 ID 및 위치 정보 포함)
  const [decorations, setDecorations] = useState<Array<{
    id: string;
    decorationId: string;
    position: { x: number; y: number };
  }>>([]);
  
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // historyIndex를 안전하게 참조하기 위한 ref
  const historyIndexRef = useRef(-1);
  
  // historyIndex가 변경될 때마다 ref 업데이트
  useEffect(() => {
    historyIndexRef.current = historyIndex;
  }, [historyIndex]);
  
  // 장식 추가
  const addDecoration = useCallback((decorationId: string) => {
    if (!decorationId || decorationId === "deco4") return; // "없음" 선택 시 추가하지 않음
    
    const newId = `decoration-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newDecoration = {
      id: newId,
      decorationId: decorationId,
      position: { x: 50, y: 50 } // 기본 위치는 중앙
    };
    
    setDecorations(prev => [...prev, newDecoration]);
    
    // 히스토리에 추가 작업 기록
    setHistory(prevHistory => {
      const currentHistoryIndex = historyIndexRef.current;
      const newHistory = [...prevHistory.slice(0, currentHistoryIndex + 1), { 
        type: 'decoration', 
        action: 'add',
        id: newId,
        decorationId,
        position: { x: 50, y: 50 }
      }];
      return newHistory;
    });
    setHistoryIndex(prev => prev + 1);
  }, []); // 의존성 배열을 빈 배열로 설정

  // decorationToAdd가 변경되면 장식 추가
  useEffect(() => {
    if (decorationToAdd && decorationToAdd !== "deco4") {
      // 직접 장식 추가 로직 실행
      const newId = `decoration-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newDecoration = {
        id: newId,
        decorationId: decorationToAdd,
        position: { x: 50, y: 50 }
      };
      
      setDecorations(prev => [...prev, newDecoration]);
      
      setHistory(prevHistory => {
        const currentHistoryIndex = historyIndexRef.current;
        const newHistory = [...prevHistory.slice(0, currentHistoryIndex + 1), { 
          type: 'decoration', 
          action: 'add',
          id: newId,
          decorationId: decorationToAdd,
          position: { x: 50, y: 50 }
        }];
        return newHistory;
      });
      setHistoryIndex(prev => prev + 1);
    }
  }, [decorationToAdd]); // decorationToAdd만 의존성으로 설정
  
  // 위치 변경 핸들러 - 히스토리 추가
  const handleDecorationChange = (id: string, newPosition: {x: number, y: number}) => {
    setDecorations(prev => {
      const updated = prev.map(item => 
        item.id === id ? { ...item, position: newPosition } : item
      );
      return updated;
    });
    
    const decorationHistory = [...history.slice(0, historyIndexRef.current + 1), { 
      type: 'decoration', 
      action: 'move',
      id, 
      position: newPosition 
    }];
    setHistory(decorationHistory);
    setHistoryIndex(decorationHistory.length - 1);
  };
  
  const handleTextChange = (newPosition: {x: number, y: number}) => {
    setTextPosition(newPosition);
    const textHistory = [...history.slice(0, historyIndexRef.current + 1), { type: 'mainText', position: newPosition }];
    setHistory(textHistory);
    setHistoryIndex(textHistory.length - 1);
  };
  
  const handleSubtextChange = (newPosition: {x: number, y: number}) => {
    setSubtextPosition(newPosition);
    const subtextHistory = [...history.slice(0, historyIndexRef.current + 1), { type: 'subText', position: newPosition }];
    setHistory(subtextHistory);
    setHistoryIndex(subtextHistory.length - 1);
  };
  
  // 장식 삭제
  const removeDecoration = (id: string) => {
    setDecorations(prev => prev.filter(item => item.id !== id));
    
    // 히스토리에 삭제 작업 기록
    const removeHistory = [...history.slice(0, historyIndexRef.current + 1), { 
      type: 'decoration', 
      action: 'remove',
      id
    }];
    setHistory(removeHistory);
    setHistoryIndex(removeHistory.length - 1);
  };

  // Undo/Redo 함수
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      const prevItem = history[historyIndex - 1];
      
      // 되돌린 항목 유형에 따라 적절한 상태 업데이트
      if (prevItem.type === 'decoration') {
        if (prevItem.action === 'move') {
          setDecorations(prev => 
            prev.map(item => 
              item.id === prevItem.id ? { ...item, position: prevItem.position } : item
            )
          );
        } 
        else if (prevItem.action === 'add') {
          setDecorations(prev => 
            prev.filter(item => item.id !== prevItem.id)
          );
        }
        else if (prevItem.action === 'remove') {
          // 삭제된 장식을 복원해야 하지만, 정보가 없으므로 이전 히스토리에서 찾아야 함
          const decorationToRestore = history.slice(0, historyIndex - 1).reverse()
            .find(h => h.type === 'decoration' && h.id === prevItem.id && (h.action === 'add' || h.action === 'move'));
          
          if (decorationToRestore) {
            setDecorations(prev => [
              ...prev, 
              { 
                id: decorationToRestore.id, 
                decorationId: decorationToRestore.decorationId, 
                position: decorationToRestore.position 
              }
            ]);
          }
        }
      } 
      else if (prevItem.type === 'mainText') {
        setTextPosition(prevItem.position);
      }
      else if (prevItem.type === 'subText') {
        setSubtextPosition(prevItem.position);
      }
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      const nextItem = history[historyIndex + 1];
      
      // 복원한 항목 유형에 따라 적절한 상태 업데이트
      if (nextItem.type === 'decoration') {
        if (nextItem.action === 'move') {
          setDecorations(prev => 
            prev.map(item => 
              item.id === nextItem.id ? { ...item, position: nextItem.position } : item
            )
          );
        } 
        else if (nextItem.action === 'add') {
          setDecorations(prev => [
            ...prev, 
            { 
              id: nextItem.id, 
              decorationId: nextItem.decorationId, 
              position: nextItem.position 
            }
          ]);
        }
        else if (nextItem.action === 'remove') {
          setDecorations(prev => 
            prev.filter(item => item.id !== nextItem.id)
          );
        }
      } 
      else if (nextItem.type === 'mainText') {
        setTextPosition(nextItem.position);
      }
      else if (nextItem.type === 'subText') {
        setSubtextPosition(nextItem.position);
      }
    }
  };

  // 위치 정보가 변경될 때마다 부모에게 알림
  useEffect(() => {
    if (onUpdatePositions && typeof onUpdatePositions === 'function') {
      // 렌더링 완료 후 다음 틱에서 실행하여 렌더링 중 상태 업데이트 방지
      const timeoutId = setTimeout(() => {
        onUpdatePositions({
          decorations: decorations || [],
          textPosition,
          subtextPosition
        });
      }, 0);
      
      return () => clearTimeout(timeoutId);
    }
  }, [decorations, textPosition, subtextPosition, onUpdatePositions]);

  return (
    <div className="flex flex-col items-center w-full">
      {/* 와인병이 없을 때 로딩 표시 */}
      {!wineBottle && (
        <div className="flex justify-center items-center h-[40vh]">
          <div className="text-gray-400">와인병 로딩 중...</div>
        </div>
      )}
      
      {/* 와인병이 있을 때 미리보기 표시 */}
      {wineBottle && (
        <>
          {/* 와인병 배경과 라벨 오버레이 */}
          <div className={`relative ${isMobile ? 'mb-16' : 'mb-32'} flex justify-center ${isMobile ? 'scale-110' : ''}`}>
            {/* 제품 배경: 이미지가 있으면 이미지, 없으면 3D 박스 스타일 */}
            {wineBottle.image ? (
              <img 
                src={wineBottle.image}
                alt={wineBottle.name}
                className="h-[650px] sm:h-[600px] md:h-[620px] lg:h-[650px] object-contain"
                style={{ 
                  transform: isMobile 
                    ? 'scale(1.2, 1.3)' 
                    : 'scale(1.6, 1.4)'
                }}
              />
            ) : (
              <div className="relative h-[400px] w-[520px]" style={{ transform: isMobile ? 'scale(1.1)' : 'scale(1.1)' }}>
                <div className="absolute left-10 top-10 w-64 h-44 bg-gray-700 border border-gray-500" />
                <div className="absolute left-[272px] top-10 w-40 h-44 bg-gray-600 border border-gray-500 -skew-y-6" />
                <div className="absolute left-10 top-10 w-64 h-44 bg-gradient-to-br from-gray-400/10 to-gray-900/10" />
              </div>
            )}
            
            {/* 와인병 정보 표시 */}
            <div className="absolute top-12 right-4 bg-black/70 text-white p-3 rounded-lg text-sm z-30">
              <div className="font-medium mb-1">{wineBottle.name}</div>
              <div className="text-xs text-gray-300">{wineBottle.dimensions}</div>
              <div className="text-xs text-gray-300">{wineBottle.capacity}</div>
            </div>

            {/* 라벨 오버레이 - 와인병 라벨 위치에 정확히 배치 */}
            <div 
              className="absolute z-20"
              style={{ 
                top: `${wineBottle.labelSize?.position?.top || 65}%`,
                left: '50%', // 와인병 중앙에 정확히 위치
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="text-center mb-2">
                <p className={`text-xs text-gray-300 bg-black/50 ${isMobile ? 'px-1 py-0.5' : 'px-2 py-1'} rounded`}>
                  실제 라벨 크기: {(baseLabelWidth/2.54).toFixed(2)}cm × {(baseLabelHeight/2.54).toFixed(2)}cm
                </p>
              </div>
              
              <div 
                className={`relative ${
                  isImageBorder 
                    ? '' 
                    : borderStyle === 'none' 
                      ? 'border-2 border-dashed border-gray-400' 
                      : getBasicBorderClass()
                }`}
                style={{ 
                  width: `${labelWidth}rem`, // 소수점까지 정확한 크기
                  height: `${labelHeight}rem`, // 소수점까지 정확한 크기
                  backgroundColor: "transparent",
                  overflow: "visible" // 요소가 라벨지를 벗어날 수 있도록 설정
                }}
              >
                {/* 업로드된 테두리 이미지 - 배경보다 먼저 렌더링하여 뒤로 배치 */}
                {isImageBorder && borderImage && (
                  <div 
                    className="absolute pointer-events-none" 
                    style={{
                      top: '-10px',
                      left: '-10px',
                      right: '-10px',
                      bottom: '-10px',
                      ...getBorderImageStyle()
                    }}
                  />
                )}
                
                {/* 배경 이미지 */}
                {finalTemplateImage && (
                  <img 
                    src={finalTemplateImage} 
                    alt="라벨 배경" 
                    className="absolute inset-0 w-full h-full object-contain opacity-100"
                    style={{
                      filter: (() => {
                        let filters = [];
                        
                        // 사진 효과
                        if (imageFilter === "grayscale") filters.push("grayscale(100%)");
                        else if (imageFilter === "sepia") filters.push("sepia(100%)");
                        else if (imageFilter === "blur") filters.push("blur(2px)");
                        else if (imageFilter === "vintage") filters.push("sepia(50%)", "contrast(120%)", "brightness(90%)");
                        else if (imageFilter === "cold") filters.push("hue-rotate(180deg)", "saturate(120%)");
                        
                        // 컬러 조정
                        if (imageBrightness !== 100) filters.push(`brightness(${imageBrightness}%)`);
                        if (imageContrast !== 100) filters.push(`contrast(${imageContrast}%)`);
                        if (imageSaturation !== 100) filters.push(`saturate(${imageSaturation}%)`);
                        if (imageHue !== 0) filters.push(`hue-rotate(${imageHue}deg)`);
                        
                        return filters.length > 0 ? filters.join(' ') : 'none';
                      })(),
                      transform: (() => {
                        let transforms = [];
                        if (imageFlipH) transforms.push("scaleX(-1)");
                        if (imageFlipV) transforms.push("scaleY(-1)");
                        return transforms.length > 0 ? transforms.join(' ') : 'none';
                      })(),
                      objectPosition: `${imageCrop.x + imageCrop.width/2}% ${imageCrop.y + imageCrop.height/2}%`,
                      clipPath: `inset(${imageCrop.y}% ${100 - imageCrop.x - imageCrop.width}% ${100 - imageCrop.y - imageCrop.height}% ${imageCrop.x}%)`
                    }}
                  />
                )}
                
                {/* 여러 장식 (드래그 가능) */}
                {decorations && decorations.length > 0 && decorations.map((decoration) => (
                  <DraggableElement 
                    key={decoration.id}
                    position={decoration.position}
                    onPositionChange={(newPos) => handleDecorationChange(decoration.id, newPos)}
                    type="decoration"
                  >
                    <div className="relative">
                      <button 
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600 z-10 decoration-delete-btn"
                        onClick={(e) => {
                          e.stopPropagation(); // 드래그 이벤트 중단
                          removeDecoration(decoration.id);
                        }}
                      >
                        ×
                      </button>
                      <img 
                        src={labelDecorations.find((d: { id: string }) => d.id === decoration.decorationId)?.image ?? ''} 
                        alt="장식" 
                        className={`${isMobile ? 'w-16 h-16' : 'w-20 h-20'} object-contain`}
                      />
                    </div>
                  </DraggableElement>
                ))}

                {/* 요소들 (드래그 가능) */}
                {elements && elements.length > 0 && elements.map((element) => (
                  <DraggableElement 
                    key={element.id}
                    position={element.position}
                    onPositionChange={(newPos) => onElementPositionUpdate && onElementPositionUpdate(element.id, newPos)}
                    type="element"
                  >
                    <div className="relative group">
                      <button 
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteElement && onDeleteElement(element.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <div 
                        style={{ 
                          transform: `rotate(${element.rotation}deg)`,
                          cursor: 'move'
                        }}
                      >
                        {renderElementIcon(element.type, element.size, element.color)}
                      </div>
                    </div>
                  </DraggableElement>
                ))}
                
                {/* 텍스트 콘텐츠 (드래그 가능) */}
                {/* 메인 텍스트 */}
                {labelDesign.text && (
                  <DraggableElement position={textPosition} onPositionChange={handleTextChange} type="mainText">
                    <div className={`text-center whitespace-normal break-words p-0 m-0 ${isVerticalFont ? 'h-full' : 'w-full'}`} style={{ 
                      fontFamily: selectedFont, 
                      color: labelDesign.textGradient === "none" ? labelDesign.textColor : "transparent", 
                      fontWeight: "bold", 
                      fontSize: isMobile ? `${labelDesign.textSize * 0.8}rem` : `${labelDesign.textSize * 1.3}rem`,
                      writingMode: isVerticalFont ? 'vertical-rl' : 'horizontal-tb',
                      textOrientation: isVerticalFont ? 'mixed' : 'mixed',
                      lineHeight: isVerticalFont ? '1.8' : '1.4',
                      minHeight: isVerticalFont ? '100px' : 'auto',
                      minWidth: isVerticalFont ? 'auto' : '100px',
                      ...getTextEffectStyles(labelDesign)
                    }}>
                      {labelDesign.text || ""}
                    </div>
                  </DraggableElement>
                )}
                
                {/* 부가 텍스트 */}
                {labelDesign.subtext && (
                  <DraggableElement position={subtextPosition} onPositionChange={handleSubtextChange} type="subText">
                    <div className={`text-center whitespace-normal p-0 m-0 ${isVerticalFont ? 'h-full' : 'w-full'}`} style={{ 
                      fontFamily: selectedFont, 
                      color: labelDesign.textGradient === "none" ? labelDesign.textColor : "transparent", 
                      fontSize: isMobile ? `${labelDesign.subtextSize * 0.8}rem` : `${labelDesign.subtextSize * 1.3}rem`,
                      writingMode: isVerticalFont ? 'vertical-rl' : 'horizontal-tb',
                      textOrientation: isVerticalFont ? 'mixed' : 'mixed',
                      lineHeight: isVerticalFont ? '1.8' : '1.4',
                      minHeight: isVerticalFont ? '80px' : 'auto',
                      minWidth: isVerticalFont ? 'auto' : '80px',
                      ...getTextEffectStyles(labelDesign)
                    }}>
                      {labelDesign.subtext || ""}
                    </div>
                  </DraggableElement>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// 디자인 옵션 카드 (수평 스크롤로 변경)
function DesignOptionCard({ title, options, selectedId, onChange, renderItem }: {
  title: string;
  options: any[];
  selectedId: string;
  onChange: (id: string) => void;
  renderItem: (option: any) => React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">{title}</h3>
      <div className="flex overflow-x-auto gap-3 pb-2"> {/* 수평 스크롤 */}
        {options.map(option => (
          <Card 
            key={option.id}
            className={`cursor-pointer transition-all min-w-[120px] ${selectedId === option.id ? 'ring-2 ring-[#722F37]' : 'hover:shadow-md'}`}
            onClick={() => onChange(option.id)}
          >
            <CardContent className="p-3 flex flex-col items-center">
              {renderItem(option)}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function LabelDesigner() {
  const { bottleId } = useParams<{ bottleId: string }>();
  const [location, setLocation] = useLocation();
  const [wineBottle, setWineBottle] = useState<any>(null);
  
  // 소품 목록 (API 연동)
  const [accessoryItems, setAccessoryItems] = useState<Array<{id: string; name: string; price: number; image?: string; maxQty?: number; stock?: number}>>([]);
  const [isLoadingAccessories, setIsLoadingAccessories] = useState(false);

  // 선택된 소품 상태
  const [selectedAccessories, setSelectedAccessories] = useState<Array<{id: string; name: string; price: number; qty: number}>>([]);

  const getAccessoryQty = (id: string) => selectedAccessories.find(a => a.id === id)?.qty || 0;
  const incrementAccessory = (item: {id: string; name: string; price: number; maxQty?: number; stock?: number}) => {
    const limit = Math.max(0, Math.min(item.maxQty ?? 99, item.stock ?? 9999));
    setSelectedAccessories(prev => {
      const found = prev.find(a => a.id === item.id);
      if (found) {
        if (found.qty >= limit) return prev; // 제한 초과 금지
        return prev.map(a => a.id === item.id ? { ...a, qty: a.qty + 1 } : a);
      }
      if (limit <= 0) return prev;
      return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1 }];
    });
  };
  const decrementAccessory = (id: string) => {
    setSelectedAccessories(prev => {
      const found = prev.find(a => a.id === id);
      if (!found) return prev;
      if (found.qty <= 1) return prev.filter(a => a.id !== id);
      return prev.map(a => a.id === id ? { ...a, qty: a.qty - 1 } : a);
    });
  };
  
  // 초기 라벨 디자인 상태에서 배경색 변경
  const [labelDesign, setLabelDesign] = useState({
    template: "template1",
    text: "",
    subtext: "",
    font: "font1",
    textColor: "#000000",
    backgroundColor: "transparent", // 초기 배경색을 투명으로 변경
    borderStyle: "none", // 기본값을 "없음"으로 변경
    borderPosition: "all", // 테두리 위치: "horizontal", "vertical", "all"
    decoration: "deco4", // 기본값을 "없음"으로 변경
    textSize: 1.25, // 메인 텍스트 크기 (rem 단위), 기본값 1.25rem
    subtextSize: 1, // 부가 텍스트 크기 (rem 단위), 기본값 1rem
    // 텍스트 효과 속성들
    textShadow: "none", // 그림자 효과: "none", "soft", "hard", "colored", "glow"
    textStroke: "none", // 테두리 효과: "none", "thin", "thick"
    textStrokeColor: "#ffffff", // 테두리 색상
    textTransform: "none", // 대소문자: "none", "uppercase", "lowercase", "capitalize"
    fontStyle: "normal", // 기울임: "normal", "italic"
    textDecoration: "none", // 밑줄/취소선: "none", "underline", "line-through"
    letterSpacing: 0, // 글자 간격: -0.2 ~ 1 (rem)
    textGradient: "none", // 그라데이션: "none", "rainbow", "sunset", "ocean", "forest", "fire"
    // 이미지 편집 속성들
    imageFilter: "none", // 사진 효과: "none", "grayscale", "sepia", "blur", "brightness", "contrast"
    imageBrightness: 100, // 밝기 (0-200)
    imageContrast: 100, // 대비 (0-200)
    imageSaturation: 100, // 채도 (0-200)
    imageHue: 0, // 색조 (0-360)
    imageFlipH: false, // 수평 반전
    imageFlipV: false, // 수직 반전
    imageCrop: { x: 0, y: 0, width: 100, height: 100 } // 자르기 영역 (%)
  });
  
  // 장식 추가를 위한 상태
  const [decorationToAdd, setDecorationToAdd] = useState<string | null>(null);
  
  // 요소 추가를 위한 상태
  const [elementToAdd, setElementToAdd] = useState<string | null>(null);
  const [elements, setElements] = useState<Array<{
    id: string;
    type: string;
    position: { x: number; y: number };
    size: number;
    color: string;
    rotation: number;
  }>>([]);
  
  // 라벨 배경 목록을 위한 상태
  const [labelBackgrounds, setLabelBackgrounds] = useState<any[]>([]);
  const [labelBorders, setLabelBorders] = useState<any[]>([]);
  const [labelDecorations, setLabelDecorations] = useState<any[]>([]);
  const [isLoadingBackgrounds, setIsLoadingBackgrounds] = useState(true);
  const [isLoadingBorders, setIsLoadingBorders] = useState(true);
  const [isLoadingDecorations, setIsLoadingDecorations] = useState(true);
  
  // 사용자 업로드 이미지를 위한 상태
  const [uploadedImages, setUploadedImages] = useState<any[]>([]);
  const [isLoadingUploads, setIsLoadingUploads] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 카테고리 관련 상태 추가
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  
  // 캐싱을 위한 상태 추가
  const [backgroundsCache, setBackgroundsCache] = useState<{[key: string]: any[]}>({});
  const [isCacheLoaded, setIsCacheLoaded] = useState(false);

  // 뒤로가기 함수
  const handleGoBack = () => {
    setLocation("/wine-bottles");
  };

  // 카테고리별 배경 이미지 로드 함수 - 캐싱 추가
  const fetchLabelBackgrounds = useCallback(async (categorySlug: string | null = null) => {
    const cacheKey = categorySlug || 'all';
    
    // 캐시에 있으면 캐시된 데이터 사용
    if (backgroundsCache[cacheKey] && isCacheLoaded) {
      setLabelBackgrounds(backgroundsCache[cacheKey]);
      setIsLoadingBackgrounds(false);
      return;
    }
    
    try {
      setIsLoadingBackgrounds(true);
      let backgrounds;
      
      // 카테고리가 선택된 경우, 해당 카테고리의 배경만 가져옴
      if (categorySlug) {
        const response = await labelApi.getBackgroundsByCategory(categorySlug);
        if (response.data && response.data.backgrounds) {
          backgrounds = response.data.backgrounds.map((bg: any) => ({
            id: bg.id,
            name: bg.name || bg.id,
            image: bg.url,
            categoryId: bg.categoryId,
            categoryName: bg.categoryName
          }));
        }
      } else {
        // 카테고리가 선택되지 않은 경우, 모든 배경 가져옴
        const response = await adminApi.getLabelBackgrounds();
        if (response.data && response.data.backgrounds) {
          backgrounds = response.data.backgrounds.map((bg: any) => ({
            id: bg.id,
            name: bg.name || bg.id,
            image: bg.url
          }));
        }
      }
      
      if (!backgrounds || backgrounds.length === 0) {
        // 배경이 없는 경우 기본 배경 추가
        backgrounds = [{ 
          id: "default", 
          name: "기본", 
          image: "/images/label/default.jpg" 
        }];
      }
      
      // 캐시에 저장
      setBackgroundsCache(prev => ({
        ...prev,
        [cacheKey]: backgrounds
      }));
      
      setLabelBackgrounds(backgrounds);
      
      // 첫 번째 배경을 기본값으로 설정 (변경된 경우에만)
      if (backgrounds.length > 0 && labelDesign.template === "template1") {
        setLabelDesign(prev => ({ ...prev, template: backgrounds[0].id }));
      }
    } catch (error) {
      console.error("라벨 배경 로드 오류:", error);
      // 오류 시 기본 배경 설정
      const defaultBg = [{ id: "default", name: "기본", image: "/images/label/default.jpg" }];
      setLabelBackgrounds(defaultBg);
      setBackgroundsCache(prev => ({
        ...prev,
        [cacheKey]: defaultBg
      }));
    } finally {
      setIsLoadingBackgrounds(false);
    }
  }, [backgroundsCache, isCacheLoaded, labelDesign.template]);

  // 초기 데이터 로드
  useEffect(() => {
    // 제품(와인병/박스) 정보 설정
    if (bottleId) {
      const selected = getProductModel(bottleId);
      if (selected) {
        setWineBottle(selected);
      }
    }
    
    // 카테고리 목록 가져오기
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await labelApi.getCategories();
        if (response.data.success) {
          const fetchedCategories = response.data.categories;
          setCategories(fetchedCategories);
        }
      } catch (error) {
        console.error("카테고리 목록 로드 오류:", error);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    
    // 모든 배경 이미지 미리 로드 (초기 캐시 구축)
    const preloadAllBackgrounds = async () => {
      try {
        setIsLoadingBackgrounds(true);
        
        // 전체 배경 로드
        const allResponse = await adminApi.getLabelBackgrounds();
        if (allResponse.data && allResponse.data.backgrounds) {
          const allBackgrounds = allResponse.data.backgrounds.map((bg: any) => ({
            id: bg.id,
            name: bg.name || bg.id,
            image: bg.url
          }));
          
          setBackgroundsCache(prev => ({
            ...prev,
            'all': allBackgrounds
          }));
          
          setLabelBackgrounds(allBackgrounds);
          
          // 첫 번째 배경을 기본값으로 설정
          if (allBackgrounds.length > 0 && labelDesign.template === "template1") {
            setLabelDesign(prev => ({ ...prev, template: allBackgrounds[0].id }));
          }
        }
        
        // 카테고리별 배경들도 미리 로드
        const categoriesResponse = await labelApi.getCategories();
        if (categoriesResponse.data.success) {
          const fetchedCategories = categoriesResponse.data.categories;
          setCategories(fetchedCategories);
          
          // 각 카테고리별 배경 미리 로드
          const categoryPromises = fetchedCategories.map(async (category: any) => {
            try {
              const response = await labelApi.getBackgroundsByCategory(category.slug);
              if (response.data && response.data.backgrounds) {
                const backgrounds = response.data.backgrounds.map((bg: any) => ({
                  id: bg.id,
                  name: bg.name || bg.id,
                  image: bg.url,
                  categoryId: bg.categoryId,
                  categoryName: bg.categoryName
                }));
                
                setBackgroundsCache(prev => ({
                  ...prev,
                  [category.slug]: backgrounds
                }));
              }
            } catch (error) {
              console.log(`카테고리 ${category.name} 배경 로드 실패:`, error);
            }
          });
          
          await Promise.allSettled(categoryPromises);
        }
        
        setIsCacheLoaded(true);
      } catch (error) {
        console.error("배경 이미지 미리 로드 오류:", error);
      } finally {
        setIsLoadingBackgrounds(false);
      }
    };
    
    // 테두리 옵션 설정
    const fetchLabelBorders = async () => {
      try {
        setIsLoadingBorders(true);
        
        // 없음 옵션
        let borders = [{ id: "none", name: "없음", type: "basic" }];
        
        // API에서 업로드된 테두리 이미지 가져오기
        try {
          const response = await adminApi.getLabelBorders();
          if (response.data && response.data.borders) {
            const uploadedBorders = response.data.borders.map((border: any) => ({
              id: border.id,
              name: border.name || border.id,
              image: border.url,
              type: "image"
            }));
            
            // 업로드된 테두리들을 없음 옵션 뒤에 추가
            borders = [{ id: "none", name: "없음", type: "basic" }, ...uploadedBorders];
          }
        } catch (apiError) {
          console.log("API에서 테두리 이미지를 가져올 수 없습니다. 없음 옵션만 사용합니다.");
        }
        
        setLabelBorders(borders);
      } catch (error) {
        console.error("테두리 옵션 설정 오류:", error);
        // 오류 시 없음 옵션만 설정
        setLabelBorders([
          { id: "none", name: "없음", type: "basic" }
        ]);
      } finally {
        setIsLoadingBorders(false);
      }
    };
    
    // 장식 이미지 가져오기
    const fetchLabelDecorations = async () => {
      try {
        setIsLoadingDecorations(true);
        const response = await adminApi.getLabelIcons();
        if (response.data && response.data.icons) {
          const decorations = response.data.icons.map((icon: any) => ({
            id: icon.id,
            name: icon.name || icon.id,
            image: icon.url
          }));
          
          // 장식이 없는 경우 기본 옵션 추가
          if (decorations.length === 0) {
            decorations.push(
              { id: "deco1", name: "기본", image: "/images/icon/default.jpg" },
              { id: "deco4", name: "없음", image: "" }
            );
          } else {
            // '없음' 옵션 항상 추가
            if (!decorations.find((d: { id: string }) => d.id === "deco4")) {
              decorations.push({ id: "deco4", name: "없음", image: "" });
            }
          }
          
          setLabelDecorations(decorations);
        }
      } catch (error) {
        console.error("장식 이미지 로드 오류:", error);
        // 오류 시 기본 장식 설정
        setLabelDecorations([
          { id: "deco1", name: "기본", image: "/images/icon/default.jpg" },
          { id: "deco4", name: "없음", image: "" }
        ]);
      } finally {
        setIsLoadingDecorations(false);
      }
    };
    
    // 사용자 업로드 이미지 가져오기
    const fetchUploadedImages = async () => {
      try {
        setIsLoadingUploads(true);
        const response = await uploadApi.getUploads();
        if (response.data && response.data.uploads) {
          const uploads = response.data.uploads.map((upload: any) => ({
            id: upload.id,
            name: upload.name || upload.id,
            image: upload.url,
            filename: upload.filename
          }));
          
          setUploadedImages(uploads);
        }
      } catch (error) {
        console.error("업로드 이미지 로드 오류:", error);
        setUploadedImages([]);
      } finally {
        setIsLoadingUploads(false);
      }
    };
    
    // 모든 데이터를 병렬로 로드
    Promise.all([
      preloadAllBackgrounds(),
      fetchLabelBorders(),
      fetchLabelDecorations(),
      fetchUploadedImages()
    ]);
  }, [bottleId]); // 의존성 배열 정리

  // 소품 목록 로드
  useEffect(() => {
    const loadAccessories = async () => {
      try {
        setIsLoadingAccessories(true);
        const res = await (await import("@/services/api")).labelApi.getAccessories();
        if (res.data?.success && Array.isArray(res.data.accessories)) {
          const items = res.data.accessories.map((a: any) => ({
            id: String(a.id), name: a.name, price: Number(a.price) || 0, image: a.image,
            maxQty: a.maxQty ?? 99, stock: a.stock ?? 9999
          }));
          setAccessoryItems(items);
        } else {
          setAccessoryItems([]);
        }
      } catch (e) {
        console.error("소품 목록 로드 오류:", e);
        setAccessoryItems([]);
      } finally {
        setIsLoadingAccessories(false);
      }
    };
    loadAccessories();
  }, []);

  // 카테고리 선택 핸들러 - 즉시 반응하도록 수정
  const handleCategoryChange = (categorySlug: string) => {
    const newCategory = categorySlug === "all" ? null : categorySlug;
    setSelectedCategory(newCategory);
    
    // 캐시에서 즉시 로드
    const cacheKey = newCategory || 'all';
    if (backgroundsCache[cacheKey]) {
      setLabelBackgrounds(backgroundsCache[cacheKey]);
    } else {
      // 캐시에 없으면 로드
      fetchLabelBackgrounds(newCategory);
    }
  };

  // 이미지 업로드 핸들러
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    
    // 허용된 이미지 타입 확인
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('지원하지 않는 이미지 형식입니다. JPG, PNG, GIF, WEBP 형식만 업로드 가능합니다.');
      return;
    }
    
    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('이미지 크기는 5MB를 초과할 수 없습니다.');
      return;
    }
    
    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await uploadApi.uploadImage(formData);
      
      if (response.data && response.data.success) {
        // 업로드 성공 후 목록에 추가
        const newUpload = {
          id: response.data.file.id,
          name: response.data.file.name,
          image: response.data.file.url,
          filename: response.data.file.filename
        };
        
        setUploadedImages(prev => [...prev, newUpload]);
        
        // 방금 업로드한 이미지를 현재 배경으로 설정
        setLabelDesign(prev => ({ ...prev, template: newUpload.id }));
        
        // 배경 목록에도 추가
        setLabelBackgrounds(prev => [...prev, { ...newUpload }]);
      } else {
        alert('이미지 업로드 중 문제가 발생했습니다.');
      }
    } catch (error) {
      console.error('이미지 업로드 오류:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
      
      // 입력 필드 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 업로드 버튼 클릭 핸들러
  const handleUploadButtonClick = () => {
    // 파일 입력 요소 클릭 트리거
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 라벨 디자인 속성 변경 핸들러
  const handleDesignChange = (key: string, value: string | number | boolean | object) => {
    setLabelDesign(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 장식 추가 핸들러 (분리)
  const handleAddDecoration = (decorationId: string) => {
    if (decorationId && decorationId !== "deco4") {
      // 장식 추가 요청을 상태로 전달
      setDecorationToAdd(decorationId);
      
      // 요청이 처리된 후 상태 초기화를 위한 타이머 설정
      setTimeout(() => {
        setDecorationToAdd(null);
      }, 100);
    }
  };

  // 요소 추가 핸들러
  const handleAddElement = (elementType: string) => {
    const newElement = {
      id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: elementType,
      position: { x: 50, y: 50 }, // 중앙에 배치
      size: 30,
      color: "#000000",
      rotation: 0
    };
    setElements(prev => [...prev, newElement]);
  };

  // 요소 위치 업데이트 핸들러
  const handleElementPositionUpdate = (elementId: string, newPosition: { x: number; y: number }) => {
    setElements(prev => prev.map(element => 
      element.id === elementId ? { ...element, position: newPosition } : element
    ));
  };

  // 요소 삭제 핸들러
  const handleDeleteElement = (elementId: string) => {
    setElements(prev => prev.filter(element => element.id !== elementId));
  };

  // 요소 속성 업데이트 핸들러
  const handleElementUpdate = (elementId: string, updates: Partial<{
    size: number;
    color: string;
    rotation: number;
  }>) => {
    setElements(prev => prev.map(element => 
      element.id === elementId ? { ...element, ...updates } : element
    ));
  };

  // 업로드 이미지 삭제 핸들러
  const handleDeleteUpload = async (filename: string, id: string) => {
    try {
      await uploadApi.deleteUpload(filename);
      
      // 업로드 목록에서 제거
      setUploadedImages(prev => prev.filter(img => img.filename !== filename));
      
      // 배경 목록에서도 제거
      setLabelBackgrounds(prev => prev.filter(bg => bg.id !== id));
      
      // 현재 선택된 배경이 삭제된 이미지라면 다른 배경으로 변경
      if (labelDesign.template === id) {
        // 첫 번째 사용 가능한 배경으로 변경
        const firstBackground = labelBackgrounds.find(bg => bg.id !== id);
        if (firstBackground) {
          setLabelDesign(prev => ({ ...prev, template: firstBackground.id }));
        }
      }
      
      alert('이미지가 성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error('이미지 삭제 오류:', error);
      alert('이미지 삭제 중 오류가 발생했습니다.');
    }
  };

  // 위치 정보 상태 추가
  const [positionData, setPositionData] = useState<{
    decorations: any[],
    textPosition: { x: number, y: number },
    subtextPosition: { x: number, y: number }
  }>({
    decorations: [],
    textPosition: { x: 50, y: 40 },
    subtextPosition: { x: 50, y: 60 }
  });
  
  // 위치 정보 업데이트 핸들러
  const handleUpdatePositions = useCallback((data: {
    decorations: any[],
    textPosition: { x: number, y: number },
    subtextPosition: { x: number, y: number }
  }) => {
    setPositionData(data);
  }, []);
  
  // 라벨 미리보기 요소를 참조하기 위한 ref
  const labelPreviewRef = useRef<HTMLDivElement>(null);
  
  // 체크아웃으로 진행
  const handleCheckout = async () => {
    try {
      // 라벨 디자인 정보를 sessionStorage에 저장
      const labelData = {
        template: labelDesign.template,
        text: labelDesign.text,
        subtext: labelDesign.subtext,
        font: labelDesign.font,
        textColor: labelDesign.textColor,
        backgroundColor: labelDesign.backgroundColor,
        borderStyle: labelDesign.borderStyle,
        borderPosition: labelDesign.borderPosition,
        // 텍스트 효과 속성들
        textShadow: labelDesign.textShadow,
        textStroke: labelDesign.textStroke,
        textStrokeColor: labelDesign.textStrokeColor,
        textTransform: labelDesign.textTransform,
        fontStyle: labelDesign.fontStyle,
        textDecoration: labelDesign.textDecoration,
        letterSpacing: labelDesign.letterSpacing,
        textGradient: labelDesign.textGradient,
        decorations: positionData.decorations.map(deco => ({
          id: deco.id,
          decorationId: deco.decorationId,
          position: deco.position
        })),
        textPosition: positionData.textPosition,
        subtextPosition: positionData.subtextPosition,
        textSize: labelDesign.textSize,
        subtextSize: labelDesign.subtextSize,
        accessories: selectedAccessories
      };
      
      sessionStorage.setItem('labelDesign', JSON.stringify(labelData));
      
      // 라벨 미리보기 요소가 있을 경우 이미지로 캡처
      if (labelPreviewRef.current) {
        // 1. 라벨만 캡처 - 기존 코드
        // 미리보기 요소에서 실제 라벨 부분만 캡처하기 위해 요소 찾기
        const labelElement = labelPreviewRef.current.querySelector('div[style*="width:"][style*="height:"]');
        
        if (labelElement) {
          // 캡처 전에 테두리 스타일 임시 제거 (점선 테두리인 경우만)
          const originalClassName = labelElement.className;
          const hasDashedBorder = originalClassName.includes('border-dashed');
          if (hasDashedBorder) {
            labelElement.className = originalClassName.replace(/border-\w*\s*/g, '').replace(/border-dashed/g, '');
          }
          
          // 캡처 전에 모든 삭제 버튼(X 버튼) 숨기기
          const deleteButtons = labelElement.querySelectorAll('.decoration-delete-btn');
          Array.from(deleteButtons).forEach(button => {
            (button as HTMLElement).style.display = 'none';
          });
          
          // html2canvas를 사용하여 라벨 요소를 이미지로 변환
          const canvas = await html2canvas(labelElement as HTMLElement, {
            backgroundColor: null,
            scale: 2, // 고해상도 이미지를 위해 스케일 2배로 설정
            logging: false,
            useCORS: true, // 외부 이미지 사용을 위한 CORS 허용
            allowTaint: true
          });
          
          // 원래 스타일 복원
          if (hasDashedBorder) {
            labelElement.className = originalClassName;
          }
          
          // 삭제 버튼 다시 표시
          Array.from(deleteButtons).forEach(button => {
            (button as HTMLElement).style.display = '';
          });
          
          // 캔버스를 데이터 URL로 변환
          const imageDataUrl = canvas.toDataURL('image/png');
          
          // 캡처한 이미지를 sessionStorage에 저장
          sessionStorage.setItem('labelPreviewImage', imageDataUrl);
        }

        // 2. 와인병 전체 영역 캡처 (새로 추가)
        // 와인병 전체 영역 찾기 - 선택자를 더 명확하게 수정
        console.log("와인병 전체 영역 캡처 시도...");
        
        try {
          // 전체 미리보기 컨테이너를 직접 캡처 
          const bottleContainer = labelPreviewRef.current.querySelector('.flex.flex-col.items-center.w-full');
          
          if (bottleContainer) {
            console.log("와인병 전체 영역 요소 찾음:", bottleContainer);
            
            // 캡처 전에 모든 삭제 버튼(X 버튼) 임시 숨기기
            const allDeleteButtons = labelPreviewRef.current.querySelectorAll('.decoration-delete-btn');
            Array.from(allDeleteButtons).forEach(button => {
              (button as HTMLElement).style.display = 'none';
            });
            
            // 캡처 전에 점선 테두리 숨기기
            const labelContainers = labelPreviewRef.current.querySelectorAll('.border-dashed');
            const originalBorderStyles: {element: HTMLElement, style: string}[] = [];
            
            Array.from(labelContainers).forEach(container => {
              const element = container as HTMLElement;
              originalBorderStyles.push({
                element,
                style: element.style.border
              });
              element.style.border = 'none';
            });
            
            // 캡처 전에 라벨 크기 정보 숨기기
            const sizeInfoElements = labelPreviewRef.current.querySelectorAll('.text-xs.text-gray-300.bg-black\\/50');
            const originalDisplayStyles: {element: HTMLElement, display: string}[] = [];
            
            Array.from(sizeInfoElements).forEach(element => {
              const el = element as HTMLElement;
              originalDisplayStyles.push({
                element: el,
                display: el.style.display
              });
              el.style.display = 'none';
            });
            
            // 캡처 전에 와인병 정보(쇼비뇽블랑 레드, 높이, 지름 등) 숨기기
            const bottleInfoElement = labelPreviewRef.current.querySelector('.absolute.top-0.right-0.bg-black\\/70.text-white');
            let originalBottleInfoDisplay = '';
            if (bottleInfoElement) {
              const el = bottleInfoElement as HTMLElement;
              originalBottleInfoDisplay = el.style.display;
              el.style.display = 'none';
            }
            
            // html2canvas를 사용하여 와인병 전체 요소를 이미지로 변환
            const bottleCanvas = await html2canvas(bottleContainer as HTMLElement, {
              backgroundColor: "rgba(17, 24, 39, 1)", // bg-gray-900와 유사한 배경색
              scale: 1.5, // 고해상도 이미지를 위해 스케일 설정
              logging: true, // 디버깅을 위해 로깅 활성화
              useCORS: true, // 외부 이미지 사용을 위한 CORS 허용
              allowTaint: true,
              onclone: (clonedDoc) => {
                // 클론된 문서에서 추가로 점선과 크기 정보를 숨김 
                const clonedBorders = clonedDoc.querySelectorAll('.border-dashed');
                Array.from(clonedBorders).forEach(element => {
                  (element as HTMLElement).style.border = 'none';
                });
                
                const clonedSizeInfo = clonedDoc.querySelectorAll('.text-xs.text-gray-300.bg-black\\/50');
                Array.from(clonedSizeInfo).forEach(element => {
                  (element as HTMLElement).style.display = 'none';
                });
                
                // 클론된 문서에서 와인병 정보도 숨김
                const clonedBottleInfo = clonedDoc.querySelector('.absolute.top-0.right-0.bg-black\\/70.text-white');
                if (clonedBottleInfo) {
                  (clonedBottleInfo as HTMLElement).style.display = 'none';
                }
                
                console.log("클론된 문서에서 점선, 크기 정보 및 와인병 정보 숨김 처리 완료");
              }
            });
            
            // 삭제 버튼 다시 표시
            Array.from(allDeleteButtons).forEach(button => {
              (button as HTMLElement).style.display = '';
            });
            
            // 테두리 스타일 복원
            originalBorderStyles.forEach(item => {
              item.element.style.border = item.style;
            });
            
            // 라벨 크기 정보 표시 복원
            originalDisplayStyles.forEach(item => {
              item.element.style.display = item.display;
            });
            
            // 와인병 정보 표시 복원
            if (bottleInfoElement) {
              (bottleInfoElement as HTMLElement).style.display = originalBottleInfoDisplay;
            }
            
            if (bottleCanvas) {
              console.log("와인병 전체 이미지 캡처 성공");
              // 캔버스를 데이터 URL로 변환
              const bottleImageDataUrl = bottleCanvas.toDataURL('image/png');
              
              // 캡처한 와인병 전체 이미지를 sessionStorage에 저장
              sessionStorage.setItem('bottlePreviewImage', bottleImageDataUrl);
              console.log("와인병 전체 이미지 sessionStorage에 저장 완료");
            } else {
              console.error("와인병 전체 이미지 캡처 실패: 캔버스 생성 실패");
            }
          } else {
            console.error("와인병 전체 영역 요소를 찾을 수 없음");
            
            // 대체 선택자로 시도
            const alternativeElement = labelPreviewRef.current.querySelector('.relative');
            if (alternativeElement) {
              console.log("대체 선택자로 와인병 요소 찾음");
              const bottleCanvas = await html2canvas(alternativeElement as HTMLElement, {
                backgroundColor: "rgba(17, 24, 39, 1)",
                scale: 1.5,
                logging: true,
                useCORS: true,
                allowTaint: true
              });
              
              const bottleImageDataUrl = bottleCanvas.toDataURL('image/png');
              sessionStorage.setItem('bottlePreviewImage', bottleImageDataUrl);
              console.log("대체 방법으로 와인병 전체 이미지 저장 완료");
            }
          }
        } catch (captureError) {
          console.error("와인병 전체 캡처 중 오류 발생:", captureError);
        }
      }
      
      // 체크아웃 페이지로 이동
      setLocation(`/checkout?bottleId=${bottleId}`);
    } catch (error) {
      console.error('라벨 캡처 중 오류 발생:', error);
      // 오류가 발생하더라도 체크아웃 페이지로 이동
      setLocation(`/checkout?bottleId=${bottleId}`);
    }
  };

  // 디자인 저장
  const handleSaveDesign = () => {
    alert("디자인이 저장되었습니다!");
    // 실제 구현에서는 API를 통해 저장
  };

  // 텍스트 크기 변경 핸들러 (소수점 첫째 자리까지 지원)
  const handleTextSizeChange = (value: number[]) => {
    setLabelDesign(prev => ({
      ...prev,
      textSize: parseFloat(value[0].toFixed(1))
    }));
  };

  const handleSubtextSizeChange = (value: number[]) => {
    setLabelDesign(prev => ({
      ...prev,
      subtextSize: parseFloat(value[0].toFixed(1))
    }));
  };
  
  // 라벨 배경 옵션 UI 수정
  const renderBackgroundOptions = () => {
    return (
      <div className="space-y-4">
        {/* 카테고리 선택 UI 추가 */}
        <div className="mb-4">
          <Label htmlFor="category-select" className="text-sm font-medium mb-1 block text-gray-300">
            카테고리
          </Label>
          <Select 
            value={selectedCategory || "all"} 
            onValueChange={handleCategoryChange}
            disabled={isLoadingCategories}
          >
            <SelectTrigger className="w-full bg-white/70 border-gray-200 text-gray-900 focus:border-primary backdrop-blur-sm">
              <SelectValue placeholder="모든 카테고리" />
            </SelectTrigger>
            <SelectContent className="bg-white/90 border-gray-200 text-gray-900 backdrop-blur-md">
              <SelectItem value="all" className="focus:bg-cyan-900/30 focus:text-cyan-400">
                모든 카테고리
              </SelectItem>
              {categories.map(category => (
                <SelectItem 
                  key={category.slug} 
                  value={category.slug} 
                  className="focus:bg-cyan-900/30 focus:text-cyan-400"
                >
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* 배경 이미지 옵션 */}
        {isLoadingBackgrounds ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-cyan-400"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {labelBackgrounds.map(background => (
              <div 
                key={background.id}
                onClick={() => handleDesignChange("template", background.id)}
                className={`cursor-pointer rounded-md overflow-hidden border-2 transition-all ${labelDesign.template === background.id ? 'border-cyan-500 shadow-[0_0_6px_rgba(0,200,255,0.6)]' : 'border-gray-700 hover:border-gray-500'}`}
              >
                <div className="aspect-[4/3] relative">
                  <img 
                    src={background.image} 
                    alt={background.name} 
                    className="w-full h-full object-cover" 
                  />
                  {background.categoryName && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-xs p-1 text-cyan-300">
                      {background.categoryName}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <DndProvider backend={isMobile ? TouchBackend : HTML5Backend}>
      <div className="min-h-screen bg-background text-foreground">
        {/* 헤더 영역 - 뒤로가기 버튼과 제목 */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-white/60 backdrop-blur-lg relative z-50">
          <Button 
            variant="ghost" 
            onClick={handleGoBack}
            className="text-gray-700 hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            뒤로가기
          </Button>
          <h1 className="text-xl font-bold">라벨 디자인</h1>
          <div className="w-20"></div> {/* 균형을 위한 빈 공간 */}
        </div>
        
        {/* 메인 콘텐츠 - 세로 레이아웃 */}
        <div className="max-w-4xl mx-auto p-2 sm:p-6 md:p-8 lg:p-12 pb-4 sm:pb-8 md:pb-12 lg:pb-16 bg-white/60 border-0 sm:border border-gray-200 backdrop-blur-lg sm:rounded-2xl shadow-none sm:shadow-md" ref={labelPreviewRef}>
          {/* 와인병과 라벨 미리보기 */}
          <div data-label-preview className="wine-bottle-container">
            <LabelPreview 
              labelDesign={labelDesign} 
              wineBottle={wineBottle} 
              decorationToAdd={decorationToAdd}
              elements={elements}
              onUpdatePositions={handleUpdatePositions}
              onElementPositionUpdate={handleElementPositionUpdate}
              onDeleteElement={handleDeleteElement}
              labelBackgrounds={labelBackgrounds}
              labelDecorations={labelDecorations}
              labelBorders={labelBorders}
              uploadedImages={uploadedImages}
            />
          </div>
          
          {/* 디자인 옵션 탭 */}
          <Tabs defaultValue="template" className="w-full mt-2">
            <TabsList className="grid grid-cols-5 gap-1 w-full mb-3 bg-white/70 border border-gray-200 backdrop-blur-sm">
              <TabsTrigger value="template" className="text-xs py-1">
                <ImageIcon className="w-3 h-3 mr-1" />
                배경
              </TabsTrigger>
              <TabsTrigger value="text" className="text-xs py-1">
                <Type className="w-3 h-3 mr-1" />
                텍스트
              </TabsTrigger>
              <TabsTrigger value="style" className="text-xs py-1">
                <Grid className="w-3 h-3 mr-1" />
                스타일
              </TabsTrigger>
              <TabsTrigger value="color" className="text-xs py-1">
                <Palette className="w-3 h-3 mr-1" />
                색상
              </TabsTrigger>
              <TabsTrigger value="edit" className="text-xs py-1">
                <Edit className="w-3 h-3 mr-1" />
                편집
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="template" className="space-y-3">
              {/* 이미지 업로드 버튼 */}
              <div className="mb-3">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  style={{ display: 'none' }} 
                  accept="image/jpeg, image/png, image/gif, image/webp"
                  onChange={handleImageUpload}
                />
                <Button 
                  className="w-full bg-[#722F37] hover:bg-[#722F37]/90 text-white py-2 h-auto text-sm"
                  onClick={handleUploadButtonClick}
                  disabled={isUploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? '업로드 중...' : '배경 이미지 업로드하기'}
                </Button>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF, WEBP 형식 (최대 5MB)</p>
              </div>
              
              {/* 카테고리 선택 UI - 라운드 텍스트 박스 형태로 표시 (2줄로 변경) */}
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2 text-gray-300">카테고리</h3>
                <div className="grid grid-cols-4 gap-2">
                  {/* 모든 카테고리 버튼 */}
                  <Button
                    variant="outline"
                    size="sm"
                    className={`rounded-full px-4 text-xs ${
                      selectedCategory === null 
                        ? 'bg-cyan-900/50 text-cyan-300 border-cyan-600' 
                        : 'bg-white/70 text-gray-700 border-gray-200 hover:bg-white/90 backdrop-blur-sm'
                    }`}
                    onClick={() => handleCategoryChange("all")}
                  >
                    전체
                  </Button>
                  
                  {/* 각 카테고리를 버튼으로 표시 */}
                  {isLoadingCategories ? (
                    <div className="flex items-center justify-center p-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-cyan-500"></div>
                    </div>
                  ) : (
                    categories.map(category => (
                      <Button
                        key={category.slug}
                        variant="outline"
                        size="sm"
                        className={`rounded-full px-3 text-xs ${
                          selectedCategory === category.slug 
                            ? 'bg-cyan-900/50 text-cyan-300 border-cyan-600' 
                            : 'bg-white/70 text-gray-700 border-gray-200 hover:bg-white/90 backdrop-blur-sm'
                        }`}
                        onClick={() => handleCategoryChange(category.slug)}
                      >
                        {category.name}
                      </Button>
                    ))
                  )}
                </div>
              </div>
              
              {/* 배경 이미지 옵션 - 수평 스크롤로 변경 */}
              {isLoadingBackgrounds ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-cyan-400"></div>
                </div>
              ) : (
                <div>
                  <h3 className="text-base font-medium mb-2">라벨 배경</h3>
                  <div className="flex overflow-x-auto gap-1 pb-2 -mx-4 px-4"> {/* 수평 스크롤 */}
                    {labelBackgrounds.map(background => (
                      <Card 
                        key={background.id}
                        className={`cursor-pointer transition-all min-w-[120px] ${
                          labelDesign.template === background.id ? 'ring-2 ring-[#722F37]' : 'hover:shadow-md'
                        }`}
                        onClick={() => handleDesignChange("template", background.id)}
                      >
                        <CardContent className="p-4 flex flex-col items-center">
                          <div className="h-24 w-24 overflow-hidden rounded relative flex items-center justify-center">
                            <img src={background.image} alt={background.name} className="max-w-full max-h-full object-contain" />
                            {background.categoryName && (
                              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-xs p-0.5 text-cyan-300 text-center">
                                {background.categoryName}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 내 업로드 이미지 목록 - 업로드된 이미지가 있을 경우에만 표시 */}
              {uploadedImages.length > 0 && (
                <div>
                  <h3 className="text-base font-medium mb-2">내 업로드 이미지</h3>
                  <div className="flex overflow-x-auto gap-3 pb-2 -mx-4 px-4">
                    {uploadedImages.map(upload => (
                      <Card
                        key={upload.id}
                        className={`relative cursor-pointer transition-all min-w-[120px] ${
                          labelDesign.template === upload.id ? 'ring-2 ring-[#722F37]' : 'hover:shadow-md'
                        }`}
                        onClick={() => handleDesignChange("template", upload.id)}
                      >
                        <CardContent className="p-4 flex flex-col items-center">
                          <div className="h-24 w-24 overflow-hidden rounded flex items-center justify-center">
                            <img src={upload.image} alt={upload.name} className="max-w-full max-h-full object-contain" />
                          </div>
                        </CardContent>
                        <button
                          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600 z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteUpload(upload.filename, upload.id);
                          }}
                        >
                          ×
                        </button>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              {/* 장식 선택 */}
              <div>
                <h3 className="text-base font-medium mb-2">아이콘 및 장식 (클릭하면 추가됩니다)</h3>
                <div className="flex overflow-x-auto gap-3 pb-2 -mx-4 px-4"> {/* 수평 스크롤 */}
                  {labelDecorations.map(option => (
                    <Card 
                      key={option.id}
                      className="cursor-pointer transition-all min-w-[120px] hover:shadow-md bg-white border-gray-300"
                      onClick={() => handleAddDecoration(option.id)}
                    >
                      <CardContent className="p-4 flex items-center justify-center">
                        <div className="h-24 w-24 flex items-center justify-center">
                          {option.id !== "deco4" ? (
                            <img src={option.image} alt={option.name} className="max-h-full max-w-full object-contain" />
                          ) : (
                            <div className="text-gray-500 text-sm">없음</div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">아이콘을 클릭하면 추가됩니다. 추가된 아이콘은 드래그하여 이동하거나 X 버튼을 눌러 삭제할 수 있습니다.</p>
              </div>

              {/* 소품구입 섹션 (여러 개 선택 후 함께 결제) */}
              <div className="mt-6">
                <h3 className="text-base font-medium mb-2 flex items-center">
                  <ShoppingCart className="w-4 h-4 mr-2" /> 소품구입
                </h3>
                <div className="flex overflow-x-auto gap-3 pb-2 -mx-4 px-4">{/* 수평 스크롤 */}
                  {isLoadingAccessories && (
                    <div className="text-sm text-gray-500 px-4">소품 로딩 중...</div>
                  )}
                  {!isLoadingAccessories && accessoryItems.map(item => (
                    <Card key={item.id} className={`min-w-[180px] bg-white/80 border-gray-200 backdrop-blur-sm ${getAccessoryQty(item.id) > 0 ? 'ring-2 ring-[#722F37]' : ''}`}>
                      <CardContent className="p-3 flex flex-col items-center">
                        <div className="h-24 w-24 rounded overflow-hidden bg-white/80 border border-gray-200 flex items-center justify-center mb-2">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="max-w-full max-h-full object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                          ) : (
                            <div className="text-xs text-gray-500">이미지 없음</div>
                          )}
                          <span className="text-gray-600 text-sm" style={{display:'none'}}>이미지</span>
                        </div>
                        <div className="text-sm font-medium text-gray-900 text-center whitespace-pre-line">{item.name}</div>
                        <div className="text-xs text-gray-600 mt-1">{item.price.toLocaleString()}원</div>
                        <div className="mt-2 flex items-center gap-2">
                          <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => decrementAccessory(item.id)}>
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="min-w-[20px] text-center text-sm">{getAccessoryQty(item.id)}</span>
                          <Button size="icon" className="h-7 w-7" onClick={() => incrementAccessory(item)}>
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">선택한 소품은 라벨과 함께 결제됩니다.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="text" className="space-y-6">
              {/* 메인 텍스트 입력 */}
              <div>
                <Label htmlFor="main-text" className="block mb-2 text-sm font-medium">메인 텍스트</Label>
                <Textarea
                  id="main-text"
                  placeholder="와인 이름 또는 메인 텍스트를 입력하세요."
                  className="w-full bg-white/70 border-gray-200 text-gray-900 backdrop-blur-sm"
                  value={labelDesign.text}
                  onChange={(e) => handleDesignChange("text", e.target.value)}
                />
              </div>

              {/* 부가 텍스트 입력 */}
              <div>
                <Label htmlFor="sub-text" className="block mb-2 text-sm font-medium">부가 텍스트</Label>
                <Textarea
                  id="sub-text"
                  placeholder="부가 정보나 설명을 입력하세요."
                  className="w-full bg-white/70 border-gray-200 text-gray-900 backdrop-blur-sm"
                  value={labelDesign.subtext}
                  onChange={(e) => handleDesignChange("subtext", e.target.value)}
                />
              </div>

              {/* 폰트 선택 */}
              <div>
                <Label htmlFor="font-select" className="block mb-2 text-sm font-medium">폰트 스타일</Label>
                <Select
                  value={labelDesign.font}
                  onValueChange={(value) => handleDesignChange("font", value)}
                >
                  <SelectTrigger id="font-select" className="w-full bg-white/70 border-gray-200 text-gray-900 backdrop-blur-sm">
                    <SelectValue placeholder="폰트를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/90 border-gray-200 text-gray-900 backdrop-blur-md max-h-60 overflow-y-auto">
                    {/* 기본 폰트 */}
                    <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100">기본 폰트</div>
                    {fonts.filter(font => ['font1', 'font2', 'font7', 'font20', 'font5', 'font45'].includes(font.id)).map((font) => (
                      <SelectItem key={font.id} value={font.id} style={{ fontFamily: font.family }}>
                        {font.name}
                      </SelectItem>
                    ))}
                    
                    {/* 붓글씨 & 서예체 */}
                    <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 mt-1">붓글씨 & 서예체</div>
                    {fonts.filter(font => ['font46', 'font47', 'font10', 'font51', 'font52', 'font53', 'font54', 'font55', 'font56', 'font57', 'font58', 'font59'].includes(font.id)).map((font) => (
                      <SelectItem key={font.id} value={font.id} style={{ fontFamily: font.family }}>
                        {font.name}
                      </SelectItem>
                    ))}
                    
                    {/* 세로쓰기 폰트 */}
                    <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 mt-1">세로쓰기 폰트</div>
                    {fonts.filter(font => font.vertical).map((font) => (
                      <SelectItem key={font.id} value={font.id} style={{ fontFamily: font.family }}>
                        📝 {font.name}
                      </SelectItem>
                    ))}
                    
                    {/* 장식적 폰트 */}
                    <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 mt-1">장식적 폰트</div>
                    {fonts.filter(font => ['font9', 'font48', 'font11'].includes(font.id)).map((font) => (
                      <SelectItem key={font.id} value={font.id} style={{ fontFamily: font.family }}>
                        {font.name}
                      </SelectItem>
                    ))}
                    
                    {/* 영문 폰트 */}
                    <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 mt-1">영문 폰트</div>
                    {fonts.filter(font => ['font3', 'font4', 'font6', 'font12', 'font19', 'font26', 'font35', 'font50'].includes(font.id)).map((font) => (
                      <SelectItem key={font.id} value={font.id} style={{ fontFamily: font.family }}>
                        {font.name}
                      </SelectItem>
                    ))}
                    
                    {/* 기타 */}
                    <div className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 mt-1">기타</div>
                    {fonts.filter(font => ['font13', 'font17', 'font31', 'font33', 'font36', 'font37'].includes(font.id)).map((font) => (
                      <SelectItem key={font.id} value={font.id} style={{ fontFamily: font.family }}>
                        {font.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* 현재 선택된 폰트가 세로쓰기인지 표시 */}
                {fonts.find(f => f.id === labelDesign.font)?.vertical && (
                  <p className="text-xs text-blue-600 mt-1">📝 세로쓰기 폰트가 선택되었습니다</p>
                )}
              </div>

              {/* 메인 텍스트 크기 조절 */}
              <div>
                <div className="flex justify-between mb-2">
                  <Label htmlFor="text-size" className="text-sm font-medium">메인 텍스트 크기</Label>
                  <span className="text-sm text-gray-400">{labelDesign.textSize}rem</span>
                </div>
                <Slider
                  id="text-size"
                  min={0.5}
                  max={6}
                  step={0.1}
                  value={[labelDesign.textSize]}
                  onValueChange={handleTextSizeChange}
                  className="w-full"
                />
              </div>

              {/* 부가 텍스트 크기 조절 */}
              <div>
                <div className="flex justify-between mb-2">
                  <Label htmlFor="subtext-size" className="text-sm font-medium">부가 텍스트 크기</Label>
                  <span className="text-sm text-gray-400">{labelDesign.subtextSize}rem</span>
                </div>
                <Slider
                  id="subtext-size"
                  min={0.5}
                  max={4}
                  step={0.1}
                  value={[labelDesign.subtextSize]}
                  onValueChange={handleSubtextSizeChange}
                  className="w-full"
                />
              </div>
              
              {/* 텍스트 효과 섹션 */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-800 mb-4">📝 텍스트 효과</h3>
                
                {/* 그림자 효과 */}
                <div>
                  <Label className="block mb-2 text-sm font-medium">그림자 효과</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "none", name: "없음" },
                      { id: "soft", name: "부드러운" },
                      { id: "hard", name: "선명한" },
                      { id: "colored", name: "컬러" },
                      { id: "glow", name: "글로우" }
                    ].map(shadow => (
                      <Button
                        key={shadow.id}
                        variant="outline"
                        className={`text-xs py-2 px-3 ${labelDesign.textShadow === shadow.id ? 'bg-[#722F37] text-white' : ''}`}
                        onClick={() => handleDesignChange("textShadow", shadow.id)}
                      >
                        {shadow.name}
                      </Button>
                    ))}
                  </div>
                </div>
                
                {/* 테두리 효과 */}
                <div>
                  <Label className="block mb-2 text-sm font-medium">테두리 효과</Label>
                  <div className="flex gap-2 mb-2">
                    <Button
                      variant="outline"
                      className={`text-xs py-2 px-3 ${labelDesign.textStroke === "none" ? 'bg-[#722F37] text-white' : ''}`}
                      onClick={() => handleDesignChange("textStroke", "none")}
                    >
                      없음
                    </Button>
                    <Button
                      variant="outline"
                      className={`text-xs py-2 px-3 ${labelDesign.textStroke === "thin" ? 'bg-[#722F37] text-white' : ''}`}
                      onClick={() => handleDesignChange("textStroke", "thin")}
                    >
                      얇게
                    </Button>
                    <Button
                      variant="outline"
                      className={`text-xs py-2 px-3 ${labelDesign.textStroke === "thick" ? 'bg-[#722F37] text-white' : ''}`}
                      onClick={() => handleDesignChange("textStroke", "thick")}
                    >
                      두껍게
                    </Button>
                  </div>
                  {labelDesign.textStroke !== "none" && (
                    <div className="flex items-center space-x-2">
                      <Label className="text-xs">테두리 색상:</Label>
                      <input
                        type="color"
                        value={labelDesign.textStrokeColor}
                        onChange={(e) => handleDesignChange("textStrokeColor", e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer"
                      />
                    </div>
                  )}
                </div>
                
                {/* 그라데이션 효과 */}
                <div>
                  <Label className="block mb-2 text-sm font-medium">그라데이션 효과</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "none", name: "없음", bg: "bg-gray-200" },
                      { id: "rainbow", name: "무지개", bg: "bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500" },
                      { id: "sunset", name: "석양", bg: "bg-gradient-to-r from-orange-500 to-yellow-400" },
                      { id: "ocean", name: "바다", bg: "bg-gradient-to-r from-blue-600 to-cyan-400" },
                      { id: "forest", name: "숲", bg: "bg-gradient-to-r from-green-700 to-green-400" },
                      { id: "fire", name: "불", bg: "bg-gradient-to-r from-red-600 to-orange-400" }
                    ].map(gradient => (
                      <Button
                        key={gradient.id}
                        variant="outline"
                        className={`text-xs py-2 px-2 relative overflow-hidden ${labelDesign.textGradient === gradient.id ? 'ring-2 ring-[#722F37]' : ''}`}
                        onClick={() => handleDesignChange("textGradient", gradient.id)}
                      >
                        <div className={`absolute inset-0 ${gradient.bg}`} />
                        <span className="relative z-10 text-white font-bold text-shadow">{gradient.name}</span>
                      </Button>
                    ))}
                  </div>
                </div>
                
                {/* 스타일 옵션들 */}
                <div>
                  <Label className="block mb-2 text-sm font-medium">스타일 옵션</Label>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <Button
                      variant="outline"
                      className={`text-xs py-2 px-3 ${labelDesign.fontStyle === "italic" ? 'bg-[#722F37] text-white' : ''}`}
                      onClick={() => handleDesignChange("fontStyle", labelDesign.fontStyle === "italic" ? "normal" : "italic")}
                    >
                      기울임
                    </Button>
                    <Select value={labelDesign.textDecoration} onValueChange={(value) => handleDesignChange("textDecoration", value)}>
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="선 효과" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">없음</SelectItem>
                        <SelectItem value="underline">밑줄</SelectItem>
                        <SelectItem value="line-through">취소선</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* 대소문자 변환 */}
                <div>
                  <Label className="block mb-2 text-sm font-medium">대소문자 변환</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "none", name: "기본" },
                      { id: "uppercase", name: "대문자" },
                      { id: "lowercase", name: "소문자" },
                      { id: "capitalize", name: "첫글자만" }
                    ].map(transform => (
                      <Button
                        key={transform.id}
                        variant="outline"
                        className={`text-xs py-2 px-3 ${labelDesign.textTransform === transform.id ? 'bg-[#722F37] text-white' : ''}`}
                        onClick={() => handleDesignChange("textTransform", transform.id)}
                      >
                        {transform.name}
                      </Button>
                    ))}
                  </div>
                </div>
                
                {/* 글자 간격 */}
                <div>
                  <div className="flex justify-between mb-2">
                    <Label className="text-sm font-medium">글자 간격</Label>
                    <span className="text-sm text-gray-400">{labelDesign.letterSpacing}rem</span>
                  </div>
                  <Slider
                    min={-0.2}
                    max={1}
                    step={0.05}
                    value={[labelDesign.letterSpacing]}
                    onValueChange={(value) => handleDesignChange("letterSpacing", value[0])}
                    className="w-full"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="style" className="space-y-6">
              {/* 테두리 스타일 선택 */}
              <div>
                <Label htmlFor="border-style" className="block mb-2 text-sm font-medium">테두리 스타일</Label>
                <div className="flex overflow-x-auto gap-3 pb-2">
                  <Card
                    className={`cursor-pointer transition-all p-3 flex justify-center items-center min-w-[120px] ${
                      labelDesign.borderStyle === 'none' ? 'ring-2 ring-[#722F37]' : 'bg-gray-800 border-gray-700'
                    }`}
                    onClick={() => handleDesignChange("borderStyle", "none")}
                  >
                    <div className="h-16 w-16 flex items-center justify-center">
                      <div className="w-12 h-12 bg-transparent border border-dashed border-gray-500 flex items-center justify-center text-xs">
                        없음
                      </div>
                    </div>
                  </Card>

                  {isLoadingBorders ? (
                    <div className="flex justify-center items-center h-20 min-w-[120px]">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-cyan-400"></div>
                    </div>
                  ) : (
                    labelBorders.filter(b => b.id !== 'none').map((border) => (
                      <Card
                        key={border.id}
                        className={`cursor-pointer transition-all p-3 flex justify-center items-center min-w-[120px] ${
                          labelDesign.borderStyle === border.id ? 'ring-2 ring-[#722F37]' : 'bg-gray-800 border-gray-700'
                        }`}
                        onClick={() => handleDesignChange("borderStyle", border.id)}
                      >
                        <div className="h-16 w-16 overflow-hidden flex items-center justify-center">
                          {border.image && (
                            <img 
                              src={border.image} 
                              alt={border.name || '테두리'} 
                              className="object-contain"
                            />
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>

              {/* 테두리 위치 선택 - 이미지 테두리인 경우만 표시 */}
              {labelDesign.borderStyle !== 'none' && labelBorders.find(b => b.id === labelDesign.borderStyle)?.type === 'image' && (
                <div>
                  <Label htmlFor="border-position" className="block mb-2 text-sm font-medium">테두리 위치</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      className={`flex items-center justify-center py-2 px-4 ${
                        labelDesign.borderPosition === 'all' ? 'bg-cyan-900/50 text-cyan-300 border-cyan-600' : ''
                      }`}
                      onClick={() => handleDesignChange("borderPosition", "all")}
                    >
                      전체
                    </Button>
                    <Button
                      variant="outline"
                      className={`flex items-center justify-center py-2 px-4 ${
                        labelDesign.borderPosition === 'horizontal' ? 'bg-cyan-900/50 text-cyan-300 border-cyan-600' : ''
                      }`}
                      onClick={() => handleDesignChange("borderPosition", "horizontal")}
                    >
                      상하
                    </Button>
                    <Button
                      variant="outline"
                      className={`flex items-center justify-center py-2 px-4 ${
                        labelDesign.borderPosition === 'vertical' ? 'bg-cyan-900/50 text-cyan-300 border-cyan-600' : ''
                      }`}
                      onClick={() => handleDesignChange("borderPosition", "vertical")}
                    >
                      좌우
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="color" className="space-y-6">
              {/* 텍스트 색상 선택 */}
              <div>
                <Label htmlFor="text-color" className="block mb-2 text-sm font-medium">텍스트 색상</Label>
                <div className="flex items-center space-x-4">
                  <input
                    id="text-color"
                    type="color"
                    value={labelDesign.textColor}
                    onChange={(e) => handleDesignChange("textColor", e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <div className="text-gray-300 text-sm">{labelDesign.textColor}</div>
                </div>
              </div>

              {/* 미리 정의된 색상 팔레트 */}
              <div>
                <Label className="block mb-2 text-sm font-medium">빠른 색상 선택</Label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    "#ffffff", "#000000", "#ff0000", "#00ff00", "#0000ff", 
                    "#ffff00", "#ff00ff", "#00ffff", "#722F37", "#9B8174",
                    "#C0C0C0", "#808080", "#800000", "#808000", "#008000"
                  ].map(color => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full border ${labelDesign.textColor === color ? 'border-white ring-2 ring-cyan-500' : 'border-gray-700'}`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleDesignChange("textColor", color)}
                      aria-label={`색상 ${color}`}
                    />
                  ))}
                </div>
              </div>

              {/* 배경색 선택 (투명도 포함) */}
              <div>
                <Label htmlFor="background-color" className="block mb-2 text-sm font-medium">배경 색상 (라벨 이미지 위에 적용)</Label>
                <div className="grid grid-cols-6 gap-2">
                  <button
                    className={`w-8 h-8 rounded flex items-center justify-center border ${
                      labelDesign.backgroundColor === 'transparent' ? 'border-white ring-2 ring-cyan-500' : 'border-gray-700'
                    }`}
                    style={{ background: "repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% / 10px 10px" }}
                    onClick={() => handleDesignChange("backgroundColor", "transparent")}
                    aria-label="투명"
                  >
                    <span className="sr-only">투명</span>
                  </button>
                  {[
                    "#ffffff80", "#00000080", "#ff000080", "#00ff0080", "#0000ff80",
                    "#ffffff", "#000000", "#ff0000", "#00ff00", "#0000ff"
                  ].map(color => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded border ${labelDesign.backgroundColor === color ? 'border-white ring-2 ring-cyan-500' : 'border-gray-700'}`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleDesignChange("backgroundColor", color)}
                      aria-label={`배경색 ${color}`}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="edit" className="space-y-6">
              {/* 사진 효과 */}
              <div>
                <Label className="block mb-2 text-sm font-medium">사진 효과</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "none", name: "원본", filter: "none" },
                    { id: "grayscale", name: "흑백", filter: "grayscale(100%)" },
                    { id: "sepia", name: "세피아", filter: "sepia(100%)" },
                    { id: "blur", name: "블러", filter: "blur(2px)" },
                    { id: "vintage", name: "빈티지", filter: "sepia(50%) contrast(120%) brightness(90%)" },
                    { id: "cold", name: "차가운", filter: "hue-rotate(180deg) saturate(120%)" }
                  ].map(effect => (
                    <button
                      key={effect.id}
                      className={`p-2 text-xs rounded border ${
                        labelDesign.imageFilter === effect.id 
                          ? 'border-primary bg-primary/20 text-primary' 
                          : 'border-gray-300 bg-white/70 text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => handleDesignChange("imageFilter", effect.id)}
                    >
                      {effect.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 컬러 조정 */}
              <div className="space-y-4">
                <Label className="block text-sm font-medium">컬러 조정</Label>
                
                {/* 밝기 */}
                <div>
                  <div className="flex justify-between mb-2">
                    <Label className="text-xs text-gray-600">
                      <Sun className="w-3 h-3 inline mr-1" />
                      밝기
                    </Label>
                    <span className="text-xs text-gray-500">{labelDesign.imageBrightness}%</span>
                  </div>
                  <Slider
                    value={[labelDesign.imageBrightness]}
                    onValueChange={(value) => handleDesignChange("imageBrightness", value[0])}
                    max={200}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* 대비 */}
                <div>
                  <div className="flex justify-between mb-2">
                    <Label className="text-xs text-gray-600">
                      <Contrast className="w-3 h-3 inline mr-1" />
                      대비
                    </Label>
                    <span className="text-xs text-gray-500">{labelDesign.imageContrast}%</span>
                  </div>
                  <Slider
                    value={[labelDesign.imageContrast]}
                    onValueChange={(value) => handleDesignChange("imageContrast", value[0])}
                    max={200}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* 채도 */}
                <div>
                  <div className="flex justify-between mb-2">
                    <Label className="text-xs text-gray-600">
                      <Droplets className="w-3 h-3 inline mr-1" />
                      채도
                    </Label>
                    <span className="text-xs text-gray-500">{labelDesign.imageSaturation}%</span>
                  </div>
                  <Slider
                    value={[labelDesign.imageSaturation]}
                    onValueChange={(value) => handleDesignChange("imageSaturation", value[0])}
                    max={200}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* 색조 */}
                <div>
                  <div className="flex justify-between mb-2">
                    <Label className="text-xs text-gray-600">
                      <RotateCcw className="w-3 h-3 inline mr-1" />
                      색조
                    </Label>
                    <span className="text-xs text-gray-500">{labelDesign.imageHue}°</span>
                  </div>
                  <Slider
                    value={[labelDesign.imageHue]}
                    onValueChange={(value) => handleDesignChange("imageHue", value[0])}
                    max={360}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>

              {/* 자르기 */}
              <div>
                <Label className="block mb-3 text-sm font-medium">이미지 자르기</Label>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    {/* X 위치 */}
                    <div>
                      <Label className="text-xs text-gray-600 block mb-1">X 위치 (%)</Label>
                      <Slider
                        value={[labelDesign.imageCrop?.x || 0]}
                        onValueChange={(value) => handleDesignChange("imageCrop", { ...labelDesign.imageCrop, x: value[0] })}
                        max={50}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-500">{labelDesign.imageCrop?.x || 0}%</span>
                    </div>
                    
                    {/* Y 위치 */}
                    <div>
                      <Label className="text-xs text-gray-600 block mb-1">Y 위치 (%)</Label>
                      <Slider
                        value={[labelDesign.imageCrop?.y || 0]}
                        onValueChange={(value) => handleDesignChange("imageCrop", { ...labelDesign.imageCrop, y: value[0] })}
                        max={50}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-500">{labelDesign.imageCrop?.y || 0}%</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {/* 너비 */}
                    <div>
                      <Label className="text-xs text-gray-600 block mb-1">너비 (%)</Label>
                      <Slider
                        value={[labelDesign.imageCrop?.width || 100]}
                        onValueChange={(value) => handleDesignChange("imageCrop", { ...labelDesign.imageCrop, width: value[0] })}
                        max={100}
                        min={10}
                        step={1}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-500">{labelDesign.imageCrop?.width || 100}%</span>
                    </div>
                    
                    {/* 높이 */}
                    <div>
                      <Label className="text-xs text-gray-600 block mb-1">높이 (%)</Label>
                      <Slider
                        value={[labelDesign.imageCrop?.height || 100]}
                        onValueChange={(value) => handleDesignChange("imageCrop", { ...labelDesign.imageCrop, height: value[0] })}
                        max={100}
                        min={10}
                        step={1}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-500">{labelDesign.imageCrop?.height || 100}%</span>
                    </div>
                  </div>
                  
                  {/* 자르기 프리셋 */}
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <button
                      className="p-2 text-xs rounded border border-gray-300 bg-white/70 text-gray-700 hover:bg-gray-100"
                      onClick={() => handleDesignChange("imageCrop", { x: 0, y: 0, width: 100, height: 100 })}
                    >
                      <Crop className="w-3 h-3 mx-auto mb-1" />
                      전체
                    </button>
                    <button
                      className="p-2 text-xs rounded border border-gray-300 bg-white/70 text-gray-700 hover:bg-gray-100"
                      onClick={() => handleDesignChange("imageCrop", { x: 12.5, y: 12.5, width: 75, height: 75 })}
                    >
                      <Crop className="w-3 h-3 mx-auto mb-1" />
                      중앙
                    </button>
                    <button
                      className="p-2 text-xs rounded border border-gray-300 bg-white/70 text-gray-700 hover:bg-gray-100"
                      onClick={() => handleDesignChange("imageCrop", { x: 0, y: 25, width: 100, height: 50 })}
                    >
                      <Crop className="w-3 h-3 mx-auto mb-1" />
                      가로
                    </button>
                  </div>
                </div>
              </div>

              {/* 이미지 반전 */}
              <div>
                <Label className="block mb-3 text-sm font-medium">이미지 반전</Label>
                <div className="flex space-x-4">
                  <button
                    className={`flex-1 p-3 rounded border ${
                      labelDesign.imageFlipH 
                        ? 'border-primary bg-primary/20 text-primary' 
                        : 'border-gray-300 bg-white/70 text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => handleDesignChange("imageFlipH", !labelDesign.imageFlipH)}
                  >
                    <FlipHorizontal className="w-4 h-4 mx-auto mb-1" />
                    <div className="text-xs">수평 반전</div>
                  </button>
                  <button
                    className={`flex-1 p-3 rounded border ${
                      labelDesign.imageFlipV 
                        ? 'border-primary bg-primary/20 text-primary' 
                        : 'border-gray-300 bg-white/70 text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => handleDesignChange("imageFlipV", !labelDesign.imageFlipV)}
                  >
                    <FlipVertical className="w-4 h-4 mx-auto mb-1" />
                    <div className="text-xs">수직 반전</div>
                  </button>
                </div>
              </div>

              {/* 요소 추가 */}
              <div>
                <Label className="block mb-3 text-sm font-medium">요소 추가</Label>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[
                    { icon: Circle, name: "원", type: "circle" },
                    { icon: Square, name: "사각형", type: "square" },
                    { icon: Triangle, name: "삼각형", type: "triangle" },
                    { icon: Star, name: "별", type: "star" },
                    { icon: Heart, name: "하트", type: "heart" },
                    { icon: Diamond, name: "다이아", type: "diamond" },
                    { icon: Hexagon, name: "육각형", type: "hexagon" },
                    { icon: Zap, name: "번개", type: "zap" },
                    { icon: Crown, name: "왕관", type: "crown" },
                    { icon: Gift, name: "선물", type: "gift" }
                  ].map(shape => (
                    <button
                      key={shape.type}
                      className="p-2 rounded border border-gray-300 bg-white/70 text-gray-700 hover:bg-gray-100 hover:border-primary transition-colors"
                      onClick={() => handleAddElement(shape.type)}
                    >
                      <shape.icon className="w-4 h-4 mx-auto mb-1" />
                      <div className="text-xs">{shape.name}</div>
                    </button>
                  ))}
                </div>

                {/* 선택된 요소 관리 */}
                {elements.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 rounded border">
                    <Label className="block mb-2 text-xs font-medium text-gray-600">
                      추가된 요소 ({elements.length}개)
                    </Label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {elements.map((element) => (
                        <div key={element.id} className="flex items-center justify-between bg-white p-2 rounded border">
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4">
                              {renderElementIcon(element.type, 16, element.color)}
                            </div>
                            <span className="text-xs text-gray-700 capitalize">{element.type}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {/* 색상 선택 */}
                            <input
                              type="color"
                              value={element.color}
                              onChange={(e) => handleElementUpdate(element.id, { color: e.target.value })}
                              className="w-4 h-4 rounded cursor-pointer"
                              title="색상 변경"
                            />
                            {/* 크기 조절 */}
                            <input
                              type="range"
                              min="16"
                              max="64"
                              value={element.size}
                              onChange={(e) => handleElementUpdate(element.id, { size: parseInt(e.target.value) })}
                              className="w-12 h-2 bg-gray-200 rounded"
                              title="크기 조절"
                            />
                            {/* 회전 */}
                            <button
                              onClick={() => handleElementUpdate(element.id, { rotation: (element.rotation + 45) % 360 })}
                              className="w-4 h-4 text-gray-500 hover:text-gray-700"
                              title="45도 회전"
                            >
                              <RotateCw className="w-3 h-3" />
                            </button>
                            {/* 삭제 */}
                            <button
                              onClick={() => handleDeleteElement(element.id)}
                              className="w-4 h-4 text-red-500 hover:text-red-700"
                              title="삭제"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* 전체 삭제 버튼 */}
                    <button
                      onClick={() => setElements([])}
                      className="mt-2 w-full p-1 text-xs text-red-600 hover:text-red-800 border border-red-300 rounded hover:bg-red-50"
                    >
                      모든 요소 삭제
                    </button>
                  </div>
                )}
              </div>

              {/* 초기화 버튼 */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  className="w-full p-3 rounded border border-gray-300 bg-white/70 text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    setLabelDesign(prev => ({
                      ...prev,
                      imageFilter: "none",
                      imageBrightness: 100,
                      imageContrast: 100,
                      imageSaturation: 100,
                      imageHue: 0,
                      imageFlipH: false,
                      imageFlipV: false,
                      imageCrop: { x: 0, y: 0, width: 100, height: 100 }
                    }));
                  }}
                >
                  <RotateCcw className="w-4 h-4 inline mr-2" />
                  모든 편집 초기화
                </button>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* 결제하기 버튼 - 페이지 맨 밑 */}
          <div className="flex justify-center mt-8 mb-4">
            <Button
              onClick={handleCheckout}
              size="lg"
              className="bg-gradient-to-r from-[#722F37] to-[#8B4B4B] hover:from-[#8B4B4B] hover:to-[#722F37] text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl w-full max-w-md"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              결제하기
            </Button>
          </div>
        </div>
      </div>
    </DndProvider>
  );
} 