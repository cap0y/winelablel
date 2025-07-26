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

export const userApi = {
  // 사용자 로그인
  login: (email: string, password: string) => api.post('/api/login', { email, password }),

  // 회원가입
  register: (userData: any) => api.post('/api/register', userData),

  // 이메일로 사용자 조회
  getUserByEmail: (email: string) => api.get(`/api/users/by-email/${email}`),
  
  // 사용자 주문 목록 조회
  getUserOrders: (email: string) => api.get(`/api/user-orders?email=${email}`)
};

// 갤러리 관련 API
export const galleryApi = {
  // 갤러리에 표시될 라벨 목록
  getLabels: () => api.get('/api/gallery/labels'),
  
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
  
  // 주문 목록 가져오기
  getOrders: () => api.get('/api/admin/orders'),
  
  // 주문 상세 정보 가져오기
  getOrder: (orderId: string) => api.get(`/api/admin/orders/${orderId}`),
  
  // 주문 상태 업데이트
  updateOrderStatus: (orderId: string, status: string) => 
    api.patch(`/api/admin/orders/${orderId}/status`, { status }),

  // 매출 통계 API - 일별 매출
  getDailySales: () => api.get('/api/admin/stats/daily'),
  
  // 매출 통계 API - 월별 매출
  getMonthlySales: () => api.get('/api/admin/stats/monthly'),
  
  // 매출 통계 API - 와인별 매출
  getBottleSales: () => api.get('/api/admin/stats/bottles'),
  
  // 매출 통계 API - 요약 통계
  getSalesSummary: () => api.get('/api/admin/stats/summary')
};

export default api;
