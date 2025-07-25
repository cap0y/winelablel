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
  onIconPositionUpdate: (iconKey: string, position: { x: number; y: number }) => void;
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

export default function DesignPreview({ design, onTextPositionUpdate, onIconPositionUpdate }: DesignPreviewProps) {
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
    
    // Allow free movement within the larger label area (192px wide, 240px tall)
    const constrainedX = Math.max(-20, Math.min(x, 170));
    const constrainedY = Math.max(-20, Math.min(y, 220));
    
    // Handle both text and icon positioning
    if (dragRef.current.element.startsWith('icon-')) {
      onIconPositionUpdate(dragRef.current.element, { x: constrainedX, y: constrainedY });
    } else {
      onTextPositionUpdate(dragRef.current.element, { x: constrainedX, y: constrainedY });
    }
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
          className="canvas-container aspect-[2/3] rounded-lg border-2 border-notion-border design-preview relative overflow-hidden bg-gradient-to-b from-notion-bg to-notion-bg-secondary"
          style={{ minHeight: '480px' }}
        >
          {/* Wine bottle background - much larger */}
          <div className="absolute inset-0 flex items-center justify-center">
            {(() => {
              const BottleComponent = wineBottleComponents[design.bottleType as keyof typeof wineBottleComponents];
              return <BottleComponent className="h-full max-h-[460px] w-auto opacity-90" />;
            })()}
          </div>
          
          {/* Label overlay area - larger and positioned to match wine bottle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-60 relative" style={{ marginTop: '20px' }}>
              {/* Label background with authentic design - larger */}
              {(() => {
                const LabelComponent = wineLabelDesigns[design.labelDesign as keyof typeof wineLabelDesigns];
                return <LabelComponent className="w-full h-full rounded-md" />;
              })()}
              
              {/* Draggable text elements with free positioning */}
              <div className="absolute inset-0 p-3">
                {/* Wine name */}
                <div
                  className="draggable-text absolute cursor-move hover:z-50 hover:scale-105 transition-transform"
                  style={{
                    transform: `translate(${design.positions.name.x}px, ${design.positions.name.y}px)`,
                    fontFamily: design.fonts.name === 'Playfair' ? 'Playfair Display, serif' : 
                               design.fonts.name === 'Roboto' ? 'Roboto, sans-serif' :
                               design.fonts.name === 'Crimson' ? 'Crimson Text, serif' :
                               design.fonts.name === 'Montserrat' ? 'Montserrat, sans-serif' :
                               design.fonts.name === 'Merriweather' ? 'Merriweather, serif' :
                               design.fonts.name === 'Lato' ? 'Lato, sans-serif' :
                               design.fonts.name === 'Open Sans' ? 'Open Sans, sans-serif' :
                               design.fonts.name === 'Source Sans Pro' ? 'Source Sans Pro, sans-serif' :
                               design.fonts.name === 'Nunito' ? 'Nunito, sans-serif' :
                               design.fonts.name === 'Poppins' ? 'Poppins, sans-serif' :
                               design.fonts.name === 'Raleway' ? 'Raleway, sans-serif' :
                               'Inter, sans-serif'
                  }}
                  onMouseDown={(e) => handleMouseDown(e, 'name')}
                >
                  <span className="text-sm font-bold text-white drop-shadow-lg select-none cursor-move">
                    {design.textElements.name}
                  </span>
                </div>
                
                {/* Vintage */}
                <div
                  className="draggable-text absolute cursor-move hover:z-50 hover:scale-105 transition-transform"
                  style={{
                    transform: `translate(${design.positions.vintage.x}px, ${design.positions.vintage.y}px)`,
                    fontFamily: design.fonts.vintage === 'Playfair' ? 'Playfair Display, serif' : 
                               design.fonts.vintage === 'Roboto' ? 'Roboto, sans-serif' :
                               design.fonts.vintage === 'Crimson' ? 'Crimson Text, serif' :
                               design.fonts.vintage === 'Montserrat' ? 'Montserrat, sans-serif' :
                               design.fonts.vintage === 'Merriweather' ? 'Merriweather, serif' :
                               design.fonts.vintage === 'Lato' ? 'Lato, sans-serif' :
                               design.fonts.vintage === 'Open Sans' ? 'Open Sans, sans-serif' :
                               design.fonts.vintage === 'Source Sans Pro' ? 'Source Sans Pro, sans-serif' :
                               design.fonts.vintage === 'Nunito' ? 'Nunito, sans-serif' :
                               design.fonts.vintage === 'Poppins' ? 'Poppins, sans-serif' :
                               design.fonts.vintage === 'Raleway' ? 'Raleway, sans-serif' :
                               'Inter, sans-serif'
                  }}
                  onMouseDown={(e) => handleMouseDown(e, 'vintage')}
                >
                  <span className="text-sm text-white drop-shadow-lg select-none cursor-move">
                    {design.textElements.vintage}
                  </span>
                </div>
                
                {/* Wine type */}
                <div
                  className="draggable-text absolute cursor-move hover:z-50 hover:scale-105 transition-transform"
                  style={{
                    transform: `translate(${design.positions.type.x}px, ${design.positions.type.y}px)`,
                    fontFamily: design.fonts.type === 'Playfair' ? 'Playfair Display, serif' : 
                               design.fonts.type === 'Roboto' ? 'Roboto, sans-serif' :
                               design.fonts.type === 'Crimson' ? 'Crimson Text, serif' :
                               design.fonts.type === 'Montserrat' ? 'Montserrat, sans-serif' :
                               design.fonts.type === 'Merriweather' ? 'Merriweather, serif' :
                               design.fonts.type === 'Lato' ? 'Lato, sans-serif' :
                               design.fonts.type === 'Open Sans' ? 'Open Sans, sans-serif' :
                               design.fonts.type === 'Source Sans Pro' ? 'Source Sans Pro, sans-serif' :
                               design.fonts.type === 'Nunito' ? 'Nunito, sans-serif' :
                               design.fonts.type === 'Poppins' ? 'Poppins, sans-serif' :
                               design.fonts.type === 'Raleway' ? 'Raleway, sans-serif' :
                               'Inter, sans-serif'
                  }}
                  onMouseDown={(e) => handleMouseDown(e, 'type')}
                >
                  <span className="text-sm text-white drop-shadow-lg select-none cursor-move">
                    {design.textElements.type}
                  </span>
                </div>
              </div>
              
              {/* Selected authentic wine icons - individually positioned and draggable */}
              {design.icons.map((iconId, index) => {
                const IconComponent = wineIcons[iconId as keyof typeof wineIcons];
                const iconKey = `icon-${index}`;
                const position = design.iconPositions[iconKey] || { x: 120 + (index * 30), y: 20 + (index * 10) };
                
                return (
                  <div
                    key={iconKey}
                    className="absolute cursor-move hover:scale-110 hover:z-50 transition-transform"
                    style={{
                      transform: `translate(${position.x}px, ${position.y}px)`
                    }}
                    onMouseDown={(e) => handleMouseDown(e, iconKey)}
                  >
                    <IconComponent
                      className={`w-6 h-6 drop-shadow-lg ${iconColors[iconId as keyof typeof iconColors]} select-none`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Canvas instructions */}
          <div className="absolute bottom-2 left-2 right-2 text-center">
            <p className="text-xs text-notion-text-muted">드래그하여 텍스트와 아이콘 위치 자유 조정</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
