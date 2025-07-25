import { CreditCard, Minus, Plus, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { DesignState } from "@/hooks/use-design-state";

interface PaymentSectionProps {
  design: DesignState;
  onQuantityUpdate: (quantity: number) => void;
  onSaveDesign: () => Promise<string>;
}

const LABEL_PRICE = 25000;
const SHIPPING_PRICE = 3000;

export default function PaymentSection({ design, onQuantityUpdate, onSaveDesign }: PaymentSectionProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const saveAndCheckout = useMutation({
    mutationFn: async () => {
      const designId = await onSaveDesign();
      return designId;
    },
    onSuccess: (designId) => {
      setLocation(`/checkout/${designId}`);
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error.message || "디자인 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const subtotal = LABEL_PRICE * design.quantity;
  const total = subtotal + SHIPPING_PRICE;

  return (
    <Card className="notion-card rounded-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center text-notion-text-primary">
          <CreditCard className="mr-2 text-green-400 w-5 h-5" />
          주문 및 결제
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Order Summary */}
          <div className="notion-card rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-notion-text-secondary">커스텀 와인라벨</span>
              <span className="font-semibold text-notion-text-primary">₩{LABEL_PRICE.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-notion-text-secondary">배송비</span>
              <span className="font-semibold text-notion-text-primary">₩{SHIPPING_PRICE.toLocaleString()}</span>
            </div>
            <hr className="border-notion-border my-2" />
            <div className="flex justify-between items-center">
              <span className="font-semibold text-notion-text-primary">총 금액</span>
              <span className="font-bold text-lg text-notion-text-primary">₩{total.toLocaleString()}</span>
            </div>
          </div>

          {/* Quantity Selection */}
          <div>
            <Label className="block text-sm text-notion-text-secondary mb-2">수량</Label>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                className="w-10 h-10 rounded-lg notion-card border-notion-border hover:bg-notion-border"
                onClick={() => onQuantityUpdate(design.quantity - 1)}
                disabled={design.quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-16 text-center font-semibold text-notion-text-primary">
                {design.quantity}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="w-10 h-10 rounded-lg notion-card border-notion-border hover:bg-notion-border"
                onClick={() => onQuantityUpdate(design.quantity + 1)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Payment Button */}
          <Button
            className="w-full py-4 notion-button rounded-lg font-semibold"
            onClick={() => saveAndCheckout.mutate()}
            disabled={saveAndCheckout.isPending}
          >
            <Lock className="mr-2 w-4 h-4" />
            {saveAndCheckout.isPending ? "저장 중..." : "안전하게 결제하기"}
          </Button>

          {/* Payment Methods */}
          <div className="flex items-center justify-center space-x-4 pt-2">
            <div className="text-2xl">💳</div>
            <div className="text-2xl">📱</div>
            <span className="text-xs text-notion-text-muted">Powered by Stripe</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
