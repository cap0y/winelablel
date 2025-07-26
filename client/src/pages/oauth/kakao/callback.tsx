import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signInWithCustomToken } from "firebase/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// 카카오 로그인 콜백 처리 페이지
export default function KakaoCallback() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processKakaoLogin = async () => {
      try {
        // URL에서 인증 코드 추출
        const urlParams = new URLSearchParams(window.location.search);
        const authCode = urlParams.get("code");

        if (!authCode) {
          throw new Error("인증 코드를 찾을 수 없습니다.");
        }

        console.log("카카오 인증 코드:", authCode);

        // 백엔드 API가 구현되지 않았으므로 임시 처리
        // 실제로는 이 코드를 서버에 보내서 처리해야 함
        
        // 로컬 스토리지에 임시 사용자 정보 저장 (개발용)
        localStorage.setItem("auth_user", JSON.stringify({
          id: "kakao_" + Date.now(),
          username: "kakao_user",
          email: "kakao_user@example.com",
          displayName: "카카오 사용자",
          photoURL: "https://via.placeholder.com/150",
          provider: "kakao"
        }));
        
        // 로그인 성공 메시지 표시
        console.log("카카오 로그인 성공 (개발 모드)");
        
        // 홈페이지로 리디렉션
        setTimeout(() => {
          setLocation("/");
        }, 1000);
      } catch (error) {
        console.error("카카오 로그인 콜백 처리 오류:", error);
        setError(error instanceof Error ? error.message : "카카오 로그인 처리 중 오류가 발생했습니다.");
        
        // 오류 발생 시 3초 후 로그인 페이지로 리디렉션
        setTimeout(() => {
          setLocation("/login");
        }, 3000);
      }
    };

    processKakaoLogin();
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
          {error ? (
            <>
              <h2 className="text-xl font-bold text-red-500">로그인 오류</h2>
              <p className="text-gray-400 text-center">{error}</p>
              <p className="text-gray-500 text-sm text-center">
                잠시 후 로그인 페이지로 이동합니다...
              </p>
            </>
          ) : (
            <>
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <h2 className="text-xl font-bold">카카오 로그인 처리 중</h2>
              <p className="text-gray-400 text-center">
                잠시만 기다려주세요. 로그인 정보를 처리하고 있습니다.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 