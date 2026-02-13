import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Info, Check } from "lucide-react";

// 패키지 타입 정의
interface ProductPackage {
  id: string;
  name: string;
  image: string;
  type: string; // 패키지 종류: gift, product, event
  bottleType: string; // 패키지 타입: standard, premium
  dimensions: string;
  capacity: string;
  price: number;
}

// 패키지 데이터
const productPackages: ProductPackage[] = [
  {
    id: "bordeaux-red",
    name: "스탠다드 기프트 박스",
    image: "/images/package-1.png",
    type: "red",
    bottleType: "bordeaux",
    dimensions: "가로 30cm x 세로 20cm x 높이 10cm",
    capacity: "중형",
    price: 5000
  },
  {
    id: "bordeaux-white",
    name: "스탠다드 제품 박스",
    image: "/images/package-2.png",
    type: "white",
    bottleType: "bordeaux",
    dimensions: "가로 30cm x 세로 20cm x 높이 10cm",
    capacity: "중형",
    price: 5200
  },
  {
    id: "bordeaux-rose",
    name: "스탠다드 이벤트 박스",
    image: "/images/package-3.png",
    type: "rose",
    bottleType: "bordeaux",
    dimensions: "가로 30cm x 세로 20cm x 높이 10cm",
    capacity: "중형",
    price: 5500
  },
  {
    id: "burgundy-red",
    name: "프리미엄 기프트 박스",
    image: "/images/package-5.png",
    type: "red",
    bottleType: "burgundy",
    dimensions: "가로 35cm x 세로 25cm x 높이 12cm",
    capacity: "대형",
    price: 5800
  },
  {
    id: "burgundy-white",
    name: "프리미엄 제품 박스",
    image: "/images/package-6.png",
    type: "white",
    bottleType: "burgundy",
    dimensions: "가로 35cm x 세로 25cm x 높이 12cm",
    capacity: "대형",
    price: 5300
  },
  {
    id: "burgundy-rose",
    name: "프리미엄 이벤트 박스",
    image: "/images/package-7.png",
    type: "rose",
    bottleType: "burgundy",
    dimensions: "가로 35cm x 세로 25cm x 높이 12cm",
    capacity: "대형",
    price: 6000
  }
];

// 패키지 카드 컴포넌트
function PackageCard({ bottle, isSelected, onClick }: { bottle: ProductPackage; isSelected: boolean; onClick: () => void }) {
  return (
    <Card 
      className={`cursor-pointer transition-all glass-card hover:shadow-lg ${
        isSelected 
          ? 'ring-2 ring-primary shadow-lg' 
          : 'hover:border-gray-300'
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4 relative">
        {isSelected && (
          <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1 shadow-lg">
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
          <h3 className="font-medium text-center mb-1 text-gray-900">{bottle.name}</h3>
          <p className="text-sm text-gray-600 text-center mb-2">{bottle.capacity}</p>
          <p className="text-[#B05C00] font-bold text-center">{bottle.price.toLocaleString()}원</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PackageSelector() {
  const [selectedBottleId, setSelectedBottleId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [location, setLocation] = useLocation();

  // 패키지 타입별 필터링
  const getFilteredBottles = () => {
    if (activeTab === "all") return productPackages;
    if (activeTab === "bordeaux" || activeTab === "burgundy") {
      return productPackages.filter(bottle => bottle.bottleType === activeTab);
    }
    return productPackages.filter(bottle => bottle.type === activeTab);
  };

  const filteredBottles = getFilteredBottles();

  // 다음 단계로 진행
  const handleContinue = () => {
    if (selectedBottleId) {
      setLocation(`/package-designer/${selectedBottleId}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 min-h-screen bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">패키지 선택</h1>
      
      <div className="mb-8">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 mb-6 bg-white/70 border border-gray-200 backdrop-blur-sm">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-white text-gray-700">전체</TabsTrigger>
            <TabsTrigger value="bordeaux" className="data-[state=active]:bg-primary data-[state=active]:text-white text-gray-700">스탠다드</TabsTrigger>
            <TabsTrigger value="burgundy" className="data-[state=active]:bg-primary data-[state=active]:text-white text-gray-700">프리미엄</TabsTrigger>
            <TabsTrigger value="red" className="data-[state=active]:bg-primary data-[state=active]:text-white text-gray-700">기프트</TabsTrigger>
            <TabsTrigger value="white" className="data-[state=active]:bg-primary data-[state=active]:text-white text-gray-700">제품</TabsTrigger>
            <TabsTrigger value="rose" className="data-[state=active]:bg-primary data-[state=active]:text-white text-gray-700">이벤트</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredBottles.map((bottle) => (
                <PackageCard 
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
        <div className="bg-white/70 text-gray-900 p-4 rounded-lg mb-6 border border-gray-200 backdrop-blur-sm">
          <h3 className="font-medium mb-2 flex items-center text-gray-900">
            <Info className="w-4 h-4 mr-2 text-[#2F3437]" />
            선택한 패키지 정보
          </h3>
          
          {(() => {
            const selectedBottle = productPackages.find(b => b.id === selectedBottleId);
            if (!selectedBottle) return null;
            
            return (
              <div className="flex items-center">
                <img 
                  src={selectedBottle.image} 
                  alt={selectedBottle.name} 
                  className="w-20 h-20 object-contain mr-4 drop-shadow-sm"
                />
                <div>
                  <p className="font-medium text-gray-900">{selectedBottle.name}</p>
                  <p className="text-sm text-gray-600">타입: <span className="text-[#0F7B6C]">{selectedBottle.bottleType === "bordeaux" ? "스탠다드" : "프리미엄"}</span></p>
                  <p className="text-sm text-gray-600">{selectedBottle.dimensions}</p>
                  <p className="text-sm text-gray-600">{selectedBottle.capacity}</p>
                  <p className="text-[#B05C00] font-bold">{selectedBottle.price.toLocaleString()}원</p>
                </div>
              </div>
            );
          })()}
        </div>
      )}
      
      <div className="flex justify-center">
        <Button
          className="bg-primary hover:bg-primary/90 text-white px-8 py-3 border-none shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!selectedBottleId}
          onClick={handleContinue}
        >
          <Package className="mr-2 h-4 w-4" />
          패키지 디자인하기
        </Button>
      </div>
    </div>
  );
} 
