import { Shapes, Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { decorativeElements } from "@/assets/decorative-elements";

interface DecorativeSelectorProps {
  selectedElements: string[];
  onElementToggle: (elementId: string) => void;
}

const decorativeOptions = [
  {
    category: "라인 & 구분선",
    items: [
      { id: "elegant-line", name: "우아한 라인", component: decorativeElements.lines.elegant },
      { id: "vintage-divider", name: "빈티지 구분선", component: decorativeElements.lines.vintage },
      { id: "modern-line", name: "모던 라인", component: decorativeElements.lines.modern },
      { id: "ornate-frame", name: "화려한 프레임", component: decorativeElements.lines.ornate },
    ]
  },
  {
    category: "테두리",
    items: [
      { id: "rope-border", name: "로프 테두리", component: decorativeElements.borders.rope },
      { id: "gold-border", name: "골드 테두리", component: decorativeElements.borders.gold },
    ]
  },
  {
    category: "모서리 장식",
    items: [
      { id: "corner-flourish", name: "코너 장식", component: decorativeElements.corners.flourish },
      { id: "vintage-corner", name: "빈티지 코너", component: decorativeElements.corners.vintage },
    ]
  },
  {
    category: "와인 테마",
    items: [
      { id: "grape-vine", name: "포도덩굴", component: decorativeElements.themed.grapeVine },
      { id: "wine-barrel", name: "와인 배럴", component: decorativeElements.themed.barrel },
      { id: "chateau", name: "샤토", component: decorativeElements.themed.chateau },
    ]
  }
];

export default function DecorativeSelector({ selectedElements, onElementToggle }: DecorativeSelectorProps) {
  return (
    <Card className="notion-card rounded-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center text-notion-text-primary">
          <Shapes className="mr-2 text-pink-400 w-5 h-5" />
          장식 요소 & 스티커
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {decorativeOptions.map((category) => (
          <div key={category.category}>
            <h3 className="text-sm font-medium text-notion-text-primary mb-3">
              {category.category}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {category.items.map((item) => {
                const isSelected = selectedElements.includes(item.id);
                const ElementComponent = item.component;
                
                return (
                  <div
                    key={item.id}
                    className={`relative rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                      isSelected
                        ? "border-pink-400 ring-2 ring-pink-400/20 bg-pink-50/5"
                        : "border-notion-border hover:border-pink-400/50"
                    }`}
                    onClick={() => onElementToggle(item.id)}
                  >
                    <div className="p-3 min-h-[60px] flex flex-col items-center justify-center bg-notion-bg-secondary/30 rounded-md">
                      <ElementComponent className="max-w-full max-h-8 mb-1" />
                      <span className="text-xs text-notion-text-muted text-center">
                        {item.name}
                      </span>
                    </div>
                    
                    {/* Selection indicator */}
                    <div className="absolute top-1 right-1">
                      {isSelected ? (
                        <div className="w-5 h-5 bg-pink-400 rounded-full flex items-center justify-center">
                          <X className="w-3 h-3 text-white" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 border-2 border-notion-border rounded-full bg-notion-bg hover:border-pink-400 transition-colors">
                          <Plus className="w-3 h-3 text-notion-text-muted m-0.5" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        
        {/* Selected elements info */}
        {selectedElements.length > 0 && (
          <div className="mt-4 p-3 bg-notion-bg-secondary/30 rounded-lg">
            <p className="text-xs text-notion-text-muted">
              선택된 장식 요소: {selectedElements.length}개
            </p>
            <p className="text-xs text-notion-text-muted mt-1">
              라벨에서 드래그하여 위치를 조정하세요
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}