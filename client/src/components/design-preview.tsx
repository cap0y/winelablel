import { Eye, Crown, Star, Heart, Leaf, Diamond, Moon, Sun, Feather } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRef, useCallback } from "react";
import type { DesignState } from "@/hooks/use-design-state";

interface DesignPreviewProps {
  design: DesignState;
  onTextPositionUpdate: (field: string, position: { x: number; y: number }) => void;
}

const iconMap = {
  crown: Crown,
  star: Star,
  heart: Heart,
  leaf: Leaf,
  diamond: Diamond,
  moon: Moon,
  sun: Sun,
  feather: Feather,
};

const iconColors = {
  crown: "text-yellow-400",
  star: "text-yellow-400",
  heart: "text-red-400",
  leaf: "text-green-400",
  diamond: "text-purple-400",
  moon: "text-blue-400",
  sun: "text-orange-400",
  feather: "text-gray-400",
};

const wineBottleImages = {
  classic: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop",
  burgundy: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300&h=400&fit=crop",
  champagne: "https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=300&h=400&fit=crop",
  bordeaux: "https://images.unsplash.com/photo-1506377872008-6645d6238ad6?w=300&h=400&fit=crop",
  rhone: "https://images.unsplash.com/photo-1569275808998-5d4b4dc3cf3b?w=300&h=400&fit=crop",
  sparkling: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop"
};

const labelImages = {
  vintage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=160&h=200&fit=crop",
  modern: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=160&h=200&fit=crop",
  elegant: "https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=160&h=200&fit=crop",
  rustic: "https://images.unsplash.com/photo-1506377872008-6645d6238ad6?w=160&h=200&fit=crop",
  premium: "https://images.unsplash.com/photo-1569275808998-5d4b4dc3cf3b?w=160&h=200&fit=crop",
  classic: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=160&h=200&fit=crop",
  minimal: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=160&h=200&fit=crop",
  ornate: "https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=160&h=200&fit=crop"
};

export default function DesignPreview({ design, onTextPositionUpdate }: DesignPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ 
    element: string | null; 
    offset: { x: number; y: number };
    isDragging: boolean;
  }>({ element: null, offset: { x: 0, y: 0 }, isDragging: false });

  const handleMouseDown = useCallback((e: React.MouseEvent, field: string) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const targetRect = (e.target as HTMLElement).getBoundingClientRect();
    
    dragRef.current = {
      element: field,
      offset: {
        x: e.clientX - targetRect.left,
        y: e.clientY - targetRect.top
      },
      isDragging: true
    };

    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current.isDragging || !dragRef.current.element || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragRef.current.offset.x;
    const y = e.clientY - rect.top - dragRef.current.offset.y;
    
    // Constrain within container bounds
    const constrainedX = Math.max(0, Math.min(x, rect.width - 100));
    const constrainedY = Math.max(0, Math.min(y, rect.height - 30));
    
    onTextPositionUpdate(dragRef.current.element, { x: constrainedX, y: constrainedY });
  }, [onTextPositionUpdate]);

  const handleMouseUp = useCallback(() => {
    dragRef.current = { element: null, offset: { x: 0, y: 0 }, isDragging: false };
  }, []);

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
          className="canvas-container aspect-[3/4] rounded-lg border-2 border-notion-border design-preview relative overflow-hidden"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Wine bottle background */}
          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={wineBottleImages[design.bottleType as keyof typeof wineBottleImages]}
              alt="Wine bottle preview"
              className="h-full object-contain opacity-30"
            />
          </div>
          
          {/* Label overlay area */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-40 bg-white bg-opacity-10 rounded-lg border border-white border-opacity-20 backdrop-blur-sm relative">
              {/* Label background */}
              <img
                src={labelImages[design.labelDesign as keyof typeof labelImages]}
                alt="Label background"
                className="w-full h-full object-cover rounded-lg opacity-80"
              />
              
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
              
              {/* Selected icons */}
              <div className="absolute top-1 right-1 flex flex-wrap gap-1">
                {design.icons.map((iconId, index) => {
                  const IconComponent = iconMap[iconId as keyof typeof iconMap];
                  return (
                    <IconComponent
                      key={`${iconId}-${index}`}
                      className={`w-3 h-3 drop-shadow-lg ${iconColors[iconId as keyof typeof iconColors]}`}
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
