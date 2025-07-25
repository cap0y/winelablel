import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Lock } from "lucide-react";
import Navigation from "@/components/navigation";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ designId }: { designId: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    if (!stripe || !elements) {
      setIsProcessing(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/?payment=success`,
      },
    });

    if (error) {
      toast({
        title: "결제 실패",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "결제 성공",
        description: "주문해 주셔서 감사합니다!",
      });
    }
    setIsProcessing(false);
  };

  return (
    <Card className="notion-card rounded-xl">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-center text-notion-text-primary">
          결제 정보
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <PaymentElement 
            options={{
              layout: "tabs"
            }}
          />
          <Button 
            type="submit" 
            className="w-full py-4 notion-button rounded-lg font-semibold"
            disabled={!stripe || !elements || isProcessing}
          >
            <Lock className="mr-2 w-4 h-4" />
            {isProcessing ? "결제 처리 중..." : "결제 완료"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default function Checkout() {
  const [match, params] = useRoute('/checkout/:designId');
  const [clientSecret, setClientSecret] = useState("");
  const { toast } = useToast();

  const designId = params?.designId;

  // Fetch design details
  const { data: design, isLoading: designLoading } = useQuery({
    queryKey: ['/api/wine-designs', designId],
    enabled: !!designId,
  });

  useEffect(() => {
    if (!designId || !design) return;

    // Create PaymentIntent as soon as the page loads
    const amount = 28000; // 25000 + 3000 shipping
    const quantity = 1;

    apiRequest("POST", "/api/create-payment-intent", { 
      amount, 
      designId,
      quantity 
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
      })
      .catch((error) => {
        toast({
          title: "오류",
          description: "결제 준비 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      });
  }, [designId, design]);

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

  if (!clientSecret) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "var(--notion-bg)" }}>
        <Navigation />
        <div className="pt-16 pb-20 px-4 max-w-md mx-auto flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full" />
        </div>
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

        {/* Order Summary */}
        <Card className="notion-card rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-notion-text-primary">
              주문 요약
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-notion-text-secondary">커스텀 와인라벨</span>
                <span className="text-notion-text-primary">₩25,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-notion-text-secondary">배송비</span>
                <span className="text-notion-text-primary">₩3,000</span>
              </div>
              <hr className="border-notion-border" />
              <div className="flex justify-between font-semibold text-lg">
                <span className="text-notion-text-primary">총액</span>
                <span className="text-notion-text-primary">₩28,000</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm designId={designId!} />
        </Elements>

        {/* Security Info */}
        <div className="text-center text-xs text-notion-text-muted">
          <p>🔒 SSL로 보호되는 안전한 결제</p>
          <p>Powered by Stripe</p>
        </div>
      </main>
    </div>
  );
}
