import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  LogOut, 
  User, 
  Upload, 
  Trash2, 
  Image, 
  FileImage, 
  Package, 
  Printer, 
  Tag, 
  CheckCircle, 
  BarChart, 
  ImageOff,
  Check,
  Clipboard,
  ChevronRight
} from "lucide-react";
import { adminApi, userApi, orderApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import SalesStatistics from "@/components/admin/SalesStatistics";

// 추가된 타입 정의
interface LabelResource {
  id: string;
  name: string;
  filename: string;
  url: string;
  type: 'background' | 'icon';
  createdAt: string;
}

interface WineOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  bottleId: string;
  bottleName: string;
  labelDesign: {
    template: string;
    text: string;
    subtext: string;
    font: string;
    textColor: string;
    backgroundColor: string;
    borderStyle: string;
    decorations: Array<{id: string, decorationId: string, position: {x: number, y: number}}>;
    textPosition: {x: number, y: number};
    subtextPosition: {x: number, y: number};
    textSize: number;
    subtextSize: number;
  };
  labelImage?: string; // 캡처된 라벨 이미지 추가
  quantity: number;
  status: 'pending' | 'processed' | 'completed' | 'cancelled';
  amount: number;
  createdAt: string;
  publishToGallery?: boolean; // 갤러리 공개 상태
  title?: string; // 갤러리 공개 시 표시할 제목
  customerPhone?: string;
  customerAddress?: string;
  customerZipCode?: string;
}

export default function ProfilePage() {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  
  // 관리자 탭 상태 관리
  const [adminActiveTab, setAdminActiveTab] = useState("labels");
  
  // 일반 사용자 탭 상태 관리
  const [userActiveTab, setUserActiveTab] = useState("orders");
  
  // 라벨 리소스 관리 상태
  const [labelBackgrounds, setLabelBackgrounds] = useState<LabelResource[]>([]);
  const [labelIcons, setLabelIcons] = useState<LabelResource[]>([]);
  const [labelBorders, setLabelBorders] = useState<LabelResource[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadType, setUploadType] = useState<'background' | 'icon' | 'border'>('background');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  
  // 와인 주문 관리 상태
  const [orders, setOrders] = useState<WineOrder[]>([]);
  const [userOrders, setUserOrders] = useState<WineOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<WineOrder | null>(null);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [orderStatusUpdating, setOrderStatusUpdating] = useState<boolean>(false);
  
  // 파일 업로드 참조
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 관리자 권한 확인
  const isAdmin = user?.userType === 'admin' || user?.isSuperUser;

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await logout();
      setLocation("/");
    } catch (error) {
      console.error("로그아웃 오류:", error);
    }
  };

  // 라벨 배경 이미지 로드
  const fetchLabelBackgrounds = async () => {
    try {
      const { data } = await adminApi.getLabelBackgrounds();
      setLabelBackgrounds(data.backgrounds || []);
    } catch (error) {
      console.error("라벨 배경 이미지 조회 오류:", error);
    }
  };

  // 라벨 아이콘 및 장식 로드
  const fetchLabelIcons = async () => {
    try {
      const { data } = await adminApi.getLabelIcons();
      setLabelIcons(data.icons || []);
    } catch (error) {
      console.error("라벨 아이콘 및 장식 조회 오류:", error);
    }
  };
  
  // 라벨 테두리 이미지 로드
  const fetchLabelBorders = async () => {
    try {
      const { data } = await adminApi.getLabelBorders();
      setLabelBorders(data.borders || []);
    } catch (error) {
      console.error("라벨 테두리 조회 오류:", error);
    }
  };

  // 와인 주문 목록 로드
  const fetchOrders = async () => {
    try {
      const { data } = await adminApi.getOrders();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("와인 주문 목록 조회 오류:", error);
    }
  };
  
  // 사용자의 주문 목록 로드
  const fetchUserOrders = async () => {
    try {
      if (!user || !user.email) return;

      const response = await userApi.getUserOrders(user.email);
      setUserOrders(response.data.orders || []);
    } catch (error) {
      console.error("사용자 주문 목록 조회 오류:", error);
    }
  };
  
  // 파일 업로드 처리
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      if (uploadType === 'background') {
        await adminApi.uploadLabelBackground(formData);
        setUploadSuccess('라벨 배경 이미지가 성공적으로 업로드되었습니다.');
        fetchLabelBackgrounds();
      } else if (uploadType === 'icon') {
        await adminApi.uploadLabelIcon(formData);
        setUploadSuccess('라벨 아이콘/장식 이미지가 성공적으로 업로드되었습니다.');
        fetchLabelIcons();
      } else if (uploadType === 'border') {
        await adminApi.uploadLabelBorder(formData);
        setUploadSuccess('라벨 테두리 이미지가 성공적으로 업로드되었습니다.');
        fetchLabelBorders();
      }
    } catch (error: any) {
      console.error("파일 업로드 오류:", error);
      setUploadError(error.message || '파일 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
  
  // 이미지 삭제 처리
  const handleDeleteImage = async (type: 'background' | 'icon' | 'border', filename: string) => {
    try {
      if (type === 'background') {
        await adminApi.deleteLabelBackground(filename);
        setLabelBackgrounds(prev => prev.filter(bg => bg.filename !== filename));
      } else if (type === 'icon') {
        await adminApi.deleteLabelIcon(filename);
        setLabelIcons(prev => prev.filter(icon => icon.filename !== filename));
      } else if (type === 'border') {
        await adminApi.deleteLabelBorder(filename);
        setLabelBorders(prev => prev.filter(border => border.filename !== filename));
      }
    } catch (error) {
      console.error("이미지 삭제 오류:", error);
    }
  };

  // 주문 상세 조회
  const handleViewOrder = async (orderId: string) => {
    try {
      const { data } = await adminApi.getOrder(orderId);
      setSelectedOrder(data.order);
    } catch (error) {
      console.error("주문 상세 조회 오류:", error);
    }
  };
  
  // 주문 인쇄 처리
  const handlePrintLabel = (order: WineOrder) => {
    setIsPrinting(true);
    
    // 인쇄 창 열기
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      alert('팝업 차단을 해제해주세요.');
      setIsPrinting(false);
      return;
    }
    
    // 인쇄할 HTML 생성
    printWindow.document.write(`
      <html>
        <head>
          <title>와인 라벨 인쇄</title>
          <style>
            @media print {
              body { margin: 0; }
              .label-container-outer { 
                position: relative;
                width: 12cm;
                height: 17cm;
                margin: 0 auto;
                padding: 1cm;
                box-sizing: border-box;
              }
              .label-border {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
                background-size: 100% 100%;
                background-position: center;
                background-repeat: no-repeat;
              }
              .label-container { 
                position: relative;
                width: 10cm;
                height: 15cm;
                margin: 0 auto;
                overflow: hidden;
                z-index: 2;
              }
              .label-bg {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1;
              }
              .captured-label {
                width: 100%;
                height: auto;
                display: block;
                margin: 0 auto;
              }
              .label-text {
                position: absolute;
                z-index: 10;
                font-weight: bold;
                color: ${order.labelDesign.textColor};
                font-family: ${order.labelDesign.font};
                font-size: ${order.labelDesign.textSize}rem;
                transform: translate(-50%, -50%);
                left: ${order.labelDesign.textPosition.x}%;
                top: ${order.labelDesign.textPosition.y}%;
              }
              .label-subtext {
                position: absolute;
                z-index: 10;
                color: ${order.labelDesign.textColor};
                font-family: ${order.labelDesign.font};
                font-size: ${order.labelDesign.subtextSize}rem;
                transform: translate(-50%, -50%);
                left: ${order.labelDesign.subtextPosition.x}%;
                top: ${order.labelDesign.subtextPosition.y}%;
              }
              .label-decoration {
                position: absolute;
                z-index: 5;
                width: 3cm;
                height: 3cm;
                transform: translate(-50%, -50%);
                object-fit: contain;
              }
              .customer-info {
                margin-top: 1cm;
                text-align: center;
              }
            }
          </style>
        </head>
        <body>
          <div class="label-container-outer">
            ${order.labelImage ? `
              <!-- 캡처된 라벨 이미지 사용 -->
              <img class="captured-label" src="${order.labelImage}" alt="캡처된 라벨 디자인" />
            ` : `
              <!-- 수동으로 조합된 라벨 디자인 -->
              ${order.labelDesign.borderStyle !== "border4" && order.labelDesign.borderStyle ? `
              <div class="label-border" style="background-image: url('/images/border/${order.labelDesign.borderStyle}.jpg')"></div>
              ` : ''}
              <div class="label-container">
                <img class="label-bg" src="/images/label/${order.labelDesign.template}.jpg" alt="라벨 배경" />
                
                <div class="label-text">${order.labelDesign.text || "와인 이름"}</div>
                <div class="label-subtext">${order.labelDesign.subtext || "부가 설명"}</div>
                
                ${order.labelDesign.decorations.map(deco => `
                  <img 
                    class="label-decoration" 
                    src="/images/icon/${deco.decorationId}.png" 
                    alt="장식" 
                    style="left: ${deco.position.x}%; top: ${deco.position.y}%;"
                  />
                `).join('')}
              </div>
            `}
          </div>
          
          <div class="customer-info">
            <h3>주문 정보</h3>
            <p>주문자: ${order.customerName}</p>
            <p>이메일: ${order.customerEmail}</p>
            <p>와인병: ${order.bottleName}</p>
            <p>수량: ${order.quantity || 1}매</p>
            <p>주문번호: ${order.id}</p>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // 인쇄 후 상태 업데이트
    updateOrderStatus(order.id, 'completed');
    
    setIsPrinting(false);
  };
  
  // 주문 상태 업데이트
  const updateOrderStatus = async (orderId: string, status: 'pending' | 'processed' | 'completed' | 'cancelled') => {
    setOrderStatusUpdating(true);
    
    try {
      await adminApi.updateOrderStatus(orderId, status);
      
      // 상태 업데이트 후 목록 갱신
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId 
            ? { ...order, status } 
            : order
        )
      );
      
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status });
      }
    } catch (error) {
      console.error("주문 상태 업데이트 오류:", error);
    } finally {
      setOrderStatusUpdating(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      if (adminActiveTab === "labels") {
        fetchLabelBackgrounds();
        fetchLabelIcons();
        fetchLabelBorders();
      } else if (adminActiveTab === "orders") {
        fetchOrders();
      }
    } else {
      // 일반 사용자인 경우 자신의 주문 내역 가져오기
      fetchUserOrders();
    }
  }, [adminActiveTab, isAdmin, userActiveTab]);

  // 주문 상세 보기 다이얼로그
  function OrderDetailDialog({ 
    order, 
    onClose, 
    onStatusUpdate, 
    isAdmin
  }: { 
    order: WineOrder | null; 
    onClose: () => void; 
    onStatusUpdate?: (orderId: string, status: 'pending' | 'processed' | 'completed' | 'cancelled') => Promise<void>;
    isAdmin?: boolean;
  }) {
    const { toast } = useToast();
    const [isPublishing, setIsPublishing] = useState(false);
    const [galleryTitle, setGalleryTitle] = useState("");
    
    useEffect(() => {
      // 선택된 주문이 변경될 때 타이틀을 주문 타이틀 또는 와인 이름으로 초기화
      if (order) {
        setGalleryTitle(order.title || order.bottleName || "");
      }
    }, [order]);
    
    // 갤러리에 공개 처리
    const handlePublishToGallery = async () => {
      if (!order) return;
      
      try {
        setIsPublishing(true);
        
        // 갤러리 공개 상태 토글
        const publish = !order.publishToGallery;
        
        await orderApi.togglePublishToGallery(
          order.id, 
          publish,
          publish ? galleryTitle : undefined
        );
        
        toast({
          title: publish ? "갤러리에 공개되었습니다" : "갤러리에서 숨김 처리되었습니다",
        });
        
        // 주문 상세 정보 업데이트 (onStatusUpdate를 통해 목록 갱신)
        if (onStatusUpdate) {
          onStatusUpdate(order.id, order.status);
        }
      } catch (error) {
        console.error("갤러리 공개 설정 오류:", error);
        toast({
          title: "오류",
          description: "갤러리 공개 설정 중 문제가 발생했습니다.",
          variant: "destructive",
        });
      } finally {
        setIsPublishing(false);
      }
    };
    
    if (!order) return null;
    
    const orderDate = new Date(order.createdAt);
    const formattedDate = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}-${String(orderDate.getDate()).padStart(2, '0')}`;
    
    return (
      <Dialog open={!!order} onOpenChange={() => onClose()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>주문 상세 정보</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">주문 정보</h3>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">주문번호:</span> {order.id}</p>
                  <p><span className="font-medium">주문일자:</span> {formattedDate}</p>
                  <p><span className="font-medium">주문상태:</span> {
                      order.status === 'completed' 
                      ? '완료' 
                      : order.status === 'processed' 
                      ? '처리 중' 
                      : order.status === 'cancelled'
                      ? '취소됨'
                      : '대기 중'
                  }</p>
                  <p><span className="font-medium">와인병:</span> {order.bottleName}</p>
                  <p><span className="font-medium">수량:</span> {order.quantity}개</p>
                  <p><span className="font-medium">금액:</span> {order.amount.toLocaleString()}원</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">고객 정보</h3>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">이름:</span> {order.customerName}</p>
                  <p><span className="font-medium">이메일:</span> {order.customerEmail}</p>
                  {order.customerPhone && (
                    <p><span className="font-medium">전화번호:</span> {order.customerPhone}</p>
                  )}
                  {order.customerAddress && (
                    <p><span className="font-medium">주소:</span> {order.customerAddress}</p>
                  )}
                  {order.customerZipCode && (
                    <p><span className="font-medium">우편번호:</span> {order.customerZipCode}</p>
                  )}
                </div>
              </div>
              
              {isAdmin && (
                <div>
                  <h3 className="text-lg font-medium mb-2">주문 상태 관리</h3>
                  <div className="flex space-x-2">
                    <Button 
                      variant={order.status === 'pending' ? "default" : "outline"}
                      size="sm"
                      onClick={() => onStatusUpdate && onStatusUpdate(order.id, 'pending')}
                    >
                      대기 중
                    </Button>
                    <Button 
                      variant={order.status === 'processed' ? "default" : "outline"}
                      size="sm"
                      onClick={() => onStatusUpdate && onStatusUpdate(order.id, 'processed')}
                    >
                      처리 중
                    </Button>
                    <Button 
                      variant={order.status === 'completed' ? "default" : "outline"}
                      size="sm"
                      onClick={() => onStatusUpdate && onStatusUpdate(order.id, 'completed')}
                    >
                      완료
                    </Button>
                    <Button 
                      variant={order.status === 'cancelled' ? "destructive" : "outline"}
                      size="sm"
                      onClick={() => onStatusUpdate && onStatusUpdate(order.id, 'cancelled')}
                    >
                      취소
                    </Button>
                  </div>
                </div>
              )}
              
              {order.status === 'completed' && (
                <div>
                  <h3 className="text-lg font-medium mb-2">갤러리 공개 설정</h3>
                  
                  {order.publishToGallery ? (
                    <div className="space-y-3">
                      <p className="text-sm text-green-600">이 라벨은 현재 갤러리에 공개되어 있습니다.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-red-50 hover:bg-red-100 text-red-600"
                        onClick={handlePublishToGallery}
                        disabled={isPublishing}
                      >
                        {isPublishing ? "처리 중..." : "갤러리에서 숨기기"}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="gallery-title">갤러리 표시 제목</Label>
                        <Input
                          id="gallery-title"
                          value={galleryTitle}
                          onChange={(e) => setGalleryTitle(e.target.value)}
                          placeholder="갤러리에 표시할 라벨 이름을 입력하세요"
                          className="max-w-md"
                        />
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-blue-50 hover:bg-blue-100 text-blue-600"
                        onClick={handlePublishToGallery}
                        disabled={isPublishing || !galleryTitle.trim()}
                      >
                        {isPublishing ? "처리 중..." : "갤러리에 공개하기"}
                      </Button>
                      <p className="text-xs text-gray-500">
                        갤러리에 공개하면 다른 사용자들이 이 라벨 디자인을 보고 좋아요와 댓글을 남길 수 있습니다.
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              <div>
                <h3 className="text-lg font-medium mb-2">라벨 인쇄</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handlePrintLabel(order)}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  라벨 인쇄
                </Button>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">라벨 디자인 미리보기</h3>
              <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center">
                {order.labelImage ? (
                  <img 
                    src={order.labelImage} 
                    alt="와인 라벨 디자인" 
                    className="max-w-full max-h-[60vh] object-contain"
                  />
                ) : (
                  <div className="p-6 text-center text-gray-400">
                    <ImageOff className="w-12 h-12 mx-auto mb-2" />
                    <p>이미지를 불러올 수 없습니다.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">내 계정</h1>
      
      {/* 프로필 정보 카드 */}
      <Card className="bg-gray-800 border-gray-700 mb-6">
        <CardHeader className="pb-2">
          <CardTitle>프로필 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              {user?.photoURL ? (
                <AvatarImage src={user.photoURL} alt={user.displayName} />
              ) : (
                <AvatarFallback className="bg-primary/20 text-primary">
                  <User className="h-12 w-12" />
                </AvatarFallback>
              )}
            </Avatar>
            
            <div>
              <h2 className="text-xl font-semibold">{user?.displayName}</h2>
              <p className="text-gray-400">{user?.email}</p>
              <div className="flex items-center mt-1">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs 
                  ${user?.userType === 'admin' ? 'bg-red-500/20 text-red-400' : 
                    'bg-green-500/20 text-green-400'}`
                }>
                  {user?.userType === 'admin' ? '관리자' : '일반 회원'}
                </span>
              </div>
            </div>
          </div>
          
          <Button variant="outline" onClick={handleLogout} className="w-full">
            <LogOut className="w-4 h-4 mr-2" />
            로그아웃
          </Button>
        </CardContent>
      </Card>
      
      {/* 일반 회원 기능 */}
      {!isAdmin && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">내 와인 라벨</h2>
          
          <Tabs value={userActiveTab} onValueChange={setUserActiveTab as any}>
            <TabsList className="grid grid-cols-2 gap-2">
              <TabsTrigger value="orders">주문 내역</TabsTrigger>
              <TabsTrigger value="stats">매출 통계</TabsTrigger>
            </TabsList>
            
            {/* 주문 내역 탭 */}
            <TabsContent value="orders">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>나의 주문 내역</CardTitle>
                  <CardDescription>내가 주문한 와인 라벨 내역</CardDescription>
                </CardHeader>
                <CardContent>
                  {userOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-700">
                            <th className="px-4 py-2 text-left">주문번호</th>
                            <th className="px-4 py-2 text-left">와인병</th>
                            <th className="px-4 py-2 text-left">주문일</th>
                            <th className="px-4 py-2 text-left">상태</th>
                            <th className="px-4 py-2 text-right">가격</th>
                            <th className="px-4 py-2 text-center">디자인 보기</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userOrders.map(order => (
                            <tr key={order.id} className="border-t border-gray-700">
                              <td className="px-4 py-3">{order.id}</td>
                              <td className="px-4 py-3">{order.bottleName}</td>
                              <td className="px-4 py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs 
                                  ${order.status === 'completed' 
                                    ? 'bg-green-500/20 text-green-400' 
                                    : order.status === 'processed' 
                                    ? 'bg-blue-500/20 text-blue-400' 
                                    : 'bg-yellow-500/20 text-yellow-400'}`
                                }>
                                  {order.status === 'completed' 
                                    ? '완료' 
                                    : order.status === 'processed' 
                                    ? '처리 중' 
                                    : '대기 중'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                {new Intl.NumberFormat('ko-KR').format(order.amount)}원
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-center gap-2">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8"
                                        onClick={() => handleViewOrder(order.id)}
                                      >
                                        <Tag className="h-3.5 w-3.5 mr-1" />
                                        상세
                                      </Button>
                                    </DialogTrigger>
                                    {/* 선택된 주문 세부 정보 */}
                                    {selectedOrder && (
                                      <OrderDetailDialog
                                        order={selectedOrder}
                                        onClose={() => setSelectedOrder(null)}
                                        onStatusUpdate={updateOrderStatus}
                                        isAdmin={isAdmin}
                                      />
                                    )}
                                  </Dialog>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-center py-8 text-gray-400">주문 내역이 없습니다.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* 매출 통계 탭 */}
            <TabsContent value="stats">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>나의 주문 통계</CardTitle>
                  <CardDescription>내 주문 통계 정보</CardDescription>
                </CardHeader>
                <CardContent>
                  <SalesStatistics />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
      
      {/* 관리자 전용 기능 */}
      {isAdmin && (
        <div className="mt-12">
            <h2 className="text-2xl font-bold">관리자 대시보드</h2>
          
          <Tabs 
            value={adminActiveTab}
            onValueChange={setAdminActiveTab}
            className="mt-6"
          >
            <TabsList className="grid grid-cols-3 gap-2">
              <TabsTrigger value="labels">라벨 관리</TabsTrigger>
              <TabsTrigger value="orders">주문 관리</TabsTrigger>
              <TabsTrigger value="stats">매출 통계</TabsTrigger>
            </TabsList>
            
            {/* 라벨 관리 탭 */}
            <TabsContent value="labels">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>와인 라벨 리소스 관리</CardTitle>
                  <CardDescription>라벨 배경, 아이콘 및 장식을 관리합니다.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* 이미지 유형 탭 */}
                    <Tabs defaultValue="background" className="w-full" onValueChange={(value) => setUploadType(value as 'background' | 'icon' | 'border')}>
                      <TabsList className="grid grid-cols-3 gap-2 mb-6">
                        <TabsTrigger value="background" className="justify-center">
                          <Image className="w-4 h-4 mr-2" />
                          배경 이미지
                        </TabsTrigger>
                        <TabsTrigger value="icon" className="justify-center">
                          <FileImage className="w-4 h-4 mr-2" />
                          아이콘/장식
                        </TabsTrigger>
                        <TabsTrigger value="border" className="justify-center">
                          <Package className="w-4 h-4 mr-2" />
                          테두리 스타일
                        </TabsTrigger>
                      </TabsList>

                      {/* 배경 이미지 탭 */}
                      <TabsContent value="background" className="pt-2">
                        {/* 업로드 버튼 */}
                        <div className="bg-gray-700 p-4 rounded-lg mb-6">
                          <div className="flex items-center gap-3">
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileUpload}
                              accept="image/*"
                              disabled={isUploading}
                              className="hidden"
                            />
                            
                                <Button 
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isUploading}
                              className="flex items-center gap-2"
                            >
                              {isUploading && uploadType === 'background' ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  업로드 중...
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4" />
                                  배경 이미지 업로드
                                </>
                              )}
                                </Button>
                            
                            <p className="text-sm text-gray-400">
                              배경 이미지는 /images/label 폴더에 저장됩니다.
                            </p>
                          </div>
                          
                          {uploadError && uploadType === 'background' && (
                            <Alert variant="destructive" className="mt-3">
                              <AlertDescription>{uploadError}</AlertDescription>
                            </Alert>
                          )}
                          
                          {uploadSuccess && uploadType === 'background' && (
                            <Alert className="mt-3 bg-green-900/30 border-green-900 text-green-300">
                              <AlertDescription>{uploadSuccess}</AlertDescription>
                            </Alert>
                          )}
                        </div>

                        {/* 배경 이미지 목록 */}
                        <h3 className="text-lg font-medium mb-3">라벨 배경 이미지</h3>
                        {labelBackgrounds.length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {labelBackgrounds.map(background => (
                              <div key={background.id} className="bg-gray-700 p-2 rounded-lg">
                                <div className="aspect-[3/4] mb-2 overflow-hidden rounded-lg bg-gray-800 relative">
                                  <img 
                                    src={background.url} 
                                    alt={background.name} 
                                    className="w-full h-full object-cover"
                                  />
                                <Button 
                                    size="icon"
                                    variant="destructive"
                                    className="absolute top-2 right-2 h-7 w-7"
                                    onClick={() => handleDeleteImage('background', background.filename)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                                <p className="text-sm font-medium truncate">{background.name}</p>
                                <p className="text-xs text-gray-400 truncate">{background.filename}</p>
                            </div>
                      ))}
                    </div>
                  ) : (
                          <p className="text-center py-8 text-gray-400">등록된 배경 이미지가 없습니다.</p>
                  )}
            </TabsContent>
            
                      {/* 아이콘/장식 탭 */}
                      <TabsContent value="icon" className="pt-2">
                        {/* 업로드 버튼 */}
                        <div className="bg-gray-700 p-4 rounded-lg mb-6">
                          <div className="flex items-center gap-3">
                          <input
                            type="file"
                              ref={fileInputRef}
                              onChange={handleFileUpload}
                            accept="image/*"
                              disabled={isUploading}
                              className="hidden"
                            />
                            
                        <Button 
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isUploading}
                              className="flex items-center gap-2"
                            >
                              {isUploading && uploadType === 'icon' ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  업로드 중...
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4" />
                                  아이콘/장식 업로드
                                </>
                              )}
                        </Button>
                            
                            <p className="text-sm text-gray-400">
                              아이콘 및 장식은 /images/icon 폴더에 저장됩니다.
                            </p>
                      </div>
                          
                          {uploadError && uploadType === 'icon' && (
                            <Alert variant="destructive" className="mt-3">
                              <AlertDescription>{uploadError}</AlertDescription>
                            </Alert>
                          )}
                          
                          {uploadSuccess && uploadType === 'icon' && (
                            <Alert className="mt-3 bg-green-900/30 border-green-900 text-green-300">
                              <AlertDescription>{uploadSuccess}</AlertDescription>
                            </Alert>
                          )}
                          </div>

                        {/* 아이콘 및 장식 목록 */}
                        <h3 className="text-lg font-medium mb-3">아이콘 및 장식</h3>
                        {labelIcons.length > 0 ? (
                          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                            {labelIcons.map(icon => (
                              <div key={icon.id} className="bg-gray-700 p-2 rounded-lg">
                                <div className="aspect-square mb-2 overflow-hidden rounded-lg bg-gray-800 relative">
                                  <img 
                                    src={icon.url} 
                                    alt={icon.name} 
                                    className="w-full h-full object-contain p-2"
                                  />
                                <Button 
                                    size="icon"
                                    variant="destructive"
                                    className="absolute top-2 right-2 h-7 w-7"
                                    onClick={() => handleDeleteImage('icon', icon.filename)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                                <p className="text-sm font-medium truncate">{icon.name}</p>
                                <p className="text-xs text-gray-400 truncate">{icon.filename}</p>
                                      </div>
                                    ))}
                                  </div>
                        ) : (
                          <p className="text-center py-8 text-gray-400">등록된 아이콘/장식이 없습니다.</p>
                        )}
                      </TabsContent>

                      {/* 테두리 스타일 탭 */}
                      <TabsContent value="border" className="pt-2">
                        {/* 업로드 버튼 */}
                        <div className="bg-gray-700 p-4 rounded-lg mb-6">
                          <div className="flex items-center gap-3">
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileUpload}
                              accept="image/*"
                              disabled={isUploading}
                              className="hidden"
                            />
                            
                            <Button
                              onClick={() => fileInputRef.current?.click()}
                              disabled={isUploading}
                              className="flex items-center gap-2"
                            >
                              {isUploading && uploadType === 'border' ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  업로드 중...
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4" />
                                  테두리 이미지 업로드
                                </>
                              )}
                            </Button>
                            
                            <p className="text-sm text-gray-400">
                              테두리 이미지는 /images/border 폴더에 저장됩니다.
                            </p>
                    </div>
                          
                          {uploadError && uploadType === 'border' && (
                            <Alert variant="destructive" className="mt-3">
                              <AlertDescription>{uploadError}</AlertDescription>
                            </Alert>
                          )}
                          
                          {uploadSuccess && uploadType === 'border' && (
                            <Alert className="mt-3 bg-green-900/30 border-green-900 text-green-300">
                              <AlertDescription>{uploadSuccess}</AlertDescription>
                            </Alert>
                          )}
                            </div>

                        {/* 테두리 이미지 목록 */}
                        <h3 className="text-lg font-medium mb-3">테두리 스타일</h3>
                        {labelBorders.length > 0 ? (
                          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                            {labelBorders.map(border => (
                              <div key={border.id} className="bg-gray-700 p-2 rounded-lg">
                                <div className="aspect-square mb-2 overflow-hidden rounded-lg bg-gray-800 relative">
                                  <img 
                                    src={border.url} 
                                    alt={border.name} 
                                    className="w-full h-full object-contain p-2"
                                  />
                            <Button
                                    size="icon"
                                    variant="destructive"
                                    className="absolute top-2 right-2 h-7 w-7"
                                    onClick={() => handleDeleteImage('border', border.filename)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                                <p className="text-sm font-medium truncate">{border.name}</p>
                                <p className="text-xs text-gray-400 truncate">{border.filename}</p>
                              </div>
                      ))}
                    </div>
                  ) : (
                          <p className="text-center py-8 text-gray-400">등록된 테두리 이미지가 없습니다.</p>
                  )}
                      </TabsContent>
                    </Tabs>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 주문 관리 탭 */}
            <TabsContent value="orders">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>와인 주문 관리</CardTitle>
                  <CardDescription>와인 라벨 주문 관리 및 인쇄</CardDescription>
                </CardHeader>
                <CardContent>
                  {orders.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-700">
                            <th className="px-4 py-2 text-left">주문번호</th>
                            <th className="px-4 py-2 text-left">주문자</th>
                            <th className="px-4 py-2 text-left">와인병</th>
                            <th className="px-4 py-2 text-left">주문일</th>
                            <th className="px-4 py-2 text-left">상태</th>
                            <th className="px-4 py-2 text-right">가격</th>
                            <th className="px-4 py-2 text-center">작업</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map(order => (
                            <tr key={order.id} className="border-t border-gray-700">
                              <td className="px-4 py-3">{order.id}</td>
                              <td className="px-4 py-3">{order.customerName}</td>
                              <td className="px-4 py-3">{order.bottleName}</td>
                              <td className="px-4 py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs 
                                  ${order.status === 'completed' 
                                    ? 'bg-green-500/20 text-green-400' 
                                    : order.status === 'processed' 
                                    ? 'bg-blue-500/20 text-blue-400' 
                                    : order.status === 'cancelled'
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-yellow-500/20 text-yellow-400'}`
                                }>
                                  {order.status === 'completed' 
                                    ? '완료' 
                                    : order.status === 'processed' 
                                    ? '처리 중' 
                                    : order.status === 'cancelled'
                                    ? '취소됨'
                                    : '대기 중'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                {new Intl.NumberFormat('ko-KR').format(order.amount)}원
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-center gap-2">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8"
                                        onClick={() => handleViewOrder(order.id)}
                                      >
                                        <Tag className="h-3.5 w-3.5 mr-1" />
                                        상세
                                      </Button>
                                    </DialogTrigger>
                                    {/* 선택된 주문 세부 정보 */}
                                    {selectedOrder && (
                                      <OrderDetailDialog
                                        order={selectedOrder}
                                        onClose={() => setSelectedOrder(null)}
                                        onStatusUpdate={updateOrderStatus}
                                        isAdmin={isAdmin}
                                      />
                                    )}
                                  </Dialog>
                                  
                                  <Button
                                    size="sm"
                                    variant="default"
                                    className="h-8 bg-green-600 hover:bg-green-700"
                                    onClick={() => handlePrintLabel(order)}
                                    disabled={isPrinting}
                                  >
                                    <Printer className="h-3.5 w-3.5 mr-1" />
                                    인쇄
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-center py-8 text-gray-400">등록된 주문이 없습니다.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* 매출 통계 탭 */}
            <TabsContent value="stats">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>매출 통계</CardTitle>
                    <CardDescription>와인 주문 매출 통계를 확인합니다.</CardDescription>
                  </div>
                  <BarChart className="w-6 h-6 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <SalesStatistics />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
} 