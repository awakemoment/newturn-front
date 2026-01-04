/**
 * Axios API 클라이언트
 * jgabin 구조 참고
 * 
 * 로컬: http://localhost:8000
 * AWS: https://api.newturn.com
 */

import axios, { AxiosError } from 'axios';

// 환경변수에서 API URL 가져오기
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

console.log('🔗 API URL:', API_URL);

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키 전송
});

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    // 토큰이 있으면 헤더에 추가
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Token ${token}`;
      }
    }
    
    console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', response.status, response.config.url);
    return response;
  },
  (error: AxiosError) => {
    console.error('❌ API Error:', error.response?.status, error.config?.url);
    
    // 401 에러 시 로그인 페이지로
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Default export
export default apiClient;

// API 함수들
export const api = {
  // 종목 검색
  searchStocks: (query: string) => 
    apiClient.get('/api/stocks/search/', { params: { q: query } }),
  
  // 종목 상세
  getStock: (stockCode: string) => 
    apiClient.get(`/api/stocks/${stockCode}/`),
  
  // 메이트 분석
  getAnalysis: (stockCode: string) => 
    apiClient.get(`/api/analysis/${stockCode}/`),
  
  // 관심 종목
  getWatchlist: () => 
    apiClient.get('/api/watchlist/'),
  
  addToWatchlist: (stockCode: string) => 
    apiClient.post('/api/watchlist/', { stock_code: stockCode }),
  
  removeFromWatchlist: (id: number) => 
    apiClient.delete(`/api/watchlist/${id}/`),
};

