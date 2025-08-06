import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Wine,
  Type,
  ImageIcon,
  Grid,
  ShoppingCart,
  Save,
  Undo,
  Redo,
  Download,
  Palette,
  ArrowLeft,
  Upload,
} from "lucide-react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { isMobile, useIsMobile } from "@/hooks/use-mobile";
import { adminApi } from "@/services/api";
import { uploadApi } from "@/services/api";
import html2canvas from "html2canvas";
import { labelApi } from "@/services/api";

// 와인병 정보 가져오는 함수
const getWineBottle = (bottleId: string) => {
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
        position: { top: 70, left: 75 }, // % 단위
      },
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
        position: { top: 70, left: 75 },
      },
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
        position: { top: 70, left: 75 },
      },
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
        position: { top: 75, left: 75 }, // % 단위
      },
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
        position: { top: 75, left: 75 },
      },
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
        position: { top: 75, left: 75 },
      },
    },
  ];

  return bottles.find((bottle) => bottle.id === bottleId);
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
  { id: "font15", name: "타이포", family: "'Anton', sans-serif" },
  { id: "font16", name: "엘레간트", family: "'Cormorant Garamond', serif" },
  { id: "font17", name: "미니멀", family: "'Roboto', sans-serif" },
  { id: "font18", name: "빈티지", family: "'Abril Fatface', cursive" },
  { id: "font19", name: "캘리그라피", family: "'Great Vibes', cursive" },
  { id: "font20", name: "굵은명조", family: "'Noto Serif KR', serif" },
  { id: "font21", name: "라이트", family: "'Lato', sans-serif" },
  { id: "font22", name: "볼드", family: "'Raleway', sans-serif" },
  { id: "font23", name: "클래식영문", family: "'Times New Roman', serif" },
  { id: "font24", name: "모던영문", family: "'Helvetica', sans-serif" },
  { id: "font25", name: "아티스틱", family: "'Righteous', cursive" },
  { id: "font26", name: "로맨틱", family: "'Sacramento', cursive" },
  { id: "font27", name: "강인한", family: "'Barlow Condensed', sans-serif" },
  { id: "font28", name: "우아한", family: "'Crimson Text', serif" },
  { id: "font29", name: "심플", family: "'Source Sans Pro', sans-serif" },
  { id: "font30", name: "레트로", family: "'Fredoka One', cursive" },
  { id: "font31", name: "세련된", family: "'Poppins', sans-serif" },
  { id: "font32", name: "고전적", family: "'Libre Baskerville', serif" },
  { id: "font33", name: "현대적", family: "'Inter', sans-serif" },
  { id: "font34", name: "예술적", family: "'Shadows Into Light', cursive" },
  { id: "font35", name: "고급스러운", family: "'Cinzel', serif" },
  { id: "font36", name: "캐주얼", family: "'Open Sans', sans-serif" },
  { id: "font37", name: "테크닉", family: "'Orbitron', monospace" },
  { id: "font38", name: "친근한", family: "'Nunito', sans-serif" },
  { id: "font39", name: "전통적", family: "'EB Garamond', serif" },
  { id: "font40", name: "독특한", family: "'Comfortaa', cursive" },
  { id: "font41", name: "날카로운", family: "'Fira Sans', sans-serif" },
  { id: "font42", name: "부드러운", family: "'Quicksand', sans-serif" },
  { id: "font43", name: "강렬한", family: "'Bangers', cursive" },
  { id: "font44", name: "신문체", family: "'Merriweather', serif" },
  { id: "font45", name: "고딕체", family: "'Nanum Gothic', sans-serif" },
  { id: "font46", name: "붓글씨", family: "'East Sea Dokdo', cursive" },
  { id: "font47", name: "펜글씨", family: "'Gamja Flower', cursive" },
  { id: "font48", name: "도톰한", family: "'Jua', sans-serif" },
  { id: "font49", name: "깔끔한", family: "'Spoqa Han Sans', sans-serif" },
  { id: "font50", name: "장식적", family: "'Lobster', cursive" },
];

// 드래그 가능한 요소 (새로운 구현)
function DraggableElement({
  children,
  position,
  onPositionChange,
  type,
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

      // 위치 제약 완화 - 라벨지 경계를 벗어날 수 있도록 확장
      const newX = Math.min(Math.max(position.x + deltaX, -50), 150);
      const newY = Math.min(Math.max(position.y + deltaY, -50), 150);

      onPositionChange({ x: newX, y: newY });
      setStartPos({ x: e.clientX, y: e.clientY });

      e.preventDefault();
      e.stopPropagation();
    },
    [dragging, startPos, position, onPositionChange, moveFactor],
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
    [dragging, startPos, position, onPositionChange, moveFactor],
  );

  const handleTouchEnd = useCallback(() => {
    setDragging(false);
  }, []);

  // 이벤트 리스너 등록/해제
  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [
    dragging,
    handleMouseMove,
    handleMouseUp,
    handleTouchMove,
    handleTouchEnd,
  ]);

  return (
    <div
      ref={elementRef}
      style={{
        position: "absolute",
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: "translate(-50%, -50%)",
        cursor: dragging ? "grabbing" : "grab",
        opacity: dragging ? 0.7 : 1,
        userSelect: "none",
        touchAction: "none",
        zIndex: dragging ? 1000 : 1,
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
  labelBorders = [],
}: {
  labelDesign: any;
  wineBottle: any;
  decorationToAdd: string | null;
  onUpdatePositions?: (data: {
    decorations: any[];
    textPosition: { x: number; y: number };
    subtextPosition: { x: number; y: number };
  }) => void;
  labelBackgrounds?: any[];
  labelDecorations?: any[];
  labelBorders?: any[];
}) {
  const {
    template,
    text,
    subtext,
    font,
    textColor,
    backgroundColor,
    borderStyle,
    textSize = 1.25, // 기본값 설정
    subtextSize = 1, // 기본값 설정
  } = labelDesign;

  // 와인병 라벨 크기 설정 (기본값으로 fallback)
  const labelWidth = wineBottle?.labelSize?.width || 18; // 기본값 18rem
  const labelHeight = wineBottle?.labelSize?.height || 34; // 기본값 34rem

  const templateImage =
    labelBackgrounds.find((t: { id: string }) => t.id === template)?.image ||
    "";
  const selectedFont =
    fonts.find((f) => f.id === font)?.family || "'Noto Sans KR', sans-serif";

  // 선택된 테두리 정보 찾기
  const selectedBorder = labelBorders.find(
    (b: { id: string }) => b.id === borderStyle,
  );
  const borderType = selectedBorder?.type || "basic";
  const borderImage = selectedBorder?.image || "";
  const isImageBorder = borderType === "image";

  // 기본 테두리 스타일 결정
  const getBasicBorderClass = () => {
    if (borderStyle === "all") return "border-2 border-solid border-primary";
    if (borderStyle === "horizontal")
      return "border-t-2 border-b-2 border-solid border-primary";
    if (borderStyle === "vertical")
      return "border-l-2 border-r-2 border-solid border-primary";
    return "border-2 border-dashed border-gray-400"; // none이거나 기본값
  };

  // 테두리 이미지 위치에 따른 스타일 결정
  const getBorderImageStyle = () => {
    if (!isImageBorder || !borderImage) return {};

    const { borderPosition } = labelDesign;

    if (borderPosition === "horizontal") {
      // 상하에만 표시
      return {
        background: `
          url(${borderImage}) top center / 100% 20px no-repeat,
          url(${borderImage}) bottom center / 100% 20px no-repeat
        `,
      };
    } else if (borderPosition === "vertical") {
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
        backgroundSize: "100% 100%",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      };
    }
  };

  // 위치 상태
  const [textPosition, setTextPosition] = useState({ x: 50, y: 40 });
  const [subtextPosition, setSubtextPosition] = useState({ x: 50, y: 60 });

  // 다중 장식 관리를 위한 상태 (각각 고유 ID 및 위치 정보 포함)
  const [decorations, setDecorations] = useState<
    Array<{
      id: string;
      decorationId: string;
      position: { x: number; y: number };
    }>
  >([]);

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
      position: { x: 50, y: 50 }, // 기본 위치는 중앙
    };

    setDecorations((prev) => [...prev, newDecoration]);

    // 히스토리에 추가 작업 기록
    setHistory((prevHistory) => {
      const currentHistoryIndex = historyIndexRef.current;
      const newHistory = [
        ...prevHistory.slice(0, currentHistoryIndex + 1),
        {
          type: "decoration",
          action: "add",
          id: newId,
          decorationId,
          position: { x: 50, y: 50 },
        },
      ];
      return newHistory;
    });
    setHistoryIndex((prev) => prev + 1);
  }, []); // 의존성 배열을 빈 배열로 설정

  // decorationToAdd가 변경되면 장식 추가
  useEffect(() => {
    if (decorationToAdd && decorationToAdd !== "deco4") {
      // 직접 장식 추가 로직 실행
      const newId = `decoration-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newDecoration = {
        id: newId,
        decorationId: decorationToAdd,
        position: { x: 50, y: 50 },
      };

      setDecorations((prev) => [...prev, newDecoration]);

      setHistory((prevHistory) => {
        const currentHistoryIndex = historyIndexRef.current;
        const newHistory = [
          ...prevHistory.slice(0, currentHistoryIndex + 1),
          {
            type: "decoration",
            action: "add",
            id: newId,
            decorationId: decorationToAdd,
            position: { x: 50, y: 50 },
          },
        ];
        return newHistory;
      });
      setHistoryIndex((prev) => prev + 1);
    }
  }, [decorationToAdd]); // decorationToAdd만 의존성으로 설정

  // 위치 변경 핸들러 - 히스토리 추가
  const handleDecorationChange = (
    id: string,
    newPosition: { x: number; y: number },
  ) => {
    setDecorations((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, position: newPosition } : item,
      );
      return updated;
    });

    const decorationHistory = [
      ...history.slice(0, historyIndexRef.current + 1),
      {
        type: "decoration",
        action: "move",
        id,
        position: newPosition,
      },
    ];
    setHistory(decorationHistory);
    setHistoryIndex(decorationHistory.length - 1);
  };

  const handleTextChange = (newPosition: { x: number; y: number }) => {
    setTextPosition(newPosition);
    const textHistory = [
      ...history.slice(0, historyIndexRef.current + 1),
      { type: "mainText", position: newPosition },
    ];
    setHistory(textHistory);
    setHistoryIndex(textHistory.length - 1);
  };

  const handleSubtextChange = (newPosition: { x: number; y: number }) => {
    setSubtextPosition(newPosition);
    const subtextHistory = [
      ...history.slice(0, historyIndexRef.current + 1),
      { type: "subText", position: newPosition },
    ];
    setHistory(subtextHistory);
    setHistoryIndex(subtextHistory.length - 1);
  };

  // 장식 삭제
  const removeDecoration = (id: string) => {
    setDecorations((prev) => prev.filter((item) => item.id !== id));

    // 히스토리에 삭제 작업 기록
    const removeHistory = [
      ...history.slice(0, historyIndexRef.current + 1),
      {
        type: "decoration",
        action: "remove",
        id,
      },
    ];
    setHistory(removeHistory);
    setHistoryIndex(removeHistory.length - 1);
  };

  // Undo/Redo 함수
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      const prevItem = history[historyIndex - 1];

      // 되돌린 항목 유형에 따라 적절한 상태 업데이트
      if (prevItem.type === "decoration") {
        if (prevItem.action === "move") {
          setDecorations((prev) =>
            prev.map((item) =>
              item.id === prevItem.id
                ? { ...item, position: prevItem.position }
                : item,
            ),
          );
        } else if (prevItem.action === "add") {
          setDecorations((prev) =>
            prev.filter((item) => item.id !== prevItem.id),
          );
        } else if (prevItem.action === "remove") {
          // 삭제된 장식을 복원해야 하지만, 정보가 없으므로 이전 히스토리에서 찾아야 함
          const decorationToRestore = history
            .slice(0, historyIndex - 1)
            .reverse()
            .find(
              (h) =>
                h.type === "decoration" &&
                h.id === prevItem.id &&
                (h.action === "add" || h.action === "move"),
            );

          if (decorationToRestore) {
            setDecorations((prev) => [
              ...prev,
              {
                id: decorationToRestore.id,
                decorationId: decorationToRestore.decorationId,
                position: decorationToRestore.position,
              },
            ]);
          }
        }
      } else if (prevItem.type === "mainText") {
        setTextPosition(prevItem.position);
      } else if (prevItem.type === "subText") {
        setSubtextPosition(prevItem.position);
      }
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      const nextItem = history[historyIndex + 1];

      // 복원한 항목 유형에 따라 적절한 상태 업데이트
      if (nextItem.type === "decoration") {
        if (nextItem.action === "move") {
          setDecorations((prev) =>
            prev.map((item) =>
              item.id === nextItem.id
                ? { ...item, position: nextItem.position }
                : item,
            ),
          );
        } else if (nextItem.action === "add") {
          setDecorations((prev) => [
            ...prev,
            {
              id: nextItem.id,
              decorationId: nextItem.decorationId,
              position: nextItem.position,
            },
          ]);
        } else if (nextItem.action === "remove") {
          setDecorations((prev) =>
            prev.filter((item) => item.id !== nextItem.id),
          );
        }
      } else if (nextItem.type === "mainText") {
        setTextPosition(nextItem.position);
      } else if (nextItem.type === "subText") {
        setSubtextPosition(nextItem.position);
      }
    }
  };

  // 위치 정보가 변경될 때마다 부모에게 알림
  useEffect(() => {
    if (onUpdatePositions && typeof onUpdatePositions === "function") {
      // 렌더링 완료 후 다음 틱에서 실행하여 렌더링 중 상태 업데이트 방지
      const timeoutId = setTimeout(() => {
        onUpdatePositions({
          decorations: decorations || [],
          textPosition,
          subtextPosition,
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
          <div
            className={`relative ${isMobile ? "mb-12" : "mb-32"} flex justify-center`}
          >
            {/* 와인병 배경 이미지 */}
            <img
              src={wineBottle.image}
              alt={wineBottle.name}
              className="h-[600px] sm:h-[600px] md:h-[620px] lg:h-[650px] object-contain"
              style={{
                transform: isMobile ? "scale(1.1, 1.2)" : "scale(1.6, 1.4)",
              }}
            />

            {/* 와인병 정보 표시 */}
            <div className="absolute top-0 right-0 bg-black/70 text-white p-3 rounded-lg text-sm z-30">
              <div className="font-medium mb-1">{wineBottle.name}</div>
              <div className="text-xs text-gray-300">
                {wineBottle.dimensions}
              </div>
              <div className="text-xs text-gray-300">{wineBottle.capacity}</div>
            </div>

            {/* 라벨 오버레이 - 와인병 라벨 위치에 정확히 배치 */}
            <div
              className="absolute z-20"
              style={{
                top: `${wineBottle.labelSize?.position?.top || 65}%`,
                left: "50%", // 와인병 중앙에 정확히 위치
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className="text-center mb-2">
                <p
                  className={`text-xs text-gray-300 bg-black/50 ${isMobile ? "px-1 py-0.5" : "px-2 py-1"} rounded`}
                >
                  실제 라벨 크기: {(labelWidth / 2.54).toFixed(2)}cm ×{" "}
                  {(labelHeight / 2.54).toFixed(2)}cm
                </p>
              </div>

              <div
                className={`relative ${
                  isImageBorder
                    ? ""
                    : borderStyle === "none"
                      ? "border-2 border-dashed border-gray-400"
                      : getBasicBorderClass()
                }`}
                style={{
                  width: `${labelWidth}rem`, // 소수점까지 정확한 크기
                  height: `${labelHeight}rem`, // 소수점까지 정확한 크기
                  backgroundColor: "transparent",
                  overflow: "visible", // 요소가 라벨지를 벗어날 수 있도록 설정
                }}
              >
                {/* 업로드된 테두리 이미지 - 배경보다 먼저 렌더링하여 뒤로 배치 */}
                {isImageBorder && borderImage && (
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      top: "-10px",
                      left: "-10px",
                      right: "-10px",
                      bottom: "-10px",
                      ...getBorderImageStyle(),
                    }}
                  />
                )}

                {/* 배경 이미지 */}
                {templateImage && (
                  <img
                    src={templateImage}
                    alt="라벨 배경"
                    className="absolute inset-0 w-full h-full object-contain opacity-100"
                  />
                )}

                {/* 여러 장식 (드래그 가능) */}
                {decorations &&
                  decorations.length > 0 &&
                  decorations.map((decoration) => (
                    <DraggableElement
                      key={decoration.id}
                      position={decoration.position}
                      onPositionChange={(newPos) =>
                        handleDecorationChange(decoration.id, newPos)
                      }
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
                          src={
                            labelDecorations.find(
                              (d: { id: string }) =>
                                d.id === decoration.decorationId,
                            )?.image ?? ""
                          }
                          alt="장식"
                          className={`${isMobile ? "w-16 h-16" : "w-20 h-20"} object-contain`}
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
                        : `${textSize * 1.3}rem`, // 데스크톱에서 더 크게
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
                        : `${subtextSize * 1.3}rem`, // 데스크톱에서 더 크게
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
function DesignOptionCard({
  title,
  options,
  selectedId,
  onChange,
  renderItem,
}: {
  title: string;
  options: any[];
  selectedId: string;
  onChange: (id: string) => void;
  renderItem: (option: any) => React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-3">{title}</h3>
      <div className="flex overflow-x-auto gap-3 pb-2">
        {" "}
        {/* 수평 스크롤 */}
        {options.map((option) => (
          <Card
            key={option.id}
            className={`cursor-pointer transition-all min-w-[120px] ${selectedId === option.id ? "ring-2 ring-[#722F37]" : "hover:shadow-md"}`}
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
  const [backgroundsCache, setBackgroundsCache] = useState<{
    [key: string]: any[];
  }>({});
  const [isCacheLoaded, setIsCacheLoaded] = useState(false);

  // 뒤로가기 함수
  const handleGoBack = () => {
    setLocation("/wine-bottles");
  };

  // 카테고리별 배경 이미지 로드 함수 - 캐싱 추가
  const fetchLabelBackgrounds = useCallback(
    async (categorySlug: string | null = null) => {
      const cacheKey = categorySlug || "all";

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
          const response =
            await labelApi.getBackgroundsByCategory(categorySlug);
          if (response.data && response.data.backgrounds) {
            backgrounds = response.data.backgrounds.map((bg: any) => ({
              id: bg.id,
              name: bg.name || bg.id,
              image: bg.url,
              categoryId: bg.categoryId,
              categoryName: bg.categoryName,
            }));
          }
        } else {
          // 카테고리가 선택되지 않은 경우, 모든 배경 가져옴
          const response = await adminApi.getLabelBackgrounds();
          if (response.data && response.data.backgrounds) {
            backgrounds = response.data.backgrounds.map((bg: any) => ({
              id: bg.id,
              name: bg.name || bg.id,
              image: bg.url,
            }));
          }
        }

        if (!backgrounds || backgrounds.length === 0) {
          // 배경이 없는 경우 기본 배경 추가
          backgrounds = [
            {
              id: "default",
              name: "기본",
              image: "/images/label/default.jpg",
            },
          ];
        }

        // 캐시에 저장
        setBackgroundsCache((prev) => ({
          ...prev,
          [cacheKey]: backgrounds,
        }));

        setLabelBackgrounds(backgrounds);

        // 첫 번째 배경을 기본값으로 설정 (변경된 경우에만)
        if (backgrounds.length > 0 && labelDesign.template === "template1") {
          setLabelDesign((prev) => ({ ...prev, template: backgrounds[0].id }));
        }
      } catch (error) {
        console.error("라벨 배경 로드 오류:", error);
        // 오류 시 기본 배경 설정
        const defaultBg = [
          { id: "default", name: "기본", image: "/images/label/default.jpg" },
        ];
        setLabelBackgrounds(defaultBg);
        setBackgroundsCache((prev) => ({
          ...prev,
          [cacheKey]: defaultBg,
        }));
      } finally {
        setIsLoadingBackgrounds(false);
      }
    },
    [backgroundsCache, isCacheLoaded, labelDesign.template],
  );

  // 초기 데이터 로드
  useEffect(() => {
    // 와인병 정보 설정
    if (bottleId) {
      const selectedBottle = getWineBottle(bottleId);
      if (selectedBottle) {
        setWineBottle(selectedBottle);
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
          const allBackgrounds = allResponse.data.backgrounds.map(
            (bg: any) => ({
              id: bg.id,
              name: bg.name || bg.id,
              image: bg.url,
            }),
          );

          setBackgroundsCache((prev) => ({
            ...prev,
            all: allBackgrounds,
          }));

          setLabelBackgrounds(allBackgrounds);

          // 첫 번째 배경을 기본값으로 설정
          if (
            allBackgrounds.length > 0 &&
            labelDesign.template === "template1"
          ) {
            setLabelDesign((prev) => ({
              ...prev,
              template: allBackgrounds[0].id,
            }));
          }
        }

        // 카테고리별 배경들도 미리 로드
        const categoriesResponse = await labelApi.getCategories();
        if (categoriesResponse.data.success) {
          const fetchedCategories = categoriesResponse.data.categories;
          setCategories(fetchedCategories);

          // 각 카테고리별 배경 미리 로드
          const categoryPromises = fetchedCategories.map(
            async (category: any) => {
              try {
                const response = await labelApi.getBackgroundsByCategory(
                  category.slug,
                );
                if (response.data && response.data.backgrounds) {
                  const backgrounds = response.data.backgrounds.map(
                    (bg: any) => ({
                      id: bg.id,
                      name: bg.name || bg.id,
                      image: bg.url,
                      categoryId: bg.categoryId,
                      categoryName: bg.categoryName,
                    }),
                  );

                  setBackgroundsCache((prev) => ({
                    ...prev,
                    [category.slug]: backgrounds,
                  }));
                }
              } catch (error) {
                console.log(`카테고리 ${category.name} 배경 로드 실패:`, error);
              }
            },
          );

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
            const uploadedBorders = response.data.borders.map(
              (border: any) => ({
                id: border.id,
                name: border.name || border.id,
                image: border.url,
                type: "image",
              }),
            );

            // 업로드된 테두리들을 없음 옵션 뒤에 추가
            borders = [
              { id: "none", name: "없음", type: "basic" },
              ...uploadedBorders,
            ];
          }
        } catch (apiError) {
          console.log(
            "API에서 테두리 이미지를 가져올 수 없습니다. 없음 옵션만 사용합니다.",
          );
        }

        setLabelBorders(borders);
      } catch (error) {
        console.error("테두리 옵션 설정 오류:", error);
        // 오류 시 없음 옵션만 설정
        setLabelBorders([{ id: "none", name: "없음", type: "basic" }]);
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
            image: icon.url,
          }));

          // 장식이 없는 경우 기본 옵션 추가
          if (decorations.length === 0) {
            decorations.push(
              { id: "deco1", name: "기본", image: "/images/icon/default.jpg" },
              { id: "deco4", name: "없음", image: "" },
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
          { id: "deco4", name: "없음", image: "" },
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
            filename: upload.filename,
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
      fetchUploadedImages(),
    ]);
  }, [bottleId]); // 의존성 배열 정리

  // 카테고리 선택 핸들러 - 즉시 반응하도록 수정
  const handleCategoryChange = (categorySlug: string) => {
    const newCategory = categorySlug === "all" ? null : categorySlug;
    setSelectedCategory(newCategory);

    // 캐시에서 즉시 로드
    const cacheKey = newCategory || "all";
    if (backgroundsCache[cacheKey]) {
      setLabelBackgrounds(backgroundsCache[cacheKey]);
    } else {
      // 캐시에 없으면 로드
      fetchLabelBackgrounds(newCategory);
    }
  };

  // 이미지 업로드 핸들러
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];

    // 허용된 이미지 타입 확인
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert(
        "지원하지 않는 이미지 형식입니다. JPG, PNG, GIF, WEBP 형식만 업로드 가능합니다.",
      );
      return;
    }

    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("이미지 크기는 5MB를 초과할 수 없습니다.");
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const response = await uploadApi.uploadImage(formData);

      if (response.data && response.data.success) {
        // 업로드 성공 후 목록에 추가
        const newUpload = {
          id: response.data.file.id,
          name: response.data.file.name,
          image: response.data.file.url,
          filename: response.data.file.filename,
        };

        setUploadedImages((prev) => [...prev, newUpload]);

        // 방금 업로드한 이미지를 현재 배경으로 설정
        setLabelDesign((prev) => ({ ...prev, template: newUpload.id }));

        // 배경 목록에도 추가
        setLabelBackgrounds((prev) => [...prev, { ...newUpload }]);
      } else {
        alert("이미지 업로드 중 문제가 발생했습니다.");
      }
    } catch (error) {
      console.error("이미지 업로드 오류:", error);
      alert("이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);

      // 입력 필드 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
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
  const handleDesignChange = (key: string, value: string) => {
    setLabelDesign((prev) => ({
      ...prev,
      [key]: value,
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

  // 업로드 이미지 삭제 핸들러
  const handleDeleteUpload = async (filename: string, id: string) => {
    try {
      await uploadApi.deleteUpload(filename);

      // 업로드 목록에서 제거
      setUploadedImages((prev) =>
        prev.filter((img) => img.filename !== filename),
      );

      // 배경 목록에서도 제거
      setLabelBackgrounds((prev) => prev.filter((bg) => bg.id !== id));

      // 현재 선택된 배경이 삭제된 이미지라면 다른 배경으로 변경
      if (labelDesign.template === id) {
        // 첫 번째 사용 가능한 배경으로 변경
        const firstBackground = labelBackgrounds.find((bg) => bg.id !== id);
        if (firstBackground) {
          setLabelDesign((prev) => ({ ...prev, template: firstBackground.id }));
        }
      }

      alert("이미지가 성공적으로 삭제되었습니다.");
    } catch (error) {
      console.error("이미지 삭제 오류:", error);
      alert("이미지 삭제 중 오류가 발생했습니다.");
    }
  };

  // 위치 정보 상태 추가
  const [positionData, setPositionData] = useState<{
    decorations: any[];
    textPosition: { x: number; y: number };
    subtextPosition: { x: number; y: number };
  }>({
    decorations: [],
    textPosition: { x: 50, y: 40 },
    subtextPosition: { x: 50, y: 60 },
  });

  // 위치 정보 업데이트 핸들러
  const handleUpdatePositions = useCallback(
    (data: {
      decorations: any[];
      textPosition: { x: number; y: number };
      subtextPosition: { x: number; y: number };
    }) => {
      setPositionData(data);
    },
    [],
  );

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
        decorations: positionData.decorations.map((deco) => ({
          id: deco.id,
          decorationId: deco.decorationId,
          position: deco.position,
        })),
        textPosition: positionData.textPosition,
        subtextPosition: positionData.subtextPosition,
        textSize: labelDesign.textSize,
        subtextSize: labelDesign.subtextSize,
      };

      sessionStorage.setItem("labelDesign", JSON.stringify(labelData));

      // 라벨 미리보기 요소가 있을 경우 이미지로 캡처
      if (labelPreviewRef.current) {
        // 1. 라벨만 캡처 - 기존 코드
        // 미리보기 요소에서 실제 라벨 부분만 캡처하기 위해 요소 찾기
        const labelElement = labelPreviewRef.current.querySelector(
          'div[style*="width:"][style*="height:"]',
        );

        if (labelElement) {
          // 캡처 전에 테두리 스타일 임시 제거 (점선 테두리인 경우만)
          const originalClassName = labelElement.className;
          const hasDashedBorder = originalClassName.includes("border-dashed");
          if (hasDashedBorder) {
            labelElement.className = originalClassName
              .replace(/border-\w*\s*/g, "")
              .replace(/border-dashed/g, "");
          }

          // 캡처 전에 모든 삭제 버튼(X 버튼) 숨기기
          const deleteButtons = labelElement.querySelectorAll(
            ".decoration-delete-btn",
          );
          Array.from(deleteButtons).forEach((button) => {
            (button as HTMLElement).style.display = "none";
          });

          // html2canvas를 사용하여 라벨 요소를 이미지로 변환
          const canvas = await html2canvas(labelElement as HTMLElement, {
            backgroundColor: null,
            scale: 2, // 고해상도 이미지를 위해 스케일 2배로 설정
            logging: false,
            useCORS: true, // 외부 이미지 사용을 위한 CORS 허용
            allowTaint: true,
          });

          // 원래 스타일 복원
          if (hasDashedBorder) {
            labelElement.className = originalClassName;
          }

          // 삭제 버튼 다시 표시
          Array.from(deleteButtons).forEach((button) => {
            (button as HTMLElement).style.display = "";
          });

          // 캔버스를 데이터 URL로 변환
          const imageDataUrl = canvas.toDataURL("image/png");

          // 캡처한 이미지를 sessionStorage에 저장
          sessionStorage.setItem("labelPreviewImage", imageDataUrl);
        }

        // 2. 와인병 전체 영역 캡처 (새로 추가)
        // 와인병 전체 영역 찾기 - 선택자를 더 명확하게 수정
        console.log("와인병 전체 영역 캡처 시도...");

        try {
          // 전체 미리보기 컨테이너를 직접 캡처
          const bottleContainer = labelPreviewRef.current.querySelector(
            ".flex.flex-col.items-center.w-full",
          );

          if (bottleContainer) {
            console.log("와인병 전체 영역 요소 찾음:", bottleContainer);

            // 캡처 전에 모든 삭제 버튼(X 버튼) 임시 숨기기
            const allDeleteButtons = labelPreviewRef.current.querySelectorAll(
              ".decoration-delete-btn",
            );
            Array.from(allDeleteButtons).forEach((button) => {
              (button as HTMLElement).style.display = "none";
            });

            // 캡처 전에 점선 테두리 숨기기
            const labelContainers =
              labelPreviewRef.current.querySelectorAll(".border-dashed");
            const originalBorderStyles: {
              element: HTMLElement;
              style: string;
            }[] = [];

            Array.from(labelContainers).forEach((container) => {
              const element = container as HTMLElement;
              originalBorderStyles.push({
                element,
                style: element.style.border,
              });
              element.style.border = "none";
            });

            // 캡처 전에 라벨 크기 정보 숨기기
            const sizeInfoElements = labelPreviewRef.current.querySelectorAll(
              ".text-xs.text-gray-300.bg-black\\/50",
            );
            const originalDisplayStyles: {
              element: HTMLElement;
              display: string;
            }[] = [];

            Array.from(sizeInfoElements).forEach((element) => {
              const el = element as HTMLElement;
              originalDisplayStyles.push({
                element: el,
                display: el.style.display,
              });
              el.style.display = "none";
            });

            // 캡처 전에 와인병 정보(쇼비뇽블랑 레드, 높이, 지름 등) 숨기기
            const bottleInfoElement = labelPreviewRef.current.querySelector(
              ".absolute.top-0.right-0.bg-black\\/70.text-white",
            );
            let originalBottleInfoDisplay = "";
            if (bottleInfoElement) {
              const el = bottleInfoElement as HTMLElement;
              originalBottleInfoDisplay = el.style.display;
              el.style.display = "none";
            }

            // html2canvas를 사용하여 와인병 전체 요소를 이미지로 변환
            const bottleCanvas = await html2canvas(
              bottleContainer as HTMLElement,
              {
                backgroundColor: "rgba(17, 24, 39, 1)", // bg-gray-900와 유사한 배경색
                scale: 1.5, // 고해상도 이미지를 위해 스케일 설정
                logging: true, // 디버깅을 위해 로깅 활성화
                useCORS: true, // 외부 이미지 사용을 위한 CORS 허용
                allowTaint: true,
                onclone: (clonedDoc) => {
                  // 클론된 문서에서 추가로 점선과 크기 정보를 숨김
                  const clonedBorders =
                    clonedDoc.querySelectorAll(".border-dashed");
                  Array.from(clonedBorders).forEach((element) => {
                    (element as HTMLElement).style.border = "none";
                  });

                  const clonedSizeInfo = clonedDoc.querySelectorAll(
                    ".text-xs.text-gray-300.bg-black\\/50",
                  );
                  Array.from(clonedSizeInfo).forEach((element) => {
                    (element as HTMLElement).style.display = "none";
                  });

                  // 클론된 문서에서 와인병 정보도 숨김
                  const clonedBottleInfo = clonedDoc.querySelector(
                    ".absolute.top-0.right-0.bg-black\\/70.text-white",
                  );
                  if (clonedBottleInfo) {
                    (clonedBottleInfo as HTMLElement).style.display = "none";
                  }

                  console.log(
                    "클론된 문서에서 점선, 크기 정보 및 와인병 정보 숨김 처리 완료",
                  );
                },
              },
            );

            // 삭제 버튼 다시 표시
            Array.from(allDeleteButtons).forEach((button) => {
              (button as HTMLElement).style.display = "";
            });

            // 테두리 스타일 복원
            originalBorderStyles.forEach((item) => {
              item.element.style.border = item.style;
            });

            // 라벨 크기 정보 표시 복원
            originalDisplayStyles.forEach((item) => {
              item.element.style.display = item.display;
            });

            // 와인병 정보 표시 복원
            if (bottleInfoElement) {
              (bottleInfoElement as HTMLElement).style.display =
                originalBottleInfoDisplay;
            }

            if (bottleCanvas) {
              console.log("와인병 전체 이미지 캡처 성공");
              // 캔버스를 데이터 URL로 변환
              const bottleImageDataUrl = bottleCanvas.toDataURL("image/png");

              // 캡처한 와인병 전체 이미지를 sessionStorage에 저장
              sessionStorage.setItem("bottlePreviewImage", bottleImageDataUrl);
              console.log("와인병 전체 이미지 sessionStorage에 저장 완료");
            } else {
              console.error("와인병 전체 이미지 캡처 실패: 캔버스 생성 실패");
            }
          } else {
            console.error("와인병 전체 영역 요소를 찾을 수 없음");

            // 대체 선택자로 시도
            const alternativeElement =
              labelPreviewRef.current.querySelector(".relative");
            if (alternativeElement) {
              console.log("대체 선택자로 와인병 요소 찾음");
              const bottleCanvas = await html2canvas(
                alternativeElement as HTMLElement,
                {
                  backgroundColor: "rgba(17, 24, 39, 1)",
                  scale: 1.5,
                  logging: true,
                  useCORS: true,
                  allowTaint: true,
                },
              );

              const bottleImageDataUrl = bottleCanvas.toDataURL("image/png");
              sessionStorage.setItem("bottlePreviewImage", bottleImageDataUrl);
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
      console.error("라벨 캡처 중 오류 발생:", error);
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
    setLabelDesign((prev) => ({
      ...prev,
      textSize: parseFloat(value[0].toFixed(1)),
    }));
  };

  const handleSubtextSizeChange = (value: number[]) => {
    setLabelDesign((prev) => ({
      ...prev,
      subtextSize: parseFloat(value[0].toFixed(1)),
    }));
  };

  // 라벨 배경 옵션 UI 수정
  const renderBackgroundOptions = () => {
    return (
      <div className="space-y-4">
        {/* 카테고리 선택 UI 추가 */}
        <div className="mb-4">
          <Label
            htmlFor="category-select"
            className="text-sm font-medium mb-1 block text-gray-300"
          >
            카테고리
          </Label>
          <Select
            value={selectedCategory || "all"}
            onValueChange={handleCategoryChange}
            disabled={isLoadingCategories}
          >
            <SelectTrigger className="w-full bg-gray-800/50 border-gray-700 text-gray-200 focus:border-cyan-500">
              <SelectValue placeholder="모든 카테고리" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
              <SelectItem
                value="all"
                className="focus:bg-cyan-900/30 focus:text-cyan-400"
              >
                모든 카테고리
              </SelectItem>
              {categories.map((category) => (
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
            {labelBackgrounds.map((background) => (
              <div
                key={background.id}
                onClick={() => handleDesignChange("template", background.id)}
                className={`cursor-pointer rounded-md overflow-hidden border-2 transition-all ${labelDesign.template === background.id ? "border-cyan-500 shadow-[0_0_6px_rgba(0,200,255,0.6)]" : "border-gray-700 hover:border-gray-500"}`}
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
      <div className="min-h-screen bg-gray-900 text-white">
        {/* 헤더 영역 - 뒤로가기 버튼과 제목 */}
        <div className="flex items-center justify-between p-3 border-b border-gray-700">
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
        <div className="max-w-4xl mx-auto p-12 pb-16" ref={labelPreviewRef}>
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

          {/* 결제하기 버튼 추가 */}
          <div className="flex justify-center mt-6 mb-4">
            <Button
              onClick={handleCheckout}
              size="lg"
              className="bg-gradient-to-r from-[#722F37] to-[#8B4B4B] hover:from-[#8B4B4B] hover:to-[#722F37] text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              결제하기
            </Button>
          </div>

          {/* 디자인 옵션 탭 */}
          <Tabs defaultValue="template" className="w-full mt-2">
            <TabsList className="grid grid-cols-4 gap-1 w-full mb-3">
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
            </TabsList>

            <TabsContent value="template" className="space-y-3">
              {/* 이미지 업로드 버튼 */}
              <div className="mb-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  accept="image/jpeg, image/png, image/gif, image/webp"
                  onChange={handleImageUpload}
                />
                <Button
                  className="w-full bg-[#722F37] hover:bg-[#722F37]/90 text-white py-2 h-auto text-sm"
                  onClick={handleUploadButtonClick}
                  disabled={isUploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? "업로드 중..." : "배경 이미지 업로드하기"}
                </Button>
                <p className="text-xs text-gray-400 mt-1">
                  JPG, PNG, GIF, WEBP 형식 (최대 5MB)
                </p>
              </div>

              {/* 카테고리 선택 UI - 라운드 텍스트 박스 형태로 표시 (2줄로 변경) */}
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2 text-gray-300">
                  카테고리
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {/* 모든 카테고리 버튼 */}
                  <Button
                    variant="outline"
                    size="sm"
                    className={`rounded-full px-4 text-xs ${
                      selectedCategory === null
                        ? "bg-cyan-900/50 text-cyan-300 border-cyan-600"
                        : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700/50"
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
                    categories.map((category) => (
                      <Button
                        key={category.slug}
                        variant="outline"
                        size="sm"
                        className={`rounded-full px-3 text-xs ${
                          selectedCategory === category.slug
                            ? "bg-cyan-900/50 text-cyan-300 border-cyan-600"
                            : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700/50"
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
                  <div className="flex overflow-x-auto gap-3 pb-2">
                    {labelBackgrounds.map((background) => (
                      <Card
                        key={background.id}
                        className={`cursor-pointer transition-all min-w-[140px] ${
                          labelDesign.template === background.id
                            ? "ring-2 ring-[#722F37]"
                            : "hover:shadow-md"
                        }`}
                        onClick={() =>
                          handleDesignChange("template", background.id)
                        }
                      >
                        <CardContent className="p-3 flex flex-col items-center">
                          <div className="h-20 w-24 overflow-hidden rounded relative">
                            <img
                              src={background.image}
                              alt={background.name}
                              className="w-full h-full object-cover"
                            />
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
                  <h3 className="text-base font-medium mb-2">
                    내 업로드 이미지
                  </h3>
                  <div className="flex overflow-x-auto gap-2 pb-2">
                    {uploadedImages.map((upload) => (
                      <Card
                        key={upload.id}
                        className={`relative cursor-pointer transition-all min-w-[120px] ${
                          labelDesign.template === upload.id
                            ? "ring-2 ring-[#722F37]"
                            : "hover:shadow-md"
                        }`}
                        onClick={() =>
                          handleDesignChange("template", upload.id)
                        }
                      >
                        <CardContent className="p-2 flex flex-col items-center">
                          <div className="h-20 w-24 overflow-hidden rounded">
                            <img
                              src={upload.image}
                              alt={upload.name}
                              className="w-full h-full object-cover"
                            />
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
                <h3 className="text-base font-medium mb-2">
                  아이콘 및 장식 (클릭하면 추가됩니다)
                </h3>
                <div className="flex overflow-x-auto gap-2 pb-2">
                  {" "}
                  {/* 수평 스크롤 */}
                  {labelDecorations.map((option) => (
                    <Card
                      key={option.id}
                      className="cursor-pointer transition-all min-w-[80px] hover:shadow-md bg-gray-800 border-gray-700"
                      onClick={() => handleAddDecoration(option.id)}
                    >
                      <CardContent className="p-3 flex items-center justify-center">
                        <div className="h-16 w-16 flex items-center justify-center">
                          {option.id !== "deco4" ? (
                            <img
                              src={option.image}
                              alt={option.name}
                              className="max-h-full max-w-full object-contain"
                            />
                          ) : (
                            <div className="text-gray-400">없음</div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  아이콘을 클릭하면 추가됩니다. 추가된 아이콘은 드래그하여
                  이동하거나 X 버튼을 눌러 삭제할 수 있습니다.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="text" className="space-y-6">
              {/* 메인 텍스트 입력 */}
              <div>
                <Label
                  htmlFor="main-text"
                  className="block mb-2 text-sm font-medium"
                >
                  메인 텍스트
                </Label>
                <Textarea
                  id="main-text"
                  placeholder="와인 이름 또는 메인 텍스트를 입력하세요."
                  className="w-full bg-gray-800 border-gray-700 text-white"
                  value={labelDesign.text}
                  onChange={(e) => handleDesignChange("text", e.target.value)}
                />
              </div>

              {/* 부가 텍스트 입력 */}
              <div>
                <Label
                  htmlFor="sub-text"
                  className="block mb-2 text-sm font-medium"
                >
                  부가 텍스트
                </Label>
                <Textarea
                  id="sub-text"
                  placeholder="부가 정보나 설명을 입력하세요."
                  className="w-full bg-gray-800 border-gray-700 text-white"
                  value={labelDesign.subtext}
                  onChange={(e) =>
                    handleDesignChange("subtext", e.target.value)
                  }
                />
              </div>

              {/* 폰트 선택 */}
              <div>
                <Label
                  htmlFor="font-select"
                  className="block mb-2 text-sm font-medium"
                >
                  폰트 스타일
                </Label>
                <Select
                  value={labelDesign.font}
                  onValueChange={(value) => handleDesignChange("font", value)}
                >
                  <SelectTrigger
                    id="font-select"
                    className="w-full bg-gray-800 border-gray-700 text-white"
                  >
                    <SelectValue placeholder="폰트를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    {fonts.map((font) => (
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
              </div>

              {/* 메인 텍스트 크기 조절 */}
              <div>
                <div className="flex justify-between mb-2">
                  <Label htmlFor="text-size" className="text-sm font-medium">
                    메인 텍스트 크기
                  </Label>
                  <span className="text-sm text-gray-400">
                    {labelDesign.textSize}rem
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

              {/* 부가 텍스트 크기 조절 */}
              <div>
                <div className="flex justify-between mb-2">
                  <Label htmlFor="subtext-size" className="text-sm font-medium">
                    부가 텍스트 크기
                  </Label>
                  <span className="text-sm text-gray-400">
                    {labelDesign.subtextSize}rem
                  </span>
                </div>
                <Slider
                  id="subtext-size"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={[labelDesign.subtextSize]}
                  onValueChange={handleSubtextSizeChange}
                  className="w-full"
                />
              </div>
            </TabsContent>

            <TabsContent value="style" className="space-y-6">
              {/* 테두리 스타일 선택 */}
              <div>
                <Label
                  htmlFor="border-style"
                  className="block mb-2 text-sm font-medium"
                >
                  테두리 스타일
                </Label>
                <div className="flex overflow-x-auto gap-3 pb-2">
                  <Card
                    className={`cursor-pointer transition-all p-3 flex justify-center items-center min-w-[120px] ${
                      labelDesign.borderStyle === "none"
                        ? "ring-2 ring-[#722F37]"
                        : "bg-gray-800 border-gray-700"
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
                    labelBorders
                      .filter((b) => b.id !== "none")
                      .map((border) => (
                        <Card
                          key={border.id}
                          className={`cursor-pointer transition-all p-3 flex justify-center items-center min-w-[120px] ${
                            labelDesign.borderStyle === border.id
                              ? "ring-2 ring-[#722F37]"
                              : "bg-gray-800 border-gray-700"
                          }`}
                          onClick={() =>
                            handleDesignChange("borderStyle", border.id)
                          }
                        >
                          <div className="h-16 w-16 overflow-hidden flex items-center justify-center">
                            {border.image && (
                              <img
                                src={border.image}
                                alt={border.name || "테두리"}
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
              {labelDesign.borderStyle !== "none" &&
                labelBorders.find((b) => b.id === labelDesign.borderStyle)
                  ?.type === "image" && (
                  <div>
                    <Label
                      htmlFor="border-position"
                      className="block mb-2 text-sm font-medium"
                    >
                      테두리 위치
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant="outline"
                        className={`flex items-center justify-center py-2 px-4 ${
                          labelDesign.borderPosition === "all"
                            ? "bg-cyan-900/50 text-cyan-300 border-cyan-600"
                            : ""
                        }`}
                        onClick={() =>
                          handleDesignChange("borderPosition", "all")
                        }
                      >
                        전체
                      </Button>
                      <Button
                        variant="outline"
                        className={`flex items-center justify-center py-2 px-4 ${
                          labelDesign.borderPosition === "horizontal"
                            ? "bg-cyan-900/50 text-cyan-300 border-cyan-600"
                            : ""
                        }`}
                        onClick={() =>
                          handleDesignChange("borderPosition", "horizontal")
                        }
                      >
                        상하
                      </Button>
                      <Button
                        variant="outline"
                        className={`flex items-center justify-center py-2 px-4 ${
                          labelDesign.borderPosition === "vertical"
                            ? "bg-cyan-900/50 text-cyan-300 border-cyan-600"
                            : ""
                        }`}
                        onClick={() =>
                          handleDesignChange("borderPosition", "vertical")
                        }
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
                <Label
                  htmlFor="text-color"
                  className="block mb-2 text-sm font-medium"
                >
                  텍스트 색상
                </Label>
                <div className="flex items-center space-x-4">
                  <input
                    id="text-color"
                    type="color"
                    value={labelDesign.textColor}
                    onChange={(e) =>
                      handleDesignChange("textColor", e.target.value)
                    }
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <div className="text-gray-300 text-sm">
                    {labelDesign.textColor}
                  </div>
                </div>
              </div>

              {/* 미리 정의된 색상 팔레트 */}
              <div>
                <Label className="block mb-2 text-sm font-medium">
                  빠른 색상 선택
                </Label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    "#ffffff",
                    "#000000",
                    "#ff0000",
                    "#00ff00",
                    "#0000ff",
                    "#ffff00",
                    "#ff00ff",
                    "#00ffff",
                    "#722F37",
                    "#9B8174",
                    "#C0C0C0",
                    "#808080",
                    "#800000",
                    "#808000",
                    "#008000",
                  ].map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full border ${labelDesign.textColor === color ? "border-white ring-2 ring-cyan-500" : "border-gray-700"}`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleDesignChange("textColor", color)}
                      aria-label={`색상 ${color}`}
                    />
                  ))}
                </div>
              </div>

              {/* 배경색 선택 (투명도 포함) */}
              <div>
                <Label
                  htmlFor="background-color"
                  className="block mb-2 text-sm font-medium"
                >
                  배경 색상 (라벨 이미지 위에 적용)
                </Label>
                <div className="grid grid-cols-6 gap-2">
                  <button
                    className={`w-8 h-8 rounded flex items-center justify-center border ${
                      labelDesign.backgroundColor === "transparent"
                        ? "border-white ring-2 ring-cyan-500"
                        : "border-gray-700"
                    }`}
                    style={{
                      background:
                        "repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% / 10px 10px",
                    }}
                    onClick={() =>
                      handleDesignChange("backgroundColor", "transparent")
                    }
                    aria-label="투명"
                  >
                    <span className="sr-only">투명</span>
                  </button>
                  {[
                    "#ffffff80",
                    "#00000080",
                    "#ff000080",
                    "#00ff0080",
                    "#0000ff80",
                    "#ffffff",
                    "#000000",
                    "#ff0000",
                    "#00ff00",
                    "#0000ff",
                  ].map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded border ${labelDesign.backgroundColor === color ? "border-white ring-2 ring-cyan-500" : "border-gray-700"}`}
                      style={{ backgroundColor: color }}
                      onClick={() =>
                        handleDesignChange("backgroundColor", color)
                      }
                      aria-label={`배경색 ${color}`}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DndProvider>
  );
}
