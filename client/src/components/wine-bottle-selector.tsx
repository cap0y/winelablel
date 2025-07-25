import { Wine } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WineBottleSelectorProps {
  selectedBottle: string;
  onBottleSelect: (bottleType: string) => void;
}

const wineBottles = [
  {
    id: "classic",
    name: "클래식",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop"
  },
  {
    id: "burgundy",
    name: "부르고뉴",
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300&h=400&fit=crop"
  },
  {
    id: "champagne",
    name: "샴페인",
    image: "https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=300&h=400&fit=crop"
  },
  {
    id: "bordeaux",
    name: "보르도",
    image: "https://images.unsplash.com/photo-1506377872008-6645d6238ad6?w=300&h=400&fit=crop"
  },
  {
    id: "rhone",
    name: "론",
    image: "https://images.unsplash.com/photo-1569275808998-5d4b4dc3cf3b?w=300&h=400&fit=crop"
  },
  {
    id: "sparkling",
    name: "스파클링",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=400&fit=crop"
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
          {wineBottles.map((bottle) => (
            <div
              key={bottle.id}
              className={`aspect-square rounded-lg p-3 border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
                selectedBottle === bottle.id
                  ? "border-purple-400 bg-purple-400/10"
                  : "border-notion-border bg-notion-bg hover:border-purple-400/50"
              }`}
              onClick={() => onBottleSelect(bottle.id)}
            >
              <img
                src={bottle.image}
                alt={bottle.name}
                className="w-full h-full object-contain rounded-md"
              />
              <p className="text-xs text-center mt-1 text-notion-text-secondary">
                {bottle.name}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
