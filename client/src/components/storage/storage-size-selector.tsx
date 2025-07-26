import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Storage3DViewer from "./storage-3d-viewer";
import type { StorageUnit } from "@shared/schema";

interface StorageSizeSelectorProps {
  units: StorageUnit[];
  selectedUnit: StorageUnit | null;
  paymentPeriod: 'custom' | 'monthly' | 'quarterly' | 'yearly';
  onSelectUnit: (unit: StorageUnit) => void;
}

// 모든 사이즈 옵션 (추가 사이즈 포함)
const ALL_SIZES = ["SB", "0.5M", "M", "2M", "3M", "4M", "XL"] as const;
type SizeType = typeof ALL_SIZES[number];

// 사이즈별 치수 정보
const SIZE_DIMENSIONS: Record<SizeType, string> = {
  "SB": "70cm(가로) × 100cm(높이) × 70cm(폭)",
  "0.5M": "90cm(가로) × 150cm(높이) × 90cm(폭)",
  "M": "120cm(가로) × 200cm(높이) × 120cm(폭)",
  "2M": "150cm(가로) × 200cm(높이) × 150cm(폭)",
  "3M": "180cm(가로) × 200cm(높이) × 180cm(폭)",
  "4M": "200cm(가로) × 200cm(높이) × 200cm(폭)",
  "XL": "250cm(가로) × 250cm(높이) × 250cm(폭)"
};

// 사이즈별 이미지 URL
const SIZE_IMAGES: Record<SizeType, string> = {
  "SB": "/images/SB_1.png",
  "0.5M": "/images/0.5M.png",
  "M": "/images/M.png",
  "2M": "/images/2M.png",
  "3M": "/images/3M_2.png",
  "4M": "/images/4M.png",
  "XL": "/images/XL.png" // XL 이미지가 없어 4M 이미지 사용
};

export default function StorageSizeSelector({ 
  units, 
  selectedUnit, 
  paymentPeriod,
  onSelectUnit 
}: StorageSizeSelectorProps) {
  // 사이즈별로 유닛 그룹화
  const [sizeGroups, setSizeGroups] = useState<Record<string, StorageUnit[]>>({});
  
  // 선택한 사이즈
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  // 모든 사이즈를 보여줄지 여부 (사용 가능한 사이즈만 보여줄지 여부)
  const [showAllSizes, setShowAllSizes] = useState(true);

  useEffect(() => {
    // 사이즈별로 유닛 그룹화
    const groups: Record<string, StorageUnit[]> = {};
    
    units.forEach(unit => {
      if (!groups[unit.size]) {
        groups[unit.size] = [];
      }
      groups[unit.size].push(unit);
    });
    
    setSizeGroups(groups);
    
    // 초기 선택된 유닛이 있으면 해당 사이즈 선택
    if (selectedUnit) {
      setSelectedSize(selectedUnit.size);
    } else if (Object.keys(groups).length > 0) {
      // 기본값으로 첫 번째 사이즈 선택
      setSelectedSize(Object.keys(groups)[0]);
      
      // 첫 번째 유닛 선택
      const firstSize = Object.keys(groups)[0];
      if (groups[firstSize]?.length > 0) {
        onSelectUnit(groups[firstSize][0]);
      }
    } else if (showAllSizes) {
      // 사용 가능한 유닛이 없더라도 첫 번째 사이즈 선택 (데모 목적)
      setSelectedSize(ALL_SIZES[0]);
    }
  }, [units, selectedUnit, onSelectUnit, showAllSizes]);

  // 사이즈 버튼 클릭 핸들러
  const handleSizeClick = (size: string) => {
    setSelectedSize(size);
    
    // 해당 사이즈의 첫 번째 유닛 선택
    if (sizeGroups[size]?.length > 0) {
      onSelectUnit(sizeGroups[size][0]);
    }
  };

  // 치수 정보 얻기
  const getDimensions = (size: string): string => {
    return SIZE_DIMENSIONS[size as SizeType] || size;
  };

  return (
    <div>
      <h2 className="text-lg font-medium mb-3">보관 사이즈</h2>
      
      {/* 사이즈 선택 버튼 */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {ALL_SIZES.map((size) => {
          // showAllSizes가 true면 모든 버튼 활성화, 아니면 사용 가능한 유닛이 있는 버튼만 활성화
          const available = showAllSizes || !!sizeGroups[size]?.length;
          return (
            <Button
              key={size}
              variant={selectedSize === size ? "default" : "outline"}
              onClick={() => available && handleSizeClick(size)}
              className={`text-sm py-0.5 ${
                selectedSize === size
                  ? "bg-primary text-white"
                  : available 
                    ? "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600" 
                    : "bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed opacity-60"
              }`}
              disabled={!available}
            >
              {size}
            </Button>
          );
        })}
      </div>
      
      {selectedSize && (
        <>
          {/* 이미지 표시 */}
          <div className="w-full h-80 bg-gray-800 rounded-lg mb-4 overflow-hidden relative">
            <img 
              src={SIZE_IMAGES[selectedSize as SizeType]} 
              alt={`${selectedSize} 사이즈`}
              className="w-full h-full object-contain"
            />
            
            {/* 사이즈 정보 오버레이 */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-3 text-center">
              <h3 className="text-xl font-bold">{selectedSize}</h3>
              <p className="text-sm text-gray-300">{getDimensions(selectedSize)}</p>
            </div>
          </div>
          
          {/* 선택 가능한 보관함 목록 – 유닛이 1개여도 항상 표시 */}
          {sizeGroups[selectedSize] && sizeGroups[selectedSize].length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">이용 가능한 보관함 선택</h3>
              <div className="grid grid-cols-3 gap-2">
                {sizeGroups[selectedSize].map((unit) => {
                  const hasPrice = (() => {
                    switch (paymentPeriod) {
                      case 'monthly': return Number(unit.monthlyPrice) > 0;
                      case 'quarterly': return Number(unit.quarterlyPrice) > 0;
                      case 'yearly': return Number(unit.yearlyPrice) > 0;
                      default: return true; // custom/daily
                    }
                  })();
                  const available = unit.isAvailable !== false && hasPrice;
                  const priceLabel = (() => {
                    switch (paymentPeriod) {
                      case 'monthly': return `${Number(unit.monthlyPrice).toLocaleString()}원/月`;
                      case 'quarterly': return `${Number(unit.quarterlyPrice).toLocaleString()}원/3M`;
                      case 'yearly': return `${Number(unit.yearlyPrice).toLocaleString()}원/年`;
                      default: return `${Number(unit.dailyPrice || 0).toLocaleString()}원/日`;
                    }
                  })();
                  const isSelected = selectedUnit?.id === unit.id;
                  const btnClass = available
                    ? isSelected
                      ? "bg-primary text-white"
                      : "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed opacity-60";

                  return (
                    <Button
                      key={unit.id}
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => available && onSelectUnit(unit)}
                      disabled={!available}
                      className={`text-sm leading-tight ${btnClass} flex flex-col items-center py-0.5`}
                    >
                      {available ? (
                        <>
                          <span>{unit.unitNumber || `${unit.size}-${unit.id}`}</span>
                          <span className="text-xs text-gray-400 mt-px">{priceLabel}</span>
                        </>
                      ) : (
                        <>
                          <span>예약중</span>
                          { (unit as any).reservedLabel && <span className="text-xs text-gray-500 mt-px">{(unit as any).reservedLabel}</span> }
                        </>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
