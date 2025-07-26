import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wine, Globe, LogIn, User, LogOut } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";

export default function Header() {
  const { language, setLanguage, refreshKey } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const [currentLang, setCurrentLang] = useState<string>(language);

  // 컴포넌트 마운트 시 현재 언어 설정
  useEffect(() => {
    setCurrentLang(language);
    console.log("Header - 현재 언어:", language, "리프레시 키:", refreshKey);
  }, [language, refreshKey]);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  const handleLanguageChange = (value: string) => {
    console.log("언어 변경 요청:", value);
    setCurrentLang(value);
    setLanguage(value as "ko" | "en" | "ja" | "zh");
  };

  // 언어 이름 표시 함수
  const getLanguageDisplay = (lang: string) => {
    switch (lang) {
      case "ko":
        return "한국어";
      case "en":
        return "English";
      case "ja":
        return "日本語";
      case "zh":
        return "中文";
      default:
        return lang;
    }
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <Wine className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-white">끄레망 와인라벨</span>
          </div>
        </Link>

        <div className="flex items-center space-x-3">
          <div className="relative z-10">
            <Select
              value={currentLang}
              onValueChange={handleLanguageChange}
              defaultValue={currentLang}
            >
              <SelectTrigger className="w-28 bg-gray-800 border-gray-700 h-9">
                <Globe className="w-4 h-4 mr-2" />
                <SelectValue placeholder="언어 선택">
                  {getLanguageDisplay(currentLang)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="ko">한국어</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ja">日本語</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.photoURL} alt={user?.displayName} />
                    <AvatarFallback className="bg-primary text-white">
                      {user?.displayName?.charAt(0) ||
                        user?.username?.charAt(0) ||
                        "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 bg-gray-800 border-gray-700 text-white"
                align="end"
              >
                <DropdownMenuLabel>내 계정</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem className="text-gray-300 focus:bg-gray-700 focus:text-white cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>프로필</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-gray-300 focus:bg-gray-700 focus:text-white cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>로그아웃</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button
                variant="outline"
                className="px-3 py-1 text-primary border-primary text-sm flex items-center gap-1"
              >
                <LogIn className="h-4 w-4" />
                로그인
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
