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
import { Wine, Type, ImageIcon, Grid, ShoppingCart, Save, Undo, Redo, Download, Palette, ArrowLeft } from "lucide-react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { isMobile, useIsMobile } from "@/hooks/use-mobile";
import { adminApi } from "@/services/api";
import html2canvas from "html2canvas";

// 와인병 정보 가져오는 함수
const getWineBottle = (bottleId: string) => {
  const bottles = [
    {
      id: "bordeaux-red-black",
      name: "보르도 레드 (블랙)",
      image: "/images/wine-bottle-1.png",
      type: "red",
      dimensions: "높이 30cm x 지름 8cm",
      capacity: "750ml",
      price: 5000,
      labelSize: {
        width: 18, // rem 단위
        height: 34, // rem 단위
        position: { top: 65, left: 75 } // % 단위
      }
    },
    {
      id: "white-gold",
      name: "화이트 와인 (골드)",
      image: "/images/wine-bottle-2.png",
      type: "white",
      dimensions: "높이 29cm x 지름 7.5cm",
      capacity: "750ml",
      price: 5200,
      labelSize: {
        width: 16, 
        height: 30,
        position: { top: 62, left: 75 }
      }
    },
    {
      id: "rose-copper",
      name: "로제 와인 (코퍼)",
      image: "/images/wine-bottle-3.png",
      type: "rose",
      dimensions: "높이 29cm x 지름 7.5cm",
      capacity: "750ml",
      price: 5500,
      labelSize: {
        width: 16,
        height: 32,
        position: { top: 64, left: 75 }
      }
    },
    {
      id: "white-black",
      name: "화이트 와인 (블랙)",
      image: "/images/wine-bottle-4.png",
      type: "white",
      dimensions: "높이 31cm x 지름 7.5cm",
      capacity: "750ml",
      price: 5300,
      labelSize: {
        width: 15,
        height: 30,
        position: { top: 60, left: 75 }
      }
    },
    {
      id: "red-gold",
      name: "레드 와인 (골드)",
      image: "/images/wine-bottle-5.png",
      type: "red",
      dimensions: "높이 30cm x 지름 8cm",
      capacity: "750ml",
      price: 5800,
      labelSize: {
        width: 18,
        height: 33,
        position: { top: 65, left: 75 }
      }
    },
    {
      id: "red-black-slim",
      name: "레드 와인 슬림 (블랙)",
      image: "/images/wine-bottle-6.png",
      type: "red",
      dimensions: "높이 32cm x 지름 7cm",
      capacity: "750ml",
      price: 6000,
      labelSize: {
        width: 14,
        height: 35,
        position: { top: 62, left: 75 }
      }
    },
    {
      id: "red-gold-premium",
      name: "레드 와인 프리미엄 (골드)",
      image: "/images/wine-bottle-7.png",
      type: "red",
      dimensions: "높이 30cm x 지름 8.5cm",
      capacity: "750ml",
      price: 6500,
      labelSize: {
        width: 19,
        height: 32,
        position: { top: 63, left: 75 }
      }
    }
  ];
  
  return bottles.find(bottle => bottle.id === bottleId);
};

// 폰트 데이터
const fonts = [
  { id: "font1", name: "세리프", family: "Georgia, serif" },
  { id: "font2", name: "산세리프", family: "'Noto Sans KR', sans-serif" },
  { id: "font3", name: "스크립트", family: "'Dancing Script', cursive" },
  { id: "font4", name: "모던", family: "'Montserrat', sans-serif" },
  { id: "font5", name: "고딕", family: "'Gothic A1', sans-serif" },
  { id: "font6", name: "클래식", family: "'Playfair Display', serif" },
  { id: "font7", name: "명조", family: "'Nanum Myeongjo', serif" },
  { id: "font8", name: "바탕", family: "'Batang', serif" },
  { id: "font9", name: "둥근체", family: "'Gaegu', cursive" },
  { id: "font10", name: "손글씨", family: "'Nanum Pen Script', cursive" },
  { id: "font11", name: "브러시", family: "'Black Han Sans', sans-serif" },
  { id: "font12", name: "영문필기", family: "'Pacifico', cursive" },
  { id: "font13", name: "헤드라인", family: "'Oswald', sans-serif" },
  { id: "font14", name: "디스플레이", family: "'Bebas Neue', cursive" },
  { id: "font15", name: "타이포", family: "'Anton', sans-serif" }
];

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
  
  // 이동 속도 조절 계수 (낮을수록 이동 거리가 짧아짐)
  const moveFactor = isMobile ? 0.05 : 0.2;

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
      
      const newX = Math.min(Math.max(position.x + deltaX, 0), 100);
      const newY = Math.min(Math.max(position.y + deltaY, 0), 100);
      
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
      
      const newX = Math.min(Math.max(position.x + deltaX, 0), 100);
      const newY = Math.min(Math.max(position.y + deltaY, 0), 100);
      
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
  onUpdatePositions,
  labelBackgrounds = [],
  labelDecorations = [],
  labelBorders = []
}: { 
  labelDesign: any, 
  wineBottle: any,
  decorationToAdd: string | null,
  onUpdatePositions?: (data: {
    decorations: any[],
    textPosition: { x: number, y: number },
    subtextPosition: { x: number, y: number }
  }) => void,
  labelBackgrounds?: any[],
  labelDecorations?: any[],
  labelBorders?: any[]
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
    subtextSize = 1   // 기본값 설정
  } = labelDesign;

  // 와인병 라벨 크기 설정 (기본값으로 fallback)
  const labelWidth = wineBottle?.labelSize?.width || 18; // 기본값 18rem
  const labelHeight = wineBottle?.labelSize?.height || 34; // 기본값 34rem

  const templateImage = labelBackgrounds.find((t: { id: string }) => t.id === template)?.image || '';
  const selectedFont = fonts.find(f => f.id === font)?.family || "'Noto Sans KR', sans-serif";
  
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
    const newHistory = [...history.slice(0, historyIndex + 1), { 
      type: 'decoration', 
      action: 'add',
      id: newId,
      decorationId,
      position: { x: 50, y: 50 }
    }];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // decorationToAdd가 변경되면 장식 추가
  useEffect(() => {
    if (decorationToAdd && decorationToAdd !== "deco4") {
      addDecoration(decorationToAdd);
    }
  }, [decorationToAdd, addDecoration]);
  
  // 위치 변경 핸들러 - 히스토리 추가
  const handleDecorationChange = (id: string, newPosition: {x: number, y: number}) => {
    setDecorations(prev => {
      const updated = prev.map(item => 
        item.id === id ? { ...item, position: newPosition } : item
      );
      return updated;
    });
    
    const newHistory = [...history.slice(0, historyIndex + 1), { 
      type: 'decoration', 
      action: 'move',
      id, 
      position: newPosition 
    }];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };
  
  const handleTextChange = (newPosition: {x: number, y: number}) => {
    setTextPosition(newPosition);
    const newHistory = [...history.slice(0, historyIndex + 1), { type: 'mainText', position: newPosition }];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };
  
  const handleSubtextChange = (newPosition: {x: number, y: number}) => {
    setSubtextPosition(newPosition);
    const newHistory = [...history.slice(0, historyIndex + 1), { type: 'subText', position: newPosition }];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };
  
  // 장식 삭제
  const removeDecoration = (id: string) => {
    setDecorations(prev => prev.filter(item => item.id !== id));
    
    // 히스토리에 삭제 작업 기록
    const newHistory = [...history.slice(0, historyIndex + 1), { 
      type: 'decoration', 
      action: 'remove',
      id
    }];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
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
          <div className={`relative ${isMobile ? 'mb-12' : 'mb-32'} flex justify-center`}>
            {/* 와인병 배경 이미지 */}
            <img 
              src={wineBottle.image}
              alt={wineBottle.name}
              className="h-[750px] sm:h-[750px] md:h-[750px] lg:h-[750px] object-contain"
              style={{ 
                transform: isMobile 
                  ? 'scale(1.1, 1.2)' 
                  : 'scale(1.6, 1.4)'
              }}
            />
            
            {/* 와인병 정보 표시 */}
            <div className="absolute top-0 right-0 bg-black/70 text-white p-3 rounded-lg text-sm z-30">
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
                  라벨 크기: {labelWidth}cm × {labelHeight}cm
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
                  width: isMobile 
                    ? `${labelWidth * 0.8}rem` // 모바일에서도 더 크게
                    : `${labelWidth * 1.3}rem`, // 데스크톱에서 더 크게
                  height: isMobile 
                    ? `${labelHeight * 0.8}rem` // 모바일에서도 더 크게
                    : `${labelHeight * 1.3}rem`, // 데스크톱에서 더 크게
                  backgroundColor: "#F9F1F2",
                }}
              >
                {/* 배경 이미지 */}
                {templateImage && (
                  <img 
                    src={templateImage} 
                    alt="라벨 배경" 
                    className="absolute inset-0 w-full h-full object-cover opacity-100" 
                  />
                )}
                
                {/* 업로드된 테두리 이미지 */}
                {isImageBorder && borderImage && (
                  <div 
                    className="absolute inset-0 pointer-events-none" 
                    style={getBorderImageStyle()}
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
                
                {/* 텍스트 콘텐츠 (드래그 가능) */}
                <DraggableElement
                  position={textPosition}
                  onPositionChange={handleTextChange}
                  type="mainText"
                >
                  <div
                    className="text-center whitespace-normal break-words w-full p-0 m-0"
                    style={{ 
                      fontFamily: selectedFont,
                      color: textColor,
                      fontWeight: "bold",
                      fontSize: isMobile 
                        ? `${textSize * 0.8}rem` // 모바일에서도 더 크게
                        : `${textSize * 1.3}rem` // 데스크톱에서 더 크게
                    }}
                  >
                    {text || "와인 이름"}
                  </div>
                </DraggableElement>
                
                <DraggableElement
                  position={subtextPosition}
                  onPositionChange={handleSubtextChange}
                  type="subText"
                >
                  <div
                    className="text-center whitespace-normal w-full p-0 m-0"
                    style={{ 
                      fontFamily: selectedFont,
                      color: textColor,
                      fontSize: isMobile 
                        ? `${subtextSize * 0.8}rem` // 모바일에서도 더 크게
                        : `${subtextSize * 1.3}rem` // 데스크톱에서 더 크게
                    }}
                  >
                    {subtext || "부가 설명을 입력하세요"}
                  </div>
                </DraggableElement>
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
  
  const [labelDesign, setLabelDesign] = useState({
    template: "template1",
    text: "",
    subtext: "",
    font: "font1",
    textColor: "#000000",
    backgroundColor: "#f5f5f5",
    borderStyle: "none", // 기본값을 "없음"으로 변경
    borderPosition: "all", // 테두리 위치: "horizontal", "vertical", "all"
    decoration: "deco4", // 기본값을 "없음"으로 변경
    textSize: 1.25, // 메인 텍스트 크기 (rem 단위), 기본값 1.25rem
    subtextSize: 1 // 부가 텍스트 크기 (rem 단위), 기본값 1rem
  });
  
  // 장식 추가를 위한 상태
  const [decorationToAdd, setDecorationToAdd] = useState<string | null>(null);
  
  // 라벨 배경 목록을 위한 상태
  const [labelBackgrounds, setLabelBackgrounds] = useState<any[]>([]);
  const [labelBorders, setLabelBorders] = useState<any[]>([]);
  const [labelDecorations, setLabelDecorations] = useState<any[]>([]);
  const [isLoadingBackgrounds, setIsLoadingBackgrounds] = useState(true);
  const [isLoadingBorders, setIsLoadingBorders] = useState(true);
  const [isLoadingDecorations, setIsLoadingDecorations] = useState(true);

  // 뒤로가기 함수
  const handleGoBack = () => {
    setLocation("/wine-bottles");
  };

  useEffect(() => {
    // 와인병 정보 가져오기
    if (bottleId) {
      const bottle = getWineBottle(bottleId);
      if (bottle) {
        setWineBottle(bottle);
      } else {
        // 잘못된 병 ID인 경우 이전 페이지로 리디렉션
        setLocation("/wine-bottles");
      }
    }
    
    // 라벨 배경 목록 가져오기
    const fetchLabelBackgrounds = async () => {
      try {
        setIsLoadingBackgrounds(true);
        const response = await adminApi.getLabelBackgrounds();
        if (response.data && response.data.backgrounds) {
          const backgrounds = response.data.backgrounds.map((bg: any) => ({
            id: bg.id,
            name: bg.name || bg.id,
            image: bg.url
          }));
          
          // 배경이 없는 경우 기본 배경 추가
          if (backgrounds.length === 0) {
            backgrounds.push({ 
              id: "default", 
              name: "기본", 
              image: "/images/label/default.jpg" 
            });
          }
          
          setLabelBackgrounds(backgrounds);
          
          // 첫 번째 배경을 기본값으로 설정
          if (backgrounds.length > 0 && labelDesign.template === "template1") {
            setLabelDesign(prev => ({ ...prev, template: backgrounds[0].id }));
          }
        }
      } catch (error) {
        console.error("라벨 배경 로드 오류:", error);
        // 오류 시 기본 배경 설정
        setLabelBackgrounds([
          { id: "default", name: "기본", image: "/images/label/default.jpg" }
        ]);
      } finally {
        setIsLoadingBackgrounds(false);
      }
    };
    
    // 테두리 옵션 설정 (업로드된 테두리 이미지만)
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
    
    fetchLabelBackgrounds();
    fetchLabelBorders();
    fetchLabelDecorations();
  }, [bottleId]);

  // 라벨 디자인 속성 변경 핸들러
  const handleDesignChange = (key: string, value: string) => {
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
        decorations: positionData.decorations.map(deco => ({
          id: deco.id,
          decorationId: deco.decorationId,
          position: deco.position
        })),
        textPosition: positionData.textPosition,
        subtextPosition: positionData.subtextPosition,
        textSize: labelDesign.textSize,
        subtextSize: labelDesign.subtextSize
      };
      
      sessionStorage.setItem('labelDesign', JSON.stringify(labelData));
      
      // 라벨 미리보기 요소가 있을 경우 이미지로 캡처
      if (labelPreviewRef.current) {
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
  
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 헤더 영역 - 뒤로가기 버튼과 제목 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <Button 
          variant="ghost" 
          onClick={handleGoBack}
          className="text-white hover:bg-gray-800"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          뒤로가기
        </Button>
        <h1 className="text-xl font-bold">나만의 와인 라벨 디자인</h1>
        <div className="w-20"></div> {/* 균형을 위한 빈 공간 */}
      </div>

      {/* 메인 콘텐츠 - 세로 레이아웃 */}
      <div className="max-w-4xl mx-auto p-4" ref={labelPreviewRef}>
        {/* 와인병과 라벨 미리보기 */}
        <LabelPreview 
          labelDesign={labelDesign} 
          wineBottle={wineBottle} 
          decorationToAdd={decorationToAdd}
          onUpdatePositions={handleUpdatePositions}
          labelBackgrounds={labelBackgrounds}
          labelDecorations={labelDecorations}
          labelBorders={labelBorders}
        />
        
        {/* 디자인 옵션 탭 */}
        <Tabs defaultValue="template" className="w-full">
          <TabsList className="grid grid-cols-4 gap-2 w-full mb-6">
            <TabsTrigger value="template" className="text-sm">
              <ImageIcon className="w-4 h-4 mr-1" />
              배경
            </TabsTrigger>
            <TabsTrigger value="text" className="text-sm">
              <Type className="w-4 h-4 mr-1" />
              텍스트
            </TabsTrigger>
            <TabsTrigger value="style" className="text-sm">
              <Grid className="w-4 h-4 mr-1" />
              스타일
            </TabsTrigger>
            <TabsTrigger value="color" className="text-sm">
              <Palette className="w-4 h-4 mr-1" />
              색상
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="template" className="space-y-6">
            {/* 배경 선택 */}
                         <DesignOptionCard
               title="라벨 배경"
               options={labelBackgrounds}
               selectedId={labelDesign.template}
               onChange={(id) => handleDesignChange("template", id)}
               renderItem={(option) => (
                 <div className="h-16 w-20 overflow-hidden rounded">
                   <img src={option.image} alt={option.name} className="w-full h-full object-cover" />
                 </div>
               )}
             />
            
            {/* 장식 선택 */}
            <div>
              <h3 className="text-lg font-medium mb-3">아이콘 및 장식 (클릭하면 추가됩니다)</h3>
              <div className="flex overflow-x-auto gap-3 pb-2"> {/* 수평 스크롤 */}
                                 {labelDecorations.map(option => (
                   <Card 
                     key={option.id}
                     className="cursor-pointer transition-all min-w-[80px] hover:shadow-md bg-gray-800 border-gray-700"
                     onClick={() => handleAddDecoration(option.id)}
                   >
                     <CardContent className="p-3 flex items-center justify-center">
                       <div className="h-12 w-12 flex items-center justify-center">
                         {option.id !== "deco4" ? (
                           <img src={option.image} alt={option.name} className="max-h-full max-w-full object-contain" />
                         ) : (
                           <div className="text-gray-400">없음</div>
                         )}
                       </div>
                     </CardContent>
                   </Card>
                 ))}
              </div>
              <p className="text-sm text-gray-400 mt-2">아이콘을 클릭하면 추가됩니다. 추가된 아이콘은 드래그하여 이동하거나 X 버튼을 눌러 삭제할 수 있습니다.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="text" className="space-y-6">
            {/* 텍스트 입력 */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="main-text" className="text-white">메인 텍스트</Label>
                <Input 
                  id="main-text"
                  placeholder="와인 이름을 입력하세요" 
                  value={labelDesign.text}
                  onChange={(e) => handleDesignChange("text", e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="sub-text" className="text-white">부가 텍스트</Label>
                <Textarea 
                  id="sub-text"
                  placeholder="부가 설명을 입력하세요" 
                  value={labelDesign.subtext}
                  onChange={(e) => handleDesignChange("subtext", e.target.value)}
                  rows={3}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              
              {/* 텍스트 크기 조절 */}
              <div className="space-y-4 pt-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label htmlFor="text-size" className="text-white">메인 텍스트 크기: {labelDesign.textSize}rem</Label>
                    <span className="text-xs text-gray-400">
                      {labelDesign.textSize < 1 ? '작게' : labelDesign.textSize > 1.5 ? '크게' : '보통'}
                    </span>
                  </div>
                  <Slider
                    id="text-size"
                    min={0.5}
                    max={3}
                    step={0.1}
                    value={[labelDesign.textSize]}
                    onValueChange={handleTextSizeChange}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label htmlFor="subtext-size" className="text-white">부가 텍스트 크기: {labelDesign.subtextSize}rem</Label>
                    <span className="text-xs text-gray-400">
                      {labelDesign.subtextSize < 0.8 ? '작게' : labelDesign.subtextSize > 1.2 ? '크게' : '보통'}
                    </span>
                  </div>
                  <Slider
                    id="subtext-size"
                    min={0.5}
                    max={2.5}
                    step={0.1}
                    value={[labelDesign.subtextSize]}
                    onValueChange={handleSubtextSizeChange}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
            
            {/* 폰트 선택 */}
            <div>
              <Label htmlFor="font-select" className="block mb-2 text-white">폰트 스타일</Label>
              <Select
                value={labelDesign.font}
                onValueChange={(value) => handleDesignChange("font", value)}
              >
                <SelectTrigger id="font-select" className="mb-2 bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="폰트 스타일 선택" />
                </SelectTrigger>
                <SelectContent className="max-h-80 bg-gray-800 border-gray-600">
                  {fonts.map(font => (
                    <SelectItem 
                      key={font.id} 
                      value={font.id}
                      style={{ fontFamily: font.family }}
                      className="text-white hover:bg-gray-700"
                    >
                      {font.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
          
                     <TabsContent value="style" className="space-y-6">
             {/* 테두리 스타일 */}
             <DesignOptionCard
               title="테두리 스타일"
               options={labelBorders}
               selectedId={labelDesign.borderStyle}
               onChange={(id) => handleDesignChange("borderStyle", id)}
               renderItem={(option) => (
                 <div className="h-12 w-12 flex items-center justify-center">
                   {option.type === "image" ? (
                     // 업로드된 테두리 이미지
                     <div 
                       className="h-10 w-10 border border-gray-500"
                       style={{
                         backgroundImage: `url(${option.image})`,
                         backgroundSize: '100% 100%',
                         backgroundPosition: 'center',
                         backgroundRepeat: 'no-repeat'
                       }}
                     />
                   ) : option.id === "none" ? (
                     <div className="text-gray-400">없음</div>
                   ) : option.id === "all" ? (
                     <div className="h-8 w-8 border-2 border-solid border-primary" />
                   ) : option.id === "horizontal" ? (
                     <div className="h-8 w-8 border-t-2 border-b-2 border-solid border-primary" />
                   ) : option.id === "vertical" ? (
                     <div className="h-8 w-8 border-l-2 border-r-2 border-solid border-primary" />
                   ) : (
                     <div className="text-gray-400">없음</div>
                   )}
                 </div>
               )}
             />
             
             {/* 테두리 이미지 위치 선택 (이미지 테두리가 선택되었을 때만 표시) */}
             {(() => {
               const selectedBorderOption = labelBorders.find(b => b.id === labelDesign.borderStyle);
               return selectedBorderOption?.type === "image" && (
                 <div className="mt-6">
                   <h3 className="text-lg font-medium mb-3 text-white">테두리 위치 선택</h3>
                   <div className="space-y-3">
                     <div className="flex items-center space-x-3">
                       <input
                         type="radio"
                         id="border-horizontal"
                         name="borderPosition"
                         value="horizontal"
                         checked={labelDesign.borderPosition === "horizontal"}
                         onChange={(e) => handleDesignChange("borderPosition", e.target.value)}
                         className="w-4 h-4 text-primary bg-gray-800 border-gray-600 focus:ring-primary"
                       />
                       <label htmlFor="border-horizontal" className="text-white text-sm">
                         상하 (위아래만)
                       </label>
                     </div>
                     
                     <div className="flex items-center space-x-3">
                       <input
                         type="radio"
                         id="border-vertical"
                         name="borderPosition"
                         value="vertical"
                         checked={labelDesign.borderPosition === "vertical"}
                         onChange={(e) => handleDesignChange("borderPosition", e.target.value)}
                         className="w-4 h-4 text-primary bg-gray-800 border-gray-600 focus:ring-primary"
                       />
                       <label htmlFor="border-vertical" className="text-white text-sm">
                         좌우 (양옆만)
                       </label>
                     </div>
                     
                     <div className="flex items-center space-x-3">
                       <input
                         type="radio"
                         id="border-all"
                         name="borderPosition"
                         value="all"
                         checked={labelDesign.borderPosition === "all"}
                         onChange={(e) => handleDesignChange("borderPosition", e.target.value)}
                         className="w-4 h-4 text-primary bg-gray-800 border-gray-600 focus:ring-primary"
                       />
                       <label htmlFor="border-all" className="text-white text-sm">
                         상하좌우 (전체)
                       </label>
                     </div>
                   </div>
                 </div>
               );
             })()}
           </TabsContent>
          
          <TabsContent value="color" className="space-y-6">
            {/* 색상 선택 */}
            <div className="space-y-6">
              <div>
                <Label htmlFor="text-color" className="block mb-2 text-white">텍스트 색상</Label>
                <div className="flex items-center gap-4">
                  <input 
                    type="color" 
                    id="text-color"
                    value={labelDesign.textColor}
                    onChange={(e) => handleDesignChange("textColor", e.target.value)}
                    className="w-10 h-10 rounded overflow-hidden"
                  />
                  <span className="text-white">{labelDesign.textColor}</span>
                </div>
              </div>
              
              <div>
                <Label htmlFor="bg-color" className="block mb-2 text-white">배경 색상</Label>
                <div className="flex items-center gap-4">
                  <input 
                    type="color" 
                    id="bg-color"
                    value={labelDesign.backgroundColor}
                    onChange={(e) => handleDesignChange("backgroundColor", e.target.value)}
                    className="w-10 h-10 rounded overflow-hidden"
                  />
                  <span className="text-white">{labelDesign.backgroundColor}</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* 주문하기 버튼 */}
        <div className="mt-8 mb-4">
          <Button 
            className="w-full bg-[#722F37] hover:bg-[#722F37]/90 text-white py-4 text-lg"
            onClick={handleCheckout}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            주문하기
          </Button>
        </div>
      </div>
    </div>
  );
} 