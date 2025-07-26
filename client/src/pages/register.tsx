import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/auth-context";
import { UserPlus, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { UserType } from "@/contexts/auth-context";

export default function RegisterPage() {
  const [location, setLocation] = useLocation();
  const { register, isLoading, error } = useAuth();
  
  // userType을 'user'로 고정
  const userType: UserType = "user";
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setLocalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // 유효성 검사
    if (!formData.username || !formData.email || !formData.password) {
      setLocalError("모든 필수 필드를 입력해주세요.");
      return;
    }

    if (formData.password.length < 6) {
      setLocalError("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName || formData.username,
        userType: userType
      });
      setLocation("/");
    } catch (error) {
      // 에러는 AuthContext에서 처리됨
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">회원가입</CardTitle>
          <CardDescription className="text-gray-400">
            계정을 생성하여 서비스를 이용하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">사용자명 *</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="사용자명을 입력하세요"
                value={formData.username}
                onChange={handleChange}
                disabled={isLoading}
                className="bg-gray-700 border-gray-600"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">이메일 *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                className="bg-gray-700 border-gray-600"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="displayName">표시 이름 (선택사항)</Label>
              <Input
                id="displayName"
                name="displayName"
                type="text"
                placeholder="다른 사용자에게 보여질 이름"
                value={formData.displayName}
                onChange={handleChange}
                disabled={isLoading}
                className="bg-gray-700 border-gray-600"
              />
              <p className="text-xs text-gray-400">입력하지 않으면 사용자명이 표시됩니다.</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호 *</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="bg-gray-700 border-gray-600 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-400">최소 6자 이상 입력해주세요</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">비밀번호 확인 *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="bg-gray-700 border-gray-600 pr-10"
                />
              </div>
            </div>

            {(error || localError) && (
              <Alert variant="destructive" className="bg-red-900/50 border-red-900 text-red-300">
                <AlertDescription>{localError || error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  처리 중...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  회원가입
                </div>
              )}
            </Button>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-400">
                이미 계정이 있으신가요?{" "}
                <Link href="/login">
                  <Button
                    variant="link"
                    className="p-0 h-auto font-normal text-primary"
                  >
                    로그인
                  </Button>
                </Link>
              </p>
            </div>
            
            <div className="pt-4">
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="w-full flex items-center gap-2 bg-gray-700 hover:bg-gray-600"
                >
                  <ArrowLeft className="h-4 w-4" />
                  로그인 페이지로 돌아가기
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 