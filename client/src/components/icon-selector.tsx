import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { wineIcons } from "@/assets/wine-icons";

interface IconSelectorProps {
  selectedIcons: string[];
  onIconToggle: (iconId: string) => void;
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

const availableIcons = Object.keys(wineIcons);

const iconDescriptions = {
  grapes: "포도송이",
  vine: "포도잎",
  barrel: "와인통",
  chateau: "샤토",
  key: "빈티지 키",
  chalice: "성배",
  oak: "오크잎",
  crown: "왕관",
  anchor: "닻",
  wheat: "밀이삭",
  shield: "방패",
  fleur: "플뢰르",
};

export default function IconSelector({ selectedIcons, onIconToggle }: IconSelectorProps) {
  return (
    <Card className="notion-card rounded-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center text-notion-text-primary">
          <Star className="mr-2 text-yellow-400 w-5 h-5" />
          아이콘 & 문양
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="scroll-container overflow-x-auto">
          <div className="flex space-x-3 pb-2" style={{ width: "max-content" }}>
            {availableIcons.map((iconId) => {
              const IconComponent = wineIcons[iconId as keyof typeof wineIcons];
              const isSelected = selectedIcons.includes(iconId);
              
              return (
                <div
                  key={iconId}
                  className="flex flex-col items-center flex-shrink-0"
                >
                  <div
                    className={`w-12 h-12 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-110 flex items-center justify-center ${
                      isSelected
                        ? "border-yellow-400 bg-yellow-400/10"
                        : "border-notion-border bg-notion-bg hover:border-yellow-400/50"
                    }`}
                    onClick={() => onIconToggle(iconId)}
                  >
                    <IconComponent 
                      className={`w-5 h-5 ${iconColors[iconId as keyof typeof iconColors]}`} 
                    />
                  </div>
                  <p className="text-[10px] text-center mt-1 text-notion-text-secondary">
                    {iconDescriptions[iconId as keyof typeof iconDescriptions]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
