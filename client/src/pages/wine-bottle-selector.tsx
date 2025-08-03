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
  type: string; // 와인 종류: red, white, rose
  bottleType: string; // 병 타입: bordeaux, burgundy
  dimensions: string;
  capacity: string;
  price: number;
}

// 샘플 와인병 데이터 (쇼비뇽블랑와 샤도네이 2가지 타입으로 수정)
const wineBottles: WineBottle[] = [
  {
    id: "bordeaux-red",
    name: "까베르네쇼비뇽 레드",
    image: "/images/wine-bottle-1.png",
    type: "red",
    bottleType: "bordeaux",
    dimensions: "높이 30cm x 지름 7.5cm",
    capacity: "750ml",
    price: 5000
  },
  {
    id: "bordeaux-white",
    name: "쇼비뇽블랑 화이트",
    image: "/images/wine-bottle-2.png",
    type: "white",
    bottleType: "bordeaux",
    dimensions: "높이 30cm x 지름 7.5cm",
    capacity: "750ml",
    price: 5200
  },
  {
    id: "bordeaux-rose",
    name: "쇼비뇽블랑 로제",
    image: "/images/wine-bottle-3.png",
    type: "rose",
    bottleType: "bordeaux",
    dimensions: "높이 30cm x 지름 7.5cm",
    capacity: "750ml",
    price: 5500
  },
  {
    id: "burgundy-red",
    name: "샤도네이 레드",
    image: "/images/wine-bottle-5.png",
    type: "red",
    bottleType: "burgundy",
    dimensions: "높이 29cm x 지름 8cm",
    capacity: "750ml",
    price: 5800
  },
  {
    id: "burgundy-white",
    name: "샤도네이 화이트",
    image: "/images/wine-bottle-6.png",
    type: "white",
    bottleType: "burgundy",
    dimensions: "높이 29cm x 지름 8cm",
    capacity: "750ml",
    price: 5300
  },
  {
    id: "burgundy-rose",
    name: "샤도네이 로제",
    image: "/images/wine-bottle-7.png",
    type: "rose",
    bottleType: "burgundy",
    dimensions: "높이 29cm x 지름 8cm",
    capacity: "750ml",
    price: 6000
  }
];

// 와인병 카드 컴포넌트
function WineBottleCard({ bottle, isSelected, onClick }: { bottle: WineBottle; isSelected: boolean; onClick: () => void }) {
  return (
    <Card 
      className={`cursor-pointer transition-all bg-gray-900 border-gray-700 hover:shadow-lg ${
        isSelected 
          ? 'ring-2 ring-cyan-500 ring-opacity-100 shadow-lg shadow-cyan-500/25' 
          : 'hover:shadow-cyan-500/20 hover:border-cyan-500/50'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4 relative">
        {isSelected && (
          <div className="absolute top-2 right-2 bg-cyan-500 text-white rounded-full p-1 shadow-lg shadow-cyan-500/50">
            <Check className="w-4 h-4" />
          </div>
        )}
        <div className="flex flex-col items-center">
          <div className="h-40 flex items-center justify-center mb-3">
            <img 
              src={bottle.image} 
              alt={bottle.name} 
              className="max-h-full max-w-full object-contain drop-shadow-sm" 
            />
          </div>
          <h3 className="font-medium text-center mb-1 text-cyan-300">{bottle.name}</h3>
          <p className="text-sm text-gray-400 text-center mb-2">{bottle.capacity}</p>
          <p className="text-yellow-400 font-bold text-center">{bottle.price.toLocaleString()}원</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function WineBottleSelector() {
  const [selectedBottleId, setSelectedBottleId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [location, setLocation] = useLocation();

  // 와인병 타입별 필터링 (와인 종류 또는 병 타입에 따라 필터링)
  const getFilteredBottles = () => {
    if (activeTab === "all") return wineBottles;
    if (activeTab === "bordeaux" || activeTab === "burgundy") {
      return wineBottles.filter(bottle => bottle.bottleType === activeTab);
    }
    return wineBottles.filter(bottle => bottle.type === activeTab);
  };

  const filteredBottles = getFilteredBottles();

  // 다음 단계로 진행
  const handleContinue = () => {
    if (selectedBottleId) {
      setLocation(`/label-designer/${selectedBottleId}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 min-h-screen bg-gray-950">
      <h1 className="text-2xl font-bold mb-6 text-center text-cyan-400">와인병 선택</h1>
      
      <div className="mb-8">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 mb-6 bg-gray-800 border-gray-700">
            <TabsTrigger value="all" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-gray-300">전체</TabsTrigger>
            <TabsTrigger value="bordeaux" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-gray-300">쇼비뇽블랑</TabsTrigger>
            <TabsTrigger value="burgundy" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-gray-300">샤도네이</TabsTrigger>
            <TabsTrigger value="red" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-gray-300">레드</TabsTrigger>
            <TabsTrigger value="white" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-gray-300">화이트</TabsTrigger>
            <TabsTrigger value="rose" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white text-gray-300">로제</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-0">
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
        </Tabs>
      </div>
      
      {selectedBottleId && (
        <div className="bg-gray-900 text-white p-4 rounded-lg mb-6 border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
          <h3 className="font-medium mb-2 flex items-center text-cyan-400">
            <Info className="w-4 h-4 mr-2 text-cyan-500" />
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
                  className="w-20 h-20 object-contain mr-4 drop-shadow-sm"
                />
                <div>
                  <p className="font-medium text-cyan-300">{selectedBottle.name}</p>
                  <p className="text-sm text-gray-400">병 타입: <span className="text-cyan-400">{selectedBottle.bottleType === "bordeaux" ? "쇼비뇽블랑" : "샤도네이"}</span></p>
                  <p className="text-sm text-gray-400">{selectedBottle.dimensions}</p>
                  <p className="text-sm text-gray-400">{selectedBottle.capacity}</p>
                  <p className="text-yellow-400 font-bold">{selectedBottle.price.toLocaleString()}원</p>
                </div>
              </div>
            );
          })()}
        </div>
      )}
      
      <div className="flex justify-center">
        <Button
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3 border-none shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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