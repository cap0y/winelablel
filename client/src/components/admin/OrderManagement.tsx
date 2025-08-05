import { useState, useEffect, useMemo, useCallback } from "react";
import { adminApi, orderApi } from "@/services/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  ArrowUpDown,
  Check,
  Truck,
  Package,
  Bell,
  ExternalLink,
  Printer,
  Eye,
  Globe,
  EyeOff,
} from "lucide-react";
import { Label } from "@/components/ui/label";

// 주문 상태 타입 정의
type OrderStatus =
  | "결제대기"
  | "결제완료"
  | "제작중"
  | "배송준비"
  | "배송중"
  | "배송완료"
  | "주문취소";

// 관리자 알림 인터페이스 추가
interface AdminNotification {
  id: string;
  type: "shipping" | "order" | "system";
  title: string;
  message: string;
  orderId?: string;
  customerEmail?: string;
  isRead: boolean;
  createdAt: string;
}

// 배송 회사 목록
const shippingCompanies = [
  { id: "cj", name: "CJ대한통운" },
  { id: "lotte", name: "롯데택배" },
  { id: "hanjin", name: "한진택배" },
  { id: "logen", name: "로젠택배" },
  { id: "post", name: "우체국택배" },
];

// 주문 상태에 따른 배지 색상 정의 - 네온 스타일로 수정
const getStatusBadgeColor = (status: OrderStatus) => {
  switch (status) {
    case "결제대기":
      return "bg-yellow-500/20 text-yellow-400 border border-yellow-500";
    case "결제완료":
      return "bg-blue-500/20 text-blue-400 border border-blue-500";
    case "제작중":
      return "bg-purple-500/20 text-purple-400 border border-purple-500";
    case "배송준비":
      return "bg-indigo-500/20 text-indigo-400 border border-indigo-500";
    case "배송중":
      return "bg-cyan-500/20 text-cyan-400 border border-cyan-500";
    case "배송완료":
      return "bg-green-500/20 text-green-400 border border-green-500";
    case "주문취소":
      return "bg-red-500/20 text-red-400 border border-red-500";
    default:
      return "bg-gray-500/20 text-gray-400 border border-gray-500";
  }
};

// 와인병 정보 가져오는 함수
const getWineBottle = (bottleId: string) => {
  const bottles = [
    {
      id: "bordeaux-red",
      name: "까베르네쇼비뇽 레드",
      image: "/images/wine-bottle-1.png",
      type: "red",
      bottleType: "bordeaux",
      dimensions: "높이 30cm x 지름 7.5cm",
      capacity: "750ml",
      price: 5000,
      labelSize: {
        width: 17.62,
        height: 20.16,
        position: { top: 70, left: 75 },
      },
    },
    {
      id: "bordeaux-white",
      name: "쇼비뇽블랑 화이트",
      image: "/images/wine-bottle-2.png",
      type: "white",
      bottleType: "bordeaux",
      dimensions: "높이 30cm x 지름 7.5cm",
      capacity: "750ml",
      price: 5200,
      labelSize: {
        width: 17.62,
        height: 20.16,
        position: { top: 70, left: 75 },
      },
    },
    {
      id: "bordeaux-rose",
      name: "쇼비뇽블랑 로제",
      image: "/images/wine-bottle-3.png",
      type: "rose",
      bottleType: "bordeaux",
      dimensions: "높이 30cm x 지름 7.5cm",
      capacity: "750ml",
      price: 5500,
      labelSize: {
        width: 17.62,
        height: 20.16,
        position: { top: 70, left: 75 },
      },
    },
    {
      id: "burgundy-red",
      name: "샤도네이 레드",
      image: "/images/wine-bottle-5.png",
      type: "red",
      bottleType: "burgundy",
      dimensions: "높이 29cm x 지름 8cm",
      capacity: "750ml",
      price: 5800,
      labelSize: {
        width: 20.16,
        height: 18.89,
        position: { top: 75, left: 75 },
      },
    },
    {
      id: "burgundy-white",
      name: "샤도네이 화이트",
      image: "/images/wine-bottle-6.png",
      type: "white",
      bottleType: "burgundy",
      dimensions: "높이 29cm x 지름 8cm",
      capacity: "750ml",
      price: 5300,
      labelSize: {
        width: 20.16,
        height: 18.89,
        position: { top: 75, left: 75 },
      },
    },
    {
      id: "burgundy-rose",
      name: "샤도네이 로제",
      image: "/images/wine-bottle-7.png",
      type: "rose",
      bottleType: "burgundy",
      dimensions: "높이 29cm x 지름 8cm",
      capacity: "750ml",
      price: 6000,
      labelSize: {
        width: 20.16,
        height: 18.89,
        position: { top: 75, left: 75 },
      },
    },
  ];

  return bottles.find((bottle) => bottle.id === bottleId);
};

// DraggableElement 컴포넌트 추가 (장식 표시용)
function StaticElement({
  children,
  position,
  type,
}: {
  children: React.ReactNode;
  position: { x: number; y: number };
  type: string;
}) {
  // x, y 위치를 -50% ~ 150% 범위에서 조정
  const adjustedLeft = Math.max(-50, Math.min(150, position.x));
  const adjustedTop = Math.max(-50, Math.min(150, position.y));

  return (
    <div
      style={{
        position: "absolute",
        left: `${adjustedLeft}%`,
        top: `${adjustedTop}%`,
        transform: "translate(-50%, -50%)",
        zIndex: 10, // 장식이 라벨 위에 표시되도록 zIndex 높게
        pointerEvents: "none", // 클릭 이벤트 무시
      }}
      data-type={type}
    >
      {children}
    </div>
  );
}

const OrderManagement = () => {
  const { toast } = useToast();

  // 상태 관리 - 캐싱 상태 추가
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [trackingNumbers, setTrackingNumbers] = useState<
    Record<string, string>
  >({});
  const [shippingCompany, setShippingCompany] = useState<
    Record<string, string>
  >({});
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [galleryTitle, setGalleryTitle] = useState("");
  const [showGallery, setShowGallery] = useState(true);

  // 캐싱 관련 상태
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const [cacheExpiry] = useState<number>(60000); // 1분 캐시

  // 관리자 알림 관련 상태
  const [adminNotifications, setAdminNotifications] = useState<
    AdminNotification[]
  >([]);
  const [adminUnreadCount, setAdminUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  // 갤러리 관련 함수 추가
  useEffect(() => {
    // 선택된 주문이 변경될 때 타이틀을 주문 타이틀 또는 와인 이름으로 초기화
    if (selectedOrder) {
      setGalleryTitle(selectedOrder.title || selectedOrder.bottleName || "");
      setShowGallery(!!selectedOrder.publishToGallery);
    }
  }, [selectedOrder]);

  // 갤러리 공개 설정 처리
  const handlePublishToGallery = async () => {
    if (!selectedOrder) return;

    try {
      setIsPublishing(true);

      // 갤러리 공개 상태 토글
      const publish = !selectedOrder.publishToGallery;

      await orderApi.togglePublishToGallery(
        selectedOrder.id,
        publish,
        publish ? galleryTitle : undefined,
      );

      // 선택된 주문과 주문 목록 모두 업데이트
      setSelectedOrder({
        ...selectedOrder,
        publishToGallery: publish,
        title: publish ? galleryTitle : selectedOrder.title,
      });

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === selectedOrder.id
            ? {
                ...order,
                publishToGallery: publish,
                title: publish ? galleryTitle : order.title,
              }
            : order,
        ),
      );

      toast({
        title: publish
          ? "갤러리에 공개되었습니다"
          : "갤러리에서 숨김 처리되었습니다",
      });
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

  // 관리자 알림 조회 함수
  const fetchAdminNotifications = async () => {
    try {
      const response = await fetch("/api/admin/notifications");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAdminNotifications(data.notifications || []);
          setAdminUnreadCount(
            data.notifications?.filter((n: AdminNotification) => !n.isRead)
              .length || 0,
          );
        }
      }
    } catch (error) {
      console.error("관리자 알림 조회 오류:", error);
    }
  };

  // 관리자 알림 읽음 처리
  const markAdminNotificationAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(
        `/api/notifications/${notificationId}/read`,
        {
          method: "PATCH",
        },
      );

      if (response.ok) {
        setAdminNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? { ...notification, isRead: true }
              : notification,
          ),
        );
        setAdminUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("관리자 알림 읽음 처리 오류:", error);
    }
  };

  // 모든 관리자 알림 읽음 처리
  const markAllAdminNotificationsAsRead = async () => {
    try {
      const response = await fetch("/api/admin/notifications/read-all", {
        method: "PATCH",
      });

      if (response.ok) {
        setAdminNotifications((prev) =>
          prev.map((notification) => ({ ...notification, isRead: true })),
        );
        setAdminUnreadCount(0);
        toast({
          title: "알림 읽음 처리",
          description: "모든 알림을 읽음으로 처리했습니다.",
        });
      }
    } catch (error) {
      console.error("전체 관리자 알림 읽음 처리 오류:", error);
    }
  };

  // 캐시된 주문 목록 조회 함수
  const fetchOrders = useCallback(
    async (forceRefresh = false) => {
      const now = Date.now();

      // 캐시가 유효하고 강제 새로고침이 아닌 경우 API 호출 생략
      if (
        !forceRefresh &&
        orders.length > 0 &&
        now - lastFetchTime < cacheExpiry
      ) {
        console.log("캐시된 주문 데이터 사용");
        return;
      }

      if (forceRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const response = await adminApi.getOrders();
        if (response.data.success) {
          const fetchedOrders = response.data.orders;

          // 각 주문의 결제 상태를 주문 상태에 따라 자동 계산
          const ordersWithPaymentStatus = fetchedOrders.map((order: any) => ({
            ...order,
            paymentStatus: getPaymentStatusFromOrderStatus(
              order.status || "결제완료",
            ),
          }));

          setOrders(ordersWithPaymentStatus);
          setLastFetchTime(now);

          // 기존 운송장 정보 초기화
          const initialTrackingNumbers: Record<string, string> = {};
          const initialShippingCompanies: Record<string, string> = {};

          ordersWithPaymentStatus.forEach((order: any) => {
            initialTrackingNumbers[order.id] = order.trackingNumber || "";
            initialShippingCompanies[order.id] = order.shippingCompany || "cj";
          });

          setTrackingNumbers(initialTrackingNumbers);
          setShippingCompany(initialShippingCompanies);
        }
      } catch (error) {
        console.error("주문 목록 로드 오류:", error);
        toast({
          title: "데이터 로드 실패",
          description: "주문 정보를 가져오는데 실패했습니다.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [orders.length, lastFetchTime, cacheExpiry, toast],
  );

  // 데이터 로드 - 초기 로드만 실행
  useEffect(() => {
    fetchOrders();
    fetchAdminNotifications(); // 관리자 알림도 초기 로드
  }, []); // 빈 의존성 배열로 초기 로드만 실행

  // 자동 새로고침 (5분마다)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders(true);
      fetchAdminNotifications(); // 관리자 알림도 주기적 업데이트
    }, 300000); // 5분

    return () => clearInterval(interval);
  }, [fetchOrders]);

  // 관리자 알림 전용 새로고침 (1분마다)
  useEffect(() => {
    const notificationInterval = setInterval(() => {
      fetchAdminNotifications();
    }, 60000); // 1분

    return () => clearInterval(notificationInterval);
  }, []);

  // 기존 주문들의 결제 상태 동기화
  useEffect(() => {
    if (orders.length > 0) {
      const updatedOrders = orders.map((order) => ({
        ...order,
        paymentStatus:
          order.paymentStatus ||
          getPaymentStatusFromOrderStatus(order.status || "결제완료"),
      }));

      // 결제 상태가 업데이트된 주문이 있는지 확인
      const hasUpdates = updatedOrders.some(
        (order, index) => order.paymentStatus !== orders[index].paymentStatus,
      );

      if (hasUpdates) {
        console.log("결제 상태 동기화 중...");
        setOrders(updatedOrders);
      }
    }
  }, [orders.length]); // orders.length가 변경될 때만 실행하여 무한 루프 방지

  // 주문 상태 업데이트 - 낙관적 업데이트 적용
  const handleStatusChange = useCallback(
    async (orderId: string, newStatus: OrderStatus) => {
      // 낙관적 업데이트 - UI를 먼저 업데이트
      const previousOrders = [...orders];
      const newPaymentStatus = getPaymentStatusFromOrderStatus(newStatus);

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: newStatus,
                paymentStatus: newPaymentStatus,
              }
            : order,
        ),
      );

      try {
        await adminApi.updateOrderStatus(orderId, newStatus);

        // 상태 변경 알림 전송
        const order = previousOrders.find((o) => o.id === orderId);
        if (order && order.customerEmail) {
          const statusMessages = {
            결제대기: "주문이 결제 대기 상태입니다.",
            결제완료: "결제가 완료되었습니다.",
            제작중: "와인 라벨을 제작하고 있습니다.",
            배송준비: "상품을 배송 준비 중입니다.",
            배송중: "상품이 배송 중입니다.",
            배송완료: "배송이 완료되었습니다.",
            주문취소: "주문이 취소되었습니다.",
          };

          try {
            await fetch("/api/notifications", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                customerEmail: order.customerEmail,
                type: "order",
                title: `주문 상태 변경: ${newStatus}`,
                message: `주문번호 ${orderId}: ${statusMessages[newStatus] || "주문 상태가 변경되었습니다."}`,
                orderId: orderId,
              }),
            });
          } catch (notificationError) {
            console.error("상태 변경 알림 전송 실패:", notificationError);
          }
        }

        toast({
          title: "상태 업데이트 성공",
          description: "주문 상태가 성공적으로 변경되었습니다.",
        });
      } catch (error) {
        // 실패 시 이전 상태로 롤백
        setOrders(previousOrders);
        console.error("주문 상태 업데이트 오류:", error);
        toast({
          title: "상태 업데이트 실패",
          description: "주문 상태 변경 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    },
    [orders, toast],
  );

  // 주문 상태에 따른 결제 상태 결정
  const getPaymentStatusFromOrderStatus = (
    orderStatus: OrderStatus | string,
  ) => {
    // 문자열로 들어오는 경우도 처리
    const status = orderStatus.toString();

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
        // paymentId가 있으면 결제완료, 없으면 결제대기로 판단
        return "결제완료";
    }
  };

  // 운송장 번호 업데이트
  const handleTrackingNumberChange = (orderId: string, value: string) => {
    setTrackingNumbers((prev) => ({ ...prev, [orderId]: value }));
  };

  // 배송 회사 업데이트
  const handleShippingCompanyChange = (orderId: string, value: string) => {
    setShippingCompany((prev) => ({ ...prev, [orderId]: value }));
  };

  // 배송 정보 저장
  const handleSaveShippingInfo = async (orderId: string) => {
    try {
      const trackingNumber = trackingNumbers[orderId];
      const shippingCompanyValue = shippingCompany[orderId];

      // API 호출 (서버에 배송 정보 저장)
      await adminApi.updateShippingInfo(orderId, {
        trackingNumber: trackingNumber,
        shippingCompany: shippingCompanyValue,
      });

      // 주문 상태를 '배송중'으로 업데이트
      await handleStatusChange(orderId, "배송중");

      // orders 상태 업데이트 - 운송장 번호와 배송사 정보 추가
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                trackingNumber: trackingNumber,
                shippingCompany: shippingCompanyValue,
              }
            : order,
        ),
      );

      // 편집 모드 종료
      setEditingOrder(null);

      toast({
        title: "배송 정보 저장 성공",
        description: "운송장 정보가 성공적으로 저장되었습니다.",
      });
    } catch (error) {
      console.error("배송 정보 저장 오류:", error);
      toast({
        title: "배송 정보 저장 실패",
        description: "운송장 정보 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // 배송 알림 전송
  const handleSendShippingNotification = async (orderId: string) => {
    try {
      // 현재 주문 정보 찾기
      const order = orders.find((o) => o.id === orderId);
      if (!order || !order.trackingNumber) {
        toast({
          title: "운송장 정보 필요",
          description: "알림 전송을 위해 운송장 번호가 필요합니다.",
          variant: "destructive",
        });
        return;
      }

      // 배송사 이름 가져오기
      const shippingCompanyName =
        shippingCompanies.find((c) => c.id === order.shippingCompany)?.name ||
        "택배사";

      // API 호출 (서버에서 배송 알림 전송)
      await adminApi.sendShippingNotification(orderId);

      // 고객에게 배송 알림 전송 및 저장
      if (order.customerEmail) {
        try {
          await fetch("/api/notifications", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              customerEmail: order.customerEmail,
              type: "shipping",
              title: "배송 시작 알림",
              message: `${order.bottleName} 주문이 배송을 시작했습니다. ${shippingCompanyName} 운송장번호: ${order.trackingNumber}`,
              orderId: orderId,
            }),
          });
        } catch (notificationError) {
          console.error("배송 알림 저장 실패:", notificationError);
        }
      }

      // 주문 목록 업데이트 - 알림 전송 상태 설정
      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o.id === orderId
            ? {
                ...o,
                shippingNotified: true,
                shippingNotifiedAt: new Date().toISOString(),
              }
            : o,
        ),
      );

      // 성공 메시지
      toast({
        title: "배송 알림 전송 성공",
        description: `고객(${order.customerName})에게 ${shippingCompanyName} 운송장번호 ${order.trackingNumber}로 배송 알림이 전송되었습니다.`,
      });
    } catch (error) {
      console.error("배송 알림 전송 오류:", error);
      toast({
        title: "배송 알림 전송 실패",
        description: "배송 알림 전송 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // 주문 상세 정보 조회
  const handleViewDetails = async (orderId: string) => {
    try {
      const { data } = await adminApi.getOrder(orderId);

      // 라벨 디자인 정보를 파싱
      let orderWithLabelDesign = { ...data.order };

      // API에서 받은 labelDesign 문자열이 있으면 파싱
      if (
        data.order.labelDesign &&
        typeof data.order.labelDesign === "string"
      ) {
        try {
          const parsedLabelDesign = JSON.parse(data.order.labelDesign);

          // 장식 정보에 이미지 URL이 없는 경우를 위한 추가 처리
          if (
            parsedLabelDesign.decorations &&
            Array.isArray(parsedLabelDesign.decorations)
          ) {
            // API에서 장식 이미지 목록 가져오기 (필요한 경우)
            try {
              const decorationsResponse = await adminApi.getLabelIcons();
              const iconsData = decorationsResponse.data.icons || [];

              // 장식 정보에 이미지 URL 추가
              parsedLabelDesign.decorations = parsedLabelDesign.decorations.map(
                (deco: any) => {
                  // 이미 이미지 URL이 있으면 그대로 사용
                  if (deco.image) return deco;

                  // API에서 가져온 장식 목록에서 찾기
                  const matchingIcon = iconsData.find(
                    (icon: any) => icon.id === deco.decorationId,
                  );
                  if (matchingIcon) {
                    return {
                      ...deco,
                      decorationUrl: matchingIcon.url,
                    };
                  }

                  return deco;
                },
              );
            } catch (error) {
              console.error("장식 이미지 목록 로드 실패:", error);
            }
          }

          orderWithLabelDesign.labelDesign = parsedLabelDesign;
          console.log("라벨 디자인 정보 파싱 성공:", parsedLabelDesign);
        } catch (e) {
          console.error("라벨 디자인 정보 파싱 실패:", e);
        }
      }

      setSelectedOrder(orderWithLabelDesign);
      setDialogOpen(true);

      // 장식 정보 있는지 확인 및 로그
      if (
        orderWithLabelDesign.labelDesign &&
        orderWithLabelDesign.labelDesign.decorations
      ) {
        console.log(
          "장식 정보 로드:",
          orderWithLabelDesign.labelDesign.decorations,
        );
      } else {
        console.log("장식 정보 없음");
      }
    } catch (error) {
      console.error("주문 상세 정보 조회 오류:", error);
      toast({
        title: "주문 상세 정보 조회 실패",
        description: "주문 정보를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  // 라벨 인쇄 처리
  const handlePrintLabel = (order: any) => {
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      alert("팝업 차단을 해제해주세요.");
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
                padding: 10px;
                font-family: Arial, sans-serif;
                background: white;
                font-size: 12px;
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
                margin: 10px 0;
              }
              .wine-bottle {
                height: 380px;
                width: auto;
                object-fit: contain;
              }
              .label-overlay {
                position: absolute;
                top: 65%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 100px;
                height: 120px;
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
                font-size: ${(order.labelDesign?.textSize || 1.2) * 8}px;
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
                font-size: ${(order.labelDesign?.subtextSize || 0.8) * 8}px;
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
                width: 18px;
                height: 18px;
                transform: translate(-50%, -50%);
                object-fit: contain;
              }
              .order-info {
                margin-top: 15px;
                padding: 12px;
                background: #f8f9fa;
                border-radius: 6px;
                text-align: left;
              }
              .order-info h3 {
                margin-top: 0;
                color: #333;
                border-bottom: 2px solid #722F37;
                padding-bottom: 3px;
                margin-bottom: 8px;
                font-size: 16px;
              }
              .info-section {
                margin-bottom: 12px;
              }
              .info-section h4 {
                margin: 0 0 6px 0;
                color: #555;
                font-size: 14px;
                border-bottom: 1px solid #ddd;
                padding-bottom: 2px;
              }
              .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
                margin-top: 6px;
              }
              .info-item {
                margin-bottom: 4px;
                font-size: 11px;
              }
              .info-label {
                font-weight: bold;
                color: #555;
                margin-right: 6px;
              }
              .info-value {
                color: #333;
              }
              h2 {
                color: #722F37; 
                margin-bottom: 15px;
                font-size: 18px;
              }
            }
          </style>
        </head>
        <body>
          <div class="preview-container">
            <h2>와인 라벨 디자인 미리보기</h2>

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
                            (deco: any) => `
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

            <!-- 주 �� 정보 -->
            <div class="order-info">
              <h3>주문 상세 정보</h3>

              <!-- 기본 주문 정보 -->
              <div class="info-section">
                <h4>주문 정보</h4>
                <div class="info-grid">
                  <div>
                    <div class="info-item">
                      <span class="info-label">주문번호:</span>
                      <span class="info-value">${order.id}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">와인병:</span>
                      <span class="info-value">${order.bottleName}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">수량:</span>
                      <span class="info-value">${order.quantity || 1}매</span>
                    </div>
                  </div>
                  <div>
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
                  </div>
                </div>
              </div>

              <!-- 고객 정보 -->
              <div class="info-section">
                <h4>고객 정보</h4>
                <div class="info-grid">
                  <div>
                    <div class="info-item">
                      <span class="info-label">주문자:</span>
                      <span class="info-value">${order.customerName}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">이메일:</span>
                      <span class="info-value">${order.customerEmail}</span>
                    </div>
                  </div>
                  <div>
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
                  </div>
                </div>
              </div>

              <!-- 배송 정보 -->
              ${
                order.customerAddress
                  ? `
              <div class="info-section">
                <h4>배송 정보</h4>
                <div class="info-item">
                  <span class="info-label">배송 주소:</span>
                  <span class="info-value">${order.customerAddress}</span>
                </div>
                ${
                  order.customerZipCode
                    ? `
                <div class="info-item">
                  <span class="info-label">우편번호:</span>
                  <span class="info-value">${order.customerZipCode}</span>
                </div>
                `
                    : ""
                }
                <div class="info-item">
                  <span class="info-label">배송 방법:</span>
                  <span class="info-value">${order.deliveryMethod === "express" ? "빠른 배송" : order.deliveryMethod === "same-day" ? "당일 배송" : "일반 배송"}</span>
                </div>
              </div>
              `
                  : ""
              }
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
  };

  // 정렬 처리
  const handleSort = (field: string) => {
    setSortField(field);
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  // 검색 및 정렬된 주문 목록 - useMemo로 메모이제이션
  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          order.id?.toLowerCase().includes(searchLower) ||
          order.customerName?.toLowerCase().includes(searchLower) ||
          order.customerEmail?.toLowerCase().includes(searchLower) ||
          order.bottleName?.toLowerCase().includes(searchLower)
        );
      })
      .sort((a, b) => {
        const field = sortField;
        const direction = sortDirection === "asc" ? 1 : -1;

        if (a[field] < b[field]) return -1 * direction;
        if (a[field] > b[field]) return 1 * direction;
        return 0;
      });
  }, [orders, searchTerm, sortField, sortDirection]);

  // 운송장 추적 URL 생성
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

  // 갤러리 표시/숨김 토글
  const toggleGallery = () => {
    setShowGallery((prev) => !prev);
  };

  return (
    <Card className="w-full border-gray-800 bg-gray-900/50 shadow-lg backdrop-blur-sm">
      <CardHeader className="border-b border-gray-800">
        <CardTitle className="flex justify-between items-center text-gray-100">
          <div className="flex items-center space-x-3">
            <span>와인 주문 관리</span>
            {isRefreshing && (
              <div className="flex items-center space-x-2 text-cyan-400">
                <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">새로고침 중...</span>
              </div>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => fetchOrders(true)}
              disabled={isRefreshing}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300"
              title="주문 목록과 결제 상태를 최신으로 업데이트합니다"
            >
              새로고침 & 결제상태 동기화
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-400" />
            <Input
              placeholder="주문 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 bg-gray-800 border-gray-700 text-gray-200 focus:border-cyan-500"
            />

            {/* 관리자 알림 버튼 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative bg-gray-800 hover:bg-gray-700 text-gray-300"
            >
              <Bell className="w-4 h-4" />
              {adminUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {adminUnreadCount > 99 ? "99+" : adminUnreadCount}
                </span>
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* 관리자 알림 패널 */}
        {showNotifications && (
          <div className="bg-gray-800/50 border-b border-gray-700 p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-200">관리자 알림</h3>
              {adminUnreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAdminNotificationsAsRead}
                  className="text-blue-400 hover:text-blue-300"
                >
                  모든 알림 읽음 처리
                </Button>
              )}
            </div>

            {adminNotifications.length > 0 ? (
              <div className="max-h-80 overflow-y-auto space-y-2">
                {adminNotifications
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime(),
                  )
                  .slice(0, 10) // 최대 10개만 표시
                  .map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border transition-all ${
                        notification.isRead
                          ? "bg-gray-700/30 border-gray-600"
                          : "bg-blue-900/20 border-blue-600/50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-2 flex-1">
                          {/* 알림 타입별 아이콘 */}
                          <div
                            className={`p-1 rounded-full ${
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

                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium text-gray-200 text-sm">
                                {notification.title}
                              </h4>
                              {!notification.isRead && (
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                              )}
                            </div>
                            <p className="text-gray-300 text-xs mb-1">
                              {notification.message}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {new Date(notification.createdAt).toLocaleString(
                                "ko-KR",
                              )}
                            </p>
                          </div>
                        </div>

                        {/* 액션 버튼들 */}
                        <div className="flex space-x-1">
                          {notification.orderId && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs px-2 py-1 h-auto text-blue-400 hover:text-blue-300"
                              onClick={() => {
                                // 해당 주문으로 스크롤하거나 검색
                                setSearchTerm(notification.orderId!);
                              }}
                            >
                              주문 찾기
                            </Button>
                          )}
                          {!notification.isRead && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs px-2 py-1 h-auto text-green-400 hover:text-green-300"
                              onClick={() =>
                                markAdminNotificationAsRead(notification.id)
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
              <div className="text-center py-6">
                <Bell className="w-8 h-8 mx-auto text-gray-500 mb-2" />
                <p className="text-gray-400 text-sm">새로운 알림이 없습니다.</p>
              </div>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-64 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
            <p className="text-gray-400">주문 데이터를 불러오는 중...</p>
            <p className="text-sm text-gray-500">
              데이터가 많을 경우 시간이 걸릴 수 있습니다.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* 통계 정보 추가 */}
            <div className="p-4 bg-gray-800/30 border-b border-gray-700">
              <div className="flex justify-between items-center text-sm text-gray-400">
                <span>총 주문: {orders.length}건</span>
                <span>검색 결과: {filteredOrders.length}건</span>
                <span>
                  마지막 업데이트:{" "}
                  {new Date(lastFetchTime).toLocaleTimeString()}
                </span>
              </div>
            </div>

            <Table className="border-collapse">
              <TableHeader className="bg-gray-800/50">
                <TableRow className="border-b border-gray-700">
                  <TableHead
                    className="w-[100px] cursor-pointer text-gray-300 hover:text-cyan-400 transition-colors"
                    onClick={() => handleSort("id")}
                  >
                    고객이름 <ArrowUpDown className="inline w-4 h-4" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer text-gray-300 hover:text-cyan-400 transition-colors"
                    onClick={() => handleSort("bottleName")}
                  >
                    주문상품 <ArrowUpDown className="inline w-4 h-4" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer text-gray-300 hover:text-cyan-400 transition-colors"
                    onClick={() => handleSort("amount")}
                  >
                    결제금액 <ArrowUpDown className="inline w-4 h-4" />
                  </TableHead>
                  <TableHead className="text-gray-300">배송정보</TableHead>
                  <TableHead
                    className="cursor-pointer text-gray-300 hover:text-cyan-400 transition-colors"
                    onClick={() => handleSort("status")}
                  >
                    결제상태 <ArrowUpDown className="inline w-4 h-4" />
                  </TableHead>
                  <TableHead
                    className="cursor-pointer text-gray-300 hover:text-cyan-400 transition-colors"
                    onClick={() => handleSort("status")}
                  >
                    주문상태 <ArrowUpDown className="inline w-4 h-4" />
                  </TableHead>
                  <TableHead className="text-gray-300">운송장번호</TableHead>
                  <TableHead className="text-gray-300">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow className="border-b border-gray-800 hover:bg-gray-800/50">
                    <TableCell
                      colSpan={8}
                      className="text-center py-10 text-gray-400"
                    >
                      {searchTerm
                        ? "검색 조건에 맞는 주문이 없습니다."
                        : "주문 내역이 없습니다."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="border-b border-gray-800 hover:bg-gray-800/50"
                    >
                      <TableCell className="font-medium text-gray-200">
                        {order.customerName}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {order.bottleName} 와인 라벨 {order.quantity || 1}매
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {new Intl.NumberFormat("ko-KR").format(
                          order.amount || 0,
                        )}
                        원/매
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <span className="font-semibold text-gray-200">
                            {order.customerName}
                          </span>
                          <span className="text-gray-400">
                            {order.customerPhone || order.phoneNumber}
                          </span>
                          <span className="text-gray-400 truncate max-w-[200px]">
                            {order.customerAddress ||
                              order.address ||
                              "배송 주소 없음"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getStatusBadgeColor(
                            order.paymentStatus ||
                              getPaymentStatusFromOrderStatus(
                                order.status || "결제완료",
                              ),
                          )}
                        >
                          {order.paymentStatus ||
                            getPaymentStatusFromOrderStatus(
                              order.status || "결제완료",
                            )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          defaultValue={order.status || "결제완료"}
                          onValueChange={(value) =>
                            handleStatusChange(order.id, value as OrderStatus)
                          }
                        >
                          <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-gray-200 focus:border-cyan-500">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                            <SelectItem
                              value="결제대기"
                              className="focus:bg-cyan-900/30 focus:text-cyan-400"
                            >
                              결제대기
                            </SelectItem>
                            <SelectItem
                              value="결제완료"
                              className="focus:bg-cyan-900/30 focus:text-cyan-400"
                            >
                              결제완료
                            </SelectItem>
                            <SelectItem
                              value="제작중"
                              className="focus:bg-cyan-900/30 focus:text-cyan-400"
                            >
                              제작중
                            </SelectItem>
                            <SelectItem
                              value="배송준비"
                              className="focus:bg-cyan-900/30 focus:text-cyan-400"
                            >
                              배송준비
                            </SelectItem>
                            <SelectItem
                              value="배송중"
                              className="focus:bg-cyan-900/30 focus:text-cyan-400"
                            >
                              배송중
                            </SelectItem>
                            <SelectItem
                              value="배송완료"
                              className="focus:bg-cyan-900/30 focus:text-cyan-400"
                            >
                              배송완료
                            </SelectItem>
                            <SelectItem
                              value="주문취소"
                              className="focus:bg-cyan-900/30 focus:text-cyan-400"
                            >
                              주문취소
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {editingOrder === order.id ? (
                          <div className="flex flex-col space-y-2">
                            <div className="flex space-x-2">
                              <Select
                                value={shippingCompany[order.id]}
                                onValueChange={(value) =>
                                  handleShippingCompanyChange(order.id, value)
                                }
                              >
                                <SelectTrigger className="w-28 bg-gray-800 border-gray-700 text-gray-200 focus:border-cyan-500">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                                  {shippingCompanies.map((company) => (
                                    <SelectItem
                                      key={company.id}
                                      value={company.id}
                                      className="focus:bg-cyan-900/30 focus:text-cyan-400"
                                    >
                                      {company.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Input
                                placeholder="운송장 번호"
                                value={trackingNumbers[order.id]}
                                onChange={(e) =>
                                  handleTrackingNumberChange(
                                    order.id,
                                    e.target.value,
                                  )
                                }
                                className="w-28 bg-gray-800 border-gray-700 text-gray-200 focus:border-cyan-500"
                              />
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => setEditingOrder(null)}
                                className="bg-gray-800 hover:bg-gray-700 text-gray-300"
                              >
                                취소
                              </Button>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleSaveShippingInfo(order.id)}
                                disabled={!trackingNumbers[order.id]}
                                className="bg-cyan-900/30 hover:bg-cyan-800/50 text-cyan-400 border border-cyan-700"
                              >
                                <Check className="w-4 h-4 mr-1" /> 저장
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col space-y-1">
                            {order.trackingNumber ? (
                              <>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-gray-300">
                                    {shippingCompanies.find(
                                      (c) => c.id === order.shippingCompany,
                                    )?.name || "택배사"}
                                    : {order.trackingNumber}
                                  </span>
                                  <a
                                    href={getTrackingUrl(
                                      order.shippingCompany || "cj",
                                      order.trackingNumber,
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-cyan-500 hover:text-cyan-400"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setEditingOrder(order.id)}
                                  className="bg-gray-800/50 hover:bg-gray-700 text-gray-300 border-gray-700"
                                >
                                  수정
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingOrder(order.id)}
                                className="bg-gray-800/50 hover:bg-gray-700 text-gray-300 border-gray-700"
                              >
                                <Truck className="w-4 h-4 mr-1 text-cyan-500" />{" "}
                                운송장 입력
                              </Button>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-2">
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(order.id)}
                              className="flex-1 bg-indigo-900/20 hover:bg-indigo-800/30 text-indigo-400 border-indigo-700"
                            >
                              <Eye className="w-4 h-4 mr-1" /> 상세
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePrintLabel(order)}
                              disabled={isPrinting || !order.labelImage}
                              className="flex-1 bg-purple-900/20 hover:bg-purple-800/30 text-purple-400 border-purple-700 disabled:opacity-50"
                            >
                              <Printer className="w-4 h-4 mr-1" /> 인쇄
                            </Button>
                          </div>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleSendShippingNotification(order.id)
                            }
                            disabled={!order.trackingNumber}
                            className="bg-cyan-900/20 hover:bg-cyan-800/30 text-cyan-400 border-cyan-700 disabled:opacity-50"
                          >
                            <Bell className="w-4 h-4 mr-1" /> 알림전송
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* 주문 상세 정보 다이얼로그 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gray-900 border border-gray-800 text-gray-100 shadow-[0_0_15px_rgba(0,200,255,0.15)]">
          <DialogHeader className="border-b border-gray-800 pb-4">
            <DialogTitle className="text-cyan-400">주문 상세 정보</DialogTitle>
            <DialogDescription className="text-gray-400">
              선택한 주문의 상세 정보와 라벨 디자인을 확인할 수 있습니다.
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2 text-cyan-400">
                    주문 정보
                  </h3>
                  <div className="text-sm space-y-1 bg-gray-800/50 p-3 rounded-lg border border-gray-800">
                    <p>
                      <span className="font-medium text-gray-300">
                        주문번호:
                      </span>{" "}
                      <span className="text-gray-200">{selectedOrder.id}</span>
                    </p>
                    <p>
                      <span className="font-medium text-gray-300">
                        주문일자:
                      </span>{" "}
                      <span className="text-gray-200">
                        {new Date(selectedOrder.createdAt).toLocaleDateString()}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium text-gray-300">
                        주문상태:
                      </span>{" "}
                      <span className="text-gray-200">
                        {selectedOrder.status}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium text-gray-300">와인병:</span>{" "}
                      <span className="text-gray-200">
                        {selectedOrder.bottleName}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium text-gray-300">수량:</span>{" "}
                      <span className="text-gray-200">
                        {selectedOrder.quantity || 1}개
                      </span>
                    </p>
                    <p>
                      <span className="font-medium text-gray-300">
                        상품 금액:
                      </span>{" "}
                      <span className="text-gray-200">
                        {new Intl.NumberFormat("ko-KR").format(
                          selectedOrder.amount,
                        )}
                        원
                      </span>
                    </p>
                    {selectedOrder.paymentId && (
                      <p>
                        <span className="font-medium text-gray-300">
                          결제ID:
                        </span>{" "}
                        <span className="text-gray-200">
                          {selectedOrder.paymentId}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {/* 결제 및 배송 정보 추가 */}
                <div>
                  <h3 className="text-lg font-medium mb-2 text-cyan-400">
                    결제 및 배송 정보
                  </h3>
                  <div className="text-sm space-y-1 bg-gray-800/50 p-3 rounded-lg border border-gray-800">
                    <p>
                      <span className="font-medium text-gray-300">
                        배송 방법:
                      </span>
                      <span className="text-gray-200">
                        {selectedOrder.deliveryMethod === "standard"
                          ? "일반 배송"
                          : selectedOrder.deliveryMethod === "express"
                            ? "빠른 배송"
                            : selectedOrder.deliveryMethod === "same-day"
                              ? "당일 배송"
                              : "일반 배송"}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium text-gray-300">배송비:</span>
                      <span className="text-gray-200">
                        {new Intl.NumberFormat("ko-KR").format(
                          selectedOrder.deliveryFee || 3000,
                        )}
                        원
                      </span>
                    </p>
                    <p>
                      <span className="font-medium text-gray-300">
                        총 결제 금액:
                      </span>
                      <span className="text-green-400 font-semibold">
                        {new Intl.NumberFormat("ko-KR").format(
                          selectedOrder.amount +
                            (selectedOrder.deliveryFee || 3000),
                        )}
                        원
                      </span>
                    </p>
                    {selectedOrder.paymentId && (
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
                        className={`${(() => {
                          const paymentStatus =
                            selectedOrder.paymentStatus ||
                            getPaymentStatusFromOrderStatus(
                              selectedOrder.status || "결제완료",
                            );
                          return paymentStatus === "결제완료"
                            ? "text-green-400"
                            : paymentStatus === "결제취소"
                              ? "text-red-400"
                              : "text-yellow-400";
                        })()}`}
                      >
                        {(() => {
                          const paymentStatus =
                            selectedOrder.paymentStatus ||
                            getPaymentStatusFromOrderStatus(
                              selectedOrder.status || "결제완료",
                            );
                          return paymentStatus;
                        })()}
                      </span>
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2 text-cyan-400">
                    고객 정보
                  </h3>
                  <div className="text-sm space-y-1 bg-gray-800/50 p-3 rounded-lg border border-gray-800">
                    <p>
                      <span className="font-medium text-gray-300">이름:</span>{" "}
                      <span className="text-gray-200">
                        {selectedOrder.customerName}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium text-gray-300">이메일:</span>{" "}
                      <span className="text-gray-200">
                        {selectedOrder.customerEmail}
                      </span>
                    </p>
                    {selectedOrder.customerPhone && (
                      <p>
                        <span className="font-medium text-gray-300">
                          전화번호:
                        </span>{" "}
                        <span className="text-gray-200">
                          {selectedOrder.customerPhone}
                        </span>
                      </p>
                    )}
                    {selectedOrder.customerAddress ? (
                      <>
                        <p>
                          <span className="font-medium text-gray-300">
                            배송 주소:
                          </span>{" "}
                          <span className="text-gray-200">
                            {selectedOrder.customerAddress}
                          </span>
                        </p>
                        {selectedOrder.customerZipCode && (
                          <p>
                            <span className="font-medium text-gray-300">
                              우편번호:
                            </span>{" "}
                            <span className="text-gray-200">
                              {selectedOrder.customerZipCode}
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
                  </div>
                </div>

                {/* 배송 정보 */}
                {selectedOrder.trackingNumber && (
                  <div>
                    <h3 className="text-lg font-medium mb-2 text-cyan-400">
                      배송 정보
                    </h3>
                    <div className="text-sm space-y-1 bg-gray-800/50 p-3 rounded-lg border border-gray-800">
                      <p>
                        <span className="font-medium text-gray-300">
                          배송사:
                        </span>
                        <span className="text-gray-200">
                          {selectedOrder.shippingCompany === "cj"
                            ? "CJ대한통운"
                            : selectedOrder.shippingCompany === "lotte"
                              ? "롯데택배"
                              : selectedOrder.shippingCompany === "hanjin"
                                ? "한진택배"
                                : selectedOrder.shippingCompany === "logen"
                                  ? "로젠택배"
                                  : selectedOrder.shippingCompany === "post"
                                    ? "우체국택배"
                                    : "택배사"}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium text-gray-300">
                          운송장번호:
                        </span>{" "}
                        <span className="text-gray-200">
                          {selectedOrder.trackingNumber}
                        </span>
                        <a
                          href={getTrackingUrl(
                            selectedOrder.shippingCompany || "cj",
                            selectedOrder.trackingNumber,
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 inline-flex items-center text-blue-500 hover:text-blue-700"
                        >
                          <ExternalLink className="w-4 h-4" /> 배송조회
                        </a>
                      </p>
                      {selectedOrder.shippingNotified &&
                        selectedOrder.shippingNotifiedAt && (
                          <p>
                            <span className="font-medium text-gray-300">
                              알림전송시간:
                            </span>{" "}
                            <span className="text-gray-200">
                              {new Date(
                                selectedOrder.shippingNotifiedAt,
                              ).toLocaleString()}
                            </span>
                          </p>
                        )}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePrintLabel(selectedOrder)}
                    disabled={isPrinting || !selectedOrder.labelImage}
                    className="bg-purple-900/20 hover:bg-purple-800/30 text-purple-400 border-purple-700"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    라벨 인쇄
                  </Button>

                  <Button
                    variant={
                      selectedOrder.publishToGallery ? "destructive" : "outline"
                    }
                    size="sm"
                    onClick={handlePublishToGallery}
                    disabled={
                      isPublishing ||
                      (!selectedOrder.publishToGallery && !galleryTitle.trim())
                    }
                    className={
                      selectedOrder.publishToGallery
                        ? "bg-red-900/20 hover:bg-red-800/30 text-red-400 border-red-700"
                        : "bg-green-900/20 hover:bg-green-800/30 text-green-400 border-green-700"
                    }
                  >
                    {selectedOrder.publishToGallery ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-2" />
                        갤러리 숨김
                      </>
                    ) : (
                      <>
                        <Globe className="w-4 h-4 mr-2" />
                        갤러리 표시
                      </>
                    )}
                  </Button>
                </div>

                {/* 갤러리 표시 제목 입력 */}
                {!selectedOrder.publishToGallery && (
                  <div className="mt-3 space-y-2">
                    <Label htmlFor="gallery-title" className="text-gray-300">
                      갤러리 표시 제목
                    </Label>
                    <Input
                      id="gallery-title"
                      value={galleryTitle}
                      onChange={(e) => setGalleryTitle(e.target.value)}
                      placeholder="갤러리에 표시될 제목"
                      className="bg-gray-800 border-gray-700 text-gray-200"
                    />
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2 text-cyan-400">
                  라벨 디자인 미리보기
                </h3>
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 relative">
                  {/* 와인병과 라벨 미리보기 (라벨 디자이너에서 영감을 받은 디자인) */}
                  <div className="flex flex-col items-center w-full relative">
                    {selectedOrder.labelImage ? (
                      <>
                        {/* 와인병 배경 이미지 */}
                        <img
                          src={(() => {
                            // 선택된 와인병 정보 가져오기
                            const bottle = selectedOrder.bottleId
                              ? getWineBottle(selectedOrder.bottleId)
                              : null;
                            return bottle?.image || "/images/wine-bottle-1.png";
                          })()}
                          alt={selectedOrder.bottleName || "와인병"}
                          className="h-[550px] object-contain"
                          style={{ transform: "scale(1.1, 1.1)" }}
                        />

                        {/* 라벨 오버레이 - 와인병 라벨 위치에 배치 */}
                        <div
                          className="absolute z-10"
                          style={{
                            top: "77%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: "14rem", // 더 작게 조정
                            height: "22rem", // 더 작게 조정
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            overflow: "visible", // 장식이 보이도록 overflow 설정
                          }}
                        >
                          {/* 라벨 미리보기 텍스트 제거 */}

                          {/* 라벨 이미지 */}
                          <div className="relative">
                            <img
                              src={selectedOrder.labelImage}
                              alt="와인 라벨 디자인"
                              className="w-auto h-auto max-w-full max-h-full object-contain"
                              style={{
                                overflow: "visible",
                                maxWidth: "12rem",
                                maxHeight: "18rem",
                                transform: "scale(0.85)",
                              }}
                            />

                            {/* 장식 렌더링 (장식 정보가 있는 경우) */}
                            {selectedOrder.labelDesign &&
                              selectedOrder.labelDesign.decorations &&
                              selectedOrder.labelDesign.decorations.length >
                                0 &&
                              selectedOrder.labelDesign.decorations.map(
                                (decoration: any, index: number) => (
                                  <StaticElement
                                    key={`decoration-${index}`}
                                    position={decoration.position}
                                    type="decoration"
                                  >
                                    <img
                                      src={
                                        decoration.image ||
                                        decoration.decorationUrl ||
                                        `/images/icon/${decoration.decorationId || "default"}.png`
                                      }
                                      alt="장식"
                                      className="w-12 h-12 object-contain"
                                      style={{
                                        filter:
                                          "drop-shadow(0 0 3px rgba(0,0,0,0.3))",
                                        maxWidth: "100%",
                                        maxHeight: "100%",
                                      }}
                                    />
                                  </StaticElement>
                                ),
                              )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="p-6 text-center text-gray-400">
                        <Package className="w-12 h-12 mx-auto mb-2" />
                        <p>라벨 이미지를 불러올 수 없습니다.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default OrderManagement;
