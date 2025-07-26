import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle } from 'lucide-react';

export default function PaymentFailure() {
  const [, setLocation] = useLocation();
  const [errorInfo, setErrorInfo] = useState<{
    code?: string;
    message?: string;
    orderName?: string;
  }>({});

  useEffect(() => {
    // URL에서 오류 정보 파라미터 가져오기
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code') || undefined;
    const message = searchParams.get('message') || undefined;
    const orderName = searchParams.get('orderName') || undefined;
    
    console.log('결제 실패 정보:', { code, message, orderName });
    
    setErrorInfo({
      code: code || 'UNKNOWN',
      message: message || '결제 처리 중 오류가 발생했습니다.',
      orderName
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold flex items-center justify-center gap-2">
            <XCircle className="text-red-500 h-6 w-6" />
            결제 실패
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-gray-700/50 p-4 rounded-lg space-y-3">
              {errorInfo.orderName && (
                <div className="flex justify-between">
                  <span className="text-gray-400">주문명</span>
                  <span>{errorInfo.orderName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">오류 코드</span>
                <span>{errorInfo.code}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-400 mb-1">오류 메시지</span>
                <span className="text-red-400">{errorInfo.message}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button 
                className="w-full bg-primary hover:bg-primary/90" 
                onClick={() => window.history.back()}
              >
                다시 시도하기
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => setLocation('/')}
              >
                홈으로 돌아가기
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 