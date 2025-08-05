import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
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
  Grid,
  Wine,
  ExternalLink,
  Truck,
  Bell,
  FileText,
  BarChart3,
  Star,
  Download,
  Palette,
} from "lucide-react";
import { adminApi, userApi, orderApi } from "@/services/api";
import SalesStatistics from "@/components/admin/SalesStatistics";
import OrderManagement from "@/components/admin/OrderManagement";
import LabelBackgroundManagement from "@/components/admin/LabelBackgroundManagement";
import WineBottleManagement from "@/components/admin/WineBottleManagement";
import UserSalesStatistics from "@/components/user/UserSalesStatistics";

// 추가된 타입 정의
interface LabelResource {
  id: string;
  name: string;
  filename: string;
  url: string;
  type: "background" | "icon";
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
    decorations: Array<{
      id: string;
      decorationId: string;
      position: { x: number; y: number };
    }>;
    textPosition: { x: number; y: number };
    subtextPosition: { x: number; y: number };
    textSize: number;
    subtextSize: number;
  };
  labelImage?: string; // 캡처된 라벨 이미지 추가
  quantity: number;
  status:
    | "pending"
    | "processed"
    | "completed"
    | "cancelled"
    | "결제대기"
    | "결제완료"
    | "제작중"
    | "배송준비"
    | "배송중"
    | "배송완료"
    | "주문취소";
  paymentStatus?: "결제대기" | "결제완료" | "결제취소"; // 결제 상태 추가
  amount: number;
  createdAt: string;
  publishToGallery?: boolean; // 갤러리 공개 상태
  title?: string; // 갤러리 공개 시 표시할 제목
  customerPhone?: string;
  customerAddress?: string;
  customerZipCode?: string;
  trackingNumber?: string; // 운송장 번호
  shippingCompany?: string; // 배송 회사
  paymentId?: string; // 결제 ID
  deliveryMethod?: "standard" | "express" | "same-day"; // 배송 방법
  deliveryFee?: number; // 배송비
}

// 알림 인터페이스 추가
interface Notification {
  id: string;
  type: "shipping" | "order" | "system";
  title: string;
  message: string;
  orderId?: string;
  isRead: boolean;
  createdAt: string;
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const isAdmin = user?.userType === "admin";

  // 관리자 탭 상태 관리
  const [adminActiveTab, setAdminActiveTab] = useState("labels");

  // 일반 사용자 탭 상태 관리
  const [userActiveTab, setUserActiveTab] = useState("orders");

  // 알림 관련 상태
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // 캐싱을 위한 상태 추가
  const [adminDataLoaded, setAdminDataLoaded] = useState({
    labels: false,
    orders: false,
    stats: false,
    backgrounds: false,
    bottles: false,
  });

  // 라벨 리소스 관리 상태
  const [labelBackgrounds, setLabelBackgrounds] = useState<LabelResource[]>([]);
  const [labelIcons, setLabelIcons] = useState<LabelResource[]>([]);
  const [labelBorders, setLabelBorders] = useState<LabelResource[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadType, setUploadType] = useState<
    "background" | "icon" | "border"
  >("icon");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // 와인 주문 관리 상태
  const [orders, setOrders] = useState<WineOrder[]>([]);
  const [userOrders, setUserOrders] = useState<WineOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<WineOrder | null>(null);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [orderStatusUpdating, setOrderStatusUpdating] =
    useState<boolean>(false);

  // 파일 업로드 참조
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 관리자 탭 변경 핸들러
  const handleAdminTabChange = (newTab: string) => {
    setAdminActiveTab(newTab);

    // 탭별로 필요한 데이터 로드 (캐시되지 않은 경우만)
    if (isAdmin) {
      switch (newTab) {
        case "labels":
          if (!adminDataLoaded.labels) {
            fetchLabelBackgrounds();
            fetchLabelIcons();
            fetchLabelBorders();
            setAdminDataLoaded((prev) => ({ ...prev, labels: true }));
          }
          break;
        case "orders":
          if (!adminDataLoaded.orders) {
            fetchOrders();
            setAdminDataLoaded((prev) => ({ ...prev, orders: true }));
          }
          break;
        case "backgrounds":
          if (!adminDataLoaded.backgrounds) {
            // LabelBackgroundManagement 컴포넌트 내부에서 처리
            setAdminDataLoaded((prev) => ({ ...prev, backgrounds: true }));
          }
          break;
        case "bottles":
          if (!adminDataLoaded.bottles) {
            // WineBottleManagement 컴포넌트 내부에서 처리
            setAdminDataLoaded((prev) => ({ ...prev, bottles: true }));
          }
          break;
        case "stats":
          if (!adminDataLoaded.stats) {
            // SalesStatistics 컴포넌트 내부에서 처리
            setAdminDataLoaded((prev) => ({ ...prev, stats: true }));
          }
          break;
      }
    }
  };

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
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
      const orders = response.data.orders || [];

      // 각 주문에 대해 결제 상태를 계산하여 설정
      const ordersWithPaymentStatus = orders.map((order: any) => ({
        ...order,
        paymentStatus:
          order.paymentStatus ||
          getPaymentStatusFromOrderStatus(order.status || "결제대기"),
      }));

      setUserOrders(ordersWithPaymentStatus);
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

    // 파일 크기 제한 검사 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("파일 크기는 5MB를 초과할 수 없습니다.");
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // 파일 타입 검증
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError(
        "지원하지 않는 파일 형식입니다. JPEG, PNG, GIF, WEBP 형식만 업로드 가능합니다.",
      );
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      if (uploadType === "background") {
        await adminApi.uploadLabelBackground(formData);
        setUploadSuccess("라벨 배경 이미지가 성공적으로 업로드되었습니다.");
        fetchLabelBackgrounds();
      } else if (uploadType === "icon") {
        await adminApi.uploadLabelIcon(formData);
        setUploadSuccess(
          "라벨 아이콘/장식 이미지가 성공적으로 업로드되었습니다.",
        );
        fetchLabelIcons();
      } else if (uploadType === "border") {
        await adminApi.uploadLabelBorder(formData);
        setUploadSuccess("라벨 테두리 이미지가 성공적으로 업로드되었습니다.");
        fetchLabelBorders();
      }
    } catch (error: any) {
      console.error("파일 업로드 오류:", error);
      setUploadError(error.message || "파일 업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // 이미지 삭제 처리
  const handleDeleteImage = async (
    type: "background" | "icon" | "border",
    filename: string,
  ) => {
    try {
      if (type === "background") {
        await adminApi.deleteLabelBackground(filename);
        setLabelBackgrounds((prev) =>
          prev.filter((bg) => bg.filename !== filename),
        );
      } else if (type === "icon") {
        await adminApi.deleteLabelIcon(filename);
        setLabelIcons((prev) =>
          prev.filter((icon) => icon.filename !== filename),
        );
      } else if (type === "border") {
        await adminApi.deleteLabelBorder(filename);
        setLabelBorders((prev) =>
          prev.filter((border) => border.filename !== filename),
        );
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
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      alert("팝업 차단을 해제해주세요.");
      setIsPrinting(false);
      return;
    }

    // 와인병 정보 가져오기
    const getWineBottle = (bottleId: string) => {
      const bottles = [
        {
          id: "bordeaux-red",
          name: "까베르네쇼비뇽 레드",
          image: "/images/wine-bottle-1.png",
          type: "red",
          bottleType: "bordeaux",
        },
        {
          id: "bordeaux-white",
          name: "쇼비뇽블랑 화이트",
          image: "/images/wine-bottle-2.png",
          type: "white",
          bottleType: "bordeaux",
        },
        {
          id: "bordeaux-rose",
          name: "쇼비뇽블랑 로제",
          image: "/images/wine-bottle-3.png",
          type: "rose",
          bottleType: "bordeaux",
        },
        {
          id: "burgundy-red",
          name: "샤도네이 레드",
          image: "/images/wine-bottle-5.png",
          type: "red",
          bottleType: "burgundy",
        },
        {
          id: "burgundy-white",
          name: "샤도네이 화이트",
          image: "/images/wine-bottle-6.png",
          type: "white",
          bottleType: "burgundy",
        },
        {
          id: "burgundy-rose",
          name: "샤도네이 로제",
          image: "/images/wine-bottle-7.png",
          type: "rose",
          bottleType: "burgundy",
        },
      ];
      return bottles.find((bottle) => bottle.id === bottleId);
    };

    const wineBottle = getWineBottle(order.bottleId);

    // 인쇄할 HTML 생성 - 전체 미리보기 스타일
    printWindow.document.write(`
      <html>
        <head>
          <title>와인 라벨 디자인 미리보기</title>
          <style>
            @media print {
              body { 
                margin: 0; 
                padding: 20px;
                font-family: Arial, sans-serif;
                background: white;
              }
              .preview-container {
                width: 100%;
                max-width: 800px;
                margin: 0 auto;
                text-align: center;
              }
              .wine-bottle-container {
                position: relative;
                display: inline-block;
                margin: 20px 0;
              }
              .wine-bottle {
                height: 400px;
                width: auto;
                object-fit: contain;
              }
              .label-overlay {
                position: absolute;
                top: 65%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 140px;
                height: 170px;
                z-index: 10;
              }
              .label-background {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 4px;
              }
              .label-text {
                position: absolute;
                font-weight: bold;
                color: ${order.labelDesign?.textColor || "#000"};
                font-family: ${order.labelDesign?.font || "Arial"};
                font-size: ${(order.labelDesign?.textSize || 1.2) * 10}px;
                transform: translate(-50%, -50%);
                left: ${order.labelDesign?.textPosition?.x || 50}%;
                top: ${order.labelDesign?.textPosition?.y || 40}%;
                white-space: nowrap;
                max-width: 90%;
                overflow: hidden;
                text-overflow: ellipsis;
              }
              .label-subtext {
                position: absolute;
                color: ${order.labelDesign?.textColor || "#000"};
                font-family: ${order.labelDesign?.font || "Arial"};
                font-size: ${(order.labelDesign?.subtextSize || 0.8) * 10}px;
                transform: translate(-50%, -50%);
                left: ${order.labelDesign?.subtextPosition?.x || 50}%;
                top: ${order.labelDesign?.subtextPosition?.y || 60}%;
                white-space: nowrap;
                max-width: 90%;
                overflow: hidden;
                text-overflow: ellipsis;
              }
              .label-decoration {
                position: absolute;
                width: 25px;
                height: 25px;
                transform: translate(-50%, -50%);
                object-fit: contain;
              }
              .order-info {
                margin-top: 30px;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 8px;
                text-align: left;
              }
              .order-info h3 {
                margin-top: 0;
                color: #333;
                border-bottom: 2px solid #722F37;
                padding-bottom: 5px;
                margin-bottom: 15px;
              }
              .info-section {
                margin-bottom: 20px;
              }
              .info-section h4 {
                margin: 0 0 10px 0;
                color: #555;
                font-size: 16px;
                border-bottom: 1px solid #ddd;
                padding-bottom: 3px;
              }
              .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin-top: 10px;
              }
              .info-item {
                margin-bottom: 8px;
              }
              .info-label {
                font-weight: bold;
                color: #555;
                margin-right: 8px;
              }
              .info-value {
                color: #333;
              }
            }
          </style>
        </head>
        <body>
          <div class="preview-container">
            <h2 style="color: #722F37; margin-bottom: 30px;">와인 라벨 디자인 미리보기</h2>

            <!-- 와인병과 라벨 미리보기 -->
            <div class="wine-bottle-container">
              <img src="${wineBottle?.image || "/images/wine-bottle-1.png"}" alt="${order.bottleName}" class="wine-bottle" />

              <!-- 라벨 오버레이 -->
              <div class="label-overlay">
                ${
                  order.labelImage
                    ? `
                  <img src="${order.labelImage}" alt="라벨 디자인" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px;" />
                `
                    : `
                  <img src="/images/label/${order.labelDesign?.template || "default"}.jpg" alt="라벨 배경" class="label-background" />

                  <div class="label-text">${order.labelDesign?.text || "와인 이름"}</div>
                  <div class="label-subtext">${order.labelDesign?.subtext || "부가 설명"}</div>

                  ${
                    order.labelDesign?.decorations
                      ? order.labelDesign.decorations
                          .map(
                            (deco) => `
                    <img 
                      class="label-decoration" 
                      src="/images/icon/${deco.decorationId}.png" 
                      alt="장식" 
                      style="left: ${deco.position.x}%; top: ${deco.position.y}%;"
                    />
                  `,
                          )
                          .join("")
                      : ""
                  }
                `
                }
              </div>
            </div>

            <!-- 주문 정보 -->
            <div class="order-info">
              <h3>주문 정보</h3>
              <div class="info-grid">
                <div>
                  <div class="info-item">
                    <span class="info-label">주문번호:</span>
                    <span class="info-value">${order.id}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">주문자:</span>
                    <span class="info-value">${order.customerName}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">이메일:</span>
                    <span class="info-value">${order.customerEmail}</span>
                  </div>
                  ${
                    order.customerPhone
                      ? `
                  <div class="info-item">
                    <span class="info-label">전화번호:</span>
                    <span class="info-value">${order.customerPhone}</span>
                  </div>
                  `
                      : ""
                  }
                  <div class="info-item">
                    <span class="info-label">와인병:</span>
                    <span class="info-value">${order.bottleName}</span>
                  </div>
                </div>
                <div>
                  <div class="info-item">
                    <span class="info-label">수량:</span>
                    <span class="info-value">${order.quantity || 1}매</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">상품 금액:</span>
                    <span class="info-value">${order.amount.toLocaleString()}원</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">배송비:</span>
                    <span class="info-value">${(order.deliveryFee || 3000).toLocaleString()}원</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">총 금액:</span>
                    <span class="info-value" style="color: #722F37; font-weight: bold;">${(order.amount + (order.deliveryFee || 3000)).toLocaleString()}원</span>
                  </div>
                  ${
                    order.customerAddress
                      ? `
                  <div class="info-item">
                    <span class="info-label">배송 주소:</span>
                    <span class="info-value">${order.customerAddress}</span>
                  </div>
                  `
                      : ""
                  }
                </div>
              </div>
            </div>
          </div>

          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
                window.close();
              }, 1000);
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();

    // 인쇄 후 상태 업데이트
    // updateOrderStatus(order.id, 'completed'); // 이 부분은 제거 (인쇄한다고 완료 상태로 변경할 필요 없음)

    setIsPrinting(false);
  };

  // 주문 상태 업데이트
  const updateOrderStatus = async (
    orderId: string,
    status:
      | "pending"
      | "processed"
      | "completed"
      | "cancelled"
      | "결제대기"
      | "결제완료"
      | "제작중"
      | "배송준비"
      | "배송중"
      | "배송완료"
      | "주문취소",
  ) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!data.success) {
        toast({
          title: "상태 업데이트 실패",
          description:
            data.message || "주문 상태를 업데이트하는데 실패했습니다.",
          variant: "destructive",
        });
        return;
      }

      // 상태 업데이트 성공
      toast({
        title: "상태 업데이트 성공",
        description: "주문 상태가 성공적으로 변경되었습니다.",
      });

      // 주문 목록 새로고침
      if (isAdmin) {
        await fetchOrders();
      } else {
        await fetchUserOrders();
      }
    } catch (error) {
      console.error("주문 상태 업데이트 오류:", error);
      toast({
        title: "상태 업데이트 실패",
        description: "주문 상태 업데이트 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // 운송장 추적 URL 생성 함수를 전역으로 이동
  const getTrackingUrl = (company: string, trackingNumber: string) => {
    switch (company) {
      case "cj":
        return `https://www.cjlogistics.com/ko/tool/parcel/tracking?gnbInvcNo=${trackingNumber}`;
      case "lotte":
        return `https://www.lotteglogis.com/home/reservation/tracking/index?InvNo=${trackingNumber}`;
      case "hanjin":
        return `https://www.hanjin.co.kr/kor/CMS/DeliveryMgr/WaybillResult.do?mCode=MN038&schLhblNo=${trackingNumber}`;
      case "logen":
        return `https://www.ilogen.com/web/personal/trace/${trackingNumber}`;
      case "post":
        return `https://service.epost.go.kr/trace.RetrieveDomRigiTraceList.comm?sid1=${trackingNumber}`;
      default:
        return "#";
    }
  };

  // 사용자 주문 내역 새로고침 함수 추가
  const refreshUserOrders = async () => {
    if (user?.email) {
      const response = await userApi.getUserOrders(user.email);
      const orders = response.data.orders || [];

      // 각 주문에 대해 결제 상태를 계산하여 설정
      const ordersWithPaymentStatus = orders.map((order: any) => ({
        ...order,
        paymentStatus:
          order.paymentStatus ||
          getPaymentStatusFromOrderStatus(order.status || "결제대기"),
      }));

      setUserOrders(ordersWithPaymentStatus);
    }
  };

  // 주문 상태에 따른 결제 상태 계산 함수
  const getPaymentStatusFromOrderStatus = (status: string) => {
    switch (status) {
      case "결제대기":
      case "pending":
        return "결제대기";
      case "결제완료":
      case "제작중":
      case "배송준비":
      case "배송중":
      case "배송완료":
      case "processed":
      case "completed":
        return "결제완료";
      case "주문취소":
      case "cancelled":
        return "결제취소";
      default:
        return "결제완료";
    }
  };

  // 알림 관련 함수들
  const fetchNotifications = async () => {
    if (!user?.email) return;

    try {
      const response = await fetch(
        `/api/notifications?email=${encodeURIComponent(user.email)}`,
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotifications(data.notifications || []);
          setUnreadCount(
            data.notifications?.filter((n: Notification) => !n.isRead).length ||
              0,
          );
        }
      }
    } catch (error) {
      console.error("알림 조회 오류:", error);
    }
  };

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

  // 모든 알림 읽음 처리
  const markAllNotificationsAsRead = async () => {
    if (!user?.email) return;

    try {
      const response = await fetch(`/api/notifications/read-all`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user.email }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notification) => ({ ...notification, isRead: true })),
        );
        setUnreadCount(0);
        toast({
          title: "알림 읽음 처리",
          description: "모든 알림을 읽음으로 처리했습니다.",
        });
      }
    } catch (error) {
      console.error("전체 알림 읽음 처리 오류:", error);
    }
  };

  useEffect(() => {
    // 초기 로드 시만 실행 - 탭 변경 시에는 handleAdminTabChange 사용
    if (isAdmin && adminActiveTab === "labels" && !adminDataLoaded.labels) {
      fetchLabelBackgrounds();
      fetchLabelIcons();
      fetchLabelBorders();
      setAdminDataLoaded((prev) => ({ ...prev, labels: true }));
    } else if (!isAdmin) {
      // 일반 사용자인 경우 자신의 주문 내역과 알림 가져오기
      fetchUserOrders();
      fetchNotifications(); // 알림도 초기에 로드
    }
  }, [isAdmin]); // adminActiveTab과 userActiveTab 의존성 제거

  useEffect(() => {
    // 주문 내역 탭이 활성화되었을 때 주문 정보 갱신
    if (userActiveTab === "orders" && !isAdmin) {
      // 최초 로드
      if (userOrders.length === 0) {
        fetchUserOrders();
      }

      // 주기적 새로고침 (30초마다) - 관리자 상태 변경 반영
      const interval = setInterval(() => {
        refreshUserOrders();
      }, 30000); // 30초마다 새로고침

      return () => clearInterval(interval);
    }

    // 알림 탭이 활성화되었을 때 알림 정보 갱신
    if (userActiveTab === "notifications" && !isAdmin) {
      fetchNotifications();

      // 주기적 새로고침 (1분마다) - 새로운 알림 확인
      const interval = setInterval(() => {
        fetchNotifications();
      }, 60000); // 1분마다 새로고침

      return () => clearInterval(interval);
    }
  }, [userActiveTab, isAdmin, userOrders.length]);

  // 주문 상세 보기 다이얼로그
  function OrderDetailDialog({
    order,
    onClose,
    onStatusUpdate,
    isAdmin,
  }: {
    order: WineOrder | null;
    onClose: () => void;
    onStatusUpdate?: (
      orderId: string,
      status: "pending" | "processed" | "completed" | "cancelled",
    ) => Promise<void>;
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
          publish ? galleryTitle : undefined,
        );

        toast({
          title: publish
            ? "갤러리에 공개되었습니다"
            : "갤러리에서 숨김 처리되었습니다",
        });

        // 주문 상세 정보 업데이트 (onStatusUpdate를 통해 목록 갱신)
        // if (onStatusUpdate) {
        //   onStatusUpdate(order.id, order.status);
        // }
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
    const formattedDate = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, "0")}-${String(orderDate.getDate()).padStart(2, "0")}`;

    const getTrackingUrl = (company: string, trackingNumber: string) => {
      switch (company) {
        case "cj":
          return `https://www.cjlogistics.com/ko/tool/parcel/tracking?gnbInvcNo=${trackingNumber}`;
        case "lotte":
          return `https://www.lotteglogis.com/home/reservation/tracking/index?InvNo=${trackingNumber}`;
        case "hanjin":
          return `https://www.hanjin.co.kr/kor/CMS/DeliveryMgr/WaybillResult.do?mCode=MN038&schLhblNo=${trackingNumber}`;
        case "logen":
          return `https://www.ilogen.com/web/personal/trace/${trackingNumber}`;
        case "post":
          return `https://service.epost.go.kr/trace.RetrieveDomRigiTraceList.comm?sid1=${trackingNumber}`;
        default:
          return "#";
      }
    };

    return (
      <Dialog open={!!order} onOpenChange={() => onClose()}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>주문 상세 정보</DialogTitle>
            <DialogDescription>
              주문한 와인 라벨의 상세 정보와 디자인을 확인할 수 있습니다.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">주문 정보</h3>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="font-medium">주문번호:</span> {order.id}
                  </p>
                  <p>
                    <span className="font-medium">주문일자:</span>{" "}
                    {formattedDate}
                  </p>
                  <p>
                    <span className="font-medium">주문상태:</span>{" "}
                    {order.status === "completed"
                      ? "완료"
                      : order.status === "processed"
                        ? "처리 중"
                        : order.status === "cancelled"
                          ? "취소됨"
                          : "대기 중"}
                  </p>
                  <p>
                    <span className="font-medium">와인병:</span>{" "}
                    {order.bottleName}
                  </p>
                  <p>
                    <span className="font-medium">수량:</span> {order.quantity}
                    개
                  </p>
                  <p>
                    <span className="font-medium">금액:</span>{" "}
                    {order.amount.toLocaleString()}원
                  </p>
                  {order.paymentId && (
                    <p>
                      <span className="font-medium">결제ID:</span>{" "}
                      {order.paymentId}
                    </p>
                  )}
                </div>
              </div>

              {/* 결제 및 배송 정보 추가 */}
              <div>
                <h3 className="text-lg font-medium mb-2">결제 및 배송 정보</h3>
                <div className="text-sm space-y-1 bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                  <p>
                    <span className="font-medium text-gray-300">
                      배송 방법:
                    </span>
                    <span className="text-gray-200">
                      {order.deliveryMethod === "standard"
                        ? "일반 배송"
                        : order.deliveryMethod === "express"
                          ? "빠른 배송"
                          : order.deliveryMethod === "same-day"
                            ? "당일 배송"
                            : "일반 배송"}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium text-gray-300">배송비:</span>
                    <span className="text-gray-200">
                      {(order.deliveryFee || 3000).toLocaleString()}원
                    </span>
                  </p>
                  <p>
                    <span className="font-medium text-gray-300">
                      총 결제 금액:
                    </span>
                    <span className="text-green-400 font-semibold">
                      {(
                        order.amount + (order.deliveryFee || 3000)
                      ).toLocaleString()}
                      원
                    </span>
                  </p>
                  {order.paymentId && (
                    <p>
                      <span className="font-medium text-gray-300">
                        결제 방법:
                      </span>
                      <span className="text-gray-200">온라인 결제</span>
                    </p>
                  )}
                  <p>
                    <span className="font-medium text-gray-300">
                      결제 상태:
                    </span>
                    <span
                      className={`${
                        order.paymentId ||
                        order.status === "결제완료" ||
                        order.status === "제작중" ||
                        order.status === "배송준비" ||
                        order.status === "배송중" ||
                        order.status === "배송완료"
                          ? "text-green-400"
                          : order.status === "cancelled" ||
                              order.status === "주문취소"
                            ? "text-red-400"
                            : "text-yellow-400"
                      }`}
                    >
                      {order.paymentId ||
                      order.status === "결제완료" ||
                      order.status === "제작중" ||
                      order.status === "배송준비" ||
                      order.status === "배송중" ||
                      order.status === "배송완료"
                        ? "결제완료"
                        : order.status === "cancelled" ||
                            order.status === "주문취소"
                          ? "결제취소"
                          : "결제대기"}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium text-gray-300">
                      주문 상태:
                    </span>
                    <span
                      className={`${
                        order.status === "completed" ||
                        order.status === "배송완료"
                          ? "text-green-400"
                          : order.status === "processed" ||
                              order.status === "제작중" ||
                              order.status === "배송준비" ||
                              order.status === "배송중"
                            ? "text-blue-400"
                            : order.status === "cancelled" ||
                                order.status === "주문취소"
                              ? "text-red-400"
                              : "text-yellow-400"
                      }`}
                    >
                      {order.status === "completed" ||
                      order.status === "배송완료"
                        ? "배송완료"
                        : order.status === "processed" ||
                            order.status === "제작중"
                          ? "제작중"
                          : order.status === "배송준비"
                            ? "배송준비"
                            : order.status === "배송중"
                              ? "배송중"
                              : order.status === "cancelled" ||
                                  order.status === "주문취소"
                                ? "주문취소"
                                : order.status === "결제완료"
                                  ? "결제완료"
                                  : "결제대기"}
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">고객 정보</h3>
                <div className="text-sm space-y-1 bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                  <p>
                    <span className="font-medium text-gray-300">이름:</span>{" "}
                    <span className="text-gray-200">{order.customerName}</span>
                  </p>
                  <p>
                    <span className="font-medium text-gray-300">이메일:</span>{" "}
                    <span className="text-gray-200">{order.customerEmail}</span>
                  </p>
                  {order.customerPhone && (
                    <p>
                      <span className="font-medium text-gray-300">
                        전화번호:
                      </span>{" "}
                      <span className="text-gray-200">
                        {order.customerPhone}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* 배송 정보 */}
              <div>
                <h3 className="text-lg font-medium mb-2">배송 정보</h3>
                <div className="text-sm space-y-1 bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                  {order.customerAddress ? (
                    <>
                      <p>
                        <span className="font-medium text-gray-300">
                          배송 주소:
                        </span>{" "}
                        <span className="text-gray-200">
                          {order.customerAddress}
                        </span>
                      </p>
                      {order.customerZipCode && (
                        <p>
                          <span className="font-medium text-gray-300">
                            우편번호:
                          </span>{" "}
                          <span className="text-gray-200">
                            {order.customerZipCode}
                          </span>
                        </p>
                      )}
                    </>
                  ) : (
                    <p>
                      <span className="font-medium text-gray-300">
                        배송 주소:
                      </span>{" "}
                      <span className="text-gray-400">배송 정보 없음</span>
                    </p>
                  )}

                  <p>
                    <span className="font-medium text-gray-300">
                      배송 방법:
                    </span>
                    <span className="text-gray-200">
                      {order.deliveryMethod === "standard"
                        ? "일반 배송"
                        : order.deliveryMethod === "express"
                          ? "빠른 배송"
                          : order.deliveryMethod === "same-day"
                            ? "당일 배송"
                            : "일반 배송"}
                    </span>
                  </p>

                  <p>
                    <span className="font-medium text-gray-300">배송비:</span>
                    <span className="text-gray-200">
                      {(order.deliveryFee || 3000).toLocaleString()}원
                    </span>
                  </p>

                  {order.trackingNumber && (
                    <>
                      <p>
                        <span className="font-medium text-gray-300">
                          배송사:
                        </span>
                        <span className="text-gray-200">
                          {order.shippingCompany === "cj"
                            ? "CJ대한통운"
                            : order.shippingCompany === "lotte"
                              ? "롯데택배"
                              : order.shippingCompany === "hanjin"
                                ? "한진택배"
                                : order.shippingCompany === "logen"
                                  ? "로젠택배"
                                  : order.shippingCompany === "post"
                                    ? "우체국택배"
                                    : "택배사"}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium text-gray-300">
                          운송장번호:
                        </span>
                        <span className="text-gray-200">
                          {order.trackingNumber}
                        </span>
                        <a
                          href={getTrackingUrl(
                            order.shippingCompany || "cj",
                            order.trackingNumber,
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 inline-flex items-center text-blue-500 hover:text-blue-700"
                        >
                          <ExternalLink className="w-4 h-4" /> 배송조회
                        </a>
                      </p>
                    </>
                  )}
                </div>
              </div>

              {isAdmin && (
                <div>
                  <h3 className="text-lg font-medium mb-2">주문 상태 관리</h3>
                  <div className="flex space-x-2">
                    <Button
                      variant={
                        order.status === "pending" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        onStatusUpdate && onStatusUpdate(order.id, "pending")
                      }
                    >
                      대기 중
                    </Button>
                    <Button
                      variant={
                        order.status === "processed" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        onStatusUpdate && onStatusUpdate(order.id, "processed")
                      }
                    >
                      처리 중
                    </Button>
                    <Button
                      variant={
                        order.status === "completed" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        onStatusUpdate && onStatusUpdate(order.id, "completed")
                      }
                    >
                      완료
                    </Button>
                    <Button
                      variant={
                        order.status === "cancelled" ? "destructive" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        onStatusUpdate && onStatusUpdate(order.id, "cancelled")
                      }
                    >
                      취소
                    </Button>
                  </div>
                </div>
              )}

              {order.status === "completed" && (
                <div>
                  <h3 className="text-lg font-medium mb-2">갤러리 공개 설정</h3>

                  {order.publishToGallery ? (
                    <div className="space-y-3">
                      <p className="text-sm text-green-600">
                        이 라벨은 현재 갤러리에 공개되어 있습니다.
                      </p>
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
                        갤러리에 공개하면 다른 사용자들이 이 라벨 디자인을 보고
                        좋아요와 댓글을 남길 수 있습니다.
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
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs 
                  ${
                    user?.userType === "admin"
                      ? "bg-red-500/20 text-red-400"
                      : "bg-green-500/20 text-green-400"
                  }`}
                >
                  {user?.userType === "admin" ? "관리자" : "일반 회원"}
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
            <TabsList className="grid grid-cols-3 gap-2">
              <TabsTrigger value="orders">주문 내역</TabsTrigger>
              <TabsTrigger value="notifications" className="relative">
                알림
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </TabsTrigger>
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
                            <th className="px-4 py-2 text-left">결제상태</th>
                            <th className="px-4 py-2 text-left">주문상태</th>
                            <th className="px-4 py-2 text-left">배송 정보</th>
                            <th className="px-4 py-2 text-right">가격</th>
                            <th className="px-4 py-2 text-center">
                              디자인 보기
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {userOrders.map((order) => (
                            <tr
                              key={order.id}
                              className="border-t border-gray-700"
                            >
                              <td className="px-4 py-3">{order.id}</td>
                              <td className="px-4 py-3">{order.bottleName}</td>
                              <td className="px-4 py-3">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </td>
                              {/* 결제상태 */}
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs 
                                  ${
                                    order.paymentStatus === "결제완료" ||
                                    (!order.paymentStatus &&
                                      (order.status === "결제완료" ||
                                        order.status === "제작중" ||
                                        order.status === "배송준비" ||
                                        order.status === "배송중" ||
                                        order.status === "배송완료"))
                                      ? "bg-green-500/20 text-green-400"
                                      : order.paymentStatus === "결제취소" ||
                                          (!order.paymentStatus &&
                                            (order.status === "주문취소" ||
                                              order.status === "cancelled"))
                                        ? "bg-red-500/20 text-red-400"
                                        : "bg-yellow-500/20 text-yellow-400"
                                  }`}
                                >
                                  {order.paymentStatus ||
                                    (order.paymentId ||
                                    order.status === "결제완료" ||
                                    order.status === "제작중" ||
                                    order.status === "배송준비" ||
                                    order.status === "배송중" ||
                                    order.status === "배송완료"
                                      ? "결제완료"
                                      : order.status === "주문취소" ||
                                          order.status === "cancelled"
                                        ? "결제취소"
                                        : "결제대기")}
                                </span>
                              </td>
                              {/* 주문상태 */}
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs 
                                  ${
                                    order.status === "completed" ||
                                    order.status === "배송완료"
                                      ? "bg-green-500/20 text-green-400"
                                      : order.status === "processed" ||
                                          order.status === "제작중" ||
                                          order.status === "배송준비" ||
                                          order.status === "배송중"
                                        ? "bg-blue-500/20 text-blue-400"
                                        : order.status === "cancelled" ||
                                            order.status === "주문취소"
                                          ? "bg-red-500/20 text-red-400"
                                          : "bg-yellow-500/20 text-yellow-400"
                                  }`}
                                >
                                  {order.status === "completed" ||
                                  order.status === "배송완료"
                                    ? "배송완료"
                                    : order.status === "processed" ||
                                        order.status === "제작중"
                                      ? "제작중"
                                      : order.status === "배송준비"
                                        ? "배송준비"
                                        : order.status === "배송중"
                                          ? "배송중"
                                          : order.status === "cancelled" ||
                                              order.status === "주문취소"
                                            ? "주문취소"
                                            : order.status === "결제완료"
                                              ? "결제완료"
                                              : "결제대기"}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                {order.customerAddress ? (
                                  <div className="text-sm">
                                    <div
                                      className="text-gray-300 font-medium truncate max-w-[150px]"
                                      title={order.customerAddress}
                                    >
                                      {order.customerAddress}
                                    </div>
                                    <div className="text-gray-400 text-xs">
                                      {order.deliveryMethod === "standard"
                                        ? "일반 배송"
                                        : order.deliveryMethod === "express"
                                          ? "빠른 배송"
                                          : order.deliveryMethod === "same-day"
                                            ? "당일 배송"
                                            : "일반 배송"}
                                      {order.deliveryFee === 0
                                        ? " (무료)"
                                        : ` (${(order.deliveryFee || 3000).toLocaleString()}원)`}
                                    </div>
                                    {order.trackingNumber && (
                                      <div className="text-cyan-400 text-xs mt-1">
                                        {order.shippingCompany === "cj"
                                          ? "CJ대한통운"
                                          : order.shippingCompany === "lotte"
                                            ? "롯데택배"
                                            : order.shippingCompany === "hanjin"
                                              ? "한진택배"
                                              : order.shippingCompany ===
                                                  "logen"
                                                ? "로젠택배"
                                                : order.shippingCompany ===
                                                    "post"
                                                  ? "우체국택배"
                                                  : "택배사"}
                                        : {order.trackingNumber}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-500 text-sm">
                                    배송 정보 없음
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {new Intl.NumberFormat("ko-KR").format(
                                  order.amount,
                                )}
                                원
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-center gap-2">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8"
                                        onClick={() =>
                                          handleViewOrder(order.id)
                                        }
                                      >
                                        <Tag className="h-3.5 w-3.5 mr-1" />
                                        상세
                                      </Button>
                                    </DialogTrigger>
                                    {/* 선택된 주문 세부 정보 */}
                                    {selectedOrder && (
                                      <OrderDetailDialog
                                        order={selectedOrder}
                                        onClose={() => {
                                          setSelectedOrder(null);
                                          refreshUserOrders(); // 다이얼로그가 닫힐 때 주문 목록 새로고침
                                        }}
                                        onStatusUpdate={async (
                                          orderId,
                                          status,
                                        ) => {
                                          await updateOrderStatus(
                                            orderId,
                                            status,
                                          );
                                          refreshUserOrders(); // 상태 변경 후 주문 목록 새로고침
                                        }}
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
                    <p className="text-center py-8 text-gray-400">
                      주문 내역이 없습니다.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 알림 탭 */}
            <TabsContent value="notifications">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>알림</CardTitle>
                  <CardDescription>
                    주문 및 배송 상태 변경 등 시스템 알림을 확인합니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {notifications.length > 0 ? (
                    <div className="space-y-4">
                      {/* 모든 알림 읽음 처리 버튼을 상단으로 이동 */}
                      {unreadCount > 0 && (
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-400">
                            읽지 않은 알림 {unreadCount}개
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-400 hover:text-blue-300"
                            onClick={markAllNotificationsAsRead}
                          >
                            모든 알림 읽음 처리
                          </Button>
                        </div>
                      )}

                      {/* 알림 목록 - 최신순으로 정렬 */}
                      {notifications
                        .sort(
                          (a, b) =>
                            new Date(b.createdAt).getTime() -
                            new Date(a.createdAt).getTime(),
                        )
                        .map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                              notification.isRead
                                ? "bg-gray-700/50 border-gray-600"
                                : "bg-blue-900/20 border-blue-600/50 shadow-blue-900/20"
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3 flex-1">
                                {/* 알림 타입별 아이콘 */}
                                <div
                                  className={`p-2 rounded-full ${
                                    notification.type === "shipping"
                                      ? "bg-green-500/20 text-green-400"
                                      : notification.type === "order"
                                        ? "bg-blue-500/20 text-blue-400"
                                        : "bg-yellow-500/20 text-yellow-400"
                                  }`}
                                >
                                  {notification.type === "shipping" && (
                                    <Truck className="w-4 h-4" />
                                  )}
                                  {notification.type === "order" && (
                                    <Package className="w-4 h-4" />
                                  )}
                                  {notification.type === "system" && (
                                    <Bell className="w-4 h-4" />
                                  )}
                                </div>

                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h4 className="font-medium text-gray-200">
                                      {notification.title}
                                    </h4>
                                    {!notification.isRead && (
                                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                    )}
                                  </div>
                                  <p className="text-gray-300 text-sm mb-2">
                                    {notification.message}
                                  </p>
                                  <p className="text-gray-500 text-xs">
                                    {new Date(
                                      notification.createdAt,
                                    ).toLocaleString("ko-KR")}
                                  </p>
                                </div>
                              </div>

                              {/* 액션 버튼들 */}
                              <div className="flex flex-col space-y-2">
                                {notification.orderId &&
                                  typeof notification.orderId === "string" && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-blue-400 hover:text-blue-300"
                                      onClick={() =>
                                        handleViewOrder(
                                          notification.orderId as string,
                                        )
                                      }
                                    >
                                      주문 보기
                                    </Button>
                                  )}
                                {!notification.isRead && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-green-400 hover:text-green-300"
                                    onClick={() =>
                                      markNotificationAsRead(notification.id)
                                    }
                                  >
                                    읽음
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Bell className="w-12 h-12 mx-auto text-gray-500 mb-4" />
                      <p className="text-gray-400">새로운 알림이 없습니다.</p>
                      <p className="text-gray-500 text-sm mt-1">
                        주문 상태가 변경되면 여기에 알림이 표시됩니다.
                      </p>
                    </div>
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
                  <UserSalesStatistics />
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
            onValueChange={handleAdminTabChange}
            className="mt-6"
          >
            <TabsList className="grid grid-cols-5 gap-2">
              <TabsTrigger value="bottles">와인병/가격</TabsTrigger>
              <TabsTrigger value="backgrounds">배경 카테고리</TabsTrigger>
              <TabsTrigger value="labels">라벨 리소스</TabsTrigger>
              <TabsTrigger value="orders">주문 관리</TabsTrigger>
              <TabsTrigger value="stats">매출 통계</TabsTrigger>
            </TabsList>

            {/* 배경 카테고리 관리 탭 */}
            <TabsContent value="backgrounds">
              <LabelBackgroundManagement />
            </TabsContent>

            {/* 라벨 관리 탭 */}
            <TabsContent value="labels">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>와인 라벨 리소스 관리</CardTitle>
                  <CardDescription>
                    라벨 배경, 아이콘 및 장식을 관리합니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* 이미지 유형 탭 */}
                    <Tabs
                      defaultValue="icon"
                      className="w-full"
                      onValueChange={(value) =>
                        setUploadType(value as "background" | "icon" | "border")
                      }
                    >
                      <TabsList className="grid grid-cols-2 gap-2 mb-6">
                        <TabsTrigger value="icon" className="justify-center">
                          <FileImage className="w-4 h-4 mr-2" />
                          아이콘/장식
                        </TabsTrigger>
                        <TabsTrigger value="border" className="justify-center">
                          <Package className="w-4 h-4 mr-2" />
                          테두리 스타일
                        </TabsTrigger>
                      </TabsList>

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
                              {isUploading && uploadType === "icon" ? (
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

                          {uploadError && uploadType === "icon" && (
                            <Alert variant="destructive" className="mt-3">
                              <AlertDescription>{uploadError}</AlertDescription>
                            </Alert>
                          )}

                          {uploadSuccess && uploadType === "icon" && (
                            <Alert className="mt-3 bg-green-900/30 border-green-900 text-green-300">
                              <AlertDescription>
                                {uploadSuccess}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>

                        {/* 아이콘 및 장식 목록 */}
                        <h3 className="text-lg font-medium mb-3">
                          아이콘 및 장식
                        </h3>
                        {labelIcons.length > 0 ? (
                          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                            {labelIcons.map((icon) => (
                              <div
                                key={icon.id}
                                className="bg-gray-700 p-2 rounded-lg"
                              >
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
                                    onClick={() =>
                                      handleDeleteImage("icon", icon.filename)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                <p className="text-sm font-medium truncate">
                                  {icon.name}
                                </p>
                                <p className="text-xs text-gray-400 truncate">
                                  {icon.filename}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center py-8 text-gray-400">
                            등록된 아이콘/장식이 없습니다.
                          </p>
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
                              {isUploading && uploadType === "border" ? (
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

                          {uploadError && uploadType === "border" && (
                            <Alert variant="destructive" className="mt-3">
                              <AlertDescription>{uploadError}</AlertDescription>
                            </Alert>
                          )}

                          {uploadSuccess && uploadType === "border" && (
                            <Alert className="mt-3 bg-green-900/30 border-green-900 text-green-300">
                              <AlertDescription>
                                {uploadSuccess}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>

                        {/* 테두리 이미지 목록 */}
                        <h3 className="text-lg font-medium mb-3">
                          테두리 스타일
                        </h3>
                        {labelBorders.length > 0 ? (
                          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                            {labelBorders.map((border) => (
                              <div
                                key={border.id}
                                className="bg-gray-700 p-2 rounded-lg"
                              >
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
                                    onClick={() =>
                                      handleDeleteImage(
                                        "border",
                                        border.filename,
                                      )
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                <p className="text-sm font-medium truncate">
                                  {border.name}
                                </p>
                                <p className="text-xs text-gray-400 truncate">
                                  {border.filename}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center py-8 text-gray-400">
                            등록된 테두리 이미지가 없습니다.
                          </p>
                        )}
                      </TabsContent>
                    </Tabs>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 주문 관리 탭 */}
            <TabsContent value="orders">
              <OrderManagement />
            </TabsContent>

            {/* 매출 통계 탭 */}
            <TabsContent value="stats">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>매출 통계</CardTitle>
                    <CardDescription>
                      와인 주문 매출 통계를 확인합니다.
                    </CardDescription>
                  </div>
                  <BarChart className="w-6 h-6 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <SalesStatistics />
                </CardContent>
              </Card>
            </TabsContent>

            {/* 와인병/가격 탭 */}
            <TabsContent value="bottles">
              <WineBottleManagement />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
