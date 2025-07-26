import { useEffect, useState } from "react";
import type { StorageUnit } from "@shared/schema";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface OrderSummary {
  orderId: string;
  paymentId: string;
  unitNumber: string;
  unitSize: string;
  period: string;
  daysBetween: number;
  amount: number;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
}

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);

  useEffect(() => {
    // URL에서 paymentId 파라미터 추출
    const searchParams = new URLSearchParams(window.location.search);
    const paymentIdParam = searchParams.get("paymentId");
    
    if (!paymentIdParam) {
      setError("결제 정보를 찾을 수 없습니다.");
      setLoading(false);
      return;
    }
    
    setPaymentId(paymentIdParam);
    
    // 결제 완료 처리 API 호출
    const completePayment = async () => {
      try {
        const response = await fetch("/api/payment/complete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ paymentId: paymentIdParam }),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "결제 완료 처리 중 오류가 발생했습니다.");
        }
        
        // 세션 스토리지에서 주문 정보 로드
        const stored = sessionStorage.getItem("lastOrder");
        if (stored) {
          try {
            setOrderSummary(JSON.parse(stored));
          } catch {}
        }
        setLoading(false);
      } catch (error) {
        console.error("결제 완료 처리 오류:", error);
        setError(error instanceof Error ? error.message : "결제 완료 처리 중 오류가 발생했습니다.");
        setLoading(false);
      }
    };
    
    completePayment();
  }, []);
  
  const handleGoToReservations = () => {
    setLocation("/profile/reservations");
  };
  
  const handleGoToHome = () => {
    setLocation("/");
  };
  
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white">결제 완료</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center py-8">
              <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
              <p className="mt-4 text-gray-300">결제 정보를 확인하는 중입니다...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-500 text-xl mb-4">오류 발생</div>
              <p className="text-gray-300 mb-6">{error}</p>
              <Button onClick={handleGoToHome} className="w-full">
                홈으로 돌아가기
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">결제가 성공적으로 완료되었습니다</h3>
              <p className="text-gray-300 mb-6">
                예약이 확정되었습니다. 마이페이지에서 예약 내역을 확인할 수 있습니다.
              </p>

              {orderSummary && (
                <div className="text-left bg-gray-900/50 p-4 rounded-lg mb-6 space-y-2">
                  <h4 className="text-primary font-semibold mb-2">주문 정보</h4>
                  <div className="flex justify-between text-sm"><span>주문 번호</span><span>{orderSummary.orderId}</span></div>
                  <div className="flex justify-between text-sm"><span>결제 ID</span><span>{orderSummary.paymentId}</span></div>
                  <div className="flex justify-between text-sm"><span>로커 번호</span><span>{orderSummary.unitNumber}</span></div>
                  <div className="flex justify-between text-sm"><span>보관함 크기</span><span>{orderSummary.unitSize}</span></div>
                  <div className="flex justify-between text-sm"><span>이용 기간</span><span>{orderSummary.period === 'daily' ? `${orderSummary.daysBetween}일` : orderSummary.period}</span></div>
                  <div className="flex justify-between text-sm"><span>총 결제 금액</span><span>{orderSummary.amount.toLocaleString()}원</span></div>
                  <h4 className="text-primary font-semibold mt-4 mb-2">계약자 정보</h4>
                  <div className="flex justify-between text-sm"><span>이름</span><span>{orderSummary.customer.name}</span></div>
                  <div className="flex justify-between text-sm"><span>이메일</span><span>{orderSummary.customer.email}</span></div>
                  {orderSummary.customer.phone && (
                    <div className="flex justify-between text-sm"><span>전화번호</span><span>{orderSummary.customer.phone}</span></div>
                  )}
                </div>
              )}
              <div className="space-y-3">
                <Button onClick={handleGoToReservations} className="w-full">
                  예약 내역 확인하기
                </Button>
                <Button onClick={handleGoToHome} variant="outline" className="w-full bg-transparent border-gray-600 hover:bg-gray-700">
                  홈으로 돌아가기
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 