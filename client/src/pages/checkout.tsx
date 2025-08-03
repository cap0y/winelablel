import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, FileEdit, Truck, Home, Wine, Package2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-context";
import AddressSearch from "@/components/ui/address-search";

// PortOne configuration
declare global {
  interface Window {
    PortOne: any;
  }
}

// 결제 폼 컴포넌트
function PaymentForm({ orderData, amount, customerInfo, createdOrder }: { 
  orderData: any;
  amount: number; 
  customerInfo: { 
    name: string; 
    email: string; 
    phone: string;
    address: string;
    zipCode: string;
  };
  createdOrder: any;
}) {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [, setLocation] = useLocation();

  const handlePayment = async () => {
    if (!window.PortOne) {
      toast({
        title: "결제 시스템 오류",
        description: "결제 시스템을 불러오는 중입니다. 잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (!createdOrder) {
      toast({
        title: "주문 정보 없음",
        description: "주문 정보가 없습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // 주문이 이미 생성되어 있으므로 바로 결제 시작
      const paymentResponse = await window.PortOne.requestPayment({
        storeId: "store-e4038486-8d83-41a5-acf1-844a009e0d94",
        paymentId: createdOrder.id,
        orderName: `와인 라벨 주문 - ${orderData.quantity}매`,
        totalAmount: amount,
        currency: "KRW",
        channelKey: "channel-key-fc5f33bb-c51e-4ac7-a0df-4dc40330046d",
        payMethod: "CARD",
        customer: {
          fullName: customerInfo.name,
          email: customerInfo.email,
          phoneNumber: customerInfo.phone,
        },
        redirectUrl: `${window.location.origin}/payment/success`,
        failRedirectUrl: `${window.location.origin}/payment/failure`,
        noticeUrls: [`${window.location.origin}/api/payment-webhook`],
        customData: {
          orderId: createdOrder.id,
        },
      });

      if (paymentResponse.code === "SUCCESS") {
        // Verify payment
        const verificationResponse = await apiRequest("POST", "/api/verify-payment", {
          orderId: createdOrder.id,
          paymentId: paymentResponse.paymentId,
          amount: amount,
        });

        const verificationData = await verificationResponse.json();

        if (verificationData.success) {
          const orderSummary = {
            orderId: createdOrder.id,
            paymentId: paymentResponse.paymentId,
            bottleType: orderData.bottleType,
            quantity: orderData.quantity,
            amount,
            customer: customerInfo,
            labelDesign: orderData.labelDesign
          };
          sessionStorage.setItem("lastOrder", JSON.stringify(orderSummary));

          toast({
            title: "결제 성공",
            description: "주문이 완료되었습니다!",
          });

          setLocation(`/payment/success?orderId=${createdOrder.id}`);
        } else {
          // 결제 검증 실패 - 결제 취소 또는 실패
          toast({
            title: "결제 실패",
            description: verificationData.message || "결제가 정상적으로 처리되지 않았습니다.",
            variant: "destructive",
          });
          
          // 3초 후 현재 페이지 새로고침 (주문 상태 갱신을 위해)
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        }
      } else if (paymentResponse.code === "CANCEL") {
        // 사용자가 결제를 취소한 경우
        // 주문 상태를 취소로 변경
        try {
          await fetch(`/api/orders/${createdOrder.id}/cancel`, {
            method: 'PATCH'
          });
          
          toast({
            title: "결제 취소",
            description: "사용자가 결제를 취소하였습니다.",
            variant: "destructive",
          });
        } catch (err) {
          console.error('주문 취소 처리 오류:', err);
          toast({
            title: "결제 취소",
            description: "결제가 취소되었습니다. 주문 상태 업데이트 중 오류가 발생했지만 결제는 취소되었습니다.",
            variant: "destructive",
          });
        }
        return; // 함수 종료하여 catch 블록으로 가지 않도록 함
      } else {
        // 기타 결제 실패 경우
        try {
          await fetch(`/api/orders/${createdOrder.id}/cancel`, {
            method: 'PATCH'
          });
        } catch (err) {
          console.error('주문 취소 처리 오류:', err);
        }
        throw new Error(paymentResponse.message || "결제 실패");
      }
    } catch (error: any) {
      toast({
        title: "결제 오류",
        description: error.message || "결제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Button 
        onClick={handlePayment}
        disabled={isProcessing}
        className="w-full bg-gradient-to-r from-[#ff00ff] to-[#cc00ff] hover:opacity-90 text-white py-6 rounded-lg font-medium flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,0,255,0.4)] transition-all hover:shadow-[0_0_25px_rgba(255,0,255,0.6)]"
      >
        {isProcessing ? (
          <div className="flex items-center">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            결제 처리 중...
          </div>
        ) : (
          <>
            <CreditCard className="w-5 h-5" /> {`${amount.toLocaleString()}원 결제하기`}
          </>
        )}
      </Button>
    </div>
  );
}

export default function Checkout() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    zipCode: ""
  });
  
  // 상세 주소를 별도로 관리 (추가)
  const [addressDetail, setAddressDetail] = useState("");
  
  // 생성된 주문 정보 저장 (추가)
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  
  // 배송 방식 선택 (기본값: 일반 배송)
  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  
  // 수량 선택 (기본값: 1)
  const [quantity, setQuantity] = useState(1);
  
  // 라벨 디자인 정보 저장
  const [labelDesign, setLabelDesign] = useState<any>(null);
  
  // 캡처된 라벨 이미지 URL 저장
  const [labelImageUrl, setLabelImageUrl] = useState<string | null>(null);
  // 전체 와인병 미리보기 이미지 URL 저장 (추가)
  const [bottlePreviewUrl, setBottlePreviewUrl] = useState<string | null>(null);

  // URL 파라미터에서 병 타입 가져오기
  const params = new URLSearchParams(window.location.search);
  const bottleId = params.get("bottleId") || "";

  // 와인병 정보 가져오기
  const getWineBottle = (bottleId: string) => {
    const bottles = [
      {
        id: "bordeaux-red",
        name: "까베르네쇼비뇽 레드",
        image: "/images/wine-bottle-1.png",
        type: "red",
        bottleType: "bordeaux",
        dimensions: "높이 30cm x 지름 7.5cm",
        capacity: "750ml",
        price: 5000,
      },
      {
        id: "bordeaux-white",
        name: "쇼비뇽블랑 화이트",
        image: "/images/wine-bottle-2.png",
        type: "white",
        bottleType: "bordeaux",
        dimensions: "높이 30cm x 지름 7.5cm",
        capacity: "750ml",
        price: 5200,
      },
      {
        id: "bordeaux-rose",
        name: "쇼비뇽블랑 로제",
        image: "/images/wine-bottle-3.png",
        type: "rose",
        bottleType: "bordeaux",
        dimensions: "높이 30cm x 지름 7.5cm",
        capacity: "750ml",
        price: 5500,
      },
      {
        id: "burgundy-red",
        name: "샤도네이 레드",
        image: "/images/wine-bottle-5.png",
        type: "red",
        bottleType: "burgundy",
        dimensions: "높이 29cm x 지름 8cm",
        capacity: "750ml",
        price: 5800,
      },
      {
        id: "burgundy-white",
        name: "샤도네이 화이트",
        image: "/images/wine-bottle-6.png",
        type: "white",
        bottleType: "burgundy",
        dimensions: "높이 29cm x 지름 8cm",
        capacity: "750ml",
        price: 5300,
      },
      {
        id: "burgundy-rose",
        name: "샤도네이 로제",
        image: "/images/wine-bottle-7.png",
        type: "rose",
        bottleType: "burgundy",
        dimensions: "높이 29cm x 지름 8cm",
        capacity: "750ml",
        price: 6000,
      }
    ];
    
    return bottles.find(bottle => bottle.id === bottleId) || bottles[0];
  };

  const bottleInfo = getWineBottle(bottleId);
  
  // 배송비 계산
  const getDeliveryFee = (method: string, basePrice: number) => {
    switch (method) {
      case "express":
        return 5000;
      case "same-day":
        return 8000;
      default:
        // 일반 배송: 3만원 이상 시 무료, 미만 시 3000원
        return basePrice >= 30000 ? 0 : 3000;
    }
  };
  
  // 총 금액 계산
  const calculateTotal = () => {
    const basePrice = bottleInfo.price * quantity;
    const deliveryFee = getDeliveryFee(deliveryMethod, basePrice);
    return basePrice + deliveryFee;
  };
  
  const totalAmount = calculateTotal();

  // sessionStorage에서 라벨 디자인 정보 불러오기
  useEffect(() => {
    const designData = sessionStorage.getItem('labelDesign');
    const imageData = sessionStorage.getItem('labelPreviewImage');
    const bottleImageData = sessionStorage.getItem('bottlePreviewImage'); // 추가
    
    console.log("라벨 이미지 데이터 있음:", !!imageData);
    console.log("와인병 전체 이미지 데이터 있음:", !!bottleImageData);
    
    if (designData) {
      try {
        setLabelDesign(JSON.parse(designData));
      } catch (error) {
        console.error('라벨 디자인 데이터 파싱 오류:', error);
        toast({
          title: "오류",
          description: "라벨 디자인 정보를 불러오는데 실패했습니다.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "라벨 디자인 없음",
        description: "먼저 와인 라벨을 디자인해주세요.",
        variant: "destructive",
      });
      navigate("/label-designer");
    }
    
    // 캡처된 라벨 이미지가 있으면 상태에 저장
    if (imageData) {
      setLabelImageUrl(imageData);
      console.log("라벨 이미지 URL 설정 완료");
    }
    
    // 캡처된 전체 와인병 미리보기 이미지가 있으면 상태에 저장
    if (bottleImageData) {
      setBottlePreviewUrl(bottleImageData);
      console.log("와인병 전체 이미지 URL 설정 완료");
    } else {
      console.log("와인병 전체 이미지가 없습니다.");
    }
    
    // 사용자 정보가 있다면 설정
    if (user) {
      setUserInfo(prev => ({
        ...prev,
        name: user.displayName || "",
        email: user.email || ""
      }));
    }
  }, []);

  // Load PortOne SDK
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.portone.io/v2/browser-sdk.js";
    script.async = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleUserInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullAddress = addressDetail ? `${userInfo.address} ${addressDetail}` : userInfo.address;
    
    if (!userInfo.name || !userInfo.email || !userInfo.address || !userInfo.zipCode) {
      toast({
        title: "입력 오류",
        description: "이름, 이메일, 배송지 주소를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerName: userInfo.name,
          customerEmail: userInfo.email,
          customerPhone: userInfo.phone,
          customerAddress: fullAddress,
          customerZipCode: userInfo.zipCode,
          bottleId: bottleInfo.id,
          bottleName: bottleInfo.name,
          labelDesign: labelDesign,
          labelImage: labelImageUrl,
          amount: totalAmount,
          quantity: quantity,
          deliveryMethod: deliveryMethod,
          deliveryFee: getDeliveryFee(deliveryMethod, bottleInfo.price * quantity),
          status: '결제대기',
          paymentStatus: '결제대기'
        })
      });

      const orderResult = await orderResponse.json();

      if (orderResult.success) {
        setCreatedOrder(orderResult.order);
        setShowPaymentForm(true);
        toast({
          title: "주문 생성 성공",
          description: "주문이 성공적으로 생성되었습니다.",
        });
      } else {
        toast({
          title: "주문 생성 실패",
          description: orderResult.message || "주문 생성에 실패했습니다.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "주문 생성 오류",
        description: error.message || "주문 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // 주소 검색 결과 처리 핸들러
  const handleAddressSelect = (selectedAddress: {
    roadAddr: string;
    siNm: string;
    sggNm: string;
    zipNo: string;
    latitude?: number;
    longitude?: number;
  }) => {
    // 선택한 주소와 우편번호를 상태에 저장
    setUserInfo({
      ...userInfo,
      address: selectedAddress.roadAddr,
      zipCode: selectedAddress.zipNo
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <section className="px-4 py-6 container mx-auto max-w-3xl">
        <Button 
          variant="outline" 
          size="sm" 
          className="mb-4 flex items-center gap-1 border-[#ff00ff]/50 text-[#ff00ff] hover:bg-[#ff00ff]/10 hover:border-[#ff00ff]/80 shadow-[0_0_10px_rgba(255,0,255,0.3)]"
          onClick={() => navigate("/label-designer/" + bottleId)}
        >
          <ArrowLeft className="w-4 h-4" /> 라벨 디자인으로 돌아가기
        </Button>
        <h1 className="text-3xl font-bold mb-6 text-white text-center">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ff00ff] to-[#00ffff] shadow-lg">
            주문하기
          </span>
        </h1>

        {/* 주문 요약 */}
        <Card className="bg-gray-800/60 border-[#ff00ff]/30 border mb-6 backdrop-blur-md shadow-[0_0_20px_rgba(255,0,255,0.2)]">
          <CardHeader className="border-b border-gray-700">
            <CardTitle className="text-lg text-[#00ffff] text-shadow-neon">주문 정보</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center mb-6">
              <div className="w-24 h-32 mr-4 relative glow-effect-blue">
                <img src={bottleInfo.image} alt={bottleInfo.name} className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="font-medium text-white text-lg">{bottleInfo.name}</h3>
                <p className="text-gray-300">와인 라벨 {quantity}매</p>
                <p className="font-medium text-[#ff00ff] text-xl mt-1">{bottleInfo.price.toLocaleString()}원/매</p>
              </div>
            </div>
            
            {/* 라벨 디자인 미리보기 */}
            <div className="mb-6">
              <h3 className="font-medium mb-3 text-[#00ffff]">라벨 디자인 미리보기</h3>
              <div className="bg-gray-800/80 p-4 rounded-lg border border-[#00ffff]/30 shadow-[0_0_15px_rgba(0,255,255,0.2)] relative">
                {bottlePreviewUrl ? (
                  // 와인병 전체 미리보기
                  <div className="flex justify-center">
                    <img 
                      src={bottlePreviewUrl}
                      alt="와인병 미리보기" 
                      className="max-w-full h-auto rounded"
                      onLoad={() => console.log("와인병 전체 이미지 로드 완료")}
                      onError={(e) => console.error("와인병 이미지 로드 실패:", e)}
                    />
                  </div>
                ) : labelImageUrl ? (
                  // 라벨 이미지만 있는 경우 대체 표시
                  <div className="flex flex-col items-center">
                    {/* 실제 크기 표시 */}
                    <div className="text-white text-xs mb-2 bg-black/50 px-2 py-1 rounded-full">
                      실제 라벨 크기: {bottleInfo.type === 'burgundy' ? '7.94cm × 7.44cm' : '6.94cm × 7.94cm'}
                    </div>
                    
                    {/* 와인병 위에 라벨 표시 */}
                    <div className="relative">
                      {/* 와인병 이미지 */}
                      <img 
                        src={bottleInfo.image} 
                        alt={bottleInfo.name}
                        className="h-[450px] object-contain"
                      />
                      
                      {/* 라벨 오버레이 */}
                      <div className="absolute" style={{
                        top: '60%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: bottleInfo.type === 'burgundy' ? '140px' : '120px',
                      }}>
                        <img 
                          src={labelImageUrl}
                          alt="와인 라벨 디자인" 
                          className="w-full h-auto object-contain rounded"
                          style={{
                            border: '1px dashed rgba(0, 255, 255, 0.3)'
                          }}
                          onLoad={() => console.log("라벨 이미지 로드 완료")}
                          onError={(e) => console.error("라벨 이미지 로드 실패:", e)}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-40 text-gray-400">
                    <p>라벨 이미지를 불러오는 중...</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-4 text-gray-100">
              <div className="flex justify-between">
                <span>상품 가격</span>
                <span className="font-medium text-white">{(bottleInfo.price * quantity).toLocaleString()}원</span>
              </div>
              
              <div className="mb-4">
                <Label className="mb-2 block text-[#00ffff]">수량</Label>
                <Select value={quantity.toString()} onValueChange={(value) => setQuantity(parseInt(value))}>
                  <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-white focus:ring-[#00ffff]/50 focus:border-[#00ffff]/50">
                    <SelectValue placeholder="수량 선택" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600 text-white">
                    {[1, 2, 3, 4, 5, 10, 20, 30, 50, 100].map(num => (
                      <SelectItem key={num} value={num.toString()} className="hover:bg-gray-700 focus:bg-gray-700">{num}매</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="mb-4">
                <Label className="mb-2 block text-[#00ffff]">배송 방법</Label>
                <RadioGroup value={deliveryMethod} onValueChange={setDeliveryMethod} className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2 bg-gray-800/60 p-3 rounded-lg border border-gray-700 hover:border-[#ff00ff]/50 transition-colors">
                    <RadioGroupItem value="standard" id="standard-delivery" className="text-[#ff00ff] focus:ring-[#ff00ff]" />
                    <Label htmlFor="standard-delivery" className="flex items-center cursor-pointer w-full">
                      <Truck className="w-5 h-5 mr-2 text-gray-300" />
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="font-medium text-white">일반 배송</span>
                          {(bottleInfo.price * quantity) >= 30000 ? (
                            <span className="text-sm text-green-400 ml-2 font-semibold">(무료배송)</span>
                          ) : (
                            <span className="text-sm text-gray-400 ml-2">(3,000원)</span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">3만원 이상 주문시 무료배송</span>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="flex justify-between">
                <span>배송비</span>
                <span className="font-medium text-white">
                  {getDeliveryFee(deliveryMethod, bottleInfo.price * quantity) === 0 ? 
                    <span className="text-green-400">무료</span> : 
                    `${getDeliveryFee(deliveryMethod, bottleInfo.price * quantity).toLocaleString()}원`
                  }
                </span>
              </div>
              
              <Separator className="border-gray-700" />
              <div className="flex justify-between text-xl font-bold">
                <span className="text-white">총 금액</span>
                <span className="text-[#ff00ff] glow-text-pink">{totalAmount.toLocaleString()}원</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 배송지 정보 폼 */}
        {!showPaymentForm && (
          <Card className="bg-gray-800/60 border-[#00ffff]/30 border mb-6 backdrop-blur-md shadow-[0_0_20px_rgba(0,255,255,0.2)]">
            <CardHeader className="border-b border-gray-700">
              <CardTitle className="text-lg text-[#00ffff] text-shadow-neon">배송지 정보</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleUserInfoSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-white">이름 *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={userInfo.name}
                    onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white focus:ring-[#00ffff]/50 focus:border-[#00ffff]/50"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-white">이메일 *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userInfo.email}
                    onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white focus:ring-[#00ffff]/50 focus:border-[#00ffff]/50"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-white">전화번호</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={userInfo.phone}
                    onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white focus:ring-[#00ffff]/50 focus:border-[#00ffff]/50"
                  />
                </div>
                
                {/* 주소 검색 기능 추가 */}
                <div className="pt-2">
                  <Label className="text-white mb-2 block">주소 검색 *</Label>
                  <AddressSearch onSelect={handleAddressSelect} />
                </div>
                
                <div>
                  <Label htmlFor="zipCode" className="text-white">우편번호 *</Label>
                  <Input
                    id="zipCode"
                    type="text"
                    value={userInfo.zipCode}
                    onChange={(e) => setUserInfo({ ...userInfo, zipCode: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white focus:ring-[#00ffff]/50 focus:border-[#00ffff]/50"
                    required
                    readOnly
                  />
                </div>
                <div>
                  <Label htmlFor="address" className="text-white">배송지 주소 *</Label>
                  <Input
                    id="address"
                    type="text"
                    value={userInfo.address}
                    onChange={(e) => setUserInfo({ ...userInfo, address: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white focus:ring-[#00ffff]/50 focus:border-[#00ffff]/50"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="addressDetail" className="text-white">상세 주소</Label>
                  <Input
                    id="addressDetail"
                    type="text"
                    value={addressDetail}
                    placeholder="아파트, 동/호수, 상세주소 입력"
                    className="bg-gray-800 border-gray-600 text-white focus:ring-[#00ffff]/50 focus:border-[#00ffff]/50"
                    onChange={(e) => setAddressDetail(e.target.value)}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-[#00ffff] to-[#0099ff] hover:opacity-90 text-black font-medium py-6 shadow-[0_0_15px_rgba(0,255,255,0.4)] transition-all hover:shadow-[0_0_20px_rgba(0,255,255,0.6)]"
                >
                  <Home className="w-5 h-5 mr-2" /> 배송지 입력 완료
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* 결제 폼 */}
        {showPaymentForm && (
          <PaymentForm 
            orderData={{
              bottleType: bottleInfo,
              quantity,
              labelDesign: labelDesign,
              deliveryMethod
            }}
            amount={totalAmount} 
            customerInfo={{
              ...userInfo,
              address: addressDetail ? `${userInfo.address} ${addressDetail}` : userInfo.address
            }}
            createdOrder={createdOrder}
          />
        )}
      </section>
    </div>
  );
}
