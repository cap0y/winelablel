import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wine, Info, Check } from "lucide-react";

// 와인병 타입 정의
interface WineBottle {
  id: string;
  name: string;
  image: string;
  type: string;
  dimensions: string;
  capacity: string;
  price: number;
}

// 샘플 와인병 데이터
const wineBottles: WineBottle[] = [
  {
    id: "bordeaux-red-black",
    name: "보르도 레드 (블랙)",
    image: "/images/wine-bottle-1.png",
    type: "red",
    dimensions: "높이 30cm x 지름 8cm",
    capacity: "750ml",
    price: 5000
  },
  {
    id: "white-gold",
    name: "화이트 와인 (골드)",
    image: "/images/wine-bottle-2.png",
    type: "white",
    dimensions: "높이 29cm x 지름 7.5cm",
    capacity: "750ml",
    price: 5200
  },
  {
    id: "rose-copper",
    name: "로제 와인 (코퍼)",
    image: "/images/wine-bottle-3.png",
    type: "rose",
    dimensions: "높이 29cm x 지름 7.5cm",
    capacity: "750ml",
    price: 5500
  },
  {
    id: "white-black",
    name: "화이트 와인 (블랙)",
    image: "/images/wine-bottle-4.png",
    type: "white",
    dimensions: "높이 31cm x 지름 7.5cm",
    capacity: "750ml",
    price: 5300
  },
  {
    id: "red-gold",
    name: "레드 와인 (골드)",
    image: "/images/wine-bottle-5.png",
    type: "red",
    dimensions: "높이 30cm x 지름 8cm",
    capacity: "750ml",
    price: 5800
  },
  {
    id: "red-black-slim",
    name: "레드 와인 슬림 (블랙)",
    image: "/images/wine-bottle-6.png",
    type: "red",
    dimensions: "높이 32cm x 지름 7cm",
    capacity: "750ml",
    price: 6000
  },
  {
    id: "red-gold-premium",
    name: "레드 와인 프리미엄 (골드)",
    image: "/images/wine-bottle-7.png",
    type: "red",
    dimensions: "높이 30cm x 지름 8.5cm",
    capacity: "750ml",
    price: 6500
  }
];

// 와인병 카드 컴포넌트
function WineBottleCard({ bottle, isSelected, onClick }: { bottle: WineBottle; isSelected: boolean; onClick: () => void }) {
  return (
    <Card 
      className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-[#722F37] ring-opacity-100' : 'hover:shadow-md'}`}
      onClick={onClick}
    >
      <CardContent className="p-4 relative">
        {isSelected && (
          <div className="absolute top-2 right-2 bg-[#722F37] text-white rounded-full p-1">
            <Check className="w-4 h-4" />
          </div>
        )}
        <div className="flex flex-col items-center">
          <div className="h-40 flex items-center justify-center mb-3">
            <img 
              src={bottle.image} 
              alt={bottle.name} 
              className="max-h-full max-w-full object-contain" 
            />
          </div>
          <h3 className="font-medium text-center mb-1">{bottle.name}</h3>
          <p className="text-sm text-gray-500 text-center mb-2">{bottle.capacity}</p>
          <p className="text-[#722F37] font-bold text-center">{bottle.price.toLocaleString()}원</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function WineBottleSelector() {
  const [selectedBottleId, setSelectedBottleId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [location, setLocation] = useLocation();

  // 와인병 타입별 필터링
  const filteredBottles = activeTab === "all" 
    ? wineBottles 
    : wineBottles.filter(bottle => bottle.type === activeTab);

  // 다음 단계로 진행
  const handleContinue = () => {
    if (selectedBottleId) {
      setLocation(`/label-designer/${selectedBottleId}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 text-center">와인병 선택</h1>
      
      <div className="mb-8">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="red">레드</TabsTrigger>
            <TabsTrigger value="white">화이트</TabsTrigger>
            <TabsTrigger value="rose">로제</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredBottles.map((bottle) => (
                <WineBottleCard 
                  key={bottle.id}
                  bottle={bottle}
                  isSelected={selectedBottleId === bottle.id}
                  onClick={() => setSelectedBottleId(bottle.id)}
                />
              ))}
            </div>
          </TabsContent>
          
          {['red', 'white', 'rose'].map(type => (
            <TabsContent key={type} value={type} className="mt-0">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filteredBottles.map((bottle) => (
                  <WineBottleCard 
                    key={bottle.id}
                    bottle={bottle}
                    isSelected={selectedBottleId === bottle.id}
                    onClick={() => setSelectedBottleId(bottle.id)}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
      
      {selectedBottleId && (
        <div className="bg-gray-800 text-white p-4 rounded-lg mb-6 border border-gray-700">
          <h3 className="font-medium mb-2 flex items-center text-white">
            <Info className="w-4 h-4 mr-2 text-[#d4af37]" />
            선택한 와인병 정보
          </h3>
          
          {(() => {
            const selectedBottle = wineBottles.find(b => b.id === selectedBottleId);
            if (!selectedBottle) return null;
            
            return (
              <div className="flex items-center">
                <img 
                  src={selectedBottle.image} 
                  alt={selectedBottle.name} 
                  className="w-20 h-20 object-contain mr-4"
                />
                <div>
                  <p className="font-medium text-white">{selectedBottle.name}</p>
                  <p className="text-sm text-gray-300">{selectedBottle.dimensions}</p>
                  <p className="text-sm text-gray-300">{selectedBottle.capacity}</p>
                  <p className="text-[#d4af37] font-bold">{selectedBottle.price.toLocaleString()}원</p>
                </div>
              </div>
            );
          })()}
        </div>
      )}
      
      <div className="flex justify-center">
        <Button
          className="bg-[#722F37] hover:bg-[#722F37]/90 text-white px-8 py-3"
          disabled={!selectedBottleId}
          onClick={handleContinue}
        >
          <Wine className="mr-2 h-4 w-4" />
          라벨 디자인하기
        </Button>
      </div>
    </div>
  );
} 