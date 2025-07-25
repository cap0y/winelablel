import { Wine } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { wineBottleComponents } from "@/assets/wine-bottles";

interface WineBottleSelectorProps {
  selectedBottle: string;
  onBottleSelect: (bottleType: string) => void;
}

const wineBottles = [
  {
    id: "classic",
    name: "클래식 보르도",
    description: "전통적인 높은 어깨"
  },
  {
    id: "burgundy", 
    name: "부르고뉴",
    description: "우아한 경사진 어깨"
  },
  {
    id: "champagne",
    name: "샴페인",
    description: "두꺼운 유리, 압력 저항"
  },
  {
    id: "rhone",
    name: "라인",
    description: "길고 슬림한 독일식"
  },
  {
    id: "sparkling",
    name: "스파클링",
    description: "투명한 현대적 디자인"
  },
  {
    id: "premium",
    name: "프리미엄",
    description: "럭셔리 다크 보틀"
  }
];

export default function WineBottleSelector({ selectedBottle, onBottleSelect }: WineBottleSelectorProps) {
  return (
    <Card className="notion-card rounded-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center text-notion-text-primary">
          <Wine className="mr-2 text-purple-400 w-5 h-5" />
          와인병 선택
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {wineBottles.map((bottle) => {
            const BottleComponent = wineBottleComponents[bottle.id as keyof typeof wineBottleComponents];
            return (
              <div
                key={bottle.id}
                className={`aspect-[3/4] rounded-lg p-3 border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                  selectedBottle === bottle.id
                    ? "border-purple-400 bg-purple-400/10"
                    : "border-notion-border bg-notion-bg hover:border-purple-400/50"
                }`}
                onClick={() => onBottleSelect(bottle.id)}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <BottleComponent className="w-full h-full max-w-[60px] max-h-[80px]" />
                </div>
                <div className="text-center mt-2">
                  <p className="text-xs font-medium text-notion-text-primary">
                    {bottle.name}
                  </p>
                  <p className="text-[10px] text-notion-text-secondary opacity-75">
                    {bottle.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
