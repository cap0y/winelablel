import { Star, Crown, Heart, Leaf, Diamond, Moon, Sun, Feather } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface IconSelectorProps {
  selectedIcons: string[];
  onIconToggle: (iconId: string) => void;
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

const availableIcons = Object.keys(iconMap);

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
              const IconComponent = iconMap[iconId as keyof typeof iconMap];
              const isSelected = selectedIcons.includes(iconId);
              
              return (
                <div
                  key={iconId}
                  className={`w-12 h-12 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-110 flex items-center justify-center flex-shrink-0 ${
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
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
