// 사용자 타입 정의
export interface User {
  id: number;
  firebaseUid: string;
  username: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  phone?: string;
  userType: 'user' | 'admin' | 'franchise';
  isApproved: boolean;
  isSuperUser: boolean;
  franchiseInfo?: {
    name: string;
    address: string;
    phone: string;
  };
  createdAt: string;
}

// 가맹점 요청 타입 정의
export interface FranchiseRequest {
  id: number;
  userId: number;
  user: User;
  franchiseInfo: {
    name: string;
    address: string;
    phone: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

// 창고 위치 타입 정의
export interface StorageLocation {
  id: number;
  name: string;
  address: string;
  city: string;
  district: string;
  latitude?: number;
  longitude?: number;
  features: string[];
  images: string[];
  isActive: boolean;
  ownerId: number;
  owner?: User;
  createdAt: string;
}

// 창고 유닛(보관함) 타입 정의
export interface StorageUnit {
  id: number;
  locationId: number;
  size: string;
  dimensions: string;
  monthlyPrice: number;
  dailyPrice: number;
  quarterlyPrice: number;
  yearlyPrice: number;
  unitNumber: string;
  isAvailable: boolean;
  createdAt: string;
}

// 창고 통계 타입 정의
export interface StorageStats {
  totalUnits: number;
  availableUnits: number;
  occupancyRate: number;
  totalRevenue: number;
  monthlyRevenue: {
    month: string;
    amount: number;
  }[];
}

// 창고 생성 폼 타입 정의
export interface StorageLocationForm {
  name: string;
  address: string;
  city: string;
  district: string;
  latitude?: number;
  longitude?: number;
  features: string[];
  images: string[];
  ownerId?: number;
}

// 보관함 생성 폼 타입 정의
export interface StorageUnitForm {
  locationId: number;
  size: string;
  dimensions: string;
  monthlyPrice: number;
  dailyPrice: number;
  quarterlyPrice: number;
  yearlyPrice: number;
  unitNumber: string;
}

// 예약 타입 정의
export interface Reservation {
  id: number;
  userId: number;
  storageUnitId: number;
  subscriptionType: 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: 'pending' | 'active' | 'cancelled' | 'expired';
  paymentIntentId?: string;
  createdAt: string;
}

// 매출 통계 타입 정의
export interface RevenueStats {
  totalRevenue: number;
  periodRevenue: number;
  growthRate: number;
  data: {
    period: string;
    amount: number;
  }[];
}
