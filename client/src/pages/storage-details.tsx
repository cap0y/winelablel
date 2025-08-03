import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { storageApi } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Clock, Shield, Video, Car, Thermometer, Package, ArrowLeft, Calendar as CalendarIcon, CalendarCheck, CalendarRange, Repeat, CreditCard } from "lucide-react";
import StorageSizeSelector from "@/components/storage/storage-size-selector";
import GoogleMap from "@/components/storage/google-map";
import { Calendar } from "@/components/ui/calendar";
import { format, addDays, differenceInDays } from "date-fns";
import { ko, enUS, ja, zhCN } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLanguage } from "@/contexts/language-context";
import { commonTranslations, storageDetailsTranslations } from "@/lib/translations";
import type { StorageLocation, StorageUnit } from "@shared/schema";
import type { DateRange } from "react-day-picker";

interface ReservedInfo { unitId:number; startDate:string; endDate:string; }

// Sample images for the carousel (데이터가 없을 경우에만 사용)
const sampleImages = [
  "/images/1.jpeg",
  "/images/2.jpeg",
  "/images/3.jpeg"
];

// StorageLocation 타입 확장
interface ExtendedStorageLocation extends StorageLocation {
  description?: string;
}

// 자동 수평 슬라이더 컴포넌트
function ImageSlider({ images }: { images: string[] }) {
  const [index, setIndex] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (images.length <= 1) return; // 한 장이면 자동 이동 X
    timeoutRef.current = setTimeout(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [index, images]);

  return (
    <div className="relative w-full h-56 overflow-hidden rounded-xl mb-6">
      <div
        className="flex w-full h-full transition-transform duration-700"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((src) => (
          <img
            key={src}
            src={src}
            alt="storage"
            className="w-full flex-shrink-0 object-cover h-56"
          />
        ))}
      </div>
      <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
        {images.map((_, i) => (
          <span
            key={i}
            className={`w-2 h-2 rounded-full ${i === index ? 'bg-primary' : 'bg-white/40'}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function StorageDetails() {
  const { locationId } = useParams<{ locationId: string }>();
  const [selectedUnit, setSelectedUnit] = useState<StorageUnit | null>(null);
  const { language } = useLanguage();
  const buttonContainerClass = language === 'ko' ? 'flex flex-wrap gap-2 mb-4' : 'grid grid-cols-2 gap-2 mb-4';
  const wrapClass = language === 'ko' ? 'whitespace-nowrap leading-normal' : 'whitespace-normal leading-tight text-center';
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(),
    to: addDays(new Date(), 30),
  });
  const [paymentPeriod, setPaymentPeriod] = useState<'custom' | 'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [, setLocation] = useLocation();

  // 이전 페이지 정보를 저장하는 상태
  const [fallbackPath, setFallbackPath] = useState<string>("/locations");

  // 이전 페이지 확인
  useEffect(() => {
    // 로컬 스토리지에 저장된 이전 페이지 경로가 있다면 사용
    const storedReferer = localStorage.getItem("storageReferer");
    if (storedReferer) {
      setFallbackPath(storedReferer);
    }
    
    // 정리 함수
    return () => {
      // 페이지 이탈 시 로컬 스토리지 정보 삭제
      localStorage.removeItem("storageReferer");
    };
  }, []);

  // 뒤로 가기 처리 함수
  const handleGoBack = () => {
    // 브라우저에 이전 페이지 히스토리가 있으면 사용
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // 히스토리가 없으면 폴백 경로로 이동
      setLocation(fallbackPath);
    }
  };

  const { data: location, isLoading: locationLoading } = useQuery<ExtendedStorageLocation>({
    queryKey: ["/api/storage-locations", locationId],
    enabled: !!locationId,
  });

  const { data: units, isLoading: unitsLoading } = useQuery<StorageUnit[]>({
    queryKey: ["storage-units", locationId],
    enabled: !!locationId,
    queryFn: async () => {
      if (!locationId) return [];
      const { data } = await storageApi.getStorageUnits(Number(locationId));
      return data;
    },
  });

  const { data: reservedUnits } = useQuery<ReservedInfo[]>({
    queryKey: ["reserved-units", locationId],
    enabled: !!locationId,
    queryFn: async () => {
      if (!locationId) return [];
      const { data } = await storageApi.getReservedUnits(Number(locationId));
      return data;
    },
  });

  const mergedUnits: any[] | undefined = useMemo(() => {
    if (!units) return undefined;
    const reservedMap = new Map<number, ReservedInfo>();
    reservedUnits?.forEach(r=>reservedMap.set(r.unitId,r));
    return units.map(u=>{
      const info = reservedMap.get(u.id);
      return {
        ...u,
        isAvailable: info? false : true,
        reservedLabel: info? `${format(new Date(info.startDate),'yy.MM.dd')}~${format(new Date(info.endDate),'yy.MM.dd')}`:undefined
      };
    });
  },[units,reservedUnits]);

  const isLoading = locationLoading || unitsLoading;
  const t = commonTranslations[language]; // 공통 번역
  
  // 날짜 형식 로케일 선택
  const getDateLocale = () => {
    switch (language) {
      case 'ko': return ko;
      case 'ja': return ja;
      case 'zh': return zhCN;
      default: return enUS;
    }
  };
  
  const dateLocale = getDateLocale();

  // 선택된 날짜 범위 일수 계산
  const daysBetween = dateRange.from && dateRange.to 
    ? differenceInDays(dateRange.to, dateRange.from) + 1 
    : 0;

  // 1) calculateDailyPrice – 일일 가격을 100원 단위로 반올림하도록 수정
  const calculateDailyPrice = (unit: StorageUnit | null): number => {
    if (!unit) return 0;

    // 1) dailyPrice 필드 우선 사용, 없으면 월 요금을 30으로 나눔
    let base = typeof unit.dailyPrice !== 'undefined' && unit.dailyPrice !== null
      ? Number(unit.dailyPrice)
      : unit.monthlyPrice
      ? Number(unit.monthlyPrice) / 30
      : 0;

    // 2) 100원 단위 반올림으로 통일 (가격 일관성)
    return Math.round(base / 100) * 100;
  };

  // 2) calculateTotalPrice – custom(일 단위) 계산 로직 변경하여 rounding 제거 및 일관성 확보
  const calculateTotalPrice = (): number => {
    if (!selectedUnit) return 0;

    // 서버에서 제공하는 기간별 가격을 우선 사용
    switch (paymentPeriod) {
      case 'monthly':
        return Number(selectedUnit.monthlyPrice) || 0;
      case 'quarterly':
        return Number(selectedUnit.quarterlyPrice) || 0;
      case 'yearly':
        return Number(selectedUnit.yearlyPrice) || 0;
      case 'custom': {
        const dailyPrice = calculateDailyPrice(selectedUnit);
        return dailyPrice * daysBetween;
      }
      default:
        return 0;
    }
  };

  // 할인율 계산 함수 (daily 기준 대비)
  const getDiscountPercent = (period: 'monthly' | 'quarterly' | 'yearly'): number => {
    if (!selectedUnit) return 0;
    const daily = calculateDailyPrice(selectedUnit);
    const baseDays = period === 'monthly' ? 30 : period === 'quarterly' ? 90 : 365;
    const baseCost = daily * baseDays;
    const periodCost = period === 'monthly' ? Number(selectedUnit.monthlyPrice) : period === 'quarterly' ? Number(selectedUnit.quarterlyPrice) : Number(selectedUnit.yearlyPrice);
    if (!baseCost || !periodCost) return 0;
    const discount = (baseCost - periodCost) / baseCost;
    return discount > 0 ? Math.round(discount * 100) : 0;
  };

  // 기간 선택에 따른 날짜 범위 업데이트
  const handlePeriodChange = (period: 'custom' | 'monthly' | 'quarterly' | 'yearly') => {
    setPaymentPeriod(period);
    
    const today = new Date();
    let endDate: Date;
    
    switch (period) {
      case 'monthly':
        endDate = addDays(today, 30);
        break;
      case 'quarterly':
        endDate = addDays(today, 90);
        break;
      case 'yearly':
        endDate = addDays(today, 365);
        break;
      default:
        return; // custom은 직접 선택하므로 변경하지 않음
    }
    
    setDateRange({
      from: today,
      to: endDate,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!location) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-400">{t.notFound}</p>
      </div>
    );
  }

  // 실제 창고 데이터 확인
  const hasRealData = location && location.name && location.address;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <section className="px-4 py-6">
        {/* Back Button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="mb-4 flex items-center gap-1 bg-gradient-to-r from-gray-700/80 to-gray-600/60 backdrop-blur-md hover:opacity-90"
          onClick={handleGoBack}
        >
          <ArrowLeft className="h-4 w-4" />
          뒤로가기
        </Button>
        
        {/* Auto Image Slider */}
        <ImageSlider
          images={location.images && Array.isArray(location.images) && location.images.length > 0 
            ? (location.images as string[]) 
            : sampleImages}
        />

        {/* Location Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">{location.name}</h1>
          <h2 className="text-lg text-gray-400 mb-3">{location.district}</h2>
          
          <div className="flex items-center space-x-2 text-gray-400 mb-4">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{location.address}</span>
          </div>
          
          {/* Description - 데이터베이스에서 가져온 설명이 있으면 표시 */}
          {location.description && (
            <p className="text-gray-300 mb-4 leading-relaxed">
              {location.description}
            </p>
          )}
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {location.features && Array.isArray(location.features) && location.features.length > 0 ? (
              location.features.map((feature: string, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs bg-gray-700 hover:bg-gray-600">
                  {feature}
                </Badge>
              ))
            ) : null}
          </div>
        </div>

        {/* Google Map */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-lg">{t.locationTitle || t.locations}</CardTitle>
          </CardHeader>
          <CardContent>
            <GoogleMap
              latitude={location.latitude ? Number(location.latitude) : 37.5665}
              longitude={location.longitude ? Number(location.longitude) : 126.9780}
              zoom={16}
              height="256px"
              className="rounded-lg"
              locationName={location.name}
              address={location.address}
              image={(location.images as string[] | undefined)?.[0]}
            />
          </CardContent>
        </Card>

        {/* 통합된 보관함 선택 및 이미지 표시 */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardContent className="p-6">
            {mergedUnits && mergedUnits.length > 0 ? (
              <StorageSizeSelector
                units={mergedUnits}
                selectedUnit={selectedUnit}
                paymentPeriod={paymentPeriod}
                // reservedLabel will be used internally
                onSelectUnit={setSelectedUnit}
              />
            ) : (
              <p className="text-gray-400">{t.noUnits || t.noLocations}</p>
            )}
          </CardContent>
        </Card>

        {/* Pricing with Date Range Selection */}
        {selectedUnit && (
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardHeader>
              <CardTitle className="text-lg">{t.priceInfo || t.selfStorage}</CardTitle>
            </CardHeader>
            <CardContent>
              {/* 기간 선택 탭 */}
              <div className={buttonContainerClass}>
                <Button
                  variant={paymentPeriod === 'monthly' ? 'default' : 'outline'}
                  className={`text-xs flex-1 flex items-center justify-center gap-1 ${wrapClass} bg-gradient-to-r from-primary/70 to-primary/50 backdrop-blur-sm hover:opacity-90`}
                  onClick={() => handlePeriodChange('monthly')}
                >
                  <CalendarIcon className="w-4 h-4" /> {t.monthly}
                </Button>
                <Button
                  variant={paymentPeriod === 'quarterly' ? 'default' : 'outline'}
                  className={`text-xs flex-1 flex items-center justify-center gap-1 ${wrapClass} bg-gradient-to-r from-purple-600/70 to-indigo-500/50 backdrop-blur-sm hover:opacity-90`}
                  onClick={() => handlePeriodChange('quarterly')}
                >
                  <Repeat className="w-4 h-4" /> {t.quarterly}
                </Button>
                <Button
                  variant={paymentPeriod === 'yearly' ? 'default' : 'outline'}
                  className={`text-xs flex-1 flex items-center justify-center gap-1 ${wrapClass} bg-gradient-to-r from-yellow-400/70 via-orange-400/60 to-red-500/50 backdrop-blur-sm hover:opacity-90`}
                  onClick={() => handlePeriodChange('yearly')}
                >
                  <CalendarCheck className="w-4 h-4" /> {t.yearly}
                </Button>
                <Button
                  variant={paymentPeriod === 'custom' ? 'default' : 'outline'}
                  className={`text-xs flex-1 flex items-center justify-center gap-1 ${wrapClass} bg-gradient-to-r from-gray-500/60 to-gray-400/40 backdrop-blur-sm hover:opacity-90`}
                  onClick={() => setPaymentPeriod('custom')}
                >
                  <CalendarRange className="w-4 h-4" /> {t.customPeriod}
                </Button>
              </div>

              {/* 날짜 선택기 */}
              {paymentPeriod === 'custom' && (
                <div className="mb-4">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "PPP", { locale: dateLocale })} -{" "}
                              {format(dateRange.to, "PPP", { locale: dateLocale })}
                              <span className="ml-2 text-xs">({daysBetween} {t.days})</span>
                            </>
                          ) : (
                            format(dateRange.from, "PPP", { locale: dateLocale })
                          )
                        ) : (
                          <span>{t.selectDates}</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-gray-700 border-gray-600" align="center">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange.from}
                        selected={dateRange}
                        onSelect={(range) => {
                          if (range) {
                            setDateRange(range);
                          }
                        }}
                        numberOfMonths={2}
                        locale={dateLocale}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
              
              <div className="space-y-3">
                {paymentPeriod === 'custom' && (
                  <>
                    <div className="flex justify-between">
                      <span>{t.dailyPrice}</span>
                      <span className="font-bold">
                        {calculateDailyPrice(selectedUnit).toLocaleString()}원
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>
                        {t.totalPrice} ({daysBetween} {t.days})
                      </span>
                      <span className="font-bold text-primary">
                        {calculateTotalPrice().toLocaleString()}원
                      </span>
                    </div>
                  </>
                )}
                
                {paymentPeriod === 'monthly' && (
                  <div className="flex justify-between items-center">
                    <span>{t.monthlyPrice}</span>
                    <span className="font-bold text-primary flex items-center gap-2">
                      {Number(selectedUnit.monthlyPrice).toLocaleString()}원
                      {getDiscountPercent('monthly') > 0 && (
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs font-semibold animate-pulse">
                          {getDiscountPercent('monthly')}% OFF
                        </span>
                      )}
                    </span>
                  </div>
                )}
                
                {paymentPeriod === 'quarterly' && (
                  <div className="flex justify-between items-center">
                    <span>{t.quarterlyPrice}</span>
                    <span className="font-bold text-primary flex items-center gap-2">
                      {Number(selectedUnit.quarterlyPrice).toLocaleString()}원
                      {getDiscountPercent('quarterly') > 0 && (
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs font-semibold animate-pulse">
                          {getDiscountPercent('quarterly')}% OFF
                        </span>
                      )}
                    </span>
                  </div>
                )}
                
                {paymentPeriod === 'yearly' && (
                  <div className="flex justify-between items-center">
                    <span>{t.yearlyPrice}</span>
                    <span className="font-bold text-primary flex items-center gap-2">
                      {Number(selectedUnit.yearlyPrice).toLocaleString()}원
                      {getDiscountPercent('yearly') > 0 && (
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white text-xs font-semibold animate-pulse">
                          {getDiscountPercent('yearly')}% OFF
                        </span>
                      )}
                    </span>
                  </div>
                )}
                <Separator />
                
                {/* 결제 버튼 */}
                <Button 
                  className="w-full bg-gradient-to-r from-primary/80 to-primary/60 hover:opacity-90 text-white/90 backdrop-blur-md py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                  onClick={() => {
                    if (!selectedUnit) return;
                    
                    // 선택된 날짜 및 기간 정보 저장
                    let urlParams = new URLSearchParams();
                    
                    // 날짜 정보 추가
                    if (dateRange.from) {
                      urlParams.append('startDate', dateRange.from.toISOString());
                    }
                    if (dateRange.to) {
                      urlParams.append('endDate', dateRange.to.toISOString());
                    }
                    
                    // 결제 기간 정보 추가 - custom은 daily로 변환
                    const periodParam = paymentPeriod === 'custom' ? 'daily' : paymentPeriod;
                    urlParams.append('period', periodParam);
                    
                    // 결제 페이지로 이동
                    setLocation(`/checkout?unitId=${selectedUnit.id}&${urlParams.toString()}`);
                  }}
                >
                  <CreditCard className="w-5 h-5" /> {t.reserve}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Facility Features */}
        <Card className="bg-gray-800 border-gray-700 mb-20">
          <CardHeader>
            <CardTitle className="text-lg">{t.facilityFeatures}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-sm">{t.openAllDay}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm">{t.security}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Video className="w-5 h-5 text-primary" />
                <span className="text-sm">{t.cctv}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Car className="w-5 h-5 text-primary" />
                <span className="text-sm">{t.parking}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Thermometer className="w-5 h-5 text-primary" />
                <span className="text-sm">{t.temperature}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Package className="w-5 h-5 text-primary" />
                <span className="text-sm">{t.storage}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}