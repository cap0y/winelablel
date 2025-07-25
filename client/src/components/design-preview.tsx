import { Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRef, useCallback, useEffect } from "react";
import type { DesignState } from "@/hooks/use-design-state";
import { wineBottleComponents } from "@/assets/wine-bottles";
import { wineLabelDesigns } from "@/assets/wine-label-designs";
import { wineIcons } from "@/assets/wine-icons";

interface DesignPreviewProps {
  design: DesignState;
  onTextPositionUpdate: (field: string, position: { x: number; y: number }) => void;
}

const iconColors = {
  grapes: "text-purple-500",
  vine: "text-green-500", 
  barrel: "text-amber-600",
  chateau: "text-gray-600",
  key: "text-yellow-500",
  chalice: "text-yellow-400",
  oak: "text-green-600",
  crown: "text-yellow-400",
  anchor: "text-blue-500",
  wheat: "text-amber-500", 
  shield: "text-gray-500",
  fleur: "text-purple-400",
};

export default function DesignPreview({ design, onTextPositionUpdate }: DesignPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ 
    element: string | null; 
    offset: { x: number; y: number };
    isDragging: boolean;
  }>({ element: null, offset: { x: 0, y: 0 }, isDragging: false });

  const handleMouseDown = useCallback((e: React.MouseEvent, field: string) => {
    e.preventDefault();
    if (!containerRef.current) return;
    
    const target = e.currentTarget as HTMLElement;
    const containerRect = containerRef.current.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    
    dragRef.current = {
      element: field,
      offset: {
        x: e.clientX - targetRect.left,
        y: e.clientY - targetRect.top
      },
      isDragging: true
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragRef.current.isDragging || !dragRef.current.element || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragRef.current.offset.x;
    const y = e.clientY - rect.top - dragRef.current.offset.y;
    
    // Constrain within label area bounds (roughly 128px wide, 160px tall)
    const constrainedX = Math.max(0, Math.min(x, 110));
    const constrainedY = Math.max(0, Math.min(y, 130));
    
    onTextPositionUpdate(dragRef.current.element, { x: constrainedX, y: constrainedY });
  }, [onTextPositionUpdate]);

  const handleMouseUp = useCallback(() => {
    dragRef.current = { element: null, offset: { x: 0, y: 0 }, isDragging: false };
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  return (
    <Card className="notion-card rounded-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center text-notion-text-primary">
          <Eye className="mr-2 text-blue-400 w-5 h-5" />
          디자인 미리보기
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          ref={containerRef}
          className="canvas-container aspect-[3/4] rounded-lg border-2 border-notion-border design-preview relative overflow-hidden bg-gradient-to-b from-notion-bg to-notion-bg-secondary"
        >
          {/* Wine bottle background with proper sizing */}
          <div className="absolute inset-0 flex items-center justify-center">
            {(() => {
              const BottleComponent = wineBottleComponents[design.bottleType as keyof typeof wineBottleComponents];
              return <BottleComponent className="h-full max-h-[280px] w-auto opacity-90" />;
            })()}
          </div>
          
          {/* Label overlay area - positioned to match real wine bottle label area */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-40 relative" style={{ marginTop: '10px' }}>
              {/* Label background with authentic design */}
              {(() => {
                const LabelComponent = wineLabelDesigns[design.labelDesign as keyof typeof wineLabelDesigns];
                return <LabelComponent className="w-full h-full rounded-md" />;
              })()}
              
              {/* Draggable text elements */}
              <div className="absolute inset-0 p-2">
                {/* Wine name */}
                <div
                  className="draggable-text absolute cursor-move"
                  style={{
                    transform: `translate(${design.positions.name.x}px, ${design.positions.name.y}px)`,
                    fontFamily: design.fonts.name === 'Playfair' ? 'Playfair Display, serif' : 
                               design.fonts.name === 'Roboto' ? 'Roboto, sans-serif' : 'Inter, sans-serif'
                  }}
                  onMouseDown={(e) => handleMouseDown(e, 'name')}
                >
                  <span className="text-xs font-bold text-white drop-shadow-lg select-none">
                    {design.textElements.name}
                  </span>
                </div>
                
                {/* Vintage */}
                <div
                  className="draggable-text absolute cursor-move"
                  style={{
                    transform: `translate(${design.positions.vintage.x}px, ${design.positions.vintage.y}px)`,
                    fontFamily: design.fonts.vintage === 'Playfair' ? 'Playfair Display, serif' : 
                               design.fonts.vintage === 'Roboto' ? 'Roboto, sans-serif' : 'Inter, sans-serif'
                  }}
                  onMouseDown={(e) => handleMouseDown(e, 'vintage')}
                >
                  <span className="text-xs text-white drop-shadow-lg select-none">
                    {design.textElements.vintage}
                  </span>
                </div>
                
                {/* Wine type */}
                <div
                  className="draggable-text absolute cursor-move"
                  style={{
                    transform: `translate(${design.positions.type.x}px, ${design.positions.type.y}px)`,
                    fontFamily: design.fonts.type === 'Playfair' ? 'Playfair Display, serif' : 
                               design.fonts.type === 'Roboto' ? 'Roboto, sans-serif' : 'Inter, sans-serif'
                  }}
                  onMouseDown={(e) => handleMouseDown(e, 'type')}
                >
                  <span className="text-xs text-white drop-shadow-lg select-none">
                    {design.textElements.type}
                  </span>
                </div>
              </div>
              
              {/* Selected authentic wine icons */}
              <div className="absolute top-2 right-2 flex flex-wrap gap-1">
                {design.icons.map((iconId, index) => {
                  const IconComponent = wineIcons[iconId as keyof typeof wineIcons];
                  return (
                    <IconComponent
                      key={`${iconId}-${index}`}
                      className={`w-4 h-4 drop-shadow-lg ${iconColors[iconId as keyof typeof iconColors]}`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Canvas instructions */}
          <div className="absolute bottom-2 left-2 right-2 text-center">
            <p className="text-xs text-notion-text-muted">드래그하여 텍스트 위치 조정</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
