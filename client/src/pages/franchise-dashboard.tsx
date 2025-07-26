import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Plus, Warehouse, ClipboardList, MapPin, DollarSign, MessageSquare, Calendar, CheckCircle, XCircle, Clock } from "lucide-react";
import type { StorageLocationForm, StorageUnitForm, StorageUnit, Reservation, RevenueStats } from "@/types/storage";
import { useCallback } from "react";
import { storageApi, reservationApi } from "@/services/api";
import AddressSearch from "@/components/ui/address-search";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ko } from "date-fns/locale";

// 임시 데이터 - 나중에 Firestore 데이터로 교체
interface Storage {
  id: string;
  name: string;
  address: string;
  status: 'active' | 'pending' | 'rejected';
  units: number;
  occupiedUnits: number;
  totalRevenue: number;
}

export default function FranchiseDashboardPage() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  
  const { data: rawStorages = [], refetch } = useQuery<any[]>({
    queryKey: ["owner-locations", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user) return [];
      const { data } = await storageApi.getOwnerStorageLocations(user.id);
      if (Array.isArray(data)) return data;
      if (Array.isArray((data as any)?.locations)) return (data as any).locations;
      return [];
    },
  });

  // 백엔드 응답을 뷰 모델로 가공
  const storages: Storage[] = (rawStorages as Array<any>).map((s): Storage => ({
    id: s.id,
    name: s.name,
    address: s.address,
    status: s.isActive ? 'active' : 'pending',
    units: s.totalUnits || 0,
    occupiedUnits: s.occupiedUnits || 0,
    totalRevenue: s.totalRevenue || 0,
  }));

  // 추가 폼 상태 및 유틸
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [newLocation, setNewLocation] = useState<StorageLocationForm & {detail?:string;latitude?:number;longitude?:number;images:string[]}>({
    name: "", address: "", city: "", district: "", detail: "", latitude:undefined, longitude:undefined, images: [], features: []
  });

  const fixedFeatures = ["주차","24시간","CCTV","온도 관리","50평"];
  const [features, setFeatures] = useState<string>("주차,24시간,CCTV,온도 관리,50평");

  const handleImageFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const arr: File[] = Array.from(files).slice(0,3);
    Promise.all(arr.map(f=>new Promise<string>((res)=>{const reader=new FileReader();reader.onload=()=>res(reader.result as string);reader.readAsDataURL(f);}))).then(base64s=>{
      setNewLocation(prev=>({...prev, images: base64s}));
    });
  },[]);

  const [unitFormLocationId, setUnitFormLocationId] = useState<number | null>(null);
  const [storageUnits, setStorageUnits] = useState<StorageUnit[]>([]);

  const sizeDimensionMap: Record<string, string[]> = {
    SB:["70cm×100cm×70cm"],"0.5M":["90cm×150cm×90cm"],M:["120cm×200cm×120cm"],
    "2M":["150cm×200cm×150cm"],"3M":["180cm×200cm×180cm"],"4M":["200cm×200cm×200cm"],XL:["250cm×250cm×250cm"]
  };

  const sizeOrder=["SB","0.5M","M","2M","3M","4M","XL"] as const;
  const baseMonthly=40000;
  const calcPrices=(size:string)=>{const idx=sizeOrder.indexOf(size as any);const monthly=baseMonthly+idx*10000;const daily=Math.round(monthly/20);return {daily,monthly,quarterly:monthly*3,yearly:monthly*12};};

  const [newUnit,setNewUnit]=useState<StorageUnitForm>({locationId:0,size:"SB",dimensions:"",dailyPrice:2000,monthlyPrice:40000,quarterlyPrice:120000,yearlyPrice:480000,unitNumber:""});

  const fetchUnits=async(locId:number)=>{const {data}=await storageApi.getStorageUnits(locId);setStorageUnits(data);} ;
  
  // 이미 사용 중인 유닛 번호를 제외한 유닛 번호 생성 함수
  const generateUnitNumbers = (locId: number, size: string) => {
    const existingUnitNumbers = storageUnits
      .filter(unit => unit.size === size)
      .map(unit => unit.unitNumber);
    
    const numbers: string[] = [];
    for (let i = 1; i <= 20; i++) {
      const candidate = `${locId}-${size}-${i}`;
      if (!existingUnitNumbers.includes(candidate)) {
        numbers.push(candidate);
      }
    }
    return numbers;
  };
  
  // 가맹점 회원이 아니면 홈으로 리디렉션
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
      return;
    }
    
    if (isAuthenticated && user?.userType !== 'franchise') {
      setLocation("/");
    }
  }, [isAuthenticated, user, setLocation]);

  // 아직 인증 상태를 체크 중이거나 리디렉션 될 경우 렌더링 방지
  if (!isAuthenticated || user?.userType !== 'franchise') {
    return null;
  }

  // 가맹점 승인 여부 확인 - 승인되지 않았다면 대기 화면 표시
  if (!user.isApproved) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="bg-yellow-500/20 text-yellow-400 p-4 rounded-lg inline-flex items-center mb-8">
          <AlertCircle className="h-6 w-6 mr-2" />
          <span>가맹점 승인 대기 중</span>
        </div>
        <h1 className="text-3xl font-bold mb-4">가맹점 승인 대기 중입니다</h1>
        <p className="text-gray-400 mb-8 max-w-lg mx-auto">
          관리자의 승인 후 창고 등록 및 관리가 가능합니다. 승인까지 최대 24시간이 소요될 수 있습니다.
        </p>
        <Button 
          variant="outline" 
          onClick={() => setLocation("/")}
          className="bg-gray-800 border-gray-700 hover:bg-gray-700"
        >
          홈으로 돌아가기
        </Button>
      </div>
    );
  }

  // 예약 데이터 및 관리 상태
  const { data: reservations = [], isLoading: isLoadingReservations, refetch: refetchReservations } = useQuery<Reservation[]>({
    queryKey: ["owner-reservations", user?.id],
    enabled: !!user?.id && activeTab === "reservations",
    queryFn: async () => {
      if (!user) return [];
      const { data } = await reservationApi.getReservations();
      return Array.isArray(data) ? data : [];
    },
  });

  // 매출 데이터 상태
  const [revenueTimeframe, setRevenueTimeframe] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");
  const { data: revenueStats, isLoading: isLoadingRevenue } = useQuery<RevenueStats>({
    queryKey: ["owner-revenue", user?.id, revenueTimeframe],
    enabled: !!user?.id && activeTab === "revenue",
    queryFn: async () => {
      if (!user) return {
        totalRevenue: 0,
        periodRevenue: 0,
        growthRate: 0,
        data: []
      };
      
      // 각 창고별 통계 데이터 조회
      const statsPromises = storages
        .filter(s => s.status === 'active')
        .map(async (storage) => {
          try {
            const { data } = await storageApi.getStorageStats(Number(storage.id));
            return data;
          } catch (error) {
            console.error(`Failed to fetch stats for storage ${storage.id}:`, error);
            return null;
          }
        });
      
      const statsResults = await Promise.all(statsPromises);
      
      // 모든 창고의 매출 데이터 병합
      const combinedStats = statsResults.reduce((acc, curr) => {
        if (!curr) return acc;
        
        acc.totalRevenue += curr.totalRevenue || 0;
        
        // 월별 매출 데이터 병합
        if (curr.monthlyRevenue && Array.isArray(curr.monthlyRevenue)) {
          curr.monthlyRevenue.forEach((item: { month: string; amount: number }) => {
            const existingMonth = acc.data.find((d: { period: string; amount: number }) => d.period === item.month);
            if (existingMonth) {
              existingMonth.amount += item.amount;
            } else {
              acc.data.push({ period: item.month, amount: item.amount });
            }
          });
        }
        
        return acc;
      }, { totalRevenue: 0, periodRevenue: 0, growthRate: 0, data: [] } as RevenueStats);
      
      // 기간별 매출 및 성장률 계산
      if (combinedStats.data.length > 0) {
        combinedStats.data.sort((a: { period: string; amount: number }, b: { period: string; amount: number }) => 
          new Date(a.period).getTime() - new Date(b.period).getTime()
        );
        
        // 가장 최근 기간의 매출을 periodRevenue로 설정
        const latestPeriod = combinedStats.data[combinedStats.data.length - 1];
        combinedStats.periodRevenue = latestPeriod.amount;
        
        // 성장률 계산 (최소 2개 이상의 데이터가 있을 때)
        if (combinedStats.data.length > 1) {
          const prevPeriod = combinedStats.data[combinedStats.data.length - 2];
          if (prevPeriod.amount > 0) {
            combinedStats.growthRate = ((latestPeriod.amount - prevPeriod.amount) / prevPeriod.amount) * 100;
          }
        }
      }
      
      return combinedStats;
    }
  });

  // 예약 상태 처리 함수
  const handleReservationStatus = async (id: number, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        // 예약 승인 API 호출 (실제로는 백엔드에 맞는 API 엔드포인트를 사용해야 함)
        await reservationApi.createReservation({ id, status: 'active' });
      } else {
        // 예약 거절 API 호출
        await reservationApi.cancelReservation(id);
      }
      // 예약 목록 새로고침
      refetchReservations();
    } catch (error) {
      console.error('예약 상태 변경 중 오류 발생:', error);
      // 오류 처리 (이 부분은 실제 애플리케이션에서 toast 메시지 등으로 처리)
    }
  };

  // 예약 상태에 따른 색상 설정 함수
  const getReservationStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      case 'expired': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  // 예약 상태에 따른 텍스트 설정 함수
  const getReservationStatusText = (status: string) => {
    switch (status) {
      case 'active': return '이용중';
      case 'pending': return '대기중';
      case 'cancelled': return '취소됨';
      case 'expired': return '만료됨';
      default: return '알 수 없음';
    }
  };

  const [ownerReservations, setOwnerReservations] = useState<any[]>([]);

  const fetchOwnerReservations = async () => {
    try {
      if (!user?.backendId) return;
      const res = await fetch(`/api/franchises/${user.backendId}/reservations?ts=${Date.now()}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.reservations)) {
        setOwnerReservations(json.reservations);
      } else {
        setOwnerReservations([]);
      }
    } catch (e) {
      console.error("[FRANCHISE] 예약 목록 조회 오류:", e);
    }
  };

  useEffect(() => {
    if (activeTab === "reservations") {
      fetchOwnerReservations();
    }
  }, [activeTab]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">가맹점 대시보드</h1>
        <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium flex items-center">
          <Warehouse className="mr-1 h-4 w-4" />
          가맹점 주인
        </div>
      </div>
      
      <Tabs 
        defaultValue="overview" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="storages">창고 관리</TabsTrigger>
          <TabsTrigger value="revenue">수입 관리</TabsTrigger>
          <TabsTrigger value="reservations">예약 관리</TabsTrigger>
        </TabsList>
        
        {/* 개요 탭 */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* 창고 수 카드 */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">총 창고 수</p>
                    <h3 className="text-2xl font-bold">{storages.filter(s => s.status === 'active').length}</h3>
                  </div>
                  <div className="bg-blue-500/20 p-3 rounded-full">
                    <Warehouse className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* 예약 현황 카드 */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">이용률</p>
                    <h3 className="text-2xl font-bold">
                      {storages.reduce((acc, curr) => acc + curr.occupiedUnits, 0)} / {storages.reduce((acc, curr) => acc + curr.units, 0)}
                    </h3>
                  </div>
                  <div className="bg-green-500/20 p-3 rounded-full">
                    <ClipboardList className="h-6 w-6 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* 월 수입 카드 */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">총 수입</p>
                    <h3 className="text-2xl font-bold">
                      {storages.reduce((acc, curr) => acc + curr.totalRevenue, 0).toLocaleString()}원
                    </h3>
                  </div>
                  <div className="bg-purple-500/20 p-3 rounded-full">
                    <DollarSign className="h-6 w-6 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* 창고 요약 */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>내 창고 목록</CardTitle>
              <CardDescription>등록된 창고 목록입니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {storages.map(storage => (
                  <Card key={storage.id} className={`border-l-4 ${
                    storage.status === 'active' ? 'border-l-green-500' : 
                    storage.status === 'pending' ? 'border-l-yellow-500' : 
                    'border-l-red-500'
                  } bg-gray-700 border-gray-600`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold flex items-center">
                            {storage.name}
                            {storage.status === 'pending' && (
                              <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
                                승인 대기중
                              </span>
                            )}
                          </h3>
                          <p className="text-gray-400 text-sm flex items-center mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {storage.address}
                          </p>
                          {storage.status === 'active' && (
                            <p className="text-gray-300 text-sm mt-2">
                              이용률: {storage.occupiedUnits}/{storage.units} ({storage.units > 0 ? Math.round((storage.occupiedUnits / storage.units) * 100) : 0}%)
                            </p>
                          )}
                        </div>
                        
                        <Button 
                          onClick={() => {
                            // 현재 경로를 localStorage에 저장
                            localStorage.setItem('storageReferer', '/franchise-dashboard');
                            setLocation(`/storage/${storage.id}`);
                          }}
                          className="bg-gray-600 hover:bg-gray-500"
                        >
                          상세 보기
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* 창고 관리 탭 */}
        <TabsContent value="storages" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">창고 관리</h2>
            <Button onClick={()=>setShowLocationForm(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="mr-1 h-4 w-4"/>
              새 창고 등록
            </Button>
          </div>

          {showLocationForm && (
            <div className="mb-6 p-4 border border-gray-600 rounded-lg bg-gray-700">
              <h3 className="text-lg font-semibold mb-2">새 창고 등록</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input placeholder="창고 이름" className="px-3 py-2 bg-gray-800 border-gray-600 rounded" value={newLocation.name} onChange={e=>setNewLocation({...newLocation,name:e.target.value})}/>
                <AddressSearch onSelect={({roadAddr,siNm,sggNm,latitude,longitude})=>{setNewLocation({...newLocation,address:roadAddr,city:siNm,district:sggNm,latitude,longitude});}} />
                <input placeholder="상세 주소" className="px-3 py-2 bg-gray-800 border-gray-600 rounded" value={newLocation.detail||""} onChange={e=>setNewLocation({...newLocation, detail:e.target.value})}/>
                <div className="flex items-center gap-2">
                  <input type="file" accept="image/*" multiple onChange={e=>handleImageFiles(e.target.files)} className="text-sm text-gray-300" />
                  <span className="text-xs text-gray-400">창고 이미지 3개</span>
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-gray-300 mb-1 block">창고 특징 (쉼표로 구분)</label>
                  <textarea 
                    className="w-full px-3 py-2 bg-gray-800 border-gray-600 rounded text-sm text-gray-300"
                    value={features}
                    onChange={e => setFeatures(e.target.value)}
                    placeholder="주차,24시간,CCTV,온도 관리,50평"
                    rows={2}
                  />
                </div>
                {newLocation.images && newLocation.images.length>0 && (
                  <div className="flex space-x-2 mt-2 col-span-2">
                    {newLocation.images.map((img,i)=>(<img key={i} src={img} alt="preview" className="h-16 w-16 object-cover rounded"/>))}
                  </div>
                )}
                {/* city, district 필드는 주소 선택 시 자동 세팅되며 사용자 입력이 필요 없습니다 */}
              </div>
              <div className="flex gap-2 mt-4">
                <Button className="bg-green-600 hover:bg-green-700" onClick={async()=>{
                  const fullAddress = `${newLocation.address} ${newLocation.detail || ""}`.trim();
                  const featuresArray = features.split(',').map(f => f.trim()).filter(f => f);
                  const payload = {
                    name:newLocation.name,
                    address:fullAddress,
                    city:newLocation.city,
                    district:newLocation.district,
                    latitude:newLocation.latitude?.toString(),
                    longitude:newLocation.longitude?.toString(),
                    features: featuresArray,
                    images: newLocation.images,
                    ownerId:(user as any).backendId,
                  };
                  await storageApi.createStorageLocation(payload);
                  setShowLocationForm(false);
                  setNewLocation({name:"",address:"",city:"",district:"",images:[],features:[]});
                  setFeatures("주차,24시간,CCTV,온도 관리,50평");
                  refetch();
                }}>저장</Button>
                <Button variant="outline" onClick={()=>setShowLocationForm(false)}>취소</Button>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-4">
            {storages.length > 0 ? (
              storages.map(storage => (
                <Card key={storage.id} className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="flex items-center">
                          {storage.name}
                          {storage.status === 'pending' && (
                            <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
                              승인 대기중
                            </span>
                          )}
                          {storage.status === 'active' && (
                            <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                              운영중
                            </span>
                          )}
                        </CardTitle>
                        <CardDescription className="flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {storage.address}
                        </CardDescription>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setUnitFormLocationId(prev => prev === Number(storage.id) ? null : Number(storage.id));
                          fetchUnits(Number(storage.id));
                        }}
                        className="bg-gray-700 border-gray-600 hover:bg-gray-600"
                      >
                        보관함 관리
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {storage.status === 'active' && (
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-gray-700/50 p-2 rounded flex justify-between">
                          <span className="text-gray-400">총 보관함</span>
                          <span>{storage.units}개</span>
                        </div>
                        <div className="bg-gray-700/50 p-2 rounded flex justify-between">
                          <span className="text-gray-400">사용 중</span>
                          <span>{storage.occupiedUnits}개</span>
                        </div>
                        <div className="bg-gray-700/50 p-2 rounded flex justify-between col-span-2">
                          <span className="text-gray-400">이용률</span>
                          <span>{storage.units > 0 ? Math.round((storage.occupiedUnits / storage.units) * 100) : 0}%</span>
                        </div>
                      </div>
                    )}
                    
                    {unitFormLocationId === Number(storage.id) && (
                      <div className="mt-4 p-4 border border-gray-600 rounded bg-gray-700">
                        <h4 className="font-semibold mb-2">보관함 추가</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Select
                            value={newUnit.size}
                            onValueChange={(val) => {
                              const p = calcPrices(val);
                              setNewUnit(prev => ({
                                ...prev,
                                size: val,
                                dailyPrice: p.daily,
                                monthlyPrice: p.monthly,
                                quarterlyPrice: p.quarterly,
                                yearlyPrice: p.yearly
                              }));
                            }}
                          >
                            <SelectTrigger className="bg-gray-800 border-gray-600">
                              <SelectValue placeholder="사이즈" />
                            </SelectTrigger>
                            <SelectContent>
                              {sizeOrder.map(sz => (
                                <SelectItem key={sz} value={sz}>{sz}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          <Select
                            value={newUnit.dimensions}
                            onValueChange={(val) => setNewUnit({...newUnit, dimensions: val})}
                          >
                            <SelectTrigger className="bg-gray-800 border-gray-600">
                              <SelectValue placeholder="규격" />
                            </SelectTrigger>
                            <SelectContent>
                              {(sizeDimensionMap[newUnit.size] || []).map(dim => (
                                <SelectItem key={dim} value={dim}>{dim}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          <Select
                            value={newUnit.unitNumber}
                            onValueChange={(val) => setNewUnit({...newUnit, unitNumber: val})}
                          >
                            <SelectTrigger className="bg-gray-800 border-gray-600">
                              <SelectValue placeholder="유닛 번호" />
                            </SelectTrigger>
                            <SelectContent>
                              {generateUnitNumbers(Number(storage.id), newUnit.size).map(num => (
                                <SelectItem key={num} value={num}>{num}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          
                          <input 
                            type="number"
                            placeholder="일 요금"
                            className="px-3 py-2 bg-gray-800 border-gray-600 rounded"
                            value={newUnit.dailyPrice}
                            onChange={e => setNewUnit({...newUnit, dailyPrice: Number(e.target.value)})}
                          />
                          <input 
                            type="number"
                            placeholder="월 요금"
                            className="px-3 py-2 bg-gray-800 border-gray-600 rounded"
                            value={newUnit.monthlyPrice}
                            onChange={e => setNewUnit({...newUnit, monthlyPrice: Number(e.target.value)})}
                          />
                          <input 
                            type="number"
                            placeholder="분기 요금"
                            className="px-3 py-2 bg-gray-800 border-gray-600 rounded"
                            value={newUnit.quarterlyPrice || (newUnit.monthlyPrice * 3)}
                            onChange={e => setNewUnit({...newUnit, quarterlyPrice: Number(e.target.value)})}
                          />
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button className="bg-green-600 hover:bg-green-700" onClick={async()=>{
                            await storageApi.createStorageUnit(Number(storage.id),{...newUnit,locationId:Number(storage.id)});
                            fetchUnits(Number(storage.id));
                            setNewUnit(prev=>({...prev,unitNumber:""}));
                          }}>저장</Button>
                          <Button variant="outline" onClick={()=>setUnitFormLocationId(null)}>닫기</Button>
                        </div>
                        {storageUnits.length>0 && (
                          <div className="mt-4">
                            <h5 className="font-medium text-sm mb-2">등록된 보관함</h5>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-200">
                              {storageUnits.map(u=>(
                                <div key={u.id} className="bg-gray-800 p-2 rounded flex justify-between">
                                  <span>{u.unitNumber}</span>
                                  <span className={`text-xs px-1.5 py-0.5 rounded-full flex items-center ${!u.isAvailable ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                    {!u.isAvailable ? '사용중' : u.size}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
                <Warehouse className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">등록된 창고가 없습니다</h3>
                <p className="text-gray-400 mb-6">
                  새 창고를 등록하여 관리를 시작해보세요.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* 수입 관리 탭 */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">수입 관리</h2>
            <Select
              value={revenueTimeframe}
              onValueChange={(value) => setRevenueTimeframe(value as "daily" | "weekly" | "monthly" | "yearly")}
            >
              <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
                <SelectValue placeholder="기간 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">일별</SelectItem>
                <SelectItem value="weekly">주별</SelectItem>
                <SelectItem value="monthly">월별</SelectItem>
                <SelectItem value="yearly">연별</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* 총 수입 카드 */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">총 수입</p>
                    <h3 className="text-2xl font-bold">{(revenueStats?.totalRevenue || 0).toLocaleString()}원</h3>
                  </div>
                  <div className="bg-purple-500/20 p-3 rounded-full">
                    <DollarSign className="h-6 w-6 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* 기간별 수입 카드 */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{revenueTimeframe === "daily" ? "오늘" : 
                      revenueTimeframe === "weekly" ? "이번 주" : 
                      revenueTimeframe === "monthly" ? "이번 달" : "올해"} 수입</p>
                    <h3 className="text-2xl font-bold">{(revenueStats?.periodRevenue || 0).toLocaleString()}원</h3>
                  </div>
                  <div className="bg-blue-500/20 p-3 rounded-full">
                    <Calendar className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* 성장률 카드 */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">성장률</p>
                    <h3 className={`text-2xl font-bold ${revenueStats?.growthRate && revenueStats.growthRate > 0 ? 'text-green-400' : revenueStats?.growthRate && revenueStats.growthRate < 0 ? 'text-red-400' : ''}`}>
                      {revenueStats?.growthRate ? (revenueStats.growthRate > 0 ? '+' : '') + revenueStats.growthRate.toFixed(1) + '%' : '0.0%'}
                    </h3>
                  </div>
                  <div className={`${revenueStats?.growthRate && revenueStats.growthRate > 0 ? 'bg-green-500/20' : revenueStats?.growthRate && revenueStats.growthRate < 0 ? 'bg-red-500/20' : 'bg-gray-500/20'} p-3 rounded-full`}>
                    <svg className={`h-6 w-6 ${revenueStats?.growthRate && revenueStats.growthRate > 0 ? 'text-green-400' : revenueStats?.growthRate && revenueStats.growthRate < 0 ? 'text-red-400' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {revenueStats?.growthRate && revenueStats.growthRate > 0 ? 
                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline> : 
                        <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>}
                      {revenueStats?.growthRate && revenueStats.growthRate > 0 ? 
                        <polyline points="17 6 23 6 23 12"></polyline> : 
                        <polyline points="17 18 23 18 23 12"></polyline>}
                    </svg>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>수입 추이</CardTitle>
              <CardDescription>기간별 수입 추이 그래프입니다.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingRevenue ? (
                <div className="flex justify-center items-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              ) : revenueStats?.data && revenueStats.data.length > 0 ? (
                <div className="h-80 relative">
                  <div className="absolute inset-0 flex items-end">
                    {revenueStats.data.map((item: { period: string; amount: number }, index) => {
                      const maxValue = Math.max(...revenueStats.data.map((d: { amount: number }) => d.amount));
                      const height = maxValue > 0 ? (item.amount / maxValue) * 100 : 0;
                      
                      return (
                        <div key={index} className="flex flex-col items-center flex-1 px-1">
                          <div 
                            className="w-full bg-purple-500/70 rounded-t"
                            style={{ height: `${height}%` }}
                          ></div>
                          <div className="text-xs mt-1 text-gray-400 truncate w-full text-center">
                            {item.period}
                          </div>
                          <div className="text-xs font-medium truncate w-full text-center">
                            {(item.amount / 10000).toFixed(1)}만원
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 text-gray-400">
                  <p>수입 데이터가 없습니다.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>창고별 수입</CardTitle>
              <CardDescription>각 창고의 수입 현황입니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {storages.filter(s => s.status === 'active').map((storage) => (
                  <div key={storage.id} className="flex justify-between items-center p-4 bg-gray-700 rounded-lg">
                    <div>
                      <h4 className="font-medium">{storage.name}</h4>
                      <p className="text-sm text-gray-400 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {storage.address}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">총 수입</p>
                      <p className="font-bold">{storage.totalRevenue.toLocaleString()}원</p>
                    </div>
                  </div>
                ))}
                
                {storages.filter(s => s.status === 'active').length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <p>운영 중인 창고가 없습니다.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* 예약 관리 탭 */}
        <TabsContent value="reservations" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">예약 관리</h2>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>예약 현황</CardTitle>
              <CardDescription>고객 예약 목록 및 상태 변경</CardDescription>
            </CardHeader>
            <CardContent>
              {ownerReservations.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-gray-700">
                        <th className="px-2 py-1">ID</th>
                        <th className="px-2 py-1">이름</th>
                        <th className="px-2 py-1">이메일</th>
                        <th className="px-2 py-1">전화</th>
                        <th className="px-2 py-1">로커</th>
                        <th className="px-2 py-1">기간</th>
                        <th className="px-2 py-1">금액</th>
                        <th className="px-2 py-1">상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ownerReservations.map((r:any)=> (
                        <tr key={r.reservationId} className="border-b border-gray-700 hover:bg-gray-800">
                          <td className="px-2 py-1">{r.reservationId}</td>
                          <td className="px-2 py-1">{r.userName || '-'}</td>
                          <td className="px-2 py-1">{r.userEmail}</td>
                          <td className="px-2 py-1">{r.userPhone || '-'}</td>
                          <td className="px-2 py-1">{r.unitNumber || '-'}</td>
                          <td className="px-2 py-1">{new Date(r.startDate).toLocaleDateString()}~{new Date(r.endDate).toLocaleDateString()}</td>
                          <td className="px-2 py-1">{Number(r.totalAmount).toLocaleString()}원</td>
                          <td className="px-2 py-1">
                            <select
                              className="bg-gray-800 border-gray-600 text-white text-xs px-2 py-1 rounded"
                              value={r.status}
                              onChange={async (e) => {
                                const newStatus = e.target.value;
                                try {
                                  await fetch(`/api/franchises/${user?.backendId}/reservations/${r.reservationId}/status`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ status: newStatus })
                                  });
                                  fetchOwnerReservations();
                                } catch (err) {
                                  console.error('status update', err);
                                }
                              }}
                            >
                              {['pending','active','expired','cancelled'].map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center py-6 text-gray-400">예약 데이터가 없습니다.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 