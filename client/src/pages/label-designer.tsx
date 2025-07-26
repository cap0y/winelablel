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
import { Wine, Type, ImageIcon, Grid, ShoppingCart, Save, Undo, Redo, Download, Palette } from "lucide-react";
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

// 미리보기 컴포넌트
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
  // wineBottle이 없으면 로딩 표시
  if (!wineBottle) {
    return <div className="flex justify-center items-center h-[80vh]">와인병 로딩 중...</div>;
  }
  
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

  // 와인병 라벨 크기 설정
  const labelWidth = wineBottle.labelSize?.width || 18; // 기본값 18rem
  const labelHeight = wineBottle.labelSize?.height || 34; // 기본값 34rem
  const labelTop = wineBottle.labelSize?.position?.top || 65; // 기본값 65%
  const labelLeft = wineBottle.labelSize?.position?.left || 75; // 기본값 75%

  const templateImage = labelBackgrounds.find((t: { id: string }) => t.id === template)?.image || '';
  const selectedFont = fonts.find(f => f.id === font)?.family || "'Noto Sans KR', sans-serif";
  
  // 선택된 테두리 이미지 찾기
  const borderImage = labelBorders.find((b: { id: string }) => b.id === borderStyle)?.image || '';

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
  
  // decorationToAdd가 변경되면 장식 추가
  useEffect(() => {
    if (decorationToAdd && decorationToAdd !== "deco4") {
      addDecoration(decorationToAdd);
    }
  }, [decorationToAdd]);
  
  // 위치 변경 핸들러 - 히스토리 추가
  const handleDecorationChange = (id: string, newPosition: {x: number, y: number}) => {
    setDecorations(prev => {
      const updated = prev.map(item => 
        item.id === id ? { ...item, position: newPosition } : item
      );
      // 위치 정보 업데이트를 부모에게 알림
      if (onUpdatePositions) {
        onUpdatePositions({
          decorations: updated,
          textPosition,
          subtextPosition
        });
      }
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
    // 위치 정보 업데이트를 부모에게 알림
    if (onUpdatePositions) {
      onUpdatePositions({
        decorations,
        textPosition: newPosition,
        subtextPosition
      });
    }
    const newHistory = [...history.slice(0, historyIndex + 1), { type: 'mainText', position: newPosition }];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };
  
  const handleSubtextChange = (newPosition: {x: number, y: number}) => {
    setSubtextPosition(newPosition);
    // 위치 정보 업데이트를 부모에게 알림
    if (onUpdatePositions) {
      onUpdatePositions({
        decorations,
        textPosition,
        subtextPosition: newPosition
      });
    }
    const newHistory = [...history.slice(0, historyIndex + 1), { type: 'subText', position: newPosition }];
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };
  
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

  // 외부에서 접근하기 위한 getter 함수와 컴포넌트 노출 코드 제거 (불필요)
  
  // 컴포넌트 마운트 시 초기 위치 정보 전달
  useEffect(() => {
    if (onUpdatePositions) {
      onUpdatePositions({
        decorations,
        textPosition,
        subtextPosition
      });
    }
  }, []);

  return (
      <div className="flex flex-col items-center bg-transparent p-0 rounded-lg w-full h-full">
        {/* 와인병을 전체 화면 배경으로 */}
        <div className="fixed top-0 bottom-0 left-0 right-0 w-full h-screen z-20 flex justify-start items-center pl-72">
              <img 
                src={wineBottle.image}
                alt={wineBottle.name}
                className="h-[95vh] object-cover opacity-100 scale-[1.8]"
              />
          {/* 테두리와 라벨 오버레이 (와인병 라벨 부분에 정확히 위치) */}
          <div 
            className="absolute z-50"
            style={{ 
              top: `${labelTop}%`,
              left: `${labelLeft}%`,
              width: `${labelWidth + 2}rem`, // 테두리를 위해 약간 더 큰 크기
              height: `${labelHeight + 2}rem`, // 테두리를 위해 약간 더 큰 크기
              transform: 'translate(-50%, -50%)'
            }}
          >
            {/* 테두리 이미지 - 라벨을 감싸는 위치에 배치 */}
            {borderStyle !== "border4" && borderImage && (
              <div 
                className="absolute inset-0 z-5" 
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url(${borderImage})`,
                  backgroundSize: '100% 100%',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              />
            )}
            
            {/* 라벨 내용 - 중앙에 정확히 위치 */}
            <div 
              className="absolute overflow-visible border border-dashed border-gray-400 z-10"
              style={{ 
                backgroundColor: borderStyle === "border2" ? "#FFF8E1" : borderStyle === "border3" ? "#F5F5F5" : "#F9F1F2",
                width: `${labelWidth}rem`,
                height: `${labelHeight}rem`,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
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
              
              {/* 기존 내부 테두리 - 테두리 스타일이 border4(없음)가 아닐 때만 표시 */}
              {borderStyle === "border1" && (
                <div className="absolute inset-0 border-4 border-opacity-70"
                    style={{ 
                      borderColor: "#722F37",
                      borderStyle: "solid"
                    }} 
                />
              )}
              
              {/* 여러 장식 (드래그 가능) */}
              {decorations.map((decoration) => (
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
                      className="w-16 h-16 object-contain"
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
                    fontSize: `${textSize}rem`
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
                    fontSize: `${subtextSize}rem`
                  }}
                >
                  {subtext || "부가 설명을 입력하세요"}
                </div>
              </DraggableElement>
            </div>
          </div>
        </div>
        
        {/* Undo/Redo 버튼 */}
        <div className="flex gap-2 mt-2">
          <Button onClick={undo}><Undo className="w-4 h-4" /></Button>
          <Button onClick={redo}><Redo className="w-4 h-4" /></Button>
        </div>
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
    borderStyle: "border1",
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
    
    // 테두리 이미지 가져오기
    const fetchLabelBorders = async () => {
      try {
        setIsLoadingBorders(true);
        const response = await adminApi.getLabelBorders();
        if (response.data && response.data.borders) {
          const borders = response.data.borders.map((border: any) => ({
            id: border.id,
            name: border.name || border.id,
            image: border.url
          }));
          
          // 테두리가 없는 경우 기본 테두리 추가
          if (borders.length === 0) {
            borders.push(
              { id: "border1", name: "기본", image: "/images/border/default.jpg" },
              { id: "border4", name: "없음", image: "" }
            );
          } else {
            // '없음' 옵션 항상 추가
            if (!borders.find((b: { id: string }) => b.id === "border4")) {
              borders.push({ id: "border4", name: "없음", image: "" });
            }
          }
          
          setLabelBorders(borders);
        }
      } catch (error) {
        console.error("테두리 이미지 로드 오류:", error);
        // 오류 시 기본 테두리 설정
        setLabelBorders([
          { id: "border1", name: "기본", image: "/images/border/default.jpg" },
          { id: "border4", name: "없음", image: "" }
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
  const handleUpdatePositions = (data: {
    decorations: any[],
    textPosition: { x: number, y: number },
    subtextPosition: { x: number, y: number }
  }) => {
    setPositionData(data);
  };
  
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
        const labelElement = labelPreviewRef.current.querySelector('.absolute.overflow-visible.border.border-dashed');
        
        if (labelElement) {
          // 캡처 전에 경계선 임시 제거
          const originalBorder = labelElement.className;
          labelElement.className = labelElement.className.replace('border border-dashed border-gray-400', '');
          
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
          labelElement.className = originalBorder;
          
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
    <div className="flex flex-col min-h-screen w-screen max-w-[100vw] overflow-x-hidden pt-8 pb-24">
      <h1 className="text-2xl font-bold my-6 text-center z-50 relative">나만의 와인 라벨 디자인</h1>
      
      <div className="flex flex-row relative z-30">
        {/* 왼쪽: 미리보기 */}
        <div className="w-full">
          <div className="sticky top-16 pt-8" ref={labelPreviewRef}>
            <LabelPreview 
              labelDesign={labelDesign} 
              wineBottle={wineBottle} 
              decorationToAdd={decorationToAdd}
              onUpdatePositions={handleUpdatePositions}
              labelBackgrounds={labelBackgrounds}
              labelDecorations={labelDecorations}
              labelBorders={labelBorders}
            />
          </div>
        </div>
        
        {/* 오른쪽: 디자인 옵션 */}
        <div className="w-1/2 pr-4 top-80 h-screen overflow-y-auto p-4 bg-opacity-90 bg-gray-900 fixed left-0">
          <Tabs defaultValue="template" className="w-full flex flex-col">
            <TabsList className="grid grid-cols-2 gap-2 w-full mb-12">
              <TabsTrigger value="template" className="justify-center">
                <ImageIcon className="w-4 h-4 mr-2" />
                배경
              </TabsTrigger>
              <TabsTrigger value="text" className="justify-center">
                <Type className="w-4 h-4 mr-2" />
                텍스트
              </TabsTrigger>
              <TabsTrigger value="style" className="justify-center">
                <Grid className="w-4 h-4 mr-2" />
                스타일
              </TabsTrigger>
              <TabsTrigger value="color" className="justify-center">
                <Palette className="w-4 h-4 mr-2" />
                색상
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="template" className="mt-6 flex-1 pl-4">
              {/* 배경 선택 */}
              <DesignOptionCard
                title="라벨 배경"
                options={labelBackgrounds}
                selectedId={labelDesign.template}
                onChange={(id) => handleDesignChange("template", id)}
                renderItem={(option) => (
                  <>
                    <div className="h-20 w-32 overflow-hidden rounded mb-2">
                      <img src={option.image} alt={option.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-sm">{option.name}</span>
                  </>
                )}
              />
              
              {/* 장식 선택 */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">아이콘 및 장식 (클릭하면 추가됩니다)</h3>
                <div className="flex overflow-x-auto gap-3 pb-2"> {/* 수평 스크롤 */}
                  {labelDecorations.map(option => (
                    <Card 
                      key={option.id}
                      className="cursor-pointer transition-all min-w-[100px] hover:shadow-md"
                      onClick={() => handleAddDecoration(option.id)}
                    >
                      <CardContent className="p-3 flex flex-col items-center">
                        <div className="h-16 w-16 flex items-center justify-center">
                          {option.id !== "deco4" ? (
                            <img src={option.image} alt={option.name} className="max-h-full max-w-full object-contain" />
                          ) : (
                            <div className="text-gray-400">없음</div>
                          )}
                        </div>
                        <span className="text-sm mt-2">{option.name}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <p className="text-sm text-gray-400 mt-2">아이콘을 클릭하면 추가됩니다. 추가된 아이콘은 드래그하여 이동하거나 X 버튼을 눌러 삭제할 수 있습니다.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="text" className="mt-6 flex-1 pl-4">
              {/* 텍스트 입력 */}
              <div className="space-y-4 mb-6">
                <div>
                  <Label htmlFor="main-text">메인 텍스트</Label>
                  <Input 
                    id="main-text"
                    placeholder="와인 이름을 입력하세요" 
                    value={labelDesign.text}
                    onChange={(e) => handleDesignChange("text", e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="sub-text">부가 텍스트</Label>
                  <Textarea 
                    id="sub-text"
                    placeholder="부가 설명을 입력하세요" 
                    value={labelDesign.subtext}
                    onChange={(e) => handleDesignChange("subtext", e.target.value)}
                    rows={3}
                  />
                </div>
                
                {/* 텍스트 크기 조절 추가 */}
                <div className="space-y-4 pt-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label htmlFor="text-size">메인 텍스트 크기: {labelDesign.textSize}rem</Label>
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
                      <Label htmlFor="subtext-size">부가 텍스트 크기: {labelDesign.subtextSize}rem</Label>
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
              <div className="mb-6">
                <Label htmlFor="font-select" className="block mb-2">폰트 스타일</Label>
                <Select
                  value={labelDesign.font}
                  onValueChange={(value) => handleDesignChange("font", value)}
                >
                  <SelectTrigger id="font-select" className="mb-2">
                    <SelectValue placeholder="폰트 스타일 선택" />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    {fonts.map(font => (
                      <SelectItem 
                        key={font.id} 
                        value={font.id}
                        style={{ fontFamily: font.family }}
                      >
                        {font.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* 폰트 미리보기 삭제 */}
              </div>
            </TabsContent>
            
            <TabsContent value="style" className="mt-6 flex-1 pl-4">
              {/* 테두리 스타일 */}
              <DesignOptionCard
                title="테두리 스타일"
                options={labelBorders}
                selectedId={labelDesign.borderStyle}
                onChange={(id) => handleDesignChange("borderStyle", id)}
                renderItem={(option) => (
                  <>
                    <div className="h-16 w-16 flex items-center justify-center">
                      {option.id !== "border4" ? (
                        <div 
                          className="h-14 w-14 border-4 border-double" 
                          style={{ 
                            borderColor: option.id === "border2" ? "gold" : 
                                       option.id === "border3" ? "silver" : "#722F37" 
                          }}
                        />
                      ) : (
                        <div className="text-gray-400">없음</div>
                      )}
                    </div>
                    <span className="text-sm mt-2">{option.name}</span>
                  </>
                )}
              />
            </TabsContent>
            
            <TabsContent value="color" className="mt-6 flex-1 pl-4">
              {/* 색상 선택 */}
              <div className="space-y-6 mb-6">
                <div>
                  <Label htmlFor="text-color" className="block mb-2">텍스트 색상</Label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="color" 
                      id="text-color"
                      value={labelDesign.textColor}
                      onChange={(e) => handleDesignChange("textColor", e.target.value)}
                      className="w-10 h-10 rounded overflow-hidden"
                    />
                    <span>{labelDesign.textColor}</span>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="bg-color" className="block mb-2">배경 색상</Label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="color" 
                      id="bg-color"
                      value={labelDesign.backgroundColor}
                      onChange={(e) => handleDesignChange("backgroundColor", e.target.value)}
                      className="w-10 h-10 rounded overflow-hidden"
                    />
                    <span>{labelDesign.backgroundColor}</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* 주문하기 버튼을 페이지 하단에 배치 */}
      <div className="mt-auto pt-8 fixed bottom-20 left-1 px-4 w-1/2 z-50"> {/* right-4에서 left-4로 변경 */}
        <Button 
          className="w-full bg-[#722F37] hover:bg-[#722F37]/90 text-white py-6 text-xl"
          onClick={handleCheckout}
        >
          <ShoppingCart className="w-6 h-6 mr-3" />
          주문하기
        </Button>
      </div>
    </div>
  );
} 