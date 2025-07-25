import { useEffect, useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Lock, CreditCard } from "lucide-react";
import Navigation from "@/components/navigation";

declare global {
  interface Window {
    IMP: any;
  }
}

const CheckoutForm = ({ designId }: { designId: string }) => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Load Portone script
    const script = document.createElement('script');
    script.src = 'https://cdn.iamport.kr/v1/iamport.js';
    script.async = true;
    document.head.appendChild(script);
    
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const createPayment = useMutation({
    mutationFn: async (paymentData: any) => {
      const response = await apiRequest('/api/create-payment', {
        method: 'POST',
        body: paymentData,
      });
      return response;
    },
  });

  const handleSubmit = async () => {
    setIsProcessing(true);

    try {
      // Get design and create payment
      const LABEL_PRICE = 25000;
      const SHIPPING_PRICE = 3000;
      const totalAmount = LABEL_PRICE + SHIPPING_PRICE;

      const paymentResult = await createPayment.mutateAsync({
        amount: totalAmount,
        designId: designId,
        quantity: 1
      });

      // Initialize Portone payment
      if (window.IMP) {
        window.IMP.init('imp_code'); // Replace with your actual Portone IMP code
        
        window.IMP.request_pay({
          pg: 'kakaopay.TC0ONETIME', // 카카오페이
          pay_method: 'card',
          merchant_uid: paymentResult.merchant_uid,
          name: paymentResult.name,
          amount: paymentResult.amount,
          buyer_name: paymentResult.buyer_name,
        }, (response: any) => {
          if (response.success) {
            // Payment successful
            toast({
              title: "결제 성공",
              description: "주문해 주셔서 감사합니다!",
            });
            setLocation('/?payment=success');
          } else {
            // Payment failed
            toast({
              title: "결제 실패",
              description: response.error_msg || "결제 중 오류가 발생했습니다.",
              variant: "destructive",
            });
          }
          setIsProcessing(false);
        });
      } else {
        throw new Error('Portone이 로드되지 않았습니다.');
      }
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message || "결제 준비 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <Card className="notion-card rounded-xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-center text-notion-text-primary flex items-center justify-center">
          <CreditCard className="mr-2 w-5 h-5 text-green-400" />
          결제 정보
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Payment Summary */}
          <div className="notion-card rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-notion-text-secondary">커스텀 와인라벨</span>
              <span className="font-semibold text-notion-text-primary">₩25,000</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-notion-text-secondary">배송비</span>
              <span className="font-semibold text-notion-text-primary">₩3,000</span>
            </div>
            <hr className="border-notion-border my-2" />
            <div className="flex justify-between items-center">
              <span className="font-semibold text-notion-text-primary">총 결제금액</span>
              <span className="font-bold text-lg text-green-400">₩28,000</span>
            </div>
          </div>

          {/* Payment Methods Info */}
          <div className="text-center text-sm text-notion-text-secondary">
            <p>카카오페이, 신용카드, 계좌이체 등</p>
            <p>다양한 결제 수단을 지원합니다</p>
          </div>

          <Button 
            onClick={handleSubmit}
            className="w-full py-4 notion-button rounded-lg font-semibold"
            disabled={isProcessing}
          >
            <Lock className="mr-2 w-4 h-4" />
            {isProcessing ? "결제 처리 중..." : "결제하기"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Checkout() {
  const [match, params] = useRoute('/checkout/:designId');

  const designId = params?.designId;

  // Fetch design details
  const { data: design, isLoading: designLoading } = useQuery({
    queryKey: ['/api/wine-designs', designId],
    enabled: !!designId,
  });

  if (!match) {
    return <div>페이지를 찾을 수 없습니다.</div>;
  }

  if (designLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--notion-bg)" }}>
        <div className="animate-spin w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--notion-bg)" }}>
      <Navigation />
      
      <main className="pt-16 pb-20 px-4 max-w-md mx-auto space-y-6">
        {/* Back button */}
        <Button
          variant="ghost"
          className="flex items-center text-notion-text-secondary hover:text-notion-text-primary"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          디자인으로 돌아가기
        </Button>

        <CheckoutForm designId={designId!} />
      </main>
    </div>
  );
}