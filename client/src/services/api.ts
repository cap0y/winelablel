import axios from 'axios';

const api = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
  }
});

// 인터셉터로 요청 전에 로컬 스토리지에서 사용자 정보를 가져와 헤더에 추가
api.interceptors.request.use(
  (config) => {
    const userStr = localStorage.getItem('auth_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.id) {
          config.headers['User-Id'] = user.id;
        }
      } catch (e) {
        console.error('사용자 정보 파싱 오류:', e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 사용자 업로드 이미지 API
export const uploadApi = {
  // 업로드 이미지 목록 가져오기
  getUploads: () => api.get('/api/labels/uploads'),
  
  // 이미지 업로드하기
  uploadImage: (formData: FormData) => 
    api.post('/api/labels/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  // 업로드 이미지 삭제하기
  deleteUpload: (filename: string) => 
    api.delete(`/api/labels/uploads/${filename}`)
};

export const userApi = {
  // 사용자 로그인
  login: (email: string, password: string) => api.post('/api/login', { email, password }),

  // 회원가입
  register: (userData: any) => api.post('/api/register', userData),

  // 이메일로 사용자 조회
  getUserByEmail: (email: string) => api.get(`/api/users/by-email/${email}`),
  
  // 비밀번호 변경
  changePassword: (email: string, currentPassword: string, newPassword: string) => 
    api.post('/api/users/change-password', { email, currentPassword, newPassword }),
  
  // 사용자 주문 목록 조회
  getUserOrders: (email: string) => api.get(`/api/user-orders?email=${email}`),
  
  // 사용자 주문 통계 조회
  getUserStats: (email: string) => api.get(`/api/user-stats?email=${email}`)
};

// 갤러리 관련 API
export const galleryApi = {
  // 라벨 갤러리 목록 - 캐시 무효화 옵션 추가
  getLabels: () => api.get('/api/gallery/labels', {
    params: { _t: new Date().getTime() } // 캐시 방지 타임스탬프 추가
  }),
  
  // 인기 라벨 이미지 (슬라이더용)
  getPopularLabelImages: (limit = 5) => api.get(`/api/gallery/labels/popular?limit=${limit}`),
  
  // 라벨 상세 정보
  getLabelDetail: (labelId: string) => api.get(`/api/gallery/labels/${labelId}`),
  
  // 댓글 작성
  addComment: (labelId: string, userId: number, content: string) => 
    api.post(`/api/gallery/labels/${labelId}/comments`, { userId, content }),
  
  // 별점 등록/수정
  rateLabel: (labelId: string, userId: number, rating: number) => 
    api.post(`/api/gallery/labels/${labelId}/ratings`, { userId, rating }),
  
  // 좋아요 토글
  toggleLike: (labelId: string, userId: number) => 
    api.post(`/api/gallery/labels/${labelId}/likes/toggle`, { userId })
};

// 주문 관련 API
export const orderApi = {
  // 주문 갤러리 공개 설정
  togglePublishToGallery: (orderId: string, publish: boolean, title?: string) => 
    api.patch(`/api/orders/${orderId}/publish`, { publish, title })
};

// 관리자 관련 API
export const adminApi = {
  // 와인 라벨 배경 목록 가져오기
  getLabelBackgrounds: () => api.get('/api/admin/labels/backgrounds'),
  
  // 와인 아이콘 및 장식 목록 가져오기
  getLabelIcons: () => api.get('/api/admin/labels/icons'),
  
  // 와인 테두리 목록 가져오기
  getLabelBorders: () => api.get('/api/admin/labels/borders'),
  
  // 와인병 목록 가져오기
  getWineBottles: () => api.get('/api/admin/bottles'),
  
  // 와인병 상세 정보 가져오기
  getWineBottle: (bottleId: string) => api.get(`/api/admin/bottles/${bottleId}`),
  
  // 와인병 추가
  createWineBottle: (bottleData: any) => api.post('/api/admin/bottles', bottleData),
  
  // 와인병 정보 수정
  updateWineBottle: (bottleId: string, bottleData: any) => api.put(`/api/admin/bottles/${bottleId}`, bottleData),
  
  // 와인병 삭제
  deleteWineBottle: (bottleId: string) => api.delete(`/api/admin/bottles/${bottleId}`),
  
  // 와인병 이미지 업로드
  uploadWineBottleImage: (formData: FormData) => 
    api.post('/api/admin/bottles/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  // 와인 라벨 배경 업로드
  uploadLabelBackground: (formData: FormData) => 
    api.post('/api/admin/labels/backgrounds/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  // 와인 아이콘/장식 업로드
  uploadLabelIcon: (formData: FormData) => 
    api.post('/api/admin/labels/icons/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    
  // 와인 테두리 업로드
  uploadLabelBorder: (formData: FormData) => 
    api.post('/api/admin/labels/borders/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  // 와인 라벨 배경 삭제
  deleteLabelBackground: (filename: string) => 
    api.delete(`/api/admin/labels/backgrounds/${filename}`),
  
  // 와인 아이콘/장식 삭제
  deleteLabelIcon: (filename: string) => 
    api.delete(`/api/admin/labels/icons/${filename}`),
    
  // 와인 테두리 삭제
  deleteLabelBorder: (filename: string) => 
    api.delete(`/api/admin/labels/borders/${filename}`),

  // 라벨 배경 카테고리 목록 조회
  getLabelCategories: () => api.get('/api/admin/labels/categories'),

  // 라벨 배경 카테고리 생성
  createLabelCategory: (categoryData: { name: string, description?: string, displayOrder?: number }) => 
    api.post('/api/admin/labels/categories', categoryData),

  // 라벨 배경 카테고리 수정
  updateLabelCategory: (categoryId: number, categoryData: { name?: string, description?: string, displayOrder?: number, isActive?: boolean }) => 
    api.patch(`/api/admin/labels/categories/${categoryId}`, categoryData),

  // 라벨 배경 카테고리 삭제
  deleteLabelCategory: (categoryId: number) => 
    api.delete(`/api/admin/labels/categories/${categoryId}`),

  // 배경 이미지에 카테고리 할당
  assignCategoriesToBackground: (backgroundId: string, categoryIds: number[]) => 
    api.post(`/api/admin/labels/backgrounds/${backgroundId}/categories`, { categoryIds }),
  
  // 주문 목록 가져오기
  getOrders: () => api.get('/api/admin/orders'),
  
  // 주문 상세 정보 가져오기
  getOrder: (orderId: string) => api.get(`/api/admin/orders/${orderId}`),
  
  // 주문 상태 업데이트
  updateOrderStatus: (orderId: string, status: string) => 
    api.patch(`/api/admin/orders/${orderId}/status`, { status }),

  // 배송 정보 업데이트 (운송장 정보 및 배송사)
  updateShippingInfo: (orderId: string, data: { trackingNumber: string, shippingCompany: string }) => 
    api.patch(`/api/admin/orders/${orderId}/shipping`, data),
  
  // 배송 알림 전송
  sendShippingNotification: (orderId: string) => 
    api.post(`/api/admin/orders/${orderId}/notify-shipping`),
  
  // 매출 통계 API - 일별 매출
  getDailySales: () => api.get('/api/admin/stats/daily'),
  
  // 매출 통계 API - 월별 매출
  getMonthlySales: () => api.get('/api/admin/stats/monthly'),
  
  // 매출 통계 API - 요약 정보
  getSalesSummary: () => api.get('/api/admin/stats/summary'),
  
  // 매출 통계 API - 와인별 판매량
  getBottleSales: () => api.get('/api/admin/stats/bottles'),

  // 소품(액세서리) 관리 API
  getAccessories: () => api.get('/api/admin/accessories'),
  createAccessory: (data: any) => api.post('/api/admin/accessories', data),
  updateAccessory: (id: number, data: any) => api.patch(`/api/admin/accessories/${id}`, data),
  deleteAccessory: (id: number) => api.delete(`/api/admin/accessories/${id}`),
  uploadAccessoryImage: (formData: FormData) => 
    api.post('/api/admin/accessories/upload', formData, { headers: { 'Content-Type': 'multipart/form-data', 'Accept': 'application/json' } }),

  // 예약 링크 관리 API
  getReservationLinks: () => api.get('/api/admin/reservation-links'),
  createReservationLink: (data: { title: string; url: string; isActive?: boolean; displayOrder?: number }) => 
    api.post('/api/admin/reservation-links', data),
  updateReservationLink: (id: number, data: Partial<{ title: string; url: string; isActive: boolean; displayOrder: number }>) => 
    api.patch(`/api/admin/reservation-links/${id}`, data),
  deleteReservationLink: (id: number) => api.delete(`/api/admin/reservation-links/${id}`)
};

// 라벨 디자인 관련 API
export const labelApi = {
  // 카테고리별 배경 이미지 조회
  getBackgroundsByCategory: (categorySlug: string) => 
    api.get(`/api/labels/backgrounds/category/${categorySlug}`),

  // 모든 카테고리 목록 조회 (활성화된 카테고리만)
  getCategories: () => api.get('/api/labels/categories'),
  
  // 와인병 목록 조회
  getWineBottles: () => api.get('/api/admin/bottles'),
  getAccessories: () => api.get('/api/accessories'),

  // 공개 예약 링크
  getReservationLinks: () => api.get('/api/reservation-links')
};

export default api;
