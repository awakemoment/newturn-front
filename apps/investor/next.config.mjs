/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // 이미지 최적화
  images: {
    domains: ['localhost'],
    // AWS S3 추가 시
    // domains: ['localhost', 'newturn-storage.s3.ap-northeast-2.amazonaws.com'],
  },
  
  // 환경변수 검증
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

export default nextConfig;

