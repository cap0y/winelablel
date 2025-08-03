import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wine,
  Globe,
  LogIn,
  User,
  LogOut,
  Bell,
  Truck,
  Package,
} from "lucide-react";
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

// 알림 인터페이스
interface Notification {
  id: string;
  type: "shipping" | "order" | "system";
  title: string;
  message: string;
  orderId?: string;
  isRead: boolean;
  createdAt: string;
}

export default function Header() {
  const { language, setLanguage, refreshKey } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const [currentLang, setCurrentLang] = useState<string>(language);

  // 알림 관련 상태
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // 컴포넌트 마운트 시 현재 언어 설정
  useEffect(() => {
    setCurrentLang(language);
    console.log("Header - 현재 언어:", language, "리프레시 키:", refreshKey);
  }, [language, refreshKey]);

  // 알림 조회 함수
  const fetchNotifications = async () => {
    if (!isAuthenticated || !user?.email) return;

    try {
      // 관리자 확인 로직 수정: userType === 'admin' 또는 isSuperUser로 확인
      const isAdmin = user.userType === "admin" || user.isSuperUser;
      const endpoint = isAdmin
        ? "/api/admin/notifications"
        : `/api/notifications?email=${encodeURIComponent(user.email)}`;

      console.log("관리자 권한 확인:", {
        userType: user.userType,
        isSuperUser: user.isSuperUser,
        isAdmin,
        endpoint,
      });

      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotifications(data.notifications || []);
          setUnreadCount(
            data.notifications?.filter((n: Notification) => !n.isRead).length ||
              0,
          );
        }
      } else {
        console.error("알림 조회 실패:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("알림 조회 오류:", error);
    }
  };

  // 로그인 상태 변경 시 알림 조회
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();

      // 1분마다 알림 조회
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, user?.email, user?.userType, user?.isSuperUser]);

  // 알림 읽음 처리
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(
        `/api/notifications/${notificationId}/read`,
        {
          method: "PATCH",
        },
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? { ...notification, isRead: true }
              : notification,
          ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("알림 읽음 처리 오류:", error);
    }
  };

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
    <header className="bg-gray-800 border-b border-gray-800 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/">
          <div className="flex items-center space-x-2">
            <img
              src="/images/CCLEMANG_Logo_v.png"
              alt="끄레망 로고"
              className="h-8 w-auto"
            />
            <span className="text-xl font-bold text-white">
              끄레망 와인라벨
            </span>
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

          {/* 알림 아이콘 */}
          {isAuthenticated && (
            <DropdownMenu
              open={showNotifications}
              onOpenChange={setShowNotifications}
            >
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full hover:bg-gray-800"
                >
                  <Bell className="w-5 h-5 text-gray-300" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-80 bg-gray-800 border-gray-700 text-white max-h-96 overflow-hidden"
                align="end"
                side="bottom"
                sideOffset={8}
              >
                <DropdownMenuLabel className="text-center border-b border-gray-700 pb-2">
                  알림 {unreadCount > 0 && `(${unreadCount})`}
                </DropdownMenuLabel>

                {notifications.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto">
                    {notifications
                      .sort(
                        (a, b) =>
                          new Date(b.createdAt).getTime() -
                          new Date(a.createdAt).getTime(),
                      )
                      .slice(0, 10) // 최대 10개만 표시
                      .map((notification) => (
                        <DropdownMenuItem
                          key={notification.id}
                          className={`p-3 cursor-pointer hover:bg-gray-700 focus:bg-gray-700 ${
                            !notification.isRead ? "bg-blue-900/20" : ""
                          }`}
                          onClick={() => {
                            if (!notification.isRead) {
                              markNotificationAsRead(notification.id);
                            }
                          }}
                        >
                          <div className="flex items-start space-x-2 w-full">
                            {/* 알림 타입별 아이콘 */}
                            <div
                              className={`p-1 rounded-full mt-1 ${
                                notification.type === "shipping"
                                  ? "bg-green-500/20 text-green-400"
                                  : notification.type === "order"
                                    ? "bg-blue-500/20 text-blue-400"
                                    : "bg-yellow-500/20 text-yellow-400"
                              }`}
                            >
                              {notification.type === "shipping" && (
                                <Truck className="w-3 h-3" />
                              )}
                              {notification.type === "order" && (
                                <Package className="w-3 h-3" />
                              )}
                              {notification.type === "system" && (
                                <Bell className="w-3 h-3" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-medium text-gray-200 text-sm truncate">
                                  {notification.title}
                                </h4>
                                {!notification.isRead && (
                                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></span>
                                )}
                              </div>
                              <p className="text-gray-300 text-xs mb-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-gray-500 text-xs">
                                {new Date(
                                  notification.createdAt,
                                ).toLocaleString("ko-KR")}
                              </p>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Bell className="w-8 h-8 mx-auto text-gray-500 mb-2" />
                    <p className="text-gray-400 text-sm">
                      새로운 알림이 없습니다.
                    </p>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

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
