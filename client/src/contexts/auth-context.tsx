import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { userApi } from '@/services/api';

// 슈퍼 관리자 이메일 설정
const SUPER_ADMIN_EMAIL = "admin@gmail.com";

export type UserType = 'user' | 'franchise' | 'admin';

interface User {
  id: number;
  username: string;
  email: string;
  displayName: string;
  photoURL?: string;
  userType: UserType;
  isApproved?: boolean; // 가맹점 승인 여부
  partnerId?: string; // 포트원 파트너 ID
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
  username: string;
  displayName?: string;
  userType?: UserType;
  franchiseInfo?: {
    name: string;
    address: string;
    phone: string;
    isApproved: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 초기 로드 시 로그인 상태 확인
  useEffect(() => {
    // 로컬 스토리지에서 로그인 상태 확인
    const checkAuthStatus = async () => {
      const userJson = localStorage.getItem('auth_user');
      if (userJson) {
        try {
          const userData = JSON.parse(userJson);
          if (userData && userData.id) {
            setUser(userData);
          } else {
            localStorage.removeItem('auth_user');
            setUser(null);
          }
        } catch (e) {
          console.error('로컬 스토리지 사용자 정보 파싱 오류:', e);
          localStorage.removeItem('auth_user');
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    
    checkAuthStatus();
  }, []);

  // 이메일 로그인
  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 백엔드 로그인 API 호출
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '로그인에 실패했습니다.');
      }
      
      // 사용자 정보 저장
      const userData = data.user;
      
      // 슈퍼 관리자 확인 및 권한 설정
      if (userData.email === SUPER_ADMIN_EMAIL && userData.userType !== 'admin') {
        userData.userType = 'admin';
        userData.isApproved = true;
      }
      
      setUser(userData);
      
      // 로컬 스토리지에 사용자 정보 저장
      localStorage.setItem('auth_user', JSON.stringify(userData));
    } catch (error: any) {
      console.error('로그인 오류:', error);
      setError(error.message || '로그인 중 오류가 발생했습니다.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 회원가입
  const register = async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // 백엔드 회원가입 API 호출
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: credentials.username,
          email: credentials.email,
          password: credentials.password,
          displayName: credentials.displayName || credentials.username,
          userType: credentials.userType || 'user',
          franchiseInfo: credentials.franchiseInfo,
          isApproved: credentials.email === SUPER_ADMIN_EMAIL ? true : 
                     (credentials.userType === 'admin' ? true : false)
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '회원가입에 실패했습니다.');
      }
      
      // 사용자 정보 저장
      const userData = data.user;
      setUser(userData);
      
      // 로컬 스토리지에 사용자 정보 저장
      localStorage.setItem('auth_user', JSON.stringify(userData));
    } catch (error: any) {
      console.error('회원가입 오류:', error);
      setError(error.message || '회원가입 중 오류가 발생했습니다.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 로그아웃
  const logout = async () => {
    setIsLoading(true);
    
    try {
      // 로컬 스토리지에서 사용자 정보 삭제
      localStorage.removeItem('auth_user');
      setUser(null);
    } catch (error: any) {
      console.error('로그아웃 오류:', error);
      setError('로그아웃 중 오류가 발생했습니다.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // 개발 중 HMR 로 인한 이중 번들 문제 대응 – fallback 값 반환
    console.warn('useAuth called outside AuthProvider');
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: async () => {},
      register: async () => {},
      logout: async () => {},
    } as any;
  }
  return context;
} 