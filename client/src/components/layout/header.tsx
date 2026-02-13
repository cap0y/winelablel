import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import {
  Package,
  Globe,
  LogIn,
  User,
  LogOut,
  Bell,
  Truck,
  Package,
  Share2,
  Printer,
  Download,
  Copy,
  FileImage,
  Settings,
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

// html2canvas 타입 선언
declare global {
  interface Window {
    html2canvas: any;
  }
}

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

function Header() {
  const { language, setLanguage, refreshKey } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const [currentLang, setCurrentLang] = useState<string>(language);

  // 알림 관련 상태
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // 공유 모달 상태
  const [showShareModal, setShowShareModal] = useState(false);

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
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/">
          <div className="flex items-center space-x-2">
            <img
              src="/images/decomsoft-logo.jpg"
              alt="디컴소프트 로고"
              className="h-8 w-auto rounded"
            />
            <span className="text-xl font-bold text-gray-900">
              패키지 디자인
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
              <SelectTrigger className="w-12 h-12 bg-white/60 border-gray-200 backdrop-blur-sm rounded-full hover:bg-gray-100" title={`현재 언어: ${getLanguageDisplay(currentLang)}`}>
                <Globe className="w-6 h-6" />
              </SelectTrigger>
              <SelectContent className="bg-white/80 border-gray-200 backdrop-blur-sm">
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
                  className="relative h-9 w-9 rounded-full hover:bg-gray-100"
                >
                  <Bell className="w-5 h-5 text-gray-700" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-80 bg-white/80 border-gray-200 text-gray-900 max-h-96 overflow-hidden backdrop-blur-md"
                align="end"
                side="bottom"
                sideOffset={8}
              >
                <DropdownMenuLabel className="text-center border-b border-gray-200 pb-2">
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
                          className={`p-3 cursor-pointer hover:bg-gray-100 focus:bg-gray-100 ${
                            !notification.isRead ? "bg-blue-50" : ""
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
                                  ? "bg-green-100 text-green-600"
                                  : notification.type === "order"
                                    ? "bg-blue-100 text-blue-600"
                                    : "bg-yellow-100 text-yellow-600"
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
                                <h4 className="font-medium text-gray-900 text-sm truncate">
                                  {notification.title}
                                </h4>
                                {!notification.isRead && (
                                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></span>
                                )}
                              </div>
                              <p className="text-gray-700 text-xs mb-1 line-clamp-2">
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
                    <Bell className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500 text-sm">
                      새로운 알림이 없습니다.
                    </p>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* 공유 기능 모달 */}
          <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full hover:bg-gray-100"
                title="공유 및 기능"
              >
                <Share2 className="w-5 h-5 text-gray-700" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <FileImage className="w-5 h-5 text-primary" />
                  <span>디컴소프트 - 공유 및 기능</span>
                </DialogTitle>
                <DialogDescription>
                  페이지 공유, 인쇄, 다운로드 등의 기능을 이용할 수 있습니다.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* 공유 기능들 */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                    <Share2 className="w-4 h-4 mr-2" />
                    공유하기
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: '디컴소프트 패키지 디자인',
                            text: '나만의 특별한 박스 패키지를 디자인해보세요!',
                            url: window.location.href
                          });
                        }
                      }}
                      className="flex items-center justify-center space-x-2"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>공유</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(window.location.href);
                          alert('링크가 클립보드에 복사되었습니다!');
                        } catch (err) {
                          console.error('클립보드 복사 실패:', err);
                        }
                      }}
                      className="flex items-center justify-center space-x-2"
                    >
                      <Copy className="w-4 h-4" />
                      <span>복사</span>
                    </Button>
                  </div>
                </div>

                {/* 기능들 */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700">기능</h3>
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // 모달을 먼저 닫고 잠시 후 인쇄 실행
                        setShowShareModal(false);
                        setTimeout(() => {
                          // 패키지 디자인 페이지인지 확인
                          if (window.location.pathname.includes('/package-designer/')) {
                            // 패키지 디자인 화면의 미리보기 영역 찾기
                            const labelPreview = document.querySelector('[data-label-preview]') || 
                                                document.querySelector('.product-package-container') ||
                                                document.querySelector('.max-w-4xl.mx-auto.p-12');
                            
                            if (labelPreview) {
                              console.log('패키지 디자인 미리보기 요소 찾음:', labelPreview);
                              
                              // 현재 페이지에 인쇄 스타일 추가
                              const printStyle = document.createElement('style');
                              printStyle.textContent = `
                                @media print {
                                  body * { visibility: hidden; }
                                  .product-package-container, .product-package-container * { visibility: visible; }
                                  [data-label-preview], [data-label-preview] * { visibility: visible; }
                                  .product-package-container {
                                    position: absolute;
                                    left: 0;
                                    top: 0;
                                    width: 100%;
                                    height: 100%;
                                    display: flex;
                                    justify-content: center;
                                    align-items: center;
                                    background: white;
                                  }
                                  [data-label-preview] {
                                    position: absolute;
                                    left: 0;
                                    top: 0;
                                    width: 100%;
                                    height: 80%;
                                    display: flex;
                                    justify-content: center;
                                    align-items: center;
                                    background: white;
                                  }
                                  .no-print { display: none !important; }
                                  .decoration-delete-btn { display: none !important; }
                                  .border-dashed { border: none !important; }
                                }
                              `;
                              document.head.appendChild(printStyle);
                              
                              // 인쇄 실행
                              window.print();
                              
                              // 인쇄 후 스타일 제거
                              setTimeout(() => {
                                document.head.removeChild(printStyle);
                              }, 1000);
                            } else {
                              console.log('디자인 미리보기 요소를 찾을 수 없음, 전체 페이지 인쇄');
                              window.print();
                            }
                          } else {
                            // 다른 페이지에서는 전체 화면 인쇄
                            window.print();
                          }
                        }, 300);
                      }}
                      className="flex items-center justify-center space-x-2"
                    >
                      <Printer className="w-4 h-4" />
                      <span>현재 화면 인쇄</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        // 모달을 먼저 닫기
                        setShowShareModal(false);
                        
                        try {
                          // 패키지 디자인 페이지인지 확인
                          if (window.location.pathname.includes('/package-designer/')) {
                            // 패키지 디자인 화면의 미리보기 영역 찾기 - 더 정확한 선택자 사용
                            let labelPreview = document.querySelector('[data-label-preview]');
                            
                            // 대체 선택자들 시도
                            if (!labelPreview) {
                              labelPreview = document.querySelector('.product-package-container');
                            }
                            if (!labelPreview) {
                              // 패키지 프리뷰가 포함된 전체 컨테이너 찾기
                              const containers = Array.from(document.querySelectorAll('div'));
                              for (const container of containers) {
                                if (container.querySelector('img[alt*="패키지"], img[src*="package"], img[src*="bottle"]')) {
                                  labelPreview = container;
                                  break;
                                }
                              }
                            }
                            
                            if (labelPreview) {
                              const previewElement = labelPreview as HTMLElement;
                              console.log('디자인 미리보기 요소 찾음, 다운로드 시작:', labelPreview);
                              console.log('요소 크기:', previewElement.offsetWidth, 'x', previewElement.offsetHeight);
                              
                              // html2canvas 동적 로드
                              if (!window.html2canvas) {
                                const script = document.createElement('script');
                                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                                document.head.appendChild(script);
                                
                                await new Promise((resolve) => {
                                  script.onload = resolve;
                                });
                              }
                              
                              // 삭제 버튼들과 불필요한 요소들 임시 숨기기
                              const deleteButtons = labelPreview.querySelectorAll('.decoration-delete-btn, .no-print');
                              const dashedBorders = labelPreview.querySelectorAll('.border-dashed');
                              const buttonOriginalStyles: string[] = [];
                              const borderOriginalStyles: string[] = [];
                              
                              // 삭제 버튼 숨기기
                              deleteButtons.forEach((btn, index) => {
                                const element = btn as HTMLElement;
                                buttonOriginalStyles[index] = element.style.display;
                                element.style.display = 'none';
                              });
                              
                              // 점선 테두리 제거
                              dashedBorders.forEach((border, index) => {
                                const element = border as HTMLElement;
                                borderOriginalStyles[index] = element.style.border;
                                element.style.border = 'none';
                              });
                              
                              // 잠시 대기 (DOM 업데이트 완료)
                              await new Promise(resolve => setTimeout(resolve, 100));
                              
                              // html2canvas로 캡처 - 더 간단하고 안정적인 방식
                              const captureElement = labelPreview as HTMLElement;
                              
                              // 캡처 전 모든 요소가 보이도록 강제 설정
                              const allElements = captureElement.querySelectorAll('*');
                              const elementOriginalStyles: any[] = [];
                              
                              allElements.forEach((el: any, index) => {
                                elementOriginalStyles[index] = {
                                  opacity: el.style.opacity,
                                  visibility: el.style.visibility,
                                  display: el.style.display
                                };
                                
                                // 모든 요소를 강제로 보이게 설정
                                if (el.style.opacity === '0' || el.style.visibility === 'hidden') {
                                  el.style.opacity = '1';
                                  el.style.visibility = 'visible';
                                }
                              });
                              
                              console.log('캡처 시작 - 요소 강제 표시 완료');
                              
                              const canvas = await window.html2canvas(captureElement, {
                                backgroundColor: '#111827', // bg-gray-900와 동일한 색상
                                scale: 2, // 안정적인 해상도
                                useCORS: true,
                                allowTaint: true,
                                logging: true,
                                width: captureElement.offsetWidth,
                                height: captureElement.offsetHeight,
                                // 간단한 설정으로 변경
                                onclone: (clonedDoc: any) => {
                                  console.log('클론 문서 처리 시작');
                                  
                                  // 삭제 버튼만 제거
                                  const deleteButtons = clonedDoc.querySelectorAll('.decoration-delete-btn, button[title*="삭제"]');
                                  deleteButtons.forEach((btn: any) => btn.remove());
                                  
                                  // 점선 테두리 제거
                                  const dashedElements = clonedDoc.querySelectorAll('.border-dashed');
                                  dashedElements.forEach((el: any) => {
                                    el.style.border = 'none';
                                  });
                                  
                                  console.log('클론 문서 처리 완료');
                                }
                              });
                              
                              // 원본 스타일 복원
                              allElements.forEach((el: any, index) => {
                                if (elementOriginalStyles[index]) {
                                  el.style.opacity = elementOriginalStyles[index].opacity;
                                  el.style.visibility = elementOriginalStyles[index].visibility;
                                  el.style.display = elementOriginalStyles[index].display;
                                }
                              });
                              
                              console.log('캔버스 생성 완료, 크기:', canvas.width, 'x', canvas.height);
                              
                              // 삭제 버튼들 복원
                              deleteButtons.forEach((btn, index) => {
                                const element = btn as HTMLElement;
                                element.style.display = buttonOriginalStyles[index];
                              });
                              
                              // 점선 테두리 복원
                              dashedBorders.forEach((border, index) => {
                                const element = border as HTMLElement;
                                element.style.border = borderOriginalStyles[index];
                              });
                              
                              // 캔버스가 비어있는지 확인
                              const ctx = canvas.getContext('2d');
                              const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
                              const pixels = imageData?.data;
                              let hasContent = false;
                              
                              if (pixels) {
                                for (let i = 0; i < pixels.length; i += 4) {
                                  // RGBA 값 확인 - 완전 투명이 아니거나 검은색이 아니면 내용이 있음
                                  if (pixels[i + 3] > 0 && (pixels[i] > 0 || pixels[i + 1] > 0 || pixels[i + 2] > 0)) {
                                    hasContent = true;
                                    break;
                                  }
                                }
                              }
                              
                              console.log('캔버스 내용 확인:', hasContent ? '내용 있음' : '내용 없음');
                              
                              if (!hasContent) {
                                alert('캡처된 이미지가 비어있습니다. 페이지를 새로고침 후 다시 시도해주세요.');
                                return;
                              }
                              
                              // 이미지 다운로드
                              const dataUrl = canvas.toDataURL('image/png', 1.0);
                              console.log('데이터 URL 길이:', dataUrl.length);
                              
                              const link = document.createElement('a');
                              link.download = `package-design-${new Date().getTime()}.png`;
                              link.href = dataUrl;
                              
                              // 브라우저 호환성을 위한 다운로드 방식
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              
                              console.log('디자인 이미지 다운로드 완료');
                            } else {
                              alert('디자인 미리보기 영역을 찾을 수 없습니다.');
                            }
                          } else {
                            // 다른 페이지에서는 전체 화면 캡처
                            if (!window.html2canvas) {
                              const script = document.createElement('script');
                              script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
                              document.head.appendChild(script);
                              
                              await new Promise((resolve) => {
                                script.onload = resolve;
                              });
                            }
                            
                            const canvas = await window.html2canvas(document.body, {
                              backgroundColor: 'white',
                              scale: 1,
                              useCORS: true,
                              allowTaint: true
                            });
                            
                            const link = document.createElement('a');
                            link.download = `screen-capture-${new Date().getTime()}.png`;
                            link.href = canvas.toDataURL('image/png');
                            link.click();
                          }
                        } catch (error) {
                          console.error('화면 다운로드 오류:', error);
                          alert('화면 다운로드 중 오류가 발생했습니다.');
                        }
                      }}
                      className="flex items-center justify-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>화면 다운로드</span>
                    </Button>
                  </div>
                </div>

                {/* 소셜 미디어 공유 */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700">소셜 미디어</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const url = encodeURIComponent(window.location.href);
                        const text = encodeURIComponent('디컴소프트에서 나만의 박스 패키지를 디자인해보세요!');
                        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
                      }}
                      className="flex items-center justify-center space-x-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <span>📘</span>
                      <span>Facebook</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const url = encodeURIComponent(window.location.href);
                        const text = encodeURIComponent('디컴소프트에서 나만의 박스 패키지를 디자인해보세요!');
                        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank', 'width=600,height=400');
                      }}
                      className="flex items-center justify-center space-x-2 text-blue-400 border-blue-200 hover:bg-blue-50"
                    >
                      <span>🐦</span>
                      <span>Twitter</span>
                    </Button>
                  </div>
                </div>

                {/* 패키지 디자인 바로가기 */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700">패키지 디자인</h3>
                  <div className="grid grid-cols-1 gap-2">
                    <Link href="/package-selector">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full flex items-center justify-center space-x-2 text-primary border-primary hover:bg-primary/5"
                      >
                        <Package className="w-4 h-4" />
                        <span>패키지 선택하기</span>
                      </Button>
                    </Link>
                    <Link href="/gallery">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full flex items-center justify-center space-x-2"
                      >
                        <Settings className="w-4 h-4" />
                        <span>디자인 갤러리</span>
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* 앱 정보 */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-center text-sm text-gray-500">
                    <p>디컴소프트 패키지 디자인 서비스</p>
                    <p>특별한 순간을 위한 특별한 패키지</p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full hover:bg-gray-100"
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
                className="w-56 bg-white/90 border-gray-200 text-gray-900 backdrop-blur-md"
                align="end"
              >
                <DropdownMenuLabel>내 계정</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-200" />
                <DropdownMenuItem className="text-gray-700 focus:bg-gray-100 focus:text-gray-900 cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>프로필</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-gray-700 focus:bg-gray-100 focus:text-gray-900 cursor-pointer"
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
                className="px-3 py-1 text-primary border-gray-300 text-sm flex items-center gap-1 bg-white/70 hover:bg-white/90 backdrop-blur-sm"
              >
                <LogIn className="h-4 w-4" />
                
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
