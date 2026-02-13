import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';

interface LoginFormProps {
  onToggleMode: () => void;
  isRegisterMode: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onToggleMode, isRegisterMode }) => {
  const { login, register, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    display_name: '',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 이미 로그인된 사용자는 홈으로 리다이렉션
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(''); // 입력 시 에러 메시지 제거
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isRegisterMode) {
        if (!formData.username || !formData.email || !formData.password) {
          setError('모든 필수 필드를 입력해주세요.');
          return;
        }
        await register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          display_name: formData.display_name || formData.username,
        });
        navigate('/');
      } else {
        if (!formData.username || !formData.password) {
          setError('사용자명과 비밀번호를 입력해주세요.');
          return;
        }
        await login({
          username: formData.username,
          password: formData.password,
        });
        navigate('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    }
  };

  const handleToggleMode = () => {
    if (isRegisterMode) {
      navigate('/login');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-0 shadow-2xl rounded-2xl">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <span className="text-2xl font-bold text-white">바</span>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            {isRegisterMode ? '회원가입' : '로그인'}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {isRegisterMode 
              ? '디컴소프트 계정을 만들어보세요' 
              : '디컴소프트에 오신 것을 환영합니다'
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                사용자명 {isRegisterMode && '또는 이메일'}
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                placeholder={isRegisterMode ? "사용자명을 입력하세요" : "사용자명 또는 이메일"}
                className="h-11 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                disabled={isLoading}
              />
            </div>

            {isRegisterMode && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    이메일 주소
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="이메일을 입력하세요"
                    className="h-11 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display_name" className="text-sm font-medium text-gray-700">
                    표시 이름 (선택사항)
                  </Label>
                  <Input
                    id="display_name"
                    name="display_name"
                    type="text"
                    value={formData.display_name}
                    onChange={handleInputChange}
                    placeholder="표시할 이름을 입력하세요"
                    className="h-11 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                    disabled={isLoading}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                비밀번호
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="비밀번호를 입력하세요"
                  className="h-11 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 pr-10"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {isRegisterMode && (
                <p className="text-xs text-gray-500">최소 6자 이상 입력해주세요</p>
              )}
            </div>

            {error && (
              <Alert className="bg-red-50 border-red-200 rounded-xl">
                <AlertDescription className="text-red-700 text-sm">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  처리 중...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {isRegisterMode ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                  {isRegisterMode ? '회원가입' : '로그인'}
                </div>
              )}
            </Button>
          </form>

          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              {isRegisterMode ? '이미 계정이 있으신가요?' : '계정이 없으신가요?'}
              <button
                onClick={handleToggleMode}
                className="ml-2 text-blue-600 hover:text-blue-700 font-medium hover:underline"
                disabled={isLoading}
              >
                {isRegisterMode ? '로그인' : '회원가입'}
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 